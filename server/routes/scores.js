'use strict';

const express = require('express');
const { v4: uuidv4 } = require('uuid');
const router  = express.Router();

module.exports = (models) => {
  const { Score, Enigma } = models;

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
    if (!team_id || !enigma_id || answer === undefined) {
      return res.status(400).json({ error: 'team_id, enigma_id and answer are required' });
    }

    // Vérifier si déjà résolu
    const existing = Score.findByTeamAndEnigma(team_id, enigma_id);
    if (existing && existing.solved_at) {
      return res.json({ already_solved: true, score: existing });
    }

    // Vérifier la réponse
    const check = Enigma.checkAnswer(enigma_id, answer);
    if (!check.valid) {
      // Incrémenter les tentatives
      if (existing) {
        Score.submit({ id: existing.id, team_id, enigma_id, points: 0, time_taken, attempts: (existing.attempts || 0) + 1 });
      } else {
        Score.submit({ id: uuidv4(), team_id, enigma_id, points: 0, time_taken: null, attempts: 1 });
      }
      return res.json({ valid: false, message: 'Mauvaise réponse, réessaie !' });
    }

    // Calculer les points avec bonus temps
    let points = check.points;
    if (time_taken && time_taken < 120) points += check.time_bonus; // bonus si < 2 min

    try {
      const score = Score.submit({
        id: uuidv4(), team_id, enigma_id, points,
        time_taken: time_taken || null,
        attempts: (existing ? existing.attempts : 0) + 1
      });
      res.json({ valid: true, points, score });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  return router;
};
