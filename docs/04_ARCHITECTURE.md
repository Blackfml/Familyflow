# 04 — ARCHITECTURE

> **Documento:** Arquitetura do Sistema
> **Versão:** 2.0 (Proposta)
> **Status:** 📝 Finalizado

---

## 1. Arquitetura Atual (v1.x)

### Diagrama de Arquitetura Atual

```
┌─────────────────────────────────────────────────┐
│                   CLIENTE (React SPA)            │
│                                                   │
│  ┌──────────┐  ┌──────────┐  ┌───────────────┐  │
│  │ App.tsx  │  │  Views   │  │  Components   │  │
│  │ (Estado) │  │(Telas)   │  │ (Widgets)     │  │
│  └────┬─────┘  └──────────┘  └───────────────┘  │
│       │                                           │
│       │ fetch (polling 5s)                       │
│       ▼                                           │
│  ┌──────────┐  ┌──────────┐  ┌───────────────┐  │
│  │ Express  │  │  Routes  │  │  Gemini AI    │  │
│  │ Server   │  │  REST    │  │  Integration  │  │
│  └────┬─────┘  └──────────┘  └───────────────┘  │
│       │                                           │
│       ▼                                           │
│  ┌──────────────────────────────────────────┐    │
│  │           Firebase Admin SDK             │    │
│  │   Firestore (single doc) + local file    │    │
│  └──────────────────────────────────────────┘    │
└──────────────────────────────────────────────────┘
```

### Problemas da Arquitetura Atual

| Problema | Impacto |
|----------|---------|
| Monolito no cliente (App.tsx 1628 linhas) | Baixa manutenibilidade |
| Monolito no servidor (server.ts 1227 linhas) | Difícil evoluir |
| Estado global sem padrão | Prop drilling, re-renders |
| Polling vs tempo real | Latência, consumo de rede |
| Single document Firestore | Limite 1MB, sem escalabilidade |
| Sem autenticação real | Inseguro |

---

## 2. Arquitetura Proposta (v2.0)

### Visão Geral

```
┌──────────────────────────────────────────────────────┐
│                    CLIENTE (React/Flutter)            │
│                                                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────┐   │
│  │  Pages   │  │Components│  │   State Layer    │   │
│  │ (Rotas)  │  │(Widgets) │  │ (Zustand/Bloc)   │   │
│  └────┬─────┘  └──────────┘  └────────┬─────────┘   │
│       │                                │              │
│  ┌────▼────────────────────────────────▼──────────┐  │
│  │            Service Layer (ApiClient)           │  │
│  │     HTTP + WebSocket + Local Cache             │  │
│  └────────────────────┬───────────────────────────┘  │
│                       │                               │
└───────────────────────┼───────────────────────────────┘
                        │
          ══════════════╪══════════════ (Network)
                        │
┌───────────────────────▼───────────────────────────────┐
│                   SERVIDOR (Node.js)                   │
│                                                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────┐   │
│  │  Routes  │  │Middleware│  │   Controllers    │   │
│  │ (REST)   │  │(Auth)    │  │ (Lógica)         │   │
│  └────┬─────┘  └──────────┘  └────────┬─────────┘   │
│       │                                │              │
│  ┌────▼────────────────────────────────▼──────────┐  │
│  │              Services Layer                    │  │
│  │  ┌────────┐┌────────┐┌────────┐┌────────┐    │  │
│  │  │ Task   ││ Goal   ││ Habit  ││ AI     │    │  │
│  │  │ Service││ Service││ Service││ Service│    │  │
│  │  └────────┘└────────┘└────────┘└────────┘    │  │
│  └────────────────────┬──────────────────────────┘  │
│                       │                               │
│  ┌────────────────────▼──────────────────────────┐  │
│  │           Repository Layer                    │  │
│  │  ┌─────────────┐  ┌─────────────┐           │  │
│  │  │ Firestore   │  │  Cache     │            │  │
│  │  │ Repository  │  │  (Redis)   │            │  │
│  │  └─────────────┘  └─────────────┘           │  │
│  └─────────────────────────────────────────────┘  │
│                                                        │
│  ┌────────────────────────────────────────────────┐  │
│  │           Firebase Admin SDK                   │  │
│  │  Firestore (Collections) + Auth + FCM          │  │
│  └────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────┘
```

### Comparação: Atual vs Proposta

| Aspecto | Atual (v1.x) | Proposto (v2.0) |
|---------|-------------|-----------------|
| Frontend | React SPA | React SPA + Flutter (mobile) |
| Estado | useState | Zustand (web) / Bloc (Flutter) |
| Roteamento | Tab manual | React Router / GoRouter |
| API | fetch polling | WebSocket + REST |
| Servidor | Monolítico | Modular (Controllers + Services + Repositories) |
| Banco | Single document | Collections normalizadas |
| Autenticação | Plaintext | Firebase Auth + JWT |
| Cache | localStorage | Redis + IndexedDB |
| Testes | Nenhum | Vitest + Testing Library |

---

## 3. Clean Architecture — Proposta

### Camadas

```
┌─────────────────────────────────────────────┐
│                Presentation                  │
│  Pages / Widgets / Components / Hooks       │
├─────────────────────────────────────────────┤
│                Application                   │
│  Use Cases / State Management / Providers   │
├─────────────────────────────────────────────┤
│                  Domain                      │
│  Entities / Value Objects / Enums / Types   │
├─────────────────────────────────────────────┤
│                  Data                        │
│  Repositories / Data Sources / DTOs / Mappers│
└─────────────────────────────────────────────┘
```

