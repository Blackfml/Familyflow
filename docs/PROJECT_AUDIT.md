# PROJECT AUDIT — FamilyFlow

> **Data:** 30/06/2026
> **Versão analisada:** 0.0.0 (AI Studio Applet)
> **Tipo de projeto:** React + TypeScript + Vite + Express (Web SPA)

---

## 1. VISÃO GERAL

### 1.1 Resumo do Projeto

FamilyFlow é um **Assistente Inteligente de Organização Familiar** desenvolvido como um applet do Google AI Studio. Trata-se de uma aplicação web full-stack (React + Express + Firebase + Gemini AI) focada em casais que desejam organizar rotina, tarefas, metas, hábitos, compras e eventos de forma compartilhada.

**Stack atual:**
| Camada | Tecnologia |
|--------|-----------|
| Frontend | React 19, TypeScript, Vite 6 |
| Estilização | Tailwind CSS v4, Lucide React, Material Symbols |
| Animação | Motion (motion/react) |
| Backend | Express 4 (Node.js), tsx |
| Banco de dados | Firebase Admin SDK + Firestore |
| IA | Google Gemini (via @google/genai) |
| Notificações | Web Notifications API + Service Worker |
| Build | Vite + esbuild |

### 1.2 Arquitetura Atual

```
familyflow-main/
├── server.ts              # Servidor Express (1227 linhas) - MONOLÍTICO
├── src/
│   ├── main.tsx           # Entry point (23 linhas)
│   ├── App.tsx            # Componente principal (1628 linhas) - MONOLÍTICO
│   ├── index.css          # Estilos globais + tema Tailwind
│   ├── types.ts           # Tipos TypeScript (162 linhas)
│   └── components/
│       ├── AuthScreen.tsx          # Tela de autenticação (707 linhas)
│       ├── HomeDashboard.tsx       # Dashboard principal (430 linhas)
│       ├── TimelineAgenda.tsx      # Agenda/Timeline (376 linhas)
│       ├── TasksView.tsx           # Gerenciamento de tarefas (571 linhas)
│       ├── GoalsView.tsx           # Metas e objetivos (337 linhas)
│       ├── HabitsView.tsx          # Hábitos diários (298 linhas)
│       ├── ShoppingView.tsx        # Lista de compras (218 linhas)
│       ├── AIChatView.tsx          # Chat com IA (294 linhas)
│       ├── FamilyChatView.tsx      # Chat familiar (220 linhas)
│       ├── MorningRoutine.tsx      # Rotina matinal (252 linhas)
│       ├── ProfileSettingsView.tsx # Perfil e configurações (463 linhas)
│       └── NotificationCenterView.tsx # Central de notificações (1190 linhas)
├── public/
│   └── sw.js              # Service Worker (108 linhas)
├── docs/                  # Documentação
├── assets/                # VAZIO (apenas .aistudio/.gitignore)
└── Config files           # package.json, tsconfig.json, vite.config.ts, etc.
```

### 1.3 Gerenciamento de Estado

- **Padrão:** Estado global centralizado em `App.tsx` via `useState`
- **Sincronização:** Polling a cada 5 segundos para `GET /api/state`
- **Persistência:** Servidor mantém estado em memória + arquivo local `family_state.json` + Firestore
- **Sem biblioteca de estado global** (Redux, Zustand, Context API avançado, etc.)

---

## 2. ANÁLISE DA ARQUITETURA

### 2.1 Clean Architecture?

**❌ NÃO segue Clean Architecture.**

| Princípio | Status | Problema |
|-----------|--------|----------|
| Separação de camadas | ❌ | Tudo está em `App.tsx` (1628 linhas) e `server.ts` (1227 linhas) |
| Domínio isolado | ❌ | Lógica de negócio misturada com UI e API |
| Repositórios | ❌ | Não há camada de dados separada |
| Casos de uso | ❌ | Lógica está espalhada entre handlers do Express e funções do App |
| Inversão de dependência | ❌ | Dependências diretas de Firebase, Express e React |

### 2.2 Acoplamento

**ALTO ACOPLAMENTO.** Problemas críticos:

