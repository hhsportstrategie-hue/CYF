# 🧪 Guide de test — Démo SM Caen

> *Pas-à-pas, optimisé pour quelqu'un qui galère sur CMD*
> *Temps estimé : 5 minutes pour la première fois, 2 minutes ensuite*

---

## ⚠️ Avant de commencer — Vérifie 2 choses

### 1. Node.js est installé ?

Ouvre une **invite de commandes** (`cmd.exe`) et tape :

```
node --version
```

**Si tu vois** `v18.x.x` ou plus → ✅ tu peux continuer
**Si tu vois** `'node' n'est pas reconnu en tant que commande` → ❌ il faut installer Node.js

👉 Pour installer Node.js : https://nodejs.org/ → télécharge la version **LTS** (verte, à gauche)
→ Double-clic sur l'installeur → Next → Next → Install
→ **Ferme la fenêtre CMD et rouvre-en une** (important !)

### 2. Tu sais où tu vas mettre le dossier CYF ?

Crée un dossier simple, par exemple :
- `C:\CYF` (recommandé, pas d'espace dans le chemin)

---

## 🚀 Pas-à-pas

### Étape 1 — Ouvre CMD dans le bon dossier

**Méthode facile** (la plus fiable) :
1. Ouvre l'Explorateur de fichiers Windows
2. Navigue jusqu'à `C:\CYF` (ou le dossier que tu as créé)
3. Clique dans la barre d'adresse (où il y a écrit `C:\CYF`)
4. Tape `cmd` et appuie sur **Entrée**

→ Une fenêtre CMD s'ouvre **directement dans le bon dossier**. C'est magique.

### Étape 2 — Clone le repo GitHub

Dans la fenêtre CMD, tape **une par une** les commandes suivantes (attends que chaque ligne se termine avant de taper la suivante) :

```cmd
git clone https://github.com/hhsportstrategie-hue/CYF.git
cd CYF
```

**Si tu vois `'git' n'est pas reconnu`** : il faut installer Git pour Windows → https://git-scm.com/download/win

### Étape 3 — Installe les dépendances

```cmd
npm install
```

**Ça va prendre 30 secondes à 2 minutes.** Tu verras défiler du texte, c'est normal. **Attends de revoir le prompt `C:\CYF\CYF>`** avant de continuer.

**Si tu vois des erreurs rouges** : fais une capture d'écran et envoie-la moi. Souvent c'est un proxy d'entreprise ou un antivirus qui bloque.

### Étape 4 — Charge la démo SM Caen

```cmd
npm run seed
```

**Tu dois voir** :

```
📋  Création du schéma…
🌱  Insertion des données de démo…
✅  Seed terminé :
    1 partie(s)
    3 énigme(s)
    4 équipe(s)
    3 score(s)

🎮  Codes d'équipe de démo :
    VIKING   → Les Vikings
    MALHBR   → Les Malherbes
    NORMAX   → Normandie Suprême
    ORNANO   → Team Ornano

🚀  Démarrez maintenant : npm start
```

**Si tu vois `Seed terminé` → ✅ c'est bon, passe à l'étape 5**

### Étape 5 — Lance le serveur

```cmd
npm start
```

**Tu dois voir** :

```
🎮  CYF — Challenge Your Fans
📍  http://localhost:3000
```

**⚠️ Important** : la fenêtre CMD va rester "bloquée" (le curseur clignote sans rien faire). C'est **NORMAL** — c'est le serveur qui tourne. **Ne ferme pas cette fenêtre !**

### Étape 6 — Ouvre le jeu dans le navigateur

Ouvre Chrome (ou ton navigateur préféré) et va sur :

```
http://localhost:3000
```

Tu devrais voir la page d'accueil CYF avec le logo 🏟️

### Étape 7 — Rejoins une partie

1. Sur la page d'accueil, tu devrais voir un champ **"Code équipe"**
2. Tape **`VIKING`** (ou un des 4 codes)
3. Clique sur **Rejoindre**
4. Tu entres dans la partie SM Caen 🎉

### Étape 8 — Joue !

Tu devrais voir l'énigme 1 : **"Le premier maillot"**

> *En quelle année le SM Caen a-t-il été fondé ? Cherchez l'inscription dorée à l'entrée du stade Michel d'Ornano.*

**Indice** : la réponse est `1913`

Teste les 3 énigmes dans l'ordre. Le classement se met à jour automatiquement.

### Étape 9 — Teste le mode admin

Dans un autre onglet, va sur :

```
http://localhost:3000/admin.html
```

Tu devrais voir le dashboard avec les stats de la partie démo.

---

## 🧪 Tester les tests (optionnel)

Dans la **même** fenêtre CMD où le serveur tourne, tu ne peux pas taper d'autres commandes. **Ouvre une 2ème fenêtre CMD** (refais Étape 1) et tape :

```cmd
cd C:\CYF\CYF
npm test
```

**Tu dois voir** : `# tests 16` `# pass 16` `# fail 0` ✅

---

## 🛑 Pour arrêter le serveur

Reviens dans la 1ère fenêtre CMD (celle qui tourne) et appuie sur :

```
Ctrl + C
```

Le serveur s'arrête, tu récupères la main.

---

## 🆘 Si ça plante

| Erreur | Solution |
|---|---|
| `'node' n'est pas reconnu` | Installe Node.js LTS, ferme et rouvre CMD |
| `'git' n'est pas reconnu` | Installe Git pour Windows |
| `npm install` erreurs rouges | Capture d'écran → envoi moi |
| `EADDRINUSE` (port 3000 pris) | Un autre truc tourne sur 3000. Change le port : `set PORT=3001 && npm start` |
| Page blanche dans le navigateur | Le serveur tourne bien ? Tu as bien tapé `http://localhost:3000` ? |
| Erreur 404 sur `/api/games` | Le seed n'a pas marché. Relance `npm run seed:reset` |
| Better-sqlite3 erreur compilation | Il faut peut-être installer les "tools" Windows. Regarde https://github.com/WiseLibs/better-sqlite3/blob/master/docs/troubleshooting.md |

**Dans tous les cas** : capture d'écran + envoie-moi.

---

## 📱 Pour tester sur ton téléphone (optionnel)

Une fois le serveur lancé sur ton PC, ton téléphone peut s'y connecter **sur le même Wi-Fi** :

1. Trouve l'IP de ton PC : `ipconfig` dans CMD → cherche "Adresse IPv4" (souvent `192.168.1.xx`)
2. Sur ton téléphone, ouvre Chrome et va sur `http://192.168.1.xx:3000` (remplace l'IP)
3. Tu peux jouer sur ton tel, c'est responsive

**Cool pour** : montrer le concept à quelqu'un, tester l'expérience mobile, voir le PWA en action.

---

## ✅ Récap — Ce que tu dois voir si tout marche

1. **Page d'accueil CYF** (http://localhost:3000) avec un design propre
2. **Rejoindre avec un code** (VIKING, MALHBR, NORMAX, ORNANO)
3. **3 énigmes** de la partie SM Caen
4. **Classement** qui se met à jour
5. **Dashboard admin** (http://localhost:3000/admin.html)
6. **16 tests passent** (`npm test`)
7. **Mode hors-ligne** : coupe le Wi-Fi, rafraîchis la page, ça marche encore !

---

*Hervé, si tu bloques sur une étape, **fais une capture d'écran et envoie-la moi** — on fera la session de debugging ensemble comme la dernière fois avec Python.*

*— Cathy*
