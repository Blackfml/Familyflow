# 19 — CHANGELOG

> **Documento:** Histórico de Mudanças
> **Versão:** 2.0 (Proposta)
> **Status:** ✅ Finalizado

---

## [2.0.0] — Planejado para Dez 2026

### 🏗️ Arquitetura

- Refatoração completa do server.ts monolítico em camadas (Controllers, Services, Repositories)
- Refatoração do App.tsx monolítico em pages, hooks e stores
- Implementação de Clean Architecture parcial
- Migração de polling HTTP para WebSocket (tempo real)
- Code splitting e lazy loading implementados
- Virtualização de listas para performance

### 🔒 Segurança

- Migração de autenticação por nome+senha para Firebase Auth (Google, Apple, Email)
- Implementação de JWT para sessões seguras
- Firestore Security Rules definidas e aplicadas
- Senhas nunca mais armazenadas (Firebase Auth gerencia)
- Rate limiting implementado nas APIs
- Helmet headers configurados
- CORS whitelist definida

### 🗄️ Banco de Dados

- Migração de single document Firestore para collections normalizadas
- Índices compostos criados para queries eficientes
- Cache local com IndexedDB
- Suporte offline inicial

### 🎨 UI/UX

- Design System completo implementado
- Dark mode como padrão, light mode polido
- Micro-animações em interações
- Novo sistema de navegação (sem sub-tabs aninhadas)
- Onboarding para novos usuários
- Bottom sheet refinado para FAB
- Tipografia revisada (mínimo 11px para corpo)
- Glassmorphism sutil e premium

### 🤖 Inteligência Artificial

- Sistema de Tools (Functions) para a IA criar/editar dados
- Memória de curto prazo (últimas 50 interações)
- Memória de longo prazo (resumos diários/semanais)
- Streaming de respostas da IA
- Fallback inteligente (não genérico)
- Sugestão proativa baseada em dados reais
- Modo Correria, Modo Foco, Modo Família

### 📱 Plataforma

- Configuração PWA completa (manifest.json, install prompt)
- Service Worker com cache de assets
- Estratégia offline inicial

### ✅ Testes

- Vitest configurado para testes unitários
- Testing Library para componentes
- Testes de integração com Supertest
- Playwright para E2E
- CI/CD no GitHub Actions

### 🐛 Bug Fixes (vs v1.x)

- HandleAddHabit que nunca salvava — corrigido
- Sub-tab bar duplicada 4x — agora componente único
- Código morto (AISuggestion type) — removido
- AudioContext sem pool — corrigido com reuso
- Mock events hardcoded — agora 100% dados reais
- Light mode inconsistente — corrigido

---

## [1.0.0] — Versão Atual (Pré-documentação)

### Funcionalidades Implementadas

- Autenticação básica (nome + senha)
- Dashboard com resumo do dia
- Tarefas (CRUD + checklist + prioridades)
- Metas financeiras (CRUD + progresso)
- Hábitos diários (toggle + streak)
- Lista de compras (CRUD + toggle)
- Agenda/Timeline semanal
- Chat familiar
- Chat IA (Gemini integration)
- Notificações flutuantes
- Notificações nativas (Service Worker)
- Gamificação (pontos, níveis, streak)
- Dark/Light mode
- Perfil e configurações

### Problemas Conhecidos (v1.x)

- Senha armazenada em plaintext
- Sem autenticação real (JWT)
- Polling de 5 segundos
- Single document Firestore (1MB limit)
- Sem Firestore Rules
- App.tsx monolítico (1628 linhas)
- Server.ts monolítico (1227 linhas)
- Código duplicado (sub-tab bar 4x)
- HandleAddHabit quebrado
- Sem testes
- Assets vazio
- Texto em 9px (acessibilidade)
- Sem PWA configurado
- API key exposta no repositório
- Sem lazy loading
- Sem code splitting
- Sem cache offline
- Gender hardcoded baseado em nome

---

## [0.1.0] — Protótipo Inicial

- Primeira versão funcional do MVP
- Estrutura básica React + Express
- Integração com Google AI Studio
- Conceito de organização familiar validado