- `App.tsx` importa e gerencia **todos** os componentes, handlers de API, estado global, notificações, modais, e navegação
- `server.ts` contém **todas** as rotas, lógica de negócio, IA, gamificação, e persistência
- Componentes importam `FamilyState` diretamente de `types.ts` e recebem o estado inteiro como prop
- Handlers de API estão em `App.tsx` e são passados como props para componentes filhos

### 2.3 Responsabilidades Misturadas

| Arquivo | Responsabilidades |
|---------|------------------|
| `App.tsx` | Roteamento, estado global, handlers de API, notificações, áudio, Service Worker, tema, layout, FAB, bottom sheet |
| `server.ts` | Servidor HTTP, rotas REST, Firebase Admin, Gemini AI, gamificação, persistência, fallback local da IA |
| `NotificationCenterView.tsx` | UI de notificações + simulador Android + código Flutter + áudio Web API |

### 2.4 Arquivos Grandes

| Arquivo | Linhas | Problema |
|---------|--------|----------|
| `App.tsx` | 1628 | Monolítico, faz TUDO |
| `server.ts` | 1227 | Monolítico, faz TUDO |
| `NotificationCenterView.tsx` | 1190 | Mistura UI, simulador, documentação |
| `AuthScreen.tsx` | 707 | Excesso de responsabilidade |
| `TasksView.tsx` | 571 | Complexidade alta |

### 2.5 Widgets Enormes

- `App.tsx` renderiza ~15 seções condicionais diferentes no mesmo retorno
- `NotificationCenterView.tsx` contém 3 sub-abas completas + simulador Android emulando notificações
- `AuthScreen.tsx` contém login, registro, upload de avatar, OAuth simulado, lista de usuários

### 2.6 Duplicação de Código

- **Sub-tab bar replicada 4 vezes** em `App.tsx` (linhas 1174-1184, 1206-1216, 1237-1247, 1270-1280) — mesma estrutura de tabs "Tarefas/Objetivos/Hábitos/Compras"
- **Lógica de notificação** duplicada entre `addFloatingAlert` e `triggerToast`
- **Fallback de permissão de notificação** repetido ~3 vezes no mesmo bloco `requestSystemPermission`
- **Código de áudio** repetido em `App.tsx` e `NotificationCenterView.tsx`
- **Lógica de gamificação** espalhada entre vários endpoints do servidor
- **Avatar URL** hardcoded em múltiplos lugares

### 2.7 Código Morto

- `handleAddHabit` em `App.tsx` (linha 505-521) faz fetch para `/api/task` com corpo vazio — nunca salva de fato no servidor
- `autoOpenAddModal` e `onAddModalOpened` — mecanismo parcialmente implementado, vários componentes recebem mas nem todos usam
- `AISuggestion` type declarado mas nunca usado em componentes
- Propriedade `password` em `UserProfile` — armazenada sem hash
- `assets/` diretório completamente vazio

### 2.8 Código Reutilizável

**Potencial para extração:**

- `SubTabBar` — componente de navegação por sub-abas (repetido 4x)
- `FloatingAlert` — sistema de notificações flutuantes
- `Modal/BottomSheet` — padrão de criação de itens
- `IconPicker` / `ColorPicker` — usado em HabitsView e TasksView
- `UserAvatar` — exibição de avatar do usuário
- `AudioFeedback` — sistema de som do Web Audio API
- `ApiClient` — camada de comunicação com o servidor
- `GamificationService` — sistema de pontos/níveis/streak

---

## 3. FIREBASE

### 3.1 Collections e Documents

**Padrão atual:** Single document — `appState/familyState`

```json
{
  "users": { ... },
  "tasks": [ ... ],
  "goals": [ ... ],
  "habits": [ ... ],
  "shoppingList": [ ... ],
  "calendarEvents": [ ... ],
  "history": [ ... ],
  "notifications": [ ... ],
  "chatHistory": [ ... ],
  "groupChat": [ ... ],
  "lastWeeklyMeetingSummary": ""
}
```

### 3.2 Problemas Identificados

