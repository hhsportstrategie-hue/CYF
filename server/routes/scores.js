'use strict';

const express = require('express');
const { v4: uuidv4 } = require('uuid');
const router  = express.Router();

// ── Limitation des essais (anti force brute) ──────────────────────
// Par équipe et par énigme : 5 essais libres, puis 1 essai toutes les 30 s.
const FREE_ATTEMPTS = 5;
const COOLDOWN_MS   = 30 * 1000;
const lastWrongAt   = new Map(); // "team:enigma" → horodatage du dernier mauvais essai

module.exports = (models) => {
  const { Score, Enigma, Team } = models;

  // GET /api/scores/leaderboard/:game_id — classement temps réel
  router.get('/leaderboard/:game_id', (req, res) => {
    res.json(Score.leaderboard(req.params.game_id));
  });

  // GET /api/scores/progress/:team_id — progression d'une équipe
  router.get('/progress/:team_id', (req, res) => {
    res.json(Score.teamProgress(req.params.team_id));
  });

  // POST /api/scores/submit — soumettre une réponse + calculer les points
  router.post('/submit', (req, res) => {
    const { team_id, enigma_id, answer, time_taken } = req.body;
    if (!team_id || !enigma_id || answer === undefined || answer === null) {
      return res.status(400).json({ error: 'team_id, enigma_id and answer are required' });
    }

    // L'équipe et l'énigme doivent exister et appartenir à la même partie
    const team   = Team.findById(team_id);
    const enigma = Enigma.findById(enigma_id);
    if (!team || !enigma) return res.status(404).json({ error: 'Team or enigma not found' });
    if (team.game_id !== enigma.game_id) {
      return res.status(400).json({ error: 'Enigma does not belong to this team\'s game' });
    }

    // Déjà résolu ?
    const existing = Score.findByTeamAndEnigma(team_id, enigma_id);
    if (existing && existing.solved_at) {
      return res.json({ already_solved: true, score: existing });
    }

    // Trop d'essais rapprochés ?
    const key = `${team_id}:${enigma_id}`;
    const attempts = existing ? existing.attempts : 0;
    if (attempts >= FREE_ATTEMPTS && lastWrongAt.has(key)) {
      const wait = lastWrongAt.get(key) + COOLDOWN_MS - Date.now();
      if (wait > 0) {
        const seconds = Math.ceil(wait / 1000);
        res.set('Retry-After', String(seconds));
        return res.status(429).json({
          error: `Trop d'essais : patientez ${seconds} s avant de réessayer.`,
          retry_after: seconds,
        });
      }
    }

    // Vérifier la réponse
    const check = Enigma.checkAnswer(enigma_id, String(answer));
    if (!check.valid) {
      const score = Score.recordWrongAttempt({ id: uuidv4(), team_id, enigma_id });
      lastWrongAt.set(key, Date.now());
      return res.json({ valid: false, attempts: score.attempts, message: 'Mauvaise réponse, réessaie !' });
    }

    // Points + bonus si résolu en moins de 2 min (durée bornée à des valeurs plausibles)
    const seconds = Number.isFinite(+time_taken) && +time_taken >= 0 ? Math.round(+time_taken) : null;
    let points = check.points;
    if (seconds !== null && seconds < 120) points += check.time_bonus;

    try {
      const score = Score.recordSolve({ id: uuidv4(), team_id, enigma_id, points, time_taken: seconds });
      lastWrongAt.delete(key);
      res.json({ valid: true, points, score });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  return router;
};
