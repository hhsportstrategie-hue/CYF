'use strict';

class TeamModel {
  constructor(db) {
    this.db = db;
  }

  findByGame(game_id) {
    return this.db.prepare('SELECT * FROM teams WHERE game_id = ? ORDER BY registered_at').all(game_id);
  }

  findById(id) {
    return this.db.prepare('SELECT * FROM teams WHERE id = ?').get(id);
  }

  findByCode(code) {
    return this.db.prepare('SELECT * FROM teams WHERE code = ?').get(code);
  }

  create({ id, game_id, name, code, members = 1 }) {
    this.db.prepare(`
      INSERT INTO teams (id, game_id, name, code, members)
      VALUES (?, ?, ?, ?, ?)
    `).run(id, game_id, name, code, members);
    return this.findById(id);
  }

  delete(id) {
    return this.db.prepare('DELETE FROM teams WHERE id = ?').run(id);
  }

  // Génère un code unique à 6 caractères
  static generateCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars[Math.floor(Math.random() * chars.length)];
    }
    return code;
  }
}

module.exports = TeamModel;
