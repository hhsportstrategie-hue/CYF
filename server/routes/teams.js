'use strict';

const express = require('express');
const { v4: uuidv4 } = require('uuid');
const router  = express.Router();

module.exports = (models) => {
  const { Team } = models;

  // GET /api/teams?game_id=xxx
  router.get('/', (req, res) => {
    const { game_id } = req.query;
    if (!game_id) return res.status(400).json({ error: 'game_id required' });
    res.json(Team.findByGame(game_id));
  });

  // GET /api/teams/join/:code — rejoindre par code
  router.get('/join/:code', (req, res) => {
    const team = Team.findByCode(req.params.code.toUpperCase());
    if (!team) return res.status(404).json({ error: 'Team not found' });
    res.json(team);
  });

  // GET /api/teams/:id
  router.get('/:id', (req, res) => {
    const team = Team.findById(req.params.id);
    if (!team) return res.status(404).json({ error: 'Team not found' });
    res.json(team);
  });

  // POST /api/teams — créer une équipe
  router.post('/', (req, res) => {
    const { game_id, name, members } = req.body;
    if (!game_id || !name) {
      return res.status(400).json({ error: 'game_id and name are required' });
    }
    // Générer un code unique
    let code, attempts = 0;
    do {
      code = require('../models/team').generateCode
        ? require('../models/team').generateCode()
        : Math.random().toString(36).substring(2, 8).toUpperCase();
      attempts++;
    } while (Team.findByCode(code) && attempts < 20);

    try {
      const team = Team.create({ id: uuidv4(), game_id, name, code, members: members || 1 });
      res.status(201).json(team);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  // DELETE /api/teams/:id
  router.delete('/:id', (req, res) => {
    const team = Team.findById(req.params.id);
    if (!team) return res.status(404).json({ error: 'Team not found' });
    Team.delete(req.params.id);
    res.json({ message: 'Team deleted' });
  });

  return router;
};
