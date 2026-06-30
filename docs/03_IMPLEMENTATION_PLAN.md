# 03 — IMPLEMENTATION PLAN

> **Documento:** Plano de Implementação (Sprints)
> **Versão:** 2.0
> **Status:** ✅ Finalizado

---

## Visão Geral

O plano de implementação está dividido em **10 Sprints** de 2 semanas cada, totalizando **20 semanas** (~5 meses) para a entrega da v2.0 completa.

---

## Sprint 1 — Fundação: Auth + Segurança

**Período:** Semana 1-2
**Prioridade:** 🔴 Crítica
**Tempo estimado:** 10 dias úteis

### Objetivo
Corrigir os problemas críticos de segurança e estabelecer a base para o novo sistema.

### Tarefas

| # | Tarefa | Esforço | Arquivos Afetados | Dependências |
|---|--------|---------|------------------|--------------|
| 1.1 | Implementar Firebase Authentication (Google, Apple, Email) | 4 dias | `server.ts`, `AuthScreen.tsx`, `firebase.ts` | - |
| 1.2 | Remover senha em plaintext do modelo | 1 dia | `types.ts`, `server.ts` | 1.1 |
| 1.3 | Criar middleware JWT no servidor | 3 dias | `server.ts`, `middleware/auth.ts` | 1.1 |
| 1.4 | Configurar variáveis de ambiente | 1 dia | `.env`, `server.ts` | - |
| 1.5 | Criar Firestore Security Rules | 2 dias | `firestore.rules` | - |
| 1.6 | Rotacionar API key exposta | 1 dia | Firebase Console | - |

### Arquivos Afetados
- `server.ts` — Refatorar auth endpoints
- `src/components/AuthScreen.tsx` — Novo fluxo de auth
- `src/types.ts` — Remover password
- `src/services/auth.ts` — Novo (service layer)
- `firebase-applet-config.json` — Remover do repositório

### Riscos
- 🔴 Migração de usuários existentes (senha plaintext → Firebase Auth)
- 🔴 Quebra de compatibilidade com clientes antigos

### Critérios de Aceitação
- ✅ Usuário consegue fazer login com Google, Apple e Email
- ✅ Senha nunca é armazenada no banco
- ✅ JWT é validado em todas as rotas
- ✅ Firestore Rules bloqueiam acesso não autorizado
- ✅ Variáveis de ambiente no lugar de config hardcoded

### Checklist
- [ ] Firebase Auth configurado no console
- [ ] Provedores Google e Apple habilitados
- [ ] Função `registerWithEmail` implementada
- [ ] Função `registerWithGoogle` implementada
- [ ] Função `loginWithEmail` implementada
- [ ] Middleware `verifyToken` no Express
- [ ] `firestore.rules` com validação por família
- [ ] `.env.example` atualizado
- [ ] `firebase-applet-config.json` no `.gitignore`

### Plano de Testes
- Teste unitário: `auth.service.spec.ts` — login, register, token validation
- Teste de integração: POST `/api/auth/register` → retorna token
- Teste E2E: Fluxo completo de registro + login

---

## Sprint 2 — Firestore + Banco de Dados

**Período:** Semana 3-4
**Prioridade:** 🔴 Crítica
**Tempo estimado:** 10 dias úteis

### Objetivo
Migrar de single document Firestore para collections normalizadas.

### Tarefas

| # | Tarefa | Esforço | Arquivos | Dependências |
|---|--------|---------|----------|--------------|
| 2.1 | Criar modelo de collections normalizadas | 2 dias | `types.ts`, `models/` | Sprint 1 |
| 2.2 | Implementar repositórios (Task, Goal, Habit, etc.) | 4 dias | `repositories/` | 2.1 |
| 2.3 | Script de migração de dados | 3 dias | `scripts/migrate.ts` | 2.1 |
| 2.4 | Atualizar controllers para usar repositórios | 3 dias | `controllers/` | 2.2 |
| 2.5 | Criar índices compostos no Firestore | 1 dia | `firestore.indexes.json` | 2.1 |

### Arquivos Afetados
- `src/types.ts` — Novo modelo
- `server.ts` — Extrair para controllers + services + repositories
- `src/repositories/` — Novo (6 repositórios)
- `src/services/` — Novo (6 services)
- `scripts/migrate.ts` — Novo

### Riscos
- 🔴 Perda de dados durante migração
- 🟠 Performance degradada durante migração
- 🟠 Compatibilidade com frontend atual

### Critérios de Aceitação
- ✅ Dados migrados sem perda
- ✅ Queries funcionando com índices
- ✅ Escrita apenas em documentos específicos
- ✅ Leituras apenas do necessário
- ✅ Testes de migração automatizados