### Regras de Dependência

- **Presentation** → Application → Domain ← Data
- **Domain** NÃO depende de nada
- **Data** implementa interfaces do Domain
- **Application** orquestra o fluxo

---

## 4. Stack Tecnológica — Proposta Final

| Camada | Tecnologia | Motivo |
|--------|-----------|--------|
| Frontend (Web) | React 19 + TypeScript + Vite | Performance, ecossistema |
| Frontend (Mobile) | Flutter 3.x | Performance nativa, widgets, Wear OS |
| Estado (Web) | Zustand | Simples, performático, TypeScript |
| Estado (Flutter) | Bloc + Freezed | Padrão, testável |
| Roteamento (Web) | React Router v7 | Padrão, lazy loading |
| Roteamento (Flutter) | GoRouter | Deep linking, web support |
| Estilização | Tailwind v4 (web) / Shadcn (Flutter) | Consistência, Design System |
| Servidor | Node.js + Express + TypeScript | Mesma linguagem do frontend |
| Banco | Firestore (Collections) | Tempo real, escalável |
| Cache | Redis | Performance, sessões |
| IA | Gemini API + LangChain | RAG, memória, tools |
| Autenticação | Firebase Auth + JWT | Segurança, fácil integração |
| Notificações | FCM + Web Push | Multi-plataforma |
| Testes | Vitest + Playwright + Detox | Cobertura completa |

---

## 5. Fluxo de Dados (Proposto)

```
Usuário interage com UI
        │
        ▼
Presentation Layer (Componente/Widget)
        │
        ▼
State Layer (Zustand/Bloc) — dispara ação
        │
        ▼
Service Layer (ApiClient) — chama API
        │
        ▼
WebSocket / REST → Servidor
        │
        ▼
Controller — valida input
        │
        ▼
Service — lógica de negócio
        │
        ▼
Repository — persiste no Firestore
        │
        ▼
Firestore → Realtime update (WebSocket)
        │
        ▼
State Layer atualiza → UI re-renderiza
```

---

## 6. Estrutura de Pastas (Proposta)

```
familyflow/
├── packages/
│   ├── server/                  # Express API
│   │   ├── src/
│   │   │   ├── controllers/     # Rotas/REST handlers
│   │   │   ├── services/        # Lógica de negócio
│   │   │   ├── repositories/    # Acesso a dados
│   │   │   ├── middleware/      # Auth, validation, logging
│   │   │   ├── types/           # DTOs, interfaces
│   │   │   └── utils/           # Helpers
│   │   └── tests/
│   │
│   ├── web/                     # React SPA
│   │   ├── src/
│   │   │   ├── pages/           # Rotas/páginas
│   │   │   ├── components/      # Componentes reutilizáveis
│   │   │   ├── hooks/           # Hooks customizados
│   │   │   ├── stores/          # Zustand stores
│   │   │   ├── services/        # API client
│   │   │   ├── types/           # Tipos compartilhados
│   │   │   └── styles/          # Tailwind, CSS
│   │   └── tests/
│   │
│   ├── mobile/                  # Flutter app
│   │   ├── lib/
│   │   │   ├── core/            # Core: theme, routes, DI
│   │   │   ├── data/            # Repositories, datasources
│   │   │   ├── domain/          # Entities, use cases
│   │   │   └── presentation/    # Bloc, pages, widgets
│   │   └── tests/
│   │
│   └── shared/                  # Tipos compartilhados
│       └── types/
│
├── docs/                        # Documentação
├── .github/                     # CI/CD
└── config/                      # Infraestrutura
```

---

## 7. Decisões de Arquitetura (ADRs)

### ADR-001: Estado Global com Zustand

**Contexto:** Estado atual usa useState com prop drilling
**Decisão:** Migrar para Zustand
**Consequências:** Performance, menos boilerplate, fácil testar

### ADR-002: WebSocket + SSE para Tempo Real

**Contexto:** Polling de 5s é ineficiente
**Decisão:** Usar WebSocket para comunicação bidirecional
**Consequências:** Latência real <100ms, economia de banda

### ADR-003: Firestore Collections ao invés de Single Document

**Contexto:** Documento único limite de 1MB
**Decisão:** Normalizar em collections (tasks, goals, habits, etc.)
**Consequências:** Escalabilidade, queries eficientes, regras de segurança

### ADR-004: Autenticação com Firebase Auth

**Contexto:** Login por nome + senha em plaintext
**Decisão:** Firebase Authentication + JWT
**Consequências:** Segurança real, OAuth, gerenciamento de sessão

### ADR-005: Repository Pattern

**Contexto:** Acesso a dados misturado com lógica
**Decisão:** Repository pattern com injeção de dependência
**Consequências:** Testabilidade, troca de datasource fácil

---

## 8. Performance e Escalabilidade

| Métrica | Atual | Meta (v2.0) |
|---------|-------|-------------|
| Latência de sincronização | ~5s | <100ms |
| Tamanho do bundle | ~500KB (estimado) | <200KB (lazy) |
| Requisições/minuto | 12 (polling) | 0 (WebSocket) |
| Usuários simultâneos | 2 | Ilimitado (multi-tenant) |
| Escrita Firestore | Documento inteiro | Apenas campos modificados |
| Cache | localStorage | Redis + IndexedDB |
