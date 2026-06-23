'use strict';

class ScoreModel {
  constructor(db) {
    this.db = db;
  }

  // Classement complet d'une partie
  leaderboard(game_id) {
    return this.db.prepare(`
      SELECT
        t.id          AS team_id,
        t.name        AS team_name,
        t.code        AS team_code,
        t.members,
        COALESCE(SUM(s.points), 0) AS total_points,
        COUNT(s.solved_at)         AS enigmas_solved,
        MAX(s.solved_at)           AS last_solved_at
      FROM teams t
      LEFT JOIN scores s ON s.team_id = t.id
      WHERE t.game_id = ?
      GROUP BY t.id
      ORDER BY total_points DESC, last_solved_at ASC
    `).all(game_id);
  }

  // Progression d'une équipe
  teamProgress(team_id) {
    return this.db.prepare(`
      SELECT s.*, e.title, e.points AS max_points, e.order_num
      FROM scores s
      JOIN enigmas e ON e.id = s.enigma_id
      WHERE s.team_id = ?
      ORDER BY e.order_num
    `).all(team_id);
  }

  // Soumettre une réponse
  submit({ id, team_id, enigma_id, points, time_taken, attempts }) {
    const existing = this.db.prepare(
      'SELECT id FROM scores WHERE team_id = ? AND enigma_id = ?'
    ).get(team_id, enigma_id);
    if (existing) {
      // Mettre à jour les tentatives
      this.db.prepare(
        'UPDATE scores SET attempts = attempts + 1 WHERE team_id = ? AND enigma_id = ?'
      ).run(team_id, enigma_id);
      return this.db.prepare(
        'SELECT * FROM scores WHERE team_id = ? AND enigma_id = ?'
      ).get(team_id, enigma_id);
    }
    this.db.prepare(`
      INSERT INTO scores (id, team_id, enigma_id, points, solved_at, time_taken, attempts)
      VALUES (?, ?, ?, ?, datetime('now'), ?, ?)
    `).run(id, team_id, enigma_id, points, time_taken, attempts);
    return this.db.prepare('SELECT * FROM scores WHERE id = ?').get(id);
  }

  findByTeamAndEnigma(team_id, enigma_id) {
    return this.db.prepare(
      'SELECT * FROM scores WHERE team_id = ? AND enigma_id = ?'
    ).get(team_id, enigma_id);
  }
}

module.exports = ScoreModel;