### Checklist
- [ ] Collections criadas: families, users, tasks, goals, habits, shopping, events, chat, notifications, history
- [ ] Script de migração testado em staging
- [ ] 6 repositórios implementados
- [ ] Índices compostos criados
- [ ] Backup do banco antes da migração

### Plano de Testes
- Teste unitário: cada repository com emulador Firestore
- Teste de integração: CRUD completo de cada entidade
- Teste de migração: dados mock → collections

---

## Sprint 3 — Refatoração do Servidor

**Período:** Semana 5-6
**Prioridade:** 🔴 Crítica
**Tempo estimado:** 10 dias úteis

### Objetivo
Transformar server.ts monolítico em arquitetura em camadas.

### Tarefas

| # | Tarefa | Esforço | Dependências |
|---|--------|---------|--------------|
| 3.1 | Separar controllers (routes handlers) | 3 dias | Sprint 2 |
| 3.2 | Separar services (lógica de negócio) | 3 dias | Sprint 2 |
| 3.3 | Implementar middleware (auth, validation, error) | 2 dias | Sprint 1 |
| 3.4 | Adicionar validação de input (Zod) | 2 dias | - |
| 3.5 | Criar error handler global | 1 dia | - |
| 3.6 | Implementar logger estruturado | 1 dia | - |

### Estrutura Final do Servidor

```
server/
├── index.ts                 # Entry point
├── app.ts                   # Express app setup
├── config/
│   ├── firebase.ts          # Firebase Admin init
│   ├── env.ts               # Env validation
│   └── ai.ts                # Gemini config
├── middleware/
│   ├── auth.ts              # JWT verification
│   ├── validate.ts          # Zod validation
│   ├── errorHandler.ts      # Global error handler
│   └── rateLimiter.ts       # Rate limiting
├── controllers/
│   ├── auth.controller.ts
│   ├── task.controller.ts
│   ├── goal.controller.ts
│   ├── habit.controller.ts
│   ├── shopping.controller.ts
│   ├── event.controller.ts
│   ├── chat.controller.ts
│   ├── ai.controller.ts
│   └── notification.controller.ts
├── services/
│   ├── auth.service.ts
│   ├── task.service.ts
│   ├── goal.service.ts
│   ├── habit.service.ts
│   ├── shopping.service.ts
│   ├── event.service.ts
│   ├── ai.service.ts
│   ├── gamification.service.ts
│   └── notification.service.ts
├── repositories/
│   ├── task.repository.ts
│   ├── goal.repository.ts
│   ├── habit.repository.ts
│   └── ...
├── types/
│   ├── dto.ts               # Request/Response DTOs
│   └── errors.ts            # Error classes
├── utils/
│   ├── logger.ts
│   └── helpers.ts
└── routes/
    └── index.ts             # Route aggregator
```

### Plano de Testes
- Teste unitário: cada service isolado
- Teste de integração: cada endpoint
- Teste de contrato: request/response schemas

---

## Sprint 4 — Refatoração do Frontend

**Período:** Semana 7-8
**Prioridade:** 🔴 Crítica
**Tempo estimado:** 10 dias úteis

### Objetivo
Transformar App.tsx monolítico em arquitetura moderna com pages, hooks e state management.

### Tarefas

| # | Tarefa | Esforço | Arquivos | Dependências |
|---|--------|---------|----------|--------------|
| 4.1 | Implementar Zustand stores | 3 dias | `stores/` | - |
| 4.2 | Criar ApiClient service layer | 2 dias | `services/api.ts` | Sprint 3 |
| 4.3 | Separar App.tsx em pages | 3 dias | `pages/` | 4.1 |
| 4.4 | Extrair hooks customizados | 2 dias | `hooks/` | 4.2 |
| 4.5 | Implementar React Router | 2 dias | `routes.tsx` | 4.3 |
| 4.6 | Remover código morto e duplicado | 1 dia | Diversos | - |
| 4.7 | Extrair sub-tab bar para componente | 1 dia | `SubTabBar.tsx` | - |

### Estrutura Final do Frontend

