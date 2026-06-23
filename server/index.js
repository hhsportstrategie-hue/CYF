'use strict';

const express    = require('express');
const cors       = require('cors');
const path       = require('path');
const Database   = require('better-sqlite3');
const fs         = require('fs');

// ── Modèles ──────────────────────────────────────────────────────
const GameModel   = require('./models/game');
const EnigmaModel = require('./models/enigma');
const TeamModel   = require('./models/team');
const ScoreModel  = require('./models/score');

// ── Routes ───────────────────────────────────────────────────────
const gamesRouter   = require('./routes/games');
const enigmasRouter = require('./routes/enigmas');
const teamsRouter   = require('./routes/teams');
const scoresRouter  = require('./routes/scores');

// ── Base de données ───────────────────────────────────────────────
const DB_PATH  = path.join(__dirname, 'db', 'cyf.sqlite');
const SCHEMA   = path.join(__dirname, 'db', 'schema.sql');

const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Initialiser le schéma si nécessaire
const schema = fs.readFileSync(SCHEMA, 'utf8');
db.exec(schema);

// ── Instances modèles ─────────────────────────────────────────────
const models = {
  Game:   new GameModel(db),
  Enigma: new EnigmaModel(db),
  Team:   new TeamModel(db),
  Score:  new ScoreModel(db),
};

// ── Application Express ───────────────────────────────────────────
const app = express();
app.use(cors());
app.use(express.json());

// Servir le frontend statique
app.use(express.static(path.join(__dirname, '..', 'client')));

// ── API Routes ────────────────────────────────────────────────────
app.use('/api/games',   gamesRouter(models));
app.use('/api/enigmas', enigmasRouter(models));
app.use('/api/teams',   teamsRouter(models));
app.use('/api/scores',  scoresRouter(models));

// ── Health check ──────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', version: '1.0.0', timestamp: new Date().toISOString() });
});

// ── SPA fallback — toutes les routes non-API vers index.html ─────
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, '..', 'client', 'index.html'));
  }
});

// ── Démarrage ─────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🏟️  CYF — Challenge Your Fans`);
  console.log(`📡  Serveur démarré sur http://localhost:${PORT}`);
  console.log(`🎮  Admin : http://localhost:${PORT}/admin.html`);
  console.log(`👥  Jeu   : http://localhost:${PORT}/game.html`);
});

module.exports = app;
