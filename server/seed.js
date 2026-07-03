'use strict';

/**
 * Script de seed — CYF Challenge Your Fans
 * Remplit la base SQLite avec des données de démonstration
 *
 * Usage :
 *   node server/seed.js            # crée cyf.sqlite + seed
 *   node server/seed.js --reset    # supprime la base existante avant
 */

const Database = require('better-sqlite3');
const path     = require('path');
const fs       = require('fs');

const DB_PATH = path.join(__dirname, 'db', 'cyf.sqlite');
const SCHEMA  = path.join(__dirname, 'db', 'schema.sql');
const SEED    = path.join(__dirname, 'db', 'seed.sql');

const RESET = process.argv.includes('--reset');

if (RESET && fs.existsSync(DB_PATH)) {
  console.log('🗑️  Suppression de la base existante...');
  fs.unlinkSync(DB_PATH);
  if (fs.existsSync(DB_PATH + '-wal')) fs.unlinkSync(DB_PATH + '-wal');
  if (fs.existsSync(DB_PATH + '-shm')) fs.unlinkSync(DB_PATH + '-shm');
}

const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

console.log('📋  Création du schéma...');
db.exec(fs.readFileSync(SCHEMA, 'utf8'));

console.log('🌱  Insertion des données de démo...');
db.exec(fs.readFileSync(SEED, 'utf8'));

// Vérification rapide
const games   = db.prepare('SELECT COUNT(*) AS n FROM games').get().n;
const enigmas = db.prepare('SELECT COUNT(*) AS n FROM enigmas').get().n;
const teams   = db.prepare('SELECT COUNT(*) AS n FROM teams').get().n;
const scores  = db.prepare('SELECT COUNT(*) AS n FROM scores').get().n;

console.log('✅  Seed terminé :');
console.log(`    ${games} partie(s)`);
console.log(`    ${enigmas} énigme(s)`);
console.log(`    ${teams} équipe(s)`);
console.log(`    ${scores} score(s)`);
console.log('');
console.log('🎮  Codes d\'équipe de démo :');
db.prepare('SELECT name, code FROM teams').all().forEach(t => {
  console.log(`    ${t.code.padEnd(8)} → ${t.name}`);
});
console.log('');
console.log('🚀  Démarrez maintenant : npm start');

db.close();