```
src/
├── main.tsx
├── App.tsx                   # Leve, apenas providers
├── routes.tsx                # React Router config
├── pages/                    # Páginas (rotas)
│   ├── DashboardPage.tsx
│   ├── TasksPage.tsx
│   ├── AgendaPage.tsx
│   ├── GoalsPage.tsx
│   ├── HabitsPage.tsx
│   ├── ShoppingPage.tsx
│   ├── ChatPage.tsx
│   ├── AIPage.tsx
│   ├── ProfilePage.tsx
│   └── AuthPage.tsx
├── components/               # Componentes reutilizáveis
│   ├── layout/
│   │   ├── AppShell.tsx      # Layout principal
│   │   ├── BottomNav.tsx
│   │   └── Header.tsx
│   ├── ui/                   # Design System
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Modal.tsx
│   │   ├── BottomSheet.tsx
│   │   ├── FloatingAlert.tsx
│   │   ├── SubTabBar.tsx
│   │   └── ProgressBar.tsx
│   └── entities/             # Componentes de entidades
│       ├── TaskCard.tsx
│       ├── TaskForm.tsx
│       ├── GoalCard.tsx
│       ├── HabitCard.tsx
│       ├── ShoppingItem.tsx
│       └── EventCard.tsx
├── stores/                   # Zustand stores
│   ├── useAuthStore.ts
│   ├── useTaskStore.ts
│   ├── useGoalStore.ts
│   ├── useHabitStore.ts
│   ├── useUIStore.ts
│   └── useNotificationStore.ts
├── hooks/                    # Custom hooks
│   ├── useApi.ts
│   ├── useAuth.ts
│   ├── useRealtime.ts
│   └── useAudio.ts
├── services/                 # API client
│   ├── api.ts
│   ├── task.api.ts
│   ├── goal.api.ts
│   └── ...
├── types/
│   └── index.ts
├── styles/
│   └── index.css
└── utils/
    ├── constants.ts
    ├── formatters.ts
    └── validators.ts
```

### Plano de Testes
- Teste unitário: cada store, hook, service
- Teste de componente: cada card, formulário
- Teste de página: renderização com dados mock

---

## Sprint 5 — WebSocket + Tempo Real

**Período:** Semana 9-10
**Prioridade:** 🟠 Alta
**Tempo estimado:** 10 dias úteis

### Objetivo
Substituir polling de 5s por WebSocket para sincronização em tempo real.

### Tarefas

| # | Tarefa | Esforço | Dependências |
|---|--------|---------|--------------|
| 5.1 | Implementar WebSocket server (Socket.IO) | 3 dias | Sprint 3 |
| 5.2 | Implementar WebSocket client | 2 dias | Sprint 4 |
| 5.3 | Event system (state_update, notification, etc.) | 2 dias | 5.1 |
| 5.4 | Reconexão automática + fallback | 2 dias | 5.2 |
| 5.5 | Testes de carga com k6 | 1 dia | 5.1 |

### Eventos

**Server → Client:**
- `state:update` — Dado foi alterado
- `notification:new` — Nova notificação
- `member:online` / `member:offline`
- `chat:message` — Nova mensagem no chat

**Client → Server:**
- `typing` — Digitando no chat
- `read` — Leu notificação
- `ping` — Keep-alive

### Plano de Testes
- Teste de integração: cliente conecta, recebe eventos
- Teste de carga: 100 conexões simultâneas
- Teste de reconexão: queda e restabelecimento

---

## Sprint 6 — Design System + UI

**Período:** Semana 11-12
**Prioridade:** 🟠 Alta
**Tempo estimado:** 10 dias úteis

### Objetivo
Implementar Design System completo e nova interface.

### Tarefas

| # | Tarefa | Esforço | Dependências |
|---|--------|---------|--------------|
| 6.1 | Implementar Design System (cores, tipografia, spacing) | 2 dias | - |
| 6.2 | Componentes UI base (Button, Card, Modal, BottomSheet, etc.) | 3 dias | 6.1 |
| 6.3 | Novo layout do app (AppShell, BottomNav, Header) | 2 dias | 6.2 |
| 6.4 | Dark/Light mode polish | 1 dia | 6.3 |
| 6.5 | Micro-animações | 2 dias | 6.3 |
| 6.6 | Onboarding screens | 2 dias | 6.3 |

### Plano de Testes
- Teste visual (Chromatic): cada componente em dark/light
- Teste de acessibilidade: contraste, foco, aria-labels

---

## Sprint 7 — IA com Tools

**Período:** Semana 13-14
**Prioridade:** 🟠 Alta
**Tempo estimado:** 10 dias úteis

### Objetivo
Transformar IA de chat simples em assistente com ações (tools/functions).

### Tarefas

| # | Tarefa | Esforço | Dependências |
|---|--------|---------|--------------|
| 7.1 | Implementar sistema de Tools (createTask, completeTask, etc.) | 3 dias | Sprint 4 |
| 7.2 | Implementar memory system (curto + longo prazo) | 3 dias | Sprint 5 |
| 7.3 | Streaming de respostas | 2 dias | 7.1 |
| 7.4 | Fallback inteligente (cache local) | 1 dia | - |
| 7.5 | Modos: Correria, Foco, Família | 2 dias | 7.1 |

### Tools da IA

