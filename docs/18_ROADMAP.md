# 18 — ROADMAP

> **Documento:** Roadmap do Produto
> **Versão:** 2.0 (Proposta)
> **Status:** ✅ Finalizado

---

## 1. Visão Geral do Roadmap

```
2026
├── Q3 (Jul-Set) → v2.0 Release
│   ├── Sprint 1-2: Fundação (Arquitetura, Auth, DB)
│   ├── Sprint 3-4: Features Core (Tasks, Habits, Goals)
│   └── Sprint 5-6: IA + UI/UX + Release
│
├── Q4 (Out-Dez) → v2.1 / v2.2
│   ├── Sprint 7-8: Widgets + Modo Família
│   ├── Sprint 9-10: Performance + AI Improvements
│   └── Sprint 11-12: Mobile Beta + Polimento

2027
├── Q1 → v3.0
│   ├── Modo Voz + Comandos Naturais
│   ├── Apple Watch / Wear OS
│   └── Google Calendar Integration
│
├── Q2 → v3.5
│   ├── Alexa / Google Home
│   ├── Integração bancária
│   └── Relatórios avançados
│
└── Q3+ → v4.0
    ├── IA Preditiva
    ├── Casa Inteligente
    └── Modo Offline Completo
```

---

## 2. Fases Detalhadas

### Fase 1: Fundação (Sprint 1-2) — Jul 2026

**Objetivo:** Corrigir problemas críticos de segurança e arquitetura

| Tarefa | Prioridade | Esforço | Dependência |
|--------|-----------|---------|-------------|
| Firebase Auth (Google/Apple/Email) | 🔴 | 5 dias | - |
| Migrar Firestore para collections | 🔴 | 8 dias | Auth |
| Firestore Rules + Índices | 🔴 | 3 dias | Collections |
| Refatorar server.ts em camadas | 🔴 | 8 dias | - |
| Configurar CI/CD | 🟠 | 3 dias | - |
| Setup de testes | 🟠 | 3 dias | - |
| Variáveis de ambiente (.env) | 🟠 | 1 dia | - |
| State management (Zustand) | 🟠 | 4 dias | - |

**Riscos:**
- Migração de dados pode causar perda
- Compatibilidade reversa necessária durante migração

### Fase 2: Features Core (Sprint 3-4) — Ago 2026

**Objetivo:** Reconstruir funcionalidades principais

| Tarefa | Prioridade | Esforço | Dependência |
|--------|-----------|---------|-------------|
| Refatorar App.tsx em pages + hooks | 🔴 | 10 dias | Zustand |
| Sistema de tarefas completo | 🔴 | 5 dias | Collections |
| Sistema de metas | 🟠 | 3 dias | Collections |
| Sistema de hábitos | 🟠 | 3 dias | Collections |
| Lista de compras | 🟠 | 2 dias | Collections |
| Agenda/Eventos | 🟠 | 3 dias | Collections |
| WebSocket em vez de polling | 🟠 | 5 dias | Server refactor |
| Design System + Dark/Light | 🟠 | 5 dias | - |

### Fase 3: IA + UI/UX (Sprint 5-6) — Set 2026

**Objetivo:** Assistente IA inteligente + interface premium

| Tarefa | Prioridade | Esforço | Dependência |
|--------|-----------|---------|-------------|
| IA com tools/functions | 🔴 | 8 dias | Features Core |
| Sistema de memória da IA | 🟠 | 5 dias | IA Tools |
| Streaming de respostas | 🟠 | 3 dias | IA Tools |
| Novo design (UI/UX completo) | 🔴 | 10 dias | Design System |
| Micro-animações | 🟠 | 4 dias | Design |
| Onboarding | 🟠 | 2 dias | Auth |
| Gamificação refinada | 🟠 | 3 dias | Features Core |
| Notificações nativas | 🟠 | 4 dias | - |

### Fase 4: Mobile + Widgets (Sprint 7-8) — Out 2026

**Objetivo:** Expandir para mobile e widgets

