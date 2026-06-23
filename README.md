# CYF — Challenge Your Fans 🏟️

**Escape game immersif déployé dans les stades et arènes sportives.**

Les supporters résolvent des énigmes scénarisées via QR codes et NFC,
avec classements en temps réel et mode hors-ligne complet (PWA).

## Concept

CYF transforme l'enceinte sportive en terrain de jeu narratif.
Avant le match, pendant la mi-temps, ou en événement dédié,
les équipes de supporters résolvent des énigmes liées à l'histoire
et à l'identité de leur club.

## Formules tarifaires

| Formule | Tarif | Pour qui |
|---------|-------|----------|
| Forfait fixe | ~4 000 € | Clubs qui veulent maîtriser leur budget |
| Partage de recettes | 8-10% des revenus | Clubs qui veulent minimiser le risque |

## Stack technique

- **Backend** : Node.js + Express
- **Base de données** : SQLite (simple, déployable partout)
- **Frontend** : HTML/CSS/JS vanilla — PWA hors-ligne
- **Compatible** : arBATT (Franck Lefèvre) — pas de framework lourd

## Structure du projet

```
CYF/
├── server/          # API REST Express
│   ├── routes/      # games, enigmas, teams, scores
│   ├── models/      # ORM léger SQLite
│   └── db/          # Schéma SQL
├── client/          # Interface joueur + admin (PWA)
│   ├── css/
│   └── js/          # app.js, qrcode.js, sw.js (service worker)
└── docs/            # Architecture + API
```

## Installation

```bash
npm install
node server/index.js
# Ouvrir http://localhost:3000
```

## Démarrage rapide

1. Créer une partie via `/admin.html`
2. Ajouter les énigmes (texte + QR code ou code manuel)
3. Partager le lien de jeu aux équipes
4. Suivre la progression en temps réel sur le dashboard admin

## Auteur

Développé par H3P Solutions pour les clubs sportifs normands.
Partenaire technologique : Twelve Solutions / Wivi (Caen).

---
*CYF — Challenge Your Fans — H3P Solutions 2026*
