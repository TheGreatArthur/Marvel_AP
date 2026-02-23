# Marvel Heroes Explorer

Application full-stack basée sur l’API SuperHero (superheroapi.com).

## Stack
- Front: React + Vite + TypeScript + React Router + Tailwind CSS
- Back: Node.js + Express + TypeScript + cors
- Proxy SuperHero API avec token (jamais exposé côté front)
- Cache in-memory (TTL 60s par défaut)

## Pré-requis
- Node.js 18+
- Compte Marvel Developer

## Clé SuperHero API
1. Récupère un token SuperHero API (superheroapi.com).
2. Crée un fichier `.env` à la racine en te basant sur `.env.example`.

Exemple:
```
PORT=3001
CACHE_TTL_MS=60000
SUPERHERO_API_TOKEN=...
SUPERHERO_MAX_ID=731
SUPERHERO_MAX_RESULTS=200
SUPERHERO_TIMEOUT_MS=15000
```

## Lancer en dev
```bash
npm install
npm run dev
```
- Front: http://localhost:5173
- Back: http://localhost:3001

## Build
```bash
npm run build
```

## Architecture
```
/client   # React + Vite + Tailwind
/server   # Express + TypeScript
```

## Routes API (proxy)
- `GET /api/heroes?search=&page=&pageSize=`
- `GET /api/heroes/:id`
- `GET /api/heroes/:id/comics?limit=&orderBy=`
- `GET /api/heroes/:id/series?limit=`
- `GET /api/heroes/:id/events?limit=`
- `GET /api/comics/:id/characters?limit=` (utilisé pour déduire des ennemis)

## Limites de l’API
- L’API SuperHero ne fournit pas de comics/séries/events détaillés.
- Les sections correspondantes sont donc affichées comme “Non disponible”.