| Tarefa | Prioridade | Esforço | Dependência |
|--------|-----------|---------|-------------|
| PWA completo (manifest, offline) | 🟠 | 5 dias | - |
| Widget Android (homescreen) | 🟡 | 5 dias | PWA |
| Push notifications (FCM) | 🟠 | 4 dias | Auth |
| Modo Família | 🟡 | 5 dias | IA |
| Apple Watch / Wear OS (estudo) | 🟡 | 3 dias | - |

### Fase 5: Performance + AI (Sprint 9-10) — Nov 2026

**Objetivo:** Otimizar e melhorar IA

| Tarefa | Prioridade | Esforço | Dependência |
|--------|-----------|---------|-------------|
| Lazy loading + code splitting | 🟠 | 3 dias | - |
| Virtualização de listas | 🟠 | 3 dias | - |
| Cache offline (IndexedDB) | 🟠 | 5 dias | - |
| Redis para cache server | 🟡 | 4 dias | - |
| IA com RAG (memória) | 🟡 | 8 dias | IA System |
| Modo Correria / Foco / Família | 🟡 | 5 dias | IA System |

### Fase 6+ (2027)

#### v3.0 — Voz + Integrações

| Feature | Descrição |
|---------|-----------|
| Comandos de voz | "FamilyFlow, cria uma tarefa para amanhã" |
| Apple Watch | Complicações, quick actions |
| Wear OS | Tiles, notificações |
| Google Calendar | Sincronização bidirecional |
| Apple Calendar | Sincronização bidirecional |

#### v3.5 — Smart Home + Finanças

| Feature | Descrição |
|---------|-----------|
| Alexa Skill | "Alexa, pergunta ao FamilyFlow o que falta fazer" |
| Google Home | Comandos de voz integrados |
| Integração bancária | Importar gastos reais |
| Relatórios financeiros | Dashboard de finanças familiares |

#### v4.0 — IA Proativa

| Feature | Descrição |
|---------|-----------|
| IA preditiva | "Baseado no histórico, amanhã será um dia corrido" |
| Detecção de padrões | "Vocês sempre brigam às quartas. Que tal mudar a rotina?" |
| Sugestão automática | Cria tarefas baseado em conversas do chat |
| Casa inteligente | "Apaguei as luzes para vocês. Boa noite!" |
| Modo offline completo | 100% funcional sem internet |

---

## 3. Marcos (Milestones)

| Marco | Data | Entregável |
|-------|------|-----------|
| **M1** | 15 Jul 2026 | Arquitetura refatorada, Firebase Auth, Collections |
| **M2** | 15 Ago 2026 | Features Core reconstruídas, WebSocket, Design System |
| **M3** | 15 Set 2026 | IA completa, novo UI, testes E2E |
| **M4** | 15 Out 2026 | PWA, widgets, primeira versão mobile |
| **M5** | 15 Nov 2026 | Performance otimizada, IA avançada |
| **M6** | 15 Dez 2026 | v2.0 Release Final |
| **M7** | Mar 2027 | v3.0 (voz + integrações) |
| **M8** | Jun 2027 | v3.5 (smart home) |
| **M9** | Set 2027 | v4.0 (IA preditiva) |

---

## 4. Dependências e Bloqueios

| Bloqueio | Impacto | Desbloqueio |
|----------|---------|------------|
| Firebase Auth implementação | Todas as features de usuário | Prioridade máxima |
| Migração de dados | Features Core sem dados | Script de migração |
| Testes configurados | Qualidade do código | Setup inicial |
| Design System aprovado | UI consistente | Revisão de design |

---

## 5. Riscos e Mitigações

| Risco | Probabilidade | Impacto | Mitigação |
|-------|--------------|---------|-----------|
| Migração de dados complexa | 🟠 Média | 🔴 Alto | Script testado, rollback preparado |
| Firebase custos elevados | 🟡 Baixa | 🟠 Médio | Monitoramento, alertas de custo |
| Performance da IA | 🟠 Média | 🟠 Médio | Fallback local, cache |
| Escopo crescente | 🔴 Alta | 🔴 Alto | Sprints fixos, priorização rigorosa |
| Ausência de testes | 🟠 Média | 🟠 Médio | CI com blocking, code review |
