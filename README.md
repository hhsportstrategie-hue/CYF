# CYF — Challenge Your Fans 🏟️

> *Escape game immersif déployé dans les stades et arènes sportives.*

**CYF** transforme l'enceinte sportive en terrain de jeu narratif. Les supporters
résolvent des énigmes scénarisées (QR codes, NFC, codes, texte) avant le match,
pendant la mi-temps, ou en événement dédié. Classement en temps réel, mode
hors-ligne complet, collecte de données CRM pour les clubs.

[![Status](https://img.shields.io/badge/status-MVP%20v1.0-brightgreen)]()
[![License](https://img.shields.io/badge/license-MIT-blue)]()
[![Node](https://img.shields.io/badge/node-%3E%3D18-green)]()

---

## 🎯 Concept

- **Hybride physique + digital** : énigmes ancrées dans le stade (zones, signalétique, expositions)
- **Narratif personnalisé** : scénarios adaptés à l'identité du club
- **Engagement pré/per/pendant match** : fidélisation supporters
- **CRM** : collecte d'emails, opt-in marketing, données de jeu
- **White-label** : déployable pour tout club

### Formules tarifaires

| Formule | Tarif | Pour qui |
|---------|-------|----------|
| Forfait fixe | ~4 000 € | Clubs qui veulent maîtriser leur budget |
| Partage de recettes | 8-10% des revenus billetterie | Clubs qui veulent minimiser le risque |

---

## ⚡ Démarrage rapide (3 minutes)

```bash
# 1. Cloner
git clone https://github.com/hhsportstrategie-hue/CYF.git
cd CYF

# 2. Installer
npm install

# 3. Charger les données de démo
node server/seed.js

# 4. Lancer
npm start
```

Le serveur démarre sur **http://localhost:3000**.

- 🎮 **Joueur** : http://localhost:3000
- ⚙️ **Admin** : http://localhost:3000/admin.html

### Codes d'équipe de démo (fournis par le seed)

| Code | Équipe |
|------|--------|
| `VIKING` | Les Vikings |
| `MALHBR` | Les Malherbes |
| `NORMAX` | Normandie Suprême |
| `ORNANO` | Team Ornano |

---

## 🏗️ Stack technique

| Couche | Technologie | Pourquoi |
|--------|-------------|----------|
| **Backend** | Node.js + Express | Léger, rapide à déployer, familier |
| **Base de données** | SQLite (better-sqlite3) | Zéro admin, synchrone, rapide |
| **Frontend** | HTML/CSS/JS vanilla | Pas de build step, compatible PWA offline |
| **PWA** | Service Worker natif | Mode hors-ligne réel, pas d'app store |
| **Tests** | node:test (Node 18+) | Aucune dépendance externe |

### Décisions structurantes

- ❌ **Pas de framework JS** (React, Vue, Angular) — overkill pour le besoin
- ❌ **Pas de build step** — le code s'exécute directement
- ❌ **Pas de framework lourd** (NestJS, TypeORM) — Express suffit
- ✅ **SQLite** plutôt que PostgreSQL — déployable en 1 fichier
- ✅ **vanilla JS** plutôt que framework — maintenable par n'importe quel dev

> **Compatibilité arBATT (Franck Lefèvre)** : choix de stack conçu pour
> s'intégrer sans friction avec l'écosystème arBATT.

---

## 📂 Structure du projet

```
CYF/
├── server/                  # API REST Express
│   ├── index.js            # Point d'entrée
│   ├── seed.js             # Script de seed
│   ├── routes/             # 4 routeurs
│   │   ├── games.js
│   │   ├── enigmas.js
│   │   ├── teams.js
│   │   └── scores.js
│   ├── models/             # ORM léger (classes)
│   │   ├── game.js
│   │   ├── enigma.js
│   │   ├── team.js
│   │   └── score.js
│   ├── db/
│   │   ├── schema.sql      # Schéma SQLite
│   │   └── seed.sql        # Données de démo
│   └── tests/
│       └── api.test.js     # 16 tests d'API
├── client/                  # Interface joueur + admin (PWA)
│   ├── index.html          # Accueil + rejoindre
│   ├── game.html           # Partie joueur
│   ├── admin.html          # Dashboard club
│   ├── manifest.json
│   ├── css/style.css
│   └── js/
│       ├── app.js          # Logique commune
│       ├── qrcode.js       # Génération QR
│       └── sw.js           # Service Worker
├── docs/
│   ├── API.md              # Documentation API REST
│   └── ARCHITECTURE.md     # Architecture technique
├── .env.example
├── .gitignore
├── package.json
├── LICENSE
├── CHANGELOG.md
└── README.md
```

---

## 🔌 API

Base URL : `http://localhost:3000/api`

### Endpoints principaux

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `GET`   | `/health` | Health check |
| `GET`   | `/games` | Liste des parties |
| `POST`  | `/games` | Créer une partie |
| `GET`   | `/games/:id/stats` | Statistiques d'une partie |
| `GET`   | `/enigmas?game_id=xxx` | Énigmes d'une partie (sans réponse) |
| `POST`  | `/enigmas/:id/check` | Vérifier une réponse |
| `GET`   | `/teams/join/:code` | Rejoindre par code 6 caractères |
| `POST`  | `/teams` | Créer une équipe (code auto-généré) |
| `POST`  | `/scores/submit` | Soumettre une réponse + score |
| `GET`   | `/scores/leaderboard/:game_id` | Classement temps réel |

**Documentation complète** : [`docs/API.md`](docs/API.md)

### Sécurité

- Les **réponses correctes ne sont jamais exposées** côté client
  (filtre sur la route `GET /api/enigmas/:id`)
- Validation serveur insensible à la casse et aux espaces
- CORS configurable via `.env` (CORS_ORIGINS en production)

---

## 🧪 Tests

```bash
npm test
```

16 tests d'API couvrent :
- Health check
- CRUD Games (5 tests)
- Enigmas + sécurité (5 tests)
- Teams + Scores + Leaderboard (5 tests)

Framework : `node:test` natif, **aucune dépendance externe**.

---

## 🎮 Mode hors-ligne (PWA)

Le Service Worker (`client/js/sw.js`) implémente :
- **Cache First** pour les assets statiques
- **Network First** pour l'API (avec fallback gracieux)
- **Queue offline** (`localStorage`) pour les réponses
- **Background Sync** (quand supporté par le navigateur)

> **Cas d'usage** : un supporter dans une zone avec couverture limitée
> peut continuer à jouer. Ses réponses sont mises en file et synchronisées
> automatiquement au retour du réseau.

---

## 🚀 Déploiement

### Développement
```bash
npm install
npm run dev    # avec nodemon (rechargement auto)
```

### Production
```bash
# Option 1 : Node direct
npm start

# Option 2 : PM2 (recommandé)
pm2 start server/index.js --name cyf
pm2 save
pm2 startup
```

### Variables d'environnement

Copier `.env.example` en `.env` et adapter :

```env
PORT=3000
NODE_ENV=production
CORS_ORIGINS=https://cyf.votreclub.fr
```

---

## 🤝 Contribution

Ce projet est en phase de **MVP stabilisé**. Les contributions sont les
bienvenues mais doivent passer par une discussion préalable avec l'équipe.

### Conventions de code

- **Backend** : JavaScript moderne (ES2020+), JSDoc sur les fonctions exportées
- **Frontend** : vanilla JS, pas de transpileur
- **SQL** : snake_case, FK explicites, index sur les colonnes de jointure
- **Commits** : messages clairs en français, un commit = une fonctionnalité

---

## 📊 Roadmap

Voir [`CHANGELOG.md`](CHANGELOG.md) pour le détail.

- **v1.1** : Auth admin, WebSocket temps réel, statistiques avancées
- **v1.2** : i18n, CMS énigmes, multi-clubs white-label
- **v2.0** : PostgreSQL multi-tenants, app mobile native

---

## 👥 Auteurs

**H3P Solutions** — Hervé Huet
- Site : https://h3p.solutions
- LinkedIn : https://www.linkedin.com/in/hhuet-h3psolutions

**Partenaire technologique** : Twelve Solutions / Wivi (Caen)

---

## 📜 Licence

MIT — voir [`LICENSE`](LICENSE).

Les **données de démo** (énigmes SM Caen) sont la propriété de H3P Solutions.
Le **code source** est réutilisable librement.

---

*CYF — Challenge Your Fans — H3P Solutions 2026*
*Escape game immersif pour clubs sportifs normands*