| Problema | Severidade | Descrição |
|----------|-----------|-----------|
| Documento único | 🔴 CRÍTICO | `appState/familyState` é um único documento com todos os dados. Firestore limite de 1MB por documento. Escalabilidade zero. |
| Sem índices | 🟠 MÉDIO | Nenhum índice composto definido |
| Sem regras de segurança | 🔴 CRÍTICO | `firebase-applet-config.json` expõe `apiKey` e configurações. Sem `firestore.rules` no projeto. |
| Escrita completa | 🟠 MÉDIO | Cada operação salva o documento INTEIRO, causando escrita excessiva |
| Sem tipagem no Firebase | 🟡 BAIXO | Usa `any` para `db` no server.ts |
| Sem validação server-side | 🟠 MÉDIO | Dados não são validados antes de salvar no Firestore |
| Offline não configurado | 🟠 MÉDIO | Não há configuração de cache offline ou persistência |

### 3.3 Queries

**Padrão atual:** Nenhuma query — sempre lê o documento inteiro.

Não há:
- Paginação
- Filtros
- Consultas específicas
- Limit/offset

---

## 4. UI

### 4.1 Telas Analisadas

| Tela | Componente | Qualidade percebida |
|------|-----------|-------------------|
| Autenticação | AuthScreen | ⭐⭐❌❌❌ — Funcional mas visualmente básico, fluxo confuso |
| Dashboard | HomeDashboard | ⭐⭐⭐❌❌ — Bom layout, mas informações densas demais |
| Agenda | TimelineAgenda | ⭐⭐⭐❌❌ — Funcional, mas timeline poderia ser mais clara |
| Tarefas | TasksView | ⭐⭐⭐⭐❌ — Bom, mas filtros poderiam ser mais intuitivos |
| Metas | GoalsView | ⭐⭐⭐❌❌ — Funcional, visual básico |
| Hábitos | HabitsView | ⭐⭐⭐❌❌ — Streak visual é bom, mas faltam métricas |
| Compras | ShoppingView | ⭐⭐⭐❌❌ — Simples, funcional |
| Chat IA | AIChatView | ⭐⭐⭐❌❌ — Básico, faltam recursos |
| Chat Família | FamilyChatView | ⭐⭐⭐❌❌ — Básico, sem tempo real |
| Perfil | ProfileSettingsView | ⭐⭐⭐⭐❌ — Bom, mas informações densas |
| Notificações | NotificationCenterView | ⭐⭐⭐❌❌ — Superdimensionado, mistura dev tools com UI |

### 4.2 Problemas de UI

| Problema | Detalhes |
|----------|----------|
| Excesso de informação | Dashboard e Perfil têm muitas informações em tela pequena |
| Navegação confusa | Sub-abas (Tarefas/Objetivos/Hábitos/Compras) confundem com as tabs principais |
| Hierarquia visual | Títulos e labels com tamanhos muito próximos, sem clara hierarquia |
| Inconsistências | `TasksView` usa emerald theme, `ShoppingView` também — sem padronização |
| Responsividade | Mobile-first parcial, mas não testado em múltiplos breakpoints |
| Espaçamentos irregulares | Padding inconsistente entre componentes |
| Fontes | Inter funciona bem, mas tamanhos muito pequenos em vários lugares (9px, 10px) |
| Dark/Light mode | Dark mode é o padrão, light mode parece incompleto |

---

## 5. UX

### 5.1 Fluxo do Usuário

```
[Auth] → Login/Register → [Dashboard] → Tabs (Home, Agenda, Tarefas, Chat, Gemini, Perfil)
                                        → FAB → Bottom Sheet → escolhe tipo de item
                                        → Notificações → Drawer lateral
```

### 5.2 Problemas de UX

| Problema | Severidade | Detalhes |
|----------|-----------|----------|
| Login sem segurança | 🔴 CRÍTICO | Senha armazenada em plaintext, sem hash, sem JWT, sem sessão |
| Polling de 5s | 🟠 MÉDIO | Experiência "tempo real" falsa — latency de até 5s |
| Perfil fixo "Alessandro/Brenda" | 🟠 MÉDIO | App hardcoded para nomes específicos |
| Requer nome exato no login | 🟡 BAIXO | Login por nome não é UX ideal |
| Sem onboarding | 🟡 BAIXO | Usuário novo não tem tutorial |
| Sem feedback de erro claro | 🟡 BAIXO | Mensagens de erro são genéricas |
| FAB pode ser confuso | 🟡 BAIXO | Usuário pode não entender o bottom sheet |
| Navegação aninhada | 🟡 BAIXO | Sub-abas dentro de tabs criam profundidade desnecessária |

