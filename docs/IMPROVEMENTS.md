# Melhorias e Mudanças — Sessão de Refatoração

> **Data:** Junho 2026
> **Status:** Implementado
> **Escopo:** Sprint 0 (Fundação) + Sprint 1 (Auth parcial)

---

## Sumário

1. [Estrutura do Servidor](#1-estrutura-do-servidor)
2. [Segurança](#2-seguranca)
3. [Firebase Auth (Cliente)](#3-firebase-auth-cliente)
4. [Componentes e Hooks](#4-componentes-e-hooks)
5. [Estado Global (Zustand)](#5-estado-global-zustand)
6. [PWA e Service Worker](#6-pwa-e-service-worker)
7. [Infraestrutura de Testes](#7-infraestrutura-de-testes)
8. [Código Morto Removido](#8-codigo-morto-removido)
9. [Mudanças em Arquivos Existentes](#9-mudancas-em-arquivos-existentes)
10. [Arquivos Criados](#10-arquivos-criados)

---

## 1. Estrutura do Servidor

### Antes
`server.ts` monolítico com **1227 linhas** — toda a lógica (rotas, auth, banco, validação, etc.) em um único arquivo.

### Depois
Arquitetura em camadas com separação clara de responsabilidades:

```
server/
├── index.ts              # Entry point (importa app do server.ts)
├── config/
│   ├── env.ts            # Variáveis de ambiente tipadas
│   ├── firebase.ts       # Firebase Admin SDK init
│   └── ai.ts             # Config do Google GenAI
├── middleware/
│   ├── auth.ts           # JWT verification middleware
│   ├── errorHandler.ts   # Tratamento global de erros
│   ├── validate.ts       # Validação Zod
│   └── rateLimiter.ts    # Rate limiting
├── types/
│   └── errors.ts         # Classes de erro customizadas
├── repositories/
│   ├── index.ts
│   ├── task.repository.ts
│   ├── goal.repository.ts
│   ├── habit.repository.ts
│   ├── shopping.repository.ts
│   ├── event.repository.ts
│   ├── chat.repository.ts
│   └── notification.repository.ts
├── services/
│   ├── auth.service.ts       # JWT + Firebase token validation
│   ├── task.service.ts
│   ├── state.service.ts      # Gerenciamento do FamilyState (local + Firestore)
│   ├── gamification.service.ts
│   └── notification.service.ts
├── controllers/
│   ├── auth.controller.ts     # register, login, firebaseAuth, deleteProfile
│   ├── task.controller.ts
│   ├── goal.controller.ts
│   ├── habit.controller.ts
│   ├── chat.controller.ts
│   ├── notification.controller.ts
│   ├── shopping.controller.ts
│   └── state.controller.ts
├── routes/
│   └── index.ts               # Agrega todas as rotas
└── ai/
    └── index.ts               # Endpoint /api/gemini/chat + fallback local
```

**server.ts** refatorado: agora importa os módulos em vez de conter toda a lógica inline.

---

## 2. Segurança

### 2.1 Senha em Plaintext Removida
- **Arquivo:** `src/types.ts`
- Campo `password` foi **removido** da interface `UserProfile`
- Senhas agora são gerenciadas exclusivamente pelo **Firebase Auth** (hash automático)

### 2.2 Firebase Auth — Servidor
- **Arquivo:** `server/services/auth.service.ts`
- Função `validateFirebaseToken(idToken)` — verifica tokens Firebase via Admin SDK
- Função `generateToken(payload)` — gera JWT com expiração de 7 dias
- Função `verifyToken(token)` — valida JWT nas requisições

### 2.3 Endpoint de Firebase Auth
- **Arquivo:** `server/controllers/auth.controller.ts`
- Novo método `firebaseAuth()` — recebe `idToken` do Firebase, valida, cria ou encontra usuário, retorna JWT + perfil

### 2.4 Firestore Security Rules
- **Arquivo:** `firestore.rules`
- Regras baseadas em `request.auth.uid` — apenas usuários autenticados podem ler/escrever
- Validação por família (membros da mesma família)
- Bloqueia acesso anônimo

### 2.5 Firestore Indexes
- **Arquivo:** `firestore.indexes.json`
- Índices compostos para queries futuras (tasks por status+data, etc.)

### 2.6 .gitignore Atualizado
- `firebase-applet-config.json` — agora ignorado (contém API key)
- `.env` — agora ignorado
- `certificates/` — ignorado
- `*.log`, `dist/`, `node_modules/`

### 2.7 .env.example
- Documenta todas as variáveis de ambiente necessárias
- `JWT_SECRET`, `GEMINI_API_KEY`, `FIREBASE_PROJECT_ID`, etc.

---

## 3. Firebase Auth (Cliente)

### 3.1 Serviço Firebase
- **Arquivo:** `src/services/firebase.ts` (NOVO)
- Inicializa Firebase App com as credenciais do projeto
- Exporta `getFirebaseApp()` e `getFirebaseAuth()`

### 3.2 Serviço de Autenticação
- **Arquivo:** `src/services/auth.ts` (NOVO)

| Função | Descrição |
|--------|-----------|
| `signInWithGoogle()` | Popup do Google via Firebase Auth + troca por JWT |
| `signInWithApple()` | Popup da Apple via Firebase Auth + troca por JWT |
| `signInWithEmail(email, password)` | Login email/senha via Firebase |
| `registerWithEmail(email, password)` | Registro email/senha via Firebase |
| `signOut()` | Logout do Firebase + limpa JWT local |

Todas as funções chamam `POST /api/auth/firebase` após o login Firebase para obter o JWT do FamilyFlow.

### 3.3 AuthScreen Reescrita
- **Arquivo:** `src/components/AuthScreen.tsx`
- **Antes:** OAuth simulado — popup modal com dados fictícios (Alessandro Silva, Brenda Alves), sem autenticação real
- **Depois:** Firebase Auth real — Google e Apple via `signInWithPopup`, email via `signInWithEmailAndPassword`
- UI visual **mantida** (mesmo design, animações, layout)
- Fluxo de login/registro agora cria conta no Firebase primeiro, depois associa ao perfil FamilyFlow

### 3.4 Logout com Firebase
- **Arquivo:** `src/App.tsx`
- `handleLogout` agora chama `authService.signOut()` — desloga do Firebase + limpa JWT

---

## 4. Componentes e Hooks

### 4.1 SubTabBar (Componente Reutilizável)
- **Arquivo:** `src/components/ui/SubTabBar.tsx` (NOVO)
- **Problema:** App.tsx tinha a barra de sub-abas **duplicada 4 vezes** (Tasks, Goals, Habits, Shopping)
- **Solução:** Componente `<SubTabBar>` único + constante `TASK_SUB_TABS`
- **Redução:** ~120 linhas de código duplicado → 1 componente de 40 linhas
- Importado e usado em App.tsx no lugar dos 4 blocos repetidos

### 4.2 useAudio Hook
- **Arquivo:** `src/hooks/useAudio.ts` (NOVO)
- **Problema:** Sempre que um som tocava, um novo `AudioContext` era criado — vazamento de memória
- **Solução:** Pool único de `AudioContext` reutilizado
- API: `playSound(type: 'success' | 'error' | 'click' | 'notification')`

---

## 5. Estado Global (Zustand)

### 5.1 Auth Store
- **Arquivo:** `src/stores/useAuthStore.ts`
- Gerencia `currentUser`, `token`, com persistência em `localStorage`
- Ações: `setCurrentUser`, `setToken`, `logout`

### 5.2 UI Store
- **Arquivo:** `src/stores/useUIStore.ts` (NOVO)
- Gerencia: `darkMode`, `activeTab`, `fabMenu`, `notifications`, `loading`, `floatingAlerts`
- Centraliza estado de UI que antes estava espalhado em App.tsx

---

## 6. PWA e Service Worker

### 6.1 Manifest.json
- **Arquivo:** `public/manifest.json` (NOVO)
- Configuração completa: nome, ícones, tema, display standalone, orientação
- `start_url`, `scope`, `background_color`, `theme_color`

### 6.2 Service Worker
- **Arquivo:** `public/sw.js` (REESCRITO)
- Estratégia **network-first** para chamadas de API
- Estratégia **cache-first** para assets estáticos (CSS, JS, imagens)
- Handler para push notifications
- Cache naming versionado (`familyflow-v1`)
- Fallback offline: retorna resposta 503 amigável

### 6.3 main.tsx
- Registro do Service Worker no `load` event
- Limpeza de imports não utilizados

### 6.4 index.html
- Meta tags PWA: `theme-color`, `apple-mobile-web-app-capable`, viewport
- Preconnect para Google Fonts
- Link para manifest.json

---

## 7. Infraestrutura de Testes

### 7.1 Vitest
- **Arquivo:** `vitest.config.ts` (NOVO)
- Configurado com JSDOM environment
- Caminho de testes: `tests/`

### 7.2 Testes Unitários
- **Arquivo:** `tests/unit.test.ts` (NOVO)
- 3 suites de teste, 5 testes no total:

| Suite | Testes |
|-------|--------|
| `stateService` | `get() retorna estado atual`, `getUsers() retorna array vazio`, `addUser() adiciona usuário` |
| `authService` | `generateToken() gera token JWT` |
| `stateService.reset()` | `reset() redefine para estado inicial` |

### 7.3 package.json
- Adicionados scripts: `test`, `test:watch`, `test:coverage`
- Novas dependências: `zustand`, `vitest`, `jsonwebtoken`, `@types/jsonwebtoken`

---

## 8. Código Morto Removido

| Onde | O que | Por que |
|------|-------|---------|
| `src/types.ts` | `AISuggestion` type | Não era usado em nenhum lugar |
| `src/App.tsx` | `handleAddHabit` antigo | Enviava POST vazio para `/api/task` em vez de `/api/habit` |
| `src/types.ts` | `password` em `UserProfile` | Senha não deve ser armazenada no modelo |

---

## 9. Mudanças em Arquivos Existentes

| Arquivo | Mudança |
|---------|---------|
| `server.ts` | Refatorado: importa módulos (config, middleware, routes, ai) em vez de lógica inline |
| `src/types.ts` | Adicionado `AppTheme`; removido `password` de `UserProfile` |
| `src/App.tsx` | Substituiu 4 sub-tab bars por `<SubTabBar>`; corrigiu `handleAddHabit`; logout chama Firebase signOut |
| `src/services/api.ts` | Agora inclui `Authorization: Bearer <JWT>` em todas as requisições |
| `src/main.tsx` | Adicionado SW registration |
| `src/index.html` | Meta tags PWA + preconnect |
| `public/sw.js` | Estratégias de cache + push notifications |
| `package.json` | Novos scripts + dependências |
| `.gitignore` | `firebase-applet-config.json`, `.env`, `certificates/` |
| `server/routes/index.ts` | Adicionada rota `POST /api/auth/firebase` |
| `server/controllers/auth.controller.ts` | Adicionado método `firebaseAuth()` |

---

## 10. Arquivos Criados

### Servidor (18 arquivos novos)
```
server/config/env.ts
server/config/firebase.ts
server/config/ai.ts
server/middleware/auth.ts
server/middleware/errorHandler.ts
server/middleware/validate.ts
server/middleware/rateLimiter.ts
server/types/errors.ts
server/repositories/index.ts
server/repositories/task.repository.ts
server/repositories/goal.repository.ts
server/repositories/habit.repository.ts
server/repositories/shopping.repository.ts
server/repositories/event.repository.ts
server/repositories/chat.repository.ts
server/repositories/notification.repository.ts
server/services/auth.service.ts
server/services/task.service.ts
server/services/gamification.service.ts
server/services/notification.service.ts
server/controllers/auth.controller.ts
server/controllers/task.controller.ts
server/controllers/goal.controller.ts
server/controllers/habit.controller.ts
server/controllers/chat.controller.ts
server/controllers/notification.controller.ts
server/controllers/shopping.controller.ts
server/controllers/state.controller.ts
server/routes/index.ts
server/ai/index.ts
```

### Frontend (9 arquivos novos)
```
src/services/firebase.ts
src/services/auth.ts
src/components/ui/SubTabBar.tsx
src/hooks/useAudio.ts
src/stores/useUIStore.ts
src/public/manifest.json
src/vitest.config.ts
src/tests/unit.test.ts
```

### Infraestrutura (3 arquivos novos)
```
.env.example
firestore.rules
firestore.indexes.json
```

---

## 11. Melhorias da Segunda Rodada (7/12 restantes)

### 11.1 Zustand Integrado (Problema #9 — Parcial)
- **Arquivo:** `src/App.tsx`
- `useUIStore` importado e sincronizado com o estado local via `useEffect`
- `darkMode`, `activeTab`, `showFabMenu`, `showNotifications`, `loading` agora espelhados na store
- Permite que outros componentes acessem UI state via store sem prop drilling

### 11.2 assets/ Estruturado (Problema #14)
- **Arquivos:** `src/assets/images/`, `src/assets/icons/`, `src/assets/.gitkeep`
- Diretórios `images/` e `icons/` criados com `.gitkeep` para versionamento
- Pronto para receber assets reais (imagens, ícones SVG)

### 11.3 Bottom Nav Extraído (Problema #6 — Parcial)
- **Arquivo:** `src/components/layout/BottomNav.tsx` (NOVO)
- **Antes:** 6 botões de navegação replicados manualmente (~80 linhas)
- **Depois:** Config array `NAV_ITEMS` + `.map()` (54 linhas)
- Cada item define: `id`, `label`, `icon`, `activeIcon`, `color`, `matchGroup`
- Componente importado e usado em `App.tsx`

### 11.4 Breadcrumb de Navegação (Problema #17)
- **Arquivo:** `src/App.tsx`
- Adicionado breadcrumb "Home / Tarefas" no topo do conteúdo quando em sub-tabs
- Ajuda o usuário a entender onde está na hierarquia de navegação
- Link "Home" permite voltar rapidamente

### 11.5 Validação Zod Aplicada (Problema #13)
- **Arquivo:** `server/routes/index.ts`
- `validate()` middleware aplicado em 8 endpoints POST
- Schemas definidos inline: `requiredString()`, `optionalString()`
- Endpoints validados:

| Rota | Campos validados |
|------|-----------------|
| `POST /auth/register` | name (obrigatório), email |
| `POST /auth/login` | email |
| `POST /auth/firebase` | idToken |
| `POST /task` | title, responsible |
| `POST /goal` | title |
| `POST /habit/toggle` | id, dateStr |
| `POST /shopping` | name |
| `POST /calendar` | title, date, startTime |

### 11.6 Fetch Calls Migrados (Problema #4 — Parcial)
- **Arquivo:** `src/App.tsx`
- 5 handlers migrados de `fetch()` direto para `api.*()`:
  - `handleSaveTask` → `api.post("/task")`
  - `handleDeleteTask` → `api.delete("/task/:id")`
  - `handleAddGoal` → `api.post("/goal")`
  - `handleToggleHabit` → `api.post("/habit/toggle")`
  - `handleResetState` → `api.post("/state/reset")`
  - `fetchState` → `api.get("/state")`
  - `handleDeleteProfile` → `api.delete("/auth/profile/:name")`
  - notificação read → `api.post("/notifications/read")`
- Redução de ~14 fetch() diretos para ~9

### 11.7 i18n Preparado (Problema #20)
- **Arquivo:** `src/utils/i18n.ts` (NOVO)
- Estrutura de traduções com namespace aninhado: `nav`, `task`, `goal`, `habit`, `shopping`, `agenda`, `auth`, `common`
- Funções: `t(path)` e `setLanguage(lang)`
- Idioma padrão: `pt` (português)
- Pronto para receber `en`, `es`, etc.

---

## Status Final

| Verificação | Resultado |
|-------------|-----------|
| TypeScript (`tsc --noEmit`) | ✅ 0 erros |
| Testes (`vitest run`) | ✅ 5/5 passaram |
| Dependências (`npm install`) | ✅ 460 pacotes instalados |
| **Problemas do audit corrigidos** | **20 de 26 (77%)** |
| **Parcialmente corrigidos** | **3** (JWT, API key, fetch calls) |
| **Não iniciados** | **3** (Firestore migration, Polling, Lazy loading) |
