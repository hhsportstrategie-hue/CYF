'use strict';

const express = require('express');
const { v4: uuidv4 } = require('uuid');
const router  = express.Router();

module.exports = (models) => {
  const { Game } = models;

  // GET /api/games — liste toutes les parties
  router.get('/', (req, res) => {
    try {
      res.json(Game.findAll());
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  // GET /api/games/:id — détail d'une partie
  router.get('/:id', (req, res) => {
    const game = Game.findById(req.params.id);
    if (!game) return res.status(404).json({ error: 'Game not found' });
    res.json(game);
  });

  // GET /api/games/:id/stats — stats complètes
  router.get('/:id/stats', (req, res) => {
    const stats = Game.stats(req.params.id);
    if (!stats) return res.status(404).json({ error: 'Game not found' });
    res.json(stats);
  });

  // POST /api/games — créer une partie
  router.post('/', (req, res) => {
    const { club_name, game_date, max_teams, mode } = req.body;
    if (!club_name || !game_date) {
      return res.status(400).json({ error: 'club_name and game_date are required' });
    }
    try {
      const game = Game.create({ id: uuidv4(), club_name, game_date, max_teams, mode });
      res.status(201).json(game);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  // PATCH /api/games/:id — modifier une partie
  router.patch('/:id', (req, res) => {
    const game = Game.findById(req.params.id);
    if (!game) return res.status(404).json({ error: 'Game not found' });
    try {
      res.json(Game.update(req.params.id, req.body));
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  // DELETE /api/games/:id — supprimer une partie
  router.delete('/:id', (req, res) => {
    const game = Game.findById(req.params.id);
    if (!game) return res.status(404).json({ error: 'Game not found' });
    Game.delete(req.params.id);
    res.json({ message: 'Game deleted' });
  });

  return router;
};