### 5.3 Acessibilidade

| Aspecto | Status | Problema |
|---------|--------|----------|
| Contraste | ⚠️ PARCIAL | Dark mode tem bom contraste, mas light mode é inconsistente |
| Labels ARIA | ❌ | Botões sem aria-label em vários lugares |
| Navegação por teclado | ❌ | Não testado, FAB e modais podem ter foco perdido |
| Font size | ❌ | Múltiplos textos em 9px — ilegível para muitos usuários |
| Touch targets | ⚠️ | Alguns botões muito pequenos (20x20px) |
| Screen reader | ❌ | Sem semântica adequada |

---

## 6. PERFORMANCE

### 6.1 Problemas Identificados

| Problema | Severidade | Descrição |
|----------|-----------|-----------|
| Re-renders excessivos | 🟠 MÉDIO | `useState` em App.tsx causa re-render de toda árvore a cada mudança |
| Polling vs WebSocket | 🟠 MÉDIO | 5s de polling = 12 requisições/minuto, mesmo sem mudanças |
| Single document Firestore | 🔴 CRÍTICO | Lê e escreve documento inteiro (escalabilidade zero) |
| Sem lazy loading | 🟠 MÉDIO | Todos os componentes carregados upfront |
| Sem code splitting | 🟠 MÉDIO | Bundle único (Vite não configurado para split) |
| Service Worker apenas para push | 🟡 BAIXO | Sem cache de assets ou estratégia offline |
| Imagens externas | 🟡 BAIXO | Avatares e ícones carregam de CDNs externas sem fallback |
| Sem memoization | 🟠 MÉDIO | `React.memo`, `useMemo`, `useCallback` não usados |
| Animações Motion | 🟡 BAIXO | Animações spring podem causar jank em dispositivos lentos |
| Web Audio API | 🟡 BAIXO | Cria novo AudioContext a cada notificação |

### 6.2 Memória e FPS

- **FPS:** Provavelmente estável em desktop, pode ter quedas em dispositivos móveis
- **Memória:** Estado inteiro do app mantido em memória (cliente + servidor)
- **Rebuilds:** Estado global causa rebuild de toda a árvore

---

## 7. IA (ASSISTENTE)

### 7.1 Funcionamento Atual

- **Modelo:** Google Gemini (`gemini-3.5-flash`)
- **Endpoint:** `/api/gemini/chat`
- **Contexto:** Estado completo da família serializado em texto + prompt
- **Fallback:** Sistema local com respostas pré-programadas quando Gemini falha

### 7.2 Problemas

| Problema | Severidade | Descrição |
|----------|-----------|-----------|
| Contexto inteiro no prompt | 🟠 MÉDIO | Serializa TODO o estado no prompt (alto custo de tokens) |
| Sem memória de longo prazo | 🟠 MÉDIO | Apenas últimas 6 mensagens do chat são enviadas |
| Fallback limita personalização | 🟡 BAIXO | Fallback local não considera dados reais |
| Sem streaming | 🟡 BAIXO | Resposta chega completa, sem streaming |
| Sem moderação de conteúdo | 🟡 BAIXO | Sem filtro de conteúdo nas respostas |
| Sem personalização por usuário | 🟡 BAIXO | Prompt genérico para todos |

---

## 8. ESCALABILIDADE

### 8.1 Limitações Atuais

| Aspecto | Situação | Impacto |
|---------|----------|---------|
| Múltiplos usuários | ⚠️ Suporta apenas 2 (Alessandro/Brenda) | Impede crescimento |
| Múltiplas famílias | ❌ Single document | Uma única família por instância |
| Web | ✅ Funciona | SPA funciona em navegadores |
| Mobile (PWA) | ❌ Não configurado | Sem manifest.json, sem install prompt |
| Desktop | ⚠️ Parcial | Responsivo até certo ponto |
| Apple Watch / Wear OS | ❌ | Fora do escopo atual |
| Widgets Android/iOS | ❌ | Fora do escopo atual |

