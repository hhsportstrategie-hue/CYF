'use strict';

class EnigmaModel {
  constructor(db) {
    this.db = db;
  }

  findByGame(game_id) {
    return this.db.prepare(
      'SELECT * FROM enigmas WHERE game_id = ? ORDER BY order_num ASC'
    ).all(game_id);
  }

  findById(id) {
    return this.db.prepare('SELECT * FROM enigmas WHERE id = ?').get(id);
  }

  create({ id, game_id, order_num, title, description, hint, media_url,
           answer_type = 'qrcode', answer, points = 100, time_bonus = 50 }) {
    this.db.prepare(`
      INSERT INTO enigmas
        (id, game_id, order_num, title, description, hint, media_url, answer_type, answer, points, time_bonus)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, game_id, order_num, title, description, hint || null,
           media_url || null, answer_type, answer, points, time_bonus);
    return this.findById(id);
  }

  update(id, fields) {
    const allowed = ['order_num','title','description','hint','media_url',
                     'answer_type','answer','points','time_bonus'];
    const updates = Object.entries(fields)
      .filter(([k]) => allowed.includes(k))
      .map(([k]) => `${k} = ?`).join(', ');
    const values = Object.entries(fields)
      .filter(([k]) => allowed.includes(k))
      .map(([, v]) => v);
    if (!updates) return this.findById(id);
    this.db.prepare(`UPDATE enigmas SET ${updates} WHERE id = ?`).run(...values, id);
    return this.findById(id);
  }

  delete(id) {
    return this.db.prepare('DELETE FROM enigmas WHERE id = ?').run(id);
  }

  // Vérification de la réponse (insensible à la casse et aux espaces)
  checkAnswer(id, userAnswer) {
    const enigma = this.findById(id);
    if (!enigma) return { valid: false, error: 'Enigma not found' };
    const correct = enigma.answer.trim().toLowerCase();
    const given   = (userAnswer || '').trim().toLowerCase();
    return { valid: correct === given, points: enigma.points, time_bonus: enigma.time_bonus };
  }
}

module.exports = EnigmaModel;
