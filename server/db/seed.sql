-- CYF — Challenge Your Fans
-- Jeu de données de démonstration
-- Usage : sqlite3 cyf.sqlite < seed.sql
--        OU automatique via : node server/seed.js

-- ─── PARTIE DE DÉMO : SM Caen ─────────────────────────────────────
INSERT INTO games (id, club_name, game_date, max_teams, mode, status) VALUES
  ('demo-game-001', 'SM Caen', '2026-10-15', 20, 'sequential', 'active');

-- ─── 3 ÉNIGMES DE DÉMO ──────────────────────────────────────────
INSERT INTO enigmas (id, game_id, order_num, title, description, hint, answer_type, answer, points, time_bonus) VALUES
  ('enigma-001', 'demo-game-001', 1,
   'Le premier maillot',
   'En quelle année le SM Caen a-t-il été fondé ? Cherchez l''inscription dorée à l''entrée du stade Michel d''Ornano.',
   'Regardez près de la billetterie historique',
   'code', '1913', 100, 50),

  ('enigma-002', 'demo-game-001', 2,
   'Le cri des supporters',
   'Quel est le surnom donné aux supporters historiques du SM Caen ? Flashez le QR code au stand "Identité".',
   NULL,
   'qrcode', 'MALHERBE', 150, 75),

  ('enigma-003', 'demo-game-001', 3,
   'La finale de 2005',
   'Quel club le SM Caen a-t-il affronté en finale de la Coupe de la Ligue 2005 ?',
   'Cherchez l''affiche dans la salle des trophées',
   'text', 'RC Strasbourg', 200, 100);

-- ─── 4 ÉQUIPES DE DÉMO ──────────────────────────────────────────
INSERT INTO teams (id, game_id, name, code, members) VALUES
  ('team-001', 'demo-game-001', 'Les Vikings', 'VIKING', 4),
  ('team-002', 'demo-game-001', 'Les Malherbes', 'MALHBR', 3),
  ('team-003', 'demo-game-001', 'Normandie Suprême', 'NORMAX', 5),
  ('team-004', 'demo-game-001', 'Team Ornano', 'ORNANO', 2);

-- ─── QUELQUES SCORES PRÉ-ENREGISTRÉS (pour la démo) ─────────────
INSERT INTO scores (id, team_id, enigma_id, points, solved_at, time_taken, attempts) VALUES
  ('score-001', 'team-001', 'enigma-001', 150, datetime('now', '-2 hours'), 87, 1),
  ('score-002', 'team-002', 'enigma-001', 100, datetime('now', '-1 hour'), 124, 2),
  ('score-003', 'team-001', 'enigma-002', 225, datetime('now', '-1 hour'), 67, 1);