### 8.2 Backend

- **Escalabilidade:** Servidor Express single-thread, estado em memória
- **Múltiplas instâncias:** Impossível sem Redis/cache compartilhado
- **Firestore:** Single document limita a 1MB e 1 escrita/segundo

---

## 9. SEGURANÇA

### 9.1 Problemas Críticos

| Problema | Severidade | Descrição |
|----------|-----------|-----------|
| Senha em plaintext | 🔴 CRÍTICO | `password` armazenada sem hash no Firestore |
| Chave de API exposta | 🟠 MÉDIO | `apiKey` no `firebase-applet-config.json` versionado |
| Sem autenticação real | 🔴 CRÍTICO | Login simulado, qualquer um pode acessar qualquer conta |
| Sem Firestore Rules | 🔴 CRÍTICO | Nenhuma regra de segurança definida |
| Sem sanitização | 🟠 MÉDIO | Input do usuário não sanitizado |
| Sem rate limiting | 🟠 MÉDIO | APIs sem proteção contra abuso |
| Sem CORS configurado | 🟡 BAIXO | App usa middlewareMode do Vite |
| Dados sensíveis no client | 🟡 BAIXO | Estado completo trafega para o frontend |

---

## 10. PROBLEMAS ENCONTRADOS (Ordenados por Severidade)

### 🔴 Críticos
1. **Senha armazenada em plaintext** — sem hash, sem segurança
2. **Firestore single document** — sem escalabilidade, limite de 1MB
3. **Sem Firestore Rules** — banco sem proteção
4. **Sem autenticação real** — login por nome sem token JWT
5. **Chave de API exposta no repositório** — apiKey no JSON

### 🟠 Altos
6. **App.tsx monolítico (1628 linhas)** — sem separação de responsabilidades
7. **Server.ts monolítico (1227 linhas)** — sem separação de responsabilidades
8. **Polling de 5s** — não é tempo real, alto consumo de rede
9. **Sem estado global (biblioteca)** — prop drilling excessivo, re-renders
10. **Sub-abas duplicadas (4x)** — código repetido em App.tsx
11. **handleAddHabit quebrado** — nunca salva no servidor
12. **Sem lazy loading / code splitting** — bundle único
13. **Sem validação de entrada** — server sem validação de dados

### 🟡 Médios
14. **assets/ vazio** — sem estrutura de assets
15. **Sem testes** — nenhum teste implementado
16. **Gender hardcoded** — lógica de gênero baseada em nome
17. **Navegação aninhada confusa** — sub-abas vs tabs
18. **Fallback de notificação repetido** — código duplicado
19. **AudioContext criado sem reuso** — pode causar memory leak
20. **Missing i18n** — textos hardcoded em português
21. **Service Worker limitado** — sem cache de assets

### 🟢 Baixos
22. **Fontes em 9px** — acessibilidade comprometida
23. **Light mode incompleto** — tema claro com problemas visuais
24. **Sem meta tags PWA** — sem manifest.json
25. **Código morto (AISuggestion type)** — tipo declarado não usado
26. **Mock events hardcoded** — TimelineAgenda tem eventos de exemplo fixos

---

## 11. MELHORIAS RECOMENDADAS

### 📋 Curto Prazo (Sprint 1-2)
| # | Melhoria | Esforço | Impacto |
|---|----------|---------|---------|
| 1 | Extrair sub-tab bar para componente reutilizável | 🟢 Baixo | 🟢 Remove duplicação |
| 2 | Adicionar hash de senha (bcrypt) | 🟢 Baixo | 🔴 Segurança crítica |
| 3 | Criar ApiClient service layer | 🟢 Baixo | 🟠 Separa responsabilidade |
| 4 | Remover código morto (handleAddHabit, AISuggestion) | 🟢 Baixo | 🟢 Limpeza |
| 5 | Extrair lógica de áudio para hook reutilizável | 🟢 Baixo | 🟠 Elimina duplicação |
| 6 | Configurar Firestore Rules básicas | 🟠 Médio | 🔴 Segurança |
| 7 | Adicionar loading skeleton | 🟠 Médio | 🟠 UX |