```typescript
tools: [
  createTask,
  updateTask,
  completeTask,
  deleteTask,
  getTasks,
  createGoal,
  updateGoalProgress,
  toggleHabit,
  getHabitStreak,
  addShoppingItem,
  checkShoppingItem,
  sendNotification,
  sendFamilyMessage,
  getWorkloadBalance,
  reorganizeSchedule,
  generateWeeklyReport,
]
```

### Plano de Testes
- Teste unitário: cada tool funciona independente
- Teste de integração: tool chama API e banco
- Teste de memória: recall de interações passadas

---

## Sprint 8 — Notificações + Gamificação

**Período:** Semana 15-16
**Prioridade:** 🟠 Alta
**Tempo estimado:** 10 dias úteis

### Objetivo
Sistema completo de notificações push e gamificação refinada.

### Tarefas

| # | Tarefa | Esforço | Dependências |
|---|--------|---------|--------------|
| 8.1 | FCM integration | 3 dias | Sprint 1 |
| 8.2 | Notification channels configuráveis | 2 dias | 8.1 |
| 8.3 | Horário silencioso | 1 dia | 8.2 |
| 8.4 | Gamificação refinada (níveis, badges) | 3 dias | Sprint 4 |
| 8.5 | Conquistas e medalhas | 2 dias | 8.4 |

### Plano de Testes
- Teste E2E: push notification dispara e aparece
- Teste de gamificação: pontos calculados corretamente

---

## Sprint 9 — Testes + Performance

**Período:** Semana 17-18
**Prioridade:** 🟠 Alta
**Tempo estimado:** 10 dias úteis

### Objetivo
Testes abrangentes e otimizações de performance.

### Tarefas

| # | Tarefa | Esforço | Dependências |
|---|--------|---------|--------------|
| 9.1 | Testes unitários (alcançar 75% cobertura) | 4 dias | Sprints 1-8 |
| 9.2 | Testes de integração (API endpoints) | 3 dias | Sprints 1-8 |
| 9.3 | Testes E2E (Playwright) | 3 dias | Sprint 6 |
| 9.4 | Lazy loading + code splitting | 2 dias | Sprint 4 |
| 9.5 | Virtualização de listas | 2 dias | Sprint 4 |
| 9.6 | Performance budget (Lighthouse) | 1 dia | 9.4, 9.5 |

### Metas de Performance
- LCP < 1.5s
- FCP < 1s
- TTI < 2s
- Bundle inicial < 150KB
- Lighthouse score > 90

---

## Sprint 10 — Polimento + Release

**Período:** Semana 19-20
**Prioridade:** 🟠 Alta
**Tempo estimado:** 10 dias úteis

### Objetivo
Preparar para lançamento público da v2.0.

### Tarefas

| # | Tarefa | Esforço | Dependências |
|---|--------|---------|--------------|
| 10.1 | CI/CD pipeline completo (GitHub Actions) | 2 dias | Sprints 1-9 |
| 10.2 | Documentação final (README, API docs) | 2 dias | - |
| 10.3 | Smoke tests no ambiente de staging | 1 dia | 10.1 |
| 10.4 | Testes de carga (k6) | 2 dias | 10.1 |
| 10.5 | Deploy para produção | 1 dia | 10.1 |
| 10.6 | Monitoramento (Uptime, Errors, Performance) | 2 dias | 10.5 |

### Release Checklist
- [ ] Todos os testes passando no CI
- [ ] Performance budget OK (Lighthouse > 90)
- [ ] Backup do Firestore realizado
- [ ] Firestore Rules em produção
- [ ] Variáveis de ambiente configuradas
- [ ] Staging validado pela equipe
- [ ] Changelog atualizado
- [ ] Rollback plan documentado

---

## Resumo das Sprints

| Sprint | Período | Foco | Prioridade | Dias |
|--------|---------|------|-----------|------|
| 1 | Sem 1-2 | Auth + Segurança | 🔴 Crítica | 10 |
| 2 | Sem 3-4 | Firestore + DB | 🔴 Crítica | 10 |
| 3 | Sem 5-6 | Server Refactor | 🔴 Crítica | 10 |
| 4 | Sem 7-8 | Frontend Refactor | 🔴 Crítica | 10 |
| 5 | Sem 9-10 | WebSocket + Tempo Real | 🟠 Alta | 10 |
| 6 | Sem 11-12 | Design System + UI | 🟠 Alta | 10 |
| 7 | Sem 13-14 | IA com Tools | 🟠 Alta | 10 |
| 8 | Sem 15-16 | Notificações + Gamificação | 🟠 Alta | 10 |
| 9 | Sem 17-18 | Testes + Performance | 🟠 Alta | 10 |
| 10 | Sem 19-20 | Polimento + Release | 🟠 Alta | 10 |

**Total estimado: 20 semanas (5 meses)**
**Data prevista de lançamento v2.0: Dezembro 2026**
