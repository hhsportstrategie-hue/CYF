# CYF — Architecture technique

## Vue d'ensemble

```
Navigateur (PWA)          Serveur Node.js          SQLite
┌─────────────────┐       ┌──────────────────┐      ┌──────────────┐
│  client/        │ HTTP  │  server/         │      │  cyf.sqlite  │
│  ├─ index.html  │◄─────►│  ├─ index.js     │◄────►│              │
│  ├─ game.html   │       │  ├─ routes/      │      │  games       │
│  ├─ admin.html  │       │  │  ├─ games.js  │      │  enigmas     │
│  └─ js/         │       │  │  ├─ enigmas.js│      │  teams       │
│     ├─ app.js   │       │  │  ├─ teams.js  │      │  scores      │
│     ├─ qrcode.js│       │  │  └─ scores.js │      └──────────────┘
│     └─ sw.js    │       │  ├─ models/      │
└─────────────────┘       │  └─ db/          │
                          └──────────────────┘
```

## Flux de jeu

```
1. Admin crée une partie      → POST /api/games
2. Admin ajoute des énigmes   → POST /api/enigmas
3. Admin crée des équipes     → POST /api/teams  (génère code unique)
4. Joueur entre le code       → GET  /api/teams/join/:code
5. Joueur reçoit les énigmes  → GET  /api/enigmas?game_id=xxx (téléchargées en cache PWA)
6. Joueur soumet une réponse  → POST /api/scores/submit
7. Classement mis à jour      → GET  /api/scores/leaderboard/:game_id (polling 15s)
```

## Mode hors-ligne (PWA)

Le Service Worker (`sw.js`) met en cache :
- Tous les assets statiques (HTML, CSS, JS) — **Cache First**
- Les appels API échouent gracieusement — **Network First avec fallback 503**

Les réponses en mode hors-ligne sont stockées dans `localStorage` (clé `cyf_offline_queue`)
et synchronisées automatiquement au retour du réseau via `syncQueue()`.

Les énigmes sont téléchargées dès le démarrage de la partie et stockées en `localStorage`
(clé `cyf_enigmas_<game_id>`), permettant de jouer sans connexion.

## Modèle de données

### games
| Colonne    | Type    | Description |
|-----------|---------|-------------|
| id        | TEXT PK | UUID v4 |
| club_name | TEXT    | Nom du club organisateur |
| game_date | TEXT    | Date ISO |
| max_teams | INT     | Limite équipes |
| mode      | TEXT    | 'sequential' ou 'free' |
| status    | TEXT    | 'draft', 'active', 'finished' |

### enigmas
| Colonne     | Type    | Description |
|------------|---------|-------------|
| id         | TEXT PK | UUID v4 |
| game_id    | TEXT FK | → games.id |
| order_num  | INT     | Ordre d'affichage |
| title      | TEXT    | Titre de l'énigme |
| description| TEXT    | Texte affiché aux joueurs |
| hint       | TEXT?   | Indice optionnel |
| answer_type| TEXT    | 'qrcode', 'code', 'text' |
| answer     | TEXT    | Réponse correcte (stockée en clair côté serveur) |
| points     | INT     | Points de base |
| time_bonus | INT     | Bonus si résolu en < 2 min |

### teams
| Colonne      | Type    | Description |
|-------------|---------|-------------|
| id          | TEXT PK | UUID v4 |
| game_id     | TEXT FK | → games.id |
| name        | TEXT    | Nom de l'équipe |
| code        | TEXT    | Code unique 6 car. (ex: ABC123) |
| members     | INT     | Nombre de joueurs |

### scores
| Colonne    | Type    | Description |
|-----------|---------|-------------|
| id        | TEXT PK | UUID v4 |
| team_id   | TEXT FK | → teams.id |
| enigma_id | TEXT FK | → enigmas.id |
| points    | INT     | Points obtenus |
| solved_at | TEXT?   | Timestamp de résolution |
| time_taken| INT?    | Secondes |
| attempts  | INT     | Nombre de tentatives |

## Sécurité

- Les réponses correctes ne sont **jamais exposées** côté client (route GET /api/enigmas/:id filtre le champ `answer`)
- Validation côté serveur insensible à la casse et aux espaces
- CORS activé pour le développement (à restreindre en production)

## Déploiement

```bash
# Développement
npm install
npm run dev

# Production
npm start
# Ou avec PM2 :
pm2 start server/index.js --name cyf

# Variables d'environnement
PORT=3000          # Port d'écoute (défaut: 3000)
```

## Compatibilité arBATT (Franck Lefèvre)

- Pas de framework JS (React, Vue, Angular) — HTML/CSS/JS vanilla uniquement
- Pas de build step — le code s'exécute directement
- PWA offline-first — fonctionne sans réseau après le premier chargement
- BarcodeDetector API pour le scan QR (natif sur Android Chrome)
- Service Worker compatible avec les contraintes de cache des environnements embarqués