### 📋 Médio Prazo (Sprint 3-5)
| # | Melhoria | Esforço | Impacto |
|---|----------|---------|---------|
| 8 | Refatorar App.tsx em camadas (hooks, context, pages) | 🔴 Alto | 🔴 Arquitetura |
| 9 | Refatorar server.ts em services/controllers/routes | 🔴 Alto | 🔴 Arquitetura |
| 10 | Implementar autenticação real (JWT + Firebase Auth) | 🔴 Alto | 🔴 Segurança |
| 11 | Migrar Firestore para modelo de collections normalizado | 🔴 Alto | 🔴 Escalabilidade |
| 12 | Substituir polling por WebSocket / SSE | 🟠 Médio | 🟠 Performance |
| 13 | Implementar state management (Zustand) | 🟠 Médio | 🟠 Performance |
| 14 | Adicionar React Router para navegação real | 🟠 Médio | 🟠 UX |
| 15 | Implementar lazy loading / code splitting | 🟠 Médio | 🟠 Performance |
| 16 | Criar sistema de testes (Vitest + Testing Library) | 🟠 Médio | 🔴 Qualidade |
| 17 | Adicionar validação de dados (Zod) | 🟠 Médio | 🟠 Segurança |

### 📋 Longo Prazo (Sprint 6+)
| # | Melhoria | Esforço | Impacto |
|---|----------|---------|---------|
| 18 | Multi-família com separação por tenant | 🔴 Alto | 🔴 Produto |
| 19 | PWA completo com offline | 🔴 Alto | 🟠 Mobile |
| 20 | Modo offline completo (IndexedDB + Sync) | 🔴 Alto | 🟠 UX |
| 21 | IA com memória persistente e RAG | 🔴 Alto | 🟠 Inovação |
| 22 | Apple Watch / Wear OS | 🔴 Alto | 🟡 Produto |
| 23 | Google Calendar / Alexa integrações | 🔴 Alto | 🟡 Produto |
| 24 | Pipeline CI/CD | 🟠 Médio | 🟠 DevOps |
| 25 | i18n (português + inglês + espanhol) | 🟠 Médio | 🟡 Produto |

---

## 12. NOTA GERAL

### 12.1 Pontuação (0-10)

| Categoria | Nota | Comentário |
|-----------|------|------------|
| **Arquitetura** | 2/10 | Monolítica, sem separação de camadas, sem padrões |
| **Código** | 3/10 | Duplicação alta, código morto, sem testes |
| **UX** | 4/10 | Funcional mas confuso, sem onboarding, polling |
| **UI** | 5/10 | Visual razoável (dark mode), mas inconsistente |
| **Firebase** | 1/10 | Single document, sem regras, sem índices |
| **Performance** | 3/10 | Polling, re-renders, sem lazy loading |
| **Escalabilidade** | 1/10 | Uma família por instância, single document |
| **Segurança** | 1/10 | Senha plaintext, sem auth real, sem rules |
| **IA** | 4/10 | Gemini integrado, mas sem memória ou personalização |
| **Produto** | 3/10 | MVP funcional, longe de produção comercial |

### 12.2 Média Ponderada

> **NOTA FINAL: 2.7/10**

O projeto tem potencial e uma base funcional, mas precisa de uma **reestruturação arquitetural profunda** antes de ser considerado um produto comercial pronto para App Store e Google Play.

---

## 13. PRÓXIMOS PASSOS

1. ❌ **NÃO implementar novas funcionalidades**
2. ✅ Preencher toda a documentação na ordem especificada
3. ✅ Criar plano de implementação dividido em Sprints
4. ✅ Priorizar a correção dos problemas críticos de segurança e arquitetura
5. ✅ Estabelecer padrões de código e design system
6. ✅ Preparar estrutura para Flutter (migração de web para mobile nativo)
