'use strict';

/**
 * Authentification administrateur — CYF
 *
 * - Un mot de passe administrateur unique (ADMIN_PASSWORD dans .env).
 *   S'il est absent, un mot de passe aléatoire est généré au démarrage
 *   et affiché dans la console (jamais de mot de passe par défaut).
 * - Connexion : POST /api/auth/login → jeton signé (HMAC-SHA256) valable 12 h.
 * - Le jeton est envoyé dans l'en-tête  Authorization: Bearer <jeton>.
 * - Anti force brute : 5 échecs par adresse IP → blocage 15 minutes.
 */

const crypto  = require('crypto');
const express = require('express');

const TOKEN_TTL_MS     = 12 * 60 * 60 * 1000; // 12 heures
const MAX_FAILURES     = 5;
const LOCKOUT_MS       = 15 * 60 * 1000;      // 15 minutes

const b64url = buf => Buffer.from(buf).toString('base64url');
const sha256 = str => crypto.createHash('sha256').update(String(str)).digest();

/**
 * @param {object} [opts]
 * @param {string} [opts.password] Mot de passe admin (défaut : ADMIN_PASSWORD)
 * @param {string} [opts.secret]   Clé de signature des jetons (défaut : SESSION_SECRET ou aléatoire)
 */
function createAuth(opts = {}) {
  let password = opts.password ?? process.env.ADMIN_PASSWORD;
  let generated = false;
  if (!password) {
    password  = crypto.randomBytes(9).toString('base64url');
    generated = true;
  }
  const passwordHash = sha256(password);
  const secret = opts.secret ?? process.env.SESSION_SECRET ?? crypto.randomBytes(32).toString('hex');

  // ── Jetons signés ────────────────────────────────────────────────
  function sign(payload) {
    return crypto.createHmac('sha256', secret).update(payload).digest('base64url');
  }

  function issueToken() {
    const expiresAt = Date.now() + TOKEN_TTL_MS;
    const payload = b64url(JSON.stringify({ role: 'admin', exp: expiresAt }));
    return { token: `${payload}.${sign(payload)}`, expires_at: new Date(expiresAt).toISOString() };
  }

  function verifyToken(token) {
    if (typeof token !== 'string') return false;
    const [payload, signature] = token.split('.');
    if (!payload || !signature) return false;
    const expected = Buffer.from(sign(payload));
    const given    = Buffer.from(signature);
    if (expected.length !== given.length || !crypto.timingSafeEqual(expected, given)) return false;
    try {
      const { role, exp } = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
      return role === 'admin' && typeof exp === 'number' && exp > Date.now();
    } catch {
      return false;
    }
  }

  // ── Middleware de protection ─────────────────────────────────────
  function requireAdmin(req, res, next) {
    const header = req.get('Authorization') || '';
    const token  = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!verifyToken(token)) {
      return res.status(401).json({ error: 'Authentification administrateur requise' });
    }
    next();
  }

  // ── Anti force brute (mémoire, par IP) ───────────────────────────
  const failures = new Map(); // ip → { count, lockedUntil }

  function isLocked(ip) {
    const f = failures.get(ip);
    if (!f || !f.lockedUntil) return 0;
    if (f.lockedUntil > Date.now()) return f.lockedUntil;
    failures.delete(ip);
    return 0;
  }

  function recordFailure(ip) {
    const f = failures.get(ip) || { count: 0, lockedUntil: 0 };
    f.count += 1;
    if (f.count >= MAX_FAILURES) f.lockedUntil = Date.now() + LOCKOUT_MS;
    failures.set(ip, f);
  }

  // ── Routes /api/auth ─────────────────────────────────────────────
  const router = express.Router();

  router.post('/login', (req, res) => {
    const ip = req.ip;
    const lockedUntil = isLocked(ip);
    if (lockedUntil) {
      const minutes = Math.ceil((lockedUntil - Date.now()) / 60000);
      return res.status(429).json({ error: `Trop de tentatives. Réessayez dans ${minutes} min.` });
    }
    const given = (req.body && req.body.password) || '';
    if (!crypto.timingSafeEqual(sha256(given), passwordHash)) {
      recordFailure(ip);
      return res.status(401).json({ error: 'Mot de passe incorrect' });
    }
    failures.delete(ip);
    res.json(issueToken());
  });

  router.get('/check', requireAdmin, (req, res) => {
    res.json({ authenticated: true });
  });

  return { router, requireAdmin, generatedPassword: generated ? password : null };
}

module.exports = { createAuth };
