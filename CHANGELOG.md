# 📋 Changelog — CYF Challenge Your Fans

Toutes les évolutions notables de ce projet sont documentées ici.

Format basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/),
ce projet adhère au [Semantic Versioning](https://semver.org/lang/fr/).

---

## [Non publié]

### 🔒 Sécurité
- Authentification du dashboard club : mot de passe `ADMIN_PASSWORD`,
  session signée de 12 h, écran de connexion et bouton de déconnexion
- Création / modification / suppression, statistiques et liste des équipes
  (avec leurs codes d'accès) réservées à l'admin ; parcours joueur inchangé
- Blocage 15 min après 5 mauvais mots de passe (par adresse IP)
- Sans `ADMIN_PASSWORD`, mot de passe temporaire aléatoire affiché au démarrage
  (aucun mot de passe par défaut)
- La liste des énigmes d'une partie n'expose plus les réponses

### 🔧 Technique
- Lecture du fichier `.env` sans dépendance ; `DB_PATH`, `SESSION_SECRET`,
  `TRUST_PROXY` pris en compte
- `better-sqlite3` ^11 (Node 22), tests isolés sur une base dédiée
- Cache du Service Worker passé en `cyf-v2` pour servir le nouveau dashboard

---

## [1.0.0] — 2026-07-03

### 🎉 Version initiale — Production-ready MVP

#### Backend
- ✅ API REST Express avec 4 ressources (games, enigmas, teams, scores)
- ✅ Base SQLite avec 4 tables, FK, index, contraintes
- ✅ 4 modèles (Game, Enigma, Team, Score) + 4 routeurs
- ✅ 14 endpoints documentés
- ✅ Sécurité : réponses d'énigmes jamais exposées côté client
- ✅ Validation côté serveur (casse, espaces)

#### Frontend (PWA)
- ✅ 3 interfaces : accueil, jeu joueur, admin
- ✅ Service Worker avec stratégie Network First / Cache First
- ✅ Mode hors-ligne complet (queue LocalStorage + Background Sync)
- ✅ Manifest PWA + bannière offline
- ✅ HTML/CSS/JS vanilla (pas de framework lourd)

#### Données
- ✅ Schéma SQL complet avec contraintes et index
- ✅ Script de seed avec partie démo SM Caen + 3 énigmes + 4 équipes
- ✅ 4 codes d'équipe de démo préchargés

#### Tests
- ✅ 16 tests d'API (node:test natif, aucune dépendance)
- ✅ Couvrent CRUD + cas d'erreur + sécurité

#### Gouvernance
- ✅ README complet (concept, install, démarrage rapide)
- ✅ Documentation API (docs/API.md)
- ✅ Documentation Architecture (docs/ARCHITECTURE.md)
- ✅ Licence MIT
- ✅ .env.example, .gitignore
- ✅ Changelog

---

## Roadmap

### v1.1 — Q3 2026
- Authentification admin (JWT)
- WebSocket pour classement temps réel
- Statistiques avancées (taux de réussite par énigme, temps moyen)
- Export CSV des scores

### v1.2 — Q4 2026
- Internationalisation (EN, ES)
- Module CMS pour gérer les énigmes en mode admin
- Génération automatique de QR codes
- Mode multi-clubs (white-label)

### v2.0 — 2027
- Migration vers PostgreSQL (multi-tenants)
- App mobile native (React Native)
- Intégration billetterie stade
