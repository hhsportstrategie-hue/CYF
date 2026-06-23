'use strict';

/**
 * Model — Game
 * Représente une partie CYF (escape game d'un club)
 */
class GameModel {
  constructor(db) {
    this.db = db;
  }

  findAll() {
    return this.db.prepare('SELECT * FROM games ORDER BY game_date DESC').all();
  }

  findById(id) {
    return this.db.prepare('SELECT * FROM games WHERE id = ?').get(id);
  }

  create({ id, club_name, game_date, max_teams = 20, mode = 'sequential' }) {
    this.db.prepare(`
      INSERT INTO games (id, club_name, game_date, max_teams, mode)
      VALUES (?, ?, ?, ?, ?)
    `).run(id, club_name, game_date, max_teams, mode);
    return this.findById(id);
  }

  update(id, fields) {
    const allowed = ['club_name', 'game_date', 'max_teams', 'mode', 'status'];
    const updates = Object.entries(fields)
      .filter(([k]) => allowed.includes(k))
      .map(([k]) => `${k} = ?`).join(', ');
    const values = Object.entries(fields)
      .filter(([k]) => allowed.includes(k))
      .map(([, v]) => v);
    if (!updates) return this.findById(id);
    this.db.prepare(`UPDATE games SET ${updates}, updated_at = datetime('now') WHERE id = ?`)
      .run(...values, id);
    return this.findById(id);
  }

  delete(id) {
    return this.db.prepare('DELETE FROM games WHERE id = ?').run(id);
  }

  // Stats d'une partie
  stats(id) {
    const game = this.findById(id);
    if (!game) return null;
    const teamCount = this.db.prepare('SELECT COUNT(*) as n FROM teams WHERE game_id = ?').get(id).n;
    const enigmaCount = this.db.prepare('SELECT COUNT(*) as n FROM enigmas WHERE game_id = ?').get(id).n;
    return { ...game, teamCount, enigmaCount };
  }
}

module.exports = GameModel;
