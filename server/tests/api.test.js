'use strict';

/**
 * Tests API — CYF Challenge Your Fans
 * Utilise node:test natif (Node 18+) — aucune dépendance externe
 *
 * Usage :
 *   node --test server/tests/
 *   OU
 *   npm test
 */

const { test, before, after, describe } = require('node:test');
const assert    = require('node:assert/strict');
const http      = require('node:http');
const path      = require('node:path');
const fs        = require('node:fs');

// ── Configuration test : base en mémoire ──────────────────────────
process.env.NODE_ENV = 'test';
const TEST_DB = path.join(__dirname, '..', 'db', 'test.sqlite');
process.env.DB_PATH = TEST_DB;
function removeTestDb() {
  for (const f of [TEST_DB, TEST_DB + '-wal', TEST_DB + '-shm']) {
    if (fs.existsSync(f)) fs.unlinkSync(f);
  }
}
removeTestDb();

const app = require('../index');

// Démarre le serveur sur un port aléatoire
let server, baseUrl;
before(async () => {
  await new Promise(resolve => {
    server = app.listen(0, () => {
      const { port } = server.address();
      baseUrl = `http://localhost:${port}`;
      console.log(`\n🧪  Test server running on ${baseUrl}\n`);
      resolve();
    });
  });
});

after(async () => {
  await new Promise(resolve => server.close(resolve));
  app.locals.db.close();
  removeTestDb();
});

async function req(method, urlPath, body = null) {
  const url = new URL(urlPath, baseUrl);
  const headers = { 'Content-Type': 'application/json' };
  const opts = { method, headers };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(url, opts);
  const data = await res.json().catch(() => ({}));
  return { status: res.status, data };
}

// ── TESTS ──────────────────────────────────────────────────────────

describe('API — Health & Smoke', () => {
  test('GET /api/health → 200, status ok', async () => {
    const r = await req('GET', '/api/health');
    assert.equal(r.status, 200);
    assert.equal(r.data.status, 'ok');
  });
});

describe('API — Games', () => {
  let gameId;
  test('POST /api/games → crée une partie', async () => {
    const r = await req('POST', '/api/games', {
      club_name: 'FC Test',
      game_date: '2026-12-01',
      max_teams: 10,
    });
    assert.equal(r.status, 201);
    assert.ok(r.data.id);
    assert.equal(r.data.club_name, 'FC Test');
    assert.equal(r.data.status, 'draft');
    gameId = r.data.id;
  });

  test('POST /api/games sans club_name → 400', async () => {
    const r = await req('POST', '/api/games', { game_date: '2026-12-01' });
    assert.equal(r.status, 400);
    assert.ok(r.data.error);
  });

  test('GET /api/games → liste les parties', async () => {
    const r = await req('GET', '/api/games');
    assert.equal(r.status, 200);
    assert.ok(Array.isArray(r.data));
    assert.ok(r.data.length >= 1);
  });

  test('GET /api/games/:id → détail', async () => {
    const r = await req('GET', `/api/games/${gameId}`);
    assert.equal(r.status, 200);
    assert.equal(r.data.id, gameId);
  });

  test('GET /api/games/:id/stats → stats complètes', async () => {
    const r = await req('GET', `/api/games/${gameId}/stats`);
    assert.equal(r.status, 200);
    assert.equal(r.data.teamCount, 0);
    assert.equal(r.data.enigmaCount, 0);
  });

  test('PATCH /api/games/:id → modifie', async () => {
    const r = await req('PATCH', `/api/games/${gameId}`, { status: 'active' });
    assert.equal(r.status, 200);
    assert.equal(r.data.status, 'active');
  });

  test('GET /api/games/inconnu → 404', async () => {
    const r = await req('GET', '/api/games/does-not-exist');
    assert.equal(r.status, 404);
  });
});

describe('API — Enigmas', () => {
  let gameId, enigmaId;

  before(async () => {
    const r = await req('POST', '/api/games', {
      club_name: 'FC Test Enigmas', game_date: '2026-12-02',
    });
    gameId = r.data.id;
  });

  test('POST /api/enigmas → crée une énigme', async () => {
    const r = await req('POST', '/api/enigmas', {
      game_id: gameId,
      order_num: 1,
      title: 'Test énigme',
      description: 'Description test',
      answer_type: 'code',
      answer: '1972',
      points: 100,
    });
    assert.equal(r.status, 201);
    assert.equal(r.data.answer, '1972'); // présent côté serveur
    enigmaId = r.data.id;
  });

  test('GET /api/enigmas?game_id=xxx → liste, SANS answer', async () => {
    const r = await req('GET', `/api/enigmas?game_id=${gameId}`);
    assert.equal(r.status, 200);
    assert.ok(r.data.length >= 1);
    assert.equal(r.data[0].answer, undefined, 'La réponse ne doit PAS fuiter côté client');
  });

  test('POST /api/enigmas/:id/check → bonne réponse', async () => {
    const r = await req('POST', `/api/enigmas/${enigmaId}/check`, { answer: '1972' });
    assert.equal(r.status, 200);
    assert.equal(r.data.valid, true);
  });

  test('POST /api/enigmas/:id/check → mauvaise réponse', async () => {
    const r = await req('POST', `/api/enigmas/${enigmaId}/check`, { answer: '1999' });
    assert.equal(r.status, 200);
    assert.equal(r.data.valid, false);
  });

  test('POST /api/enigmas/:id/check → insensible à la casse/espaces', async () => {
    const r = await req('POST', `/api/enigmas/${enigmaId}/check`, { answer: '  1972  ' });
    assert.equal(r.data.valid, true);
  });
});

describe('API — Teams & Scores', () => {
  let gameId, teamId, enigmaId, teamCode;

  before(async () => {
    // Setup : 1 partie, 1 énigme, 1 équipe
    const g = await req('POST', '/api/games', {
      club_name: 'FC Test Scores', game_date: '2026-12-03',
    });
    gameId = g.data.id;

    const e = await req('POST', '/api/enigmas', {
      game_id: gameId, order_num: 1, title: 'E', description: 'D',
      answer_type: 'code', answer: '42',
    });
    enigmaId = e.data.id;

    const t = await req('POST', '/api/teams', {
      game_id: gameId, name: 'Test Team', members: 2,
    });
    teamId = t.data.id;
    teamCode = t.data.code;
    assert.equal(t.data.code.length, 6);
  });

  test('GET /api/teams/join/:code → rejoint par code', async () => {
    const r = await req('GET', `/api/teams/join/${teamCode}`);
    assert.equal(r.status, 200);
    assert.equal(r.data.id, teamId);
  });

  test('POST /api/scores/submit → bonne réponse', async () => {
    const r = await req('POST', '/api/scores/submit', {
      team_id: teamId, enigma_id: enigmaId, answer: '42', time_taken: 90,
    });
    assert.equal(r.status, 200);
    assert.equal(r.data.valid, true);
    assert.ok(r.data.score);
  });

  test('POST /api/scores/submit → déjà résolu', async () => {
    const r = await req('POST', '/api/scores/submit', {
      team_id: teamId, enigma_id: enigmaId, answer: '42',
    });
    assert.equal(r.data.already_solved, true);
  });

  test('GET /api/scores/leaderboard/:game_id → classement', async () => {
    const r = await req('GET', `/api/scores/leaderboard/${gameId}`);
    assert.equal(r.status, 200);
    assert.ok(Array.isArray(r.data));
    assert.equal(r.data[0].team_id, teamId);
    assert.equal(r.data[0].enigmas_solved, 1);
  });
});
