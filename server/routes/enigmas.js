'use strict';

const express = require('express');
const { v4: uuidv4 } = require('uuid');
const router  = express.Router();

module.exports = (models) => {
  const { Enigma } = models;

  // GET /api/enigmas?game_id=xxx
  router.get('/', (req, res) => {
    const { game_id } = req.query;
    if (!game_id) return res.status(400).json({ error: 'game_id required' });
    res.json(Enigma.findByGame(game_id));
  });

  // GET /api/enigmas/:id
  router.get('/:id', (req, res) => {
    const enigma = Enigma.findById(req.params.id);
    if (!enigma) return res.status(404).json({ error: 'Enigma not found' });
    // Ne jamais exposer la réponse côté joueur
    const { answer, ...safe } = enigma;
    res.json(safe);
  });

  // POST /api/enigmas — créer une énigme
  router.post('/', (req, res) => {
    const { game_id, order_num, title, description, hint, media_url,
            answer_type, answer, points, time_bonus } = req.body;
    if (!game_id || !title || !answer) {
      return res.status(400).json({ error: 'game_id, title and answer are required' });
    }
    try {
      const enigma = Enigma.create({
        id: uuidv4(), game_id, order_num: order_num || 0,
        title, description: description || '', hint, media_url,
        answer_type, answer, points, time_bonus
      });
      res.status(201).json(enigma);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  // POST /api/enigmas/:id/check — vérifier une réponse
  router.post('/:id/check', (req, res) => {
    const { answer } = req.body;
    const result = Enigma.checkAnswer(req.params.id, answer);
    res.json(result);
  });

  // PATCH /api/enigmas/:id
  router.patch('/:id', (req, res) => {
    const enigma = Enigma.findById(req.params.id);
    if (!enigma) return res.status(404).json({ error: 'Enigma not found' });
    try {
      res.json(Enigma.update(req.params.id, req.body));
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  // DELETE /api/enigmas/:id
  router.delete('/:id', (req, res) => {
    const enigma = Enigma.findById(req.params.id);
    if (!enigma) return res.status(404).json({ error: 'Enigma not found' });
    Enigma.delete(req.params.id);
    res.json({ message: 'Enigma deleted' });
  });

  return router;
};
