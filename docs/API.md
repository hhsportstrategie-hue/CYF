# CYF — Documentation API REST

Base URL : `http://localhost:3000/api`

## 🔒 Authentification admin

Les routes marquées **🔒 Admin** exigent l'en-tête
`Authorization: Bearer <jeton>`. Sans jeton valide : **401**.

### POST /auth/login
**Body** `{ "password": "..." }` (valeur de `ADMIN_PASSWORD`)
**Response 200** `{ "token": "...", "expires_at": "2026-10-22T03:00:00.000Z" }` — valable 12 h
**401** mot de passe incorrect · **429** après 5 échecs (blocage 15 min par adresse IP)

### GET /auth/check 🔒 Admin
Vérifie qu'un jeton est encore valide. **Response 200** `{ "authenticated": true }`

### Routes protégées 🔒 Admin
`POST/PATCH/DELETE /games`, `GET /games/:id/stats`,
`POST/PATCH/DELETE /enigmas`, `POST /enigmas/:id/check`,
`GET /teams?game_id=`, `GET /teams/:id`, `POST /teams`, `DELETE /teams/:id`.

Restent publiques (parcours joueur) : `GET /games`, `GET /games/:id`,
`GET /enigmas`, `GET /enigmas/:id`,
`GET /teams/join/:code`, `POST /scores/submit`, `GET /scores/leaderboard/:game_id`,
`GET /scores/progress/:team_id`.

---

## 🎮 Games

### GET /games
Liste toutes les parties.

**Response 200**
```json
[{ "id": "uuid", "club_name": "SM Caen", "game_date": "2026-10-15", "max_teams": 20, "mode": "sequential", "status": "active" }]
```

### GET /games/:id
Détail d'une partie.

### GET /games/:id/stats
Statistiques (nb équipes, nb énigmes).

### POST /games
Créer une partie.

**Body**
```json
{ "club_name": "SM Caen", "game_date": "2026-10-15", "max_teams": 20, "mode": "sequential" }
```

### PATCH /games/:id
Modifier une partie (champs : club_name, game_date, max_teams, mode, status).

### DELETE /games/:id
Supprimer une partie (cascade sur énigmes, équipes, scores).

---

## 🔍 Enigmas

### GET /enigmas?game_id=xxx
Liste les énigmes d'une partie (triées par order_num). **La réponse n'est pas incluse.**

### GET /enigmas/:id
Détail d'une énigme. **La réponse n'est pas incluse.**

### POST /enigmas
Créer une énigme.

**Body**
```json
{
  "game_id": "uuid",
  "order_num": 1,
  "title": "La salle des trophées",
  "description": "Trouvez l'année du premier titre...",
  "hint": "Regardez le mur du fond",
  "answer_type": "code",
  "answer": "1972",
  "points": 100,
  "time_bonus": 50
}
```

### POST /enigmas/:id/check 🔒 Admin
Tester une réponse (sans créer de score). Réservé à l'admin : ouvert aux
joueurs, il permettrait d'essayer des réponses sans aucune limite.

**Body** `{ "answer": "1972" }`
**Response** `{ "valid": true, "points": 100, "time_bonus": 50 }`

### PATCH /enigmas/:id
Modifier une énigme.

### DELETE /enigmas/:id
Supprimer une énigme.

---

## 👥 Teams

### GET /teams?game_id=xxx
Liste les équipes d'une partie.

### GET /teams/join/:code
Rejoindre par code (ex: `ABC123`). Retourne l'équipe complète.

### GET /teams/:id
Détail d'une équipe.

### POST /teams
Créer une équipe (le code est généré automatiquement).

**Body** `{ "game_id": "uuid", "name": "Les Ultras", "members": 4 }`
**Response** inclut le `code` généré.

### DELETE /teams/:id
Supprimer une équipe.

---

## 🏅 Scores

### GET /scores/leaderboard/:game_id
Classement en temps réel. Public : ne contient **pas** les codes d'équipe.

**Response**
```json
[
  { "team_id": "uuid", "team_name": "Les Ultras", "total_points": 350, "enigmas_solved": 3, "last_solved_at": "2026-10-15T14:32:00" }
]
```

### GET /scores/progress/:team_id
Progression d'une équipe (énigmes résolues + points).

### POST /scores/submit
Soumettre une réponse et calculer le score.

- L'équipe et l'énigme doivent exister (**404**) et appartenir à la même partie (**400**).
- Une mauvaise réponse ajoute une tentative ; l'énigme reste non résolue.
- Bonus temps si `time_taken` < 120 s.
- **Anti force brute** : après 5 mauvaises réponses sur une même énigme,
  une équipe ne peut plus répondre qu'une fois toutes les 30 s → **429**
  `{ "error": "Trop d'essais : patientez 12 s avant de réessayer.", "retry_after": 12 }`
  (en-tête `Retry-After`).

**Body**
```json
{ "team_id": "uuid", "enigma_id": "uuid", "answer": "1972", "time_taken": 87 }
```

**Response (correct)**
```json
{ "valid": true, "points": 150, "score": { ... } }
```

**Response (incorrect)**
```json
{ "valid": false, "attempts": 2, "message": "Mauvaise réponse, réessaie !" }
```

**Response (déjà résolu)**
```json
{ "already_solved": true, "score": { ... } }
```

---

## ❤️ Health

### GET /health
`{ "status": "ok", "version": "1.0.0", "timestamp": "..." }`
