-- CYF — Challenge Your Fans
-- Schéma SQLite

PRAGMA foreign_keys = ON;

-- ─── PARTIES ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS games (
    id          TEXT PRIMARY KEY,
    club_name   TEXT NOT NULL,
    game_date   TEXT NOT NULL,
    max_teams   INTEGER DEFAULT 20,
    mode        TEXT DEFAULT 'sequential', -- 'sequential' | 'free'
    status      TEXT DEFAULT 'draft',      -- 'draft' | 'active' | 'finished'
    created_at  TEXT DEFAULT (datetime('now')),
    updated_at  TEXT DEFAULT (datetime('now'))
);

-- ─── ÉNIGMES ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS enigmas (
    id          TEXT PRIMARY KEY,
    game_id     TEXT NOT NULL REFERENCES games(id) ON DELETE CASCADE,
    order_num   INTEGER NOT NULL DEFAULT 0,
    title       TEXT NOT NULL,
    description TEXT NOT NULL,
    hint        TEXT,
    media_url   TEXT,                      -- image ou vidéo
    answer_type TEXT DEFAULT 'qrcode',    -- 'qrcode' | 'code' | 'text'
    answer      TEXT NOT NULL,             -- valeur correcte
    points      INTEGER DEFAULT 100,
    time_bonus  INTEGER DEFAULT 50,        -- points bonus si résolu en < 2 min
    created_at  TEXT DEFAULT (datetime('now'))
);

-- ─── ÉQUIPES ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS teams (
    id          TEXT PRIMARY KEY,
    game_id     TEXT NOT NULL REFERENCES games(id) ON DELETE CASCADE,
    name        TEXT NOT NULL,
    code        TEXT UNIQUE NOT NULL,      -- code à 6 caractères pour rejoindre
    members     INTEGER DEFAULT 1,
    registered_at TEXT DEFAULT (datetime('now'))
);

-- ─── SCORES & PROGRESSION ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS scores (
    id          TEXT PRIMARY KEY,
    team_id     TEXT NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    enigma_id   TEXT NOT NULL REFERENCES enigmas(id) ON DELETE CASCADE,
    points      INTEGER DEFAULT 0,
    solved_at   TEXT,
    time_taken  INTEGER,                   -- secondes
    attempts    INTEGER DEFAULT 0,
    UNIQUE(team_id, enigma_id)
);

-- ─── INDEX ──────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_enigmas_game ON enigmas(game_id, order_num);
CREATE INDEX IF NOT EXISTS idx_teams_game   ON teams(game_id);
CREATE INDEX IF NOT EXISTS idx_scores_team  ON scores(team_id);
CREATE INDEX IF NOT EXISTS idx_scores_enigma ON scores(enigma_id);
