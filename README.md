<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# FamilyFlow

FamilyFlow is a smart family management application that helps organize tasks, goals, habits, shopping, and calendar events. Powered by Gemini AI, it provides intelligent scheduling, workload balancing, and weekly summaries.

## Tech Stack

- **Frontend**: React 19, TypeScript, React Router v7, Zustand, Tailwind CSS v4, Motion, Lucide React
- **Backend**: Express, TypeScript, Socket.io
- **AI**: Google Gemini API (via @google/genai)
- **Database**: Firebase Firestore + Local JSON
- **Build**: Vite, esbuild, tsx
- **Testing**: Vitest

## Quick Start

**Prerequisites:** Node.js 20+

```bash
# 1. Install dependencies
npm install

# 2. Set environment variables
cp .env.example .env
# Edit .env and set GEMINI_API_KEY

# 3. Start development server
npm run dev
```

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run preview` | Preview production build |
| `npm run test` | Run tests with Vitest |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Run tests with coverage |
| `npm run lint` | TypeScript type check |
| `npm run clean` | Remove dist directory |
| `npm run migrate` | Run Firestore migration |

## Environment Variables

| Variable | Description |
|----------|-------------|
| `GEMINI_API_KEY` | Required. Gemini AI API key |
| `APP_URL` | App URL (default: http://localhost:3000) |
| `JWT_SECRET` | JWT signing secret |
| `FIREBASE_PROJECT_ID` | Firebase project ID |
| `FIRESTORE_DATABASE_ID` | Firestore database ID |
| `NODE_ENV` | Environment (development / production) |

## Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose up --build

# Or build manually
docker build -t familyflow .
docker run -p 3001:3001 --env-file .env familyflow
```

## CI/CD

![CI/CD](https://github.com/your-org/familyflow/actions/workflows/ci.yml/badge.svg)

The CI/CD pipeline runs quality checks (TypeScript, lint, tests, build) on push to main/develop and deploys accordingly.

## API Documentation

See [docs/API.md](docs/API.md) for the full API reference.

## Deploy

### Pré-requisitos
- [Railway CLI](https://docs.railway.app/develop/cli) instalado
- [Vercel CLI](https://vercel.com/docs/cli) instalado
- Tokens de deploy configurados nos secrets do GitHub

### Backend (Railway)
```bash
railway login
railway init
railway up
```

### Frontend (Vercel)
```bash
vercel login
vercel --prod
```

### Variáveis de ambiente necessárias
| Variável | Onde configurar |
|---|---|
| `RAILWAY_TOKEN` | GitHub Secrets |
| `VERCEL_TOKEN` | GitHub Secrets |
| `FIREBASE_SERVICE_ACCOUNT` | Railway Environment |
| `GEMINI_API_KEY` | Railway Environment |
| `JWT_SECRET` | Railway Environment |
| `VITE_FIREBASE_API_KEY` | Vercel Environment |
| `VITE_FIREBASE_PROJECT_ID` | Vercel Environment |
| `VITE_GEMINI_API_KEY` | Vercel Environment |

## Smoke Test

```bash
# Start the server, then run:
npx tsx tests/smoke.test.ts
```

## Load Test

Requires [k6](https://k6.io/):

```bash
k6 run tests/load.test.js
```
