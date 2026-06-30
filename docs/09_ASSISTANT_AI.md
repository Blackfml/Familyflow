# 09 — ASSISTANT AI

> **Documento:** Assistente Inteligente Familiar
> **Versão:** 2.0 (Proposta)
> **Status:** ✅ Finalizado

---

## 1. Visão

O FamilyFlow AI não é um chatbot genérico. É uma **integrante da família** — uma assistente que conhece a rotina, os hábitos, as preferências e o histórico de cada membro.

```
Current:   "IA = Chat que responde perguntas"
Target:    "IA = Membro da família que organiza, sugere, motiva e cuida"
```

---

## 2. Estado Atual (v1.x)

### Funcionamento

```
Usuário digita pergunta
        │
        ▼
POST /api/gemini/chat
        │
        ▼
Servidor monta contexto:
  - Usuários e pontos
  - Todas as tarefas
  - Todas as metas
  - Todos os hábitos
  - Últimos 10 logs
  - Últimas 6 mensagens
        │
        ▼
Envia para Gemini 3.5 Flash
        │
        ▼
Resposta em Markdown
        │
        ▼
Salva no chatHistory
Retorna para o frontend
```

### Problemas Atuais

| Problema | Impacto |
|----------|---------|
| Contexto inteiro no prompt | Alto custo de tokens, lentidão |
| Apenas últimas 6 mensagens | Sem memória de longo prazo |
| Sem diferenciação de usuário | IA não sabe quem está falando |
| Sem ações (tools/functions) | Apenas texto, sem criar/editar coisas |
| Fallback genérico | Respostas pré-programadas sem contexto |
| Sem streaming | Usuário espera resposta completa |
| Sem moderação | Pode gerar conteúdo inadequado |

---

## 3. Arquitetura Proposta (v2.0)

```
┌─────────────────────────────────────────────────────┐
│                   FamilyFlow AI                      │
├─────────────────────────────────────────────────────┤
│  ┌───────────────────────────────────────────────┐  │
│  │           AI Orchestrator                     │  │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────────┐  │  │
│  │  │ Router   │ │ Context  │ │ Memory       │  │  │
│  │  │ (intent) │ │ Builder  │ │ Manager      │  │  │
│  │  └──────────┘ └──────────┘ └──────────────┘  │  │
│  └───────────────────────────────────────────────┘  │
│                                                      │
│  ┌────────────┐ ┌────────────┐ ┌────────────────┐  │
│  │ Gemini API │ │ LangChain  │ │ Tool System    │  │
│  │ (model)    │ │ (RAG)      │ │ (Functions)    │  │
│  └────────────┘ └────────────┘ └────────────────┘  │
│                                                      │
│  ┌───────────────────────────────────────────────┐  │
│  │              Tools (Functions)                 │  │
│  │  createTask  toggleHabit  getWorkload         │  │
│  │  updateGoal  addShopping  getWeeklyReport     │  │
│  │  sendNotification  createEvent  getAgenda     │  │
│  └───────────────────────────────────────────────┘  │
│                                                      │
│  ┌───────────────────────────────────────────────┐  │
│  │           Memory System                        │  │
│  │  Short-term (últimas 50 interações)           │  │
│  │  Long-term (resumos diários/semanais)         │  │
│  │  Preferences (aprendido sobre cada membro)    │  │
│  └───────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

---

## 4. Capacidades da IA

### 4.1 Capacidades Atuais (Manter)

| Capacidade | Descrição |
|-----------|-----------|
| Chat contextual | Responde perguntas sobre a rotina |
| Reorganizar agenda | Sugere cronograma otimizado |
| Analisar carga | Detecta sobrecarga e sugere redistribuição |
| Reunião semanal | Gera relatório automático da semana |

### 4.2 Capacidades Propostas (v2.0)

| Capacidade | Prioridade | Descrição |
|-----------|-----------|-----------|
| **Criação por voz/texto** | 🔴 Alta | "Cria uma tarefa para comprar leite amanhã" |
| **Detecção de conflitos** | 🔴 Alta | "Você tem reunião e consulta no mesmo horário" |
| **Sugestão proativa** | 🔴 Alta | "Percebi que Brenda está sobrecarregada esta semana" |
| **Memória de preferências** | 🟠 Média | Lembra que Alessandro prefere tarefas de manhã |
| **Rotina adaptativa** | 🟠 Média | Ajusta sugestões com base no histórico |
| **Modo Família** | 🟠 Média | Sugestões que envolvem o casal |
| **Integração Google Calendar** | 🟡 Baixa | Sincroniza eventos externos |
| **Alexa / Voice assistants** | 🟡 Baixa | Comandos por voz |

---

## 5. Sistema de Tools (Functions)

A IA poderá executar ações diretamente no app:

### Task Tools

```typescript
// Criar tarefa
tool createTask({
  title: string,
  description?: string,
  responsible: string,
  priority: "low" | "medium" | "high" | "urgent",
  date?: string,
  time?: string
}): Task

// Buscar tarefas
tool getTasks({
  status?: string,
  responsible?: string,
  date?: string
}): Task[]

// Concluir tarefa
tool completeTask(taskId: string): void

// Reorganizar tarefas
tool reorganizeTasks(): Schedule
```

### Goal Tools

```typescript
// Criar meta
tool createGoal({
  title: string,
  targetAmount?: number,
  deadline?: string
}): Goal

// Ver progresso
tool getGoalProgress(): Goal[]
```

### Habit Tools

```typescript
// Completar hábito
tool completeHabit(habitId: string): void

// Sugerir novo hábito
tool suggestHabit(): { title: string, description: string }
```

### Communication Tools

```typescript
// Enviar notificação
tool sendNotification({
  targetUser: string,
  title: string,
  body: string
}): void

// Enviar mensagem no chat
tool sendFamilyMessage(content: string): void
```

---

## 6. Sistema de Memória

### Memória de Curto Prazo

```
Últimas 50 interações (chatHistory)
├── Quem falou
├── O que foi dito
├── Ações tomadas
└── Contexto da conversa
```

### Memória de Longo Prazo

```
Resumo Diário (gerado toda noite)
├── Tarefas concluídas
├── Hábitos completados
├── Pontos ganhos
└── Observações da IA

Resumo Semanal (gerado domingo)
├── Análise de produtividade
├── Padrões identificados
├── Sugestões de melhoria
└── Comparação com semanas anteriores

Preferências Aprendidas
├── Brenda prefere tarefas de casa
├── Alessandro é mais produtivo de manhã
├── Casal prefere reunião domingo 20h
└── Brenda não gosta de lembretes noturnos
```

### Estrutura do Documento de Memória

```
families/{familyId}/ai/memory/{memberId}
├── preferences: { ... }
├── dailySummaries: { [date]: { ... } }
├── weeklySummaries: { [weekId]: { ... } }
├── learnedPatterns: [ ... ]
└── lastInteraction: Timestamp
```

---

## 7. Prompts Estruturados

### System Prompt (v2.0)

```
Você é o FamilyFlow AI, o assistente inteligente da família {familyName}.

MEMBROS:
- {member1}: {points} pontos, nível {level}, streak {streak} dias
- {member2}: {points} pontos, nível {level}, streak {streak} dias

ESTADO ATUAL (resumido):
- {n} tarefas pendentes
- {m} metas ativas
- {h} hábitos hoje
- {s} itens na lista de compras

REGRAS:
1. Responda SEMPRE em português brasileiro
2. Seja acolhedora e positiva (nunca culpe)
3. Use Markdown para formatação
4. Sugira próximos passos
5. Se detectar sobrecarga, ofereça redistribuição
6. Comemore conquistas genuinamente
7. Para criar/modificar dados, use as tools disponíveis
8. Se não souber responder, diga que vai aprender

MEMÓRIA RECENTE:
{ultimas_interacoes}

PREFERÊNCIAS:
{preferencias_aprendidas}
```

---

## 8. Estratégia de Fallback

### Níveis de Fallback

| Nível | Cenário | Ação |
|-------|---------|------|
| 1 | Gemini funcionando | Resposta normal com tools |
| 2 | Gemini lento (>5s) | Usa cache de resposta similar |
| 3 | Gemini offline | Fallback local com dados atuais |
| 4 | Tudo offline | Mensagem amigável + modo somente leitura |

### Fallback Inteligente (Proposto)

Diferente do fallback atual (que retorna texto genérico), o novo fallback:

1. Usa últimos dados sincronizados do cache
2. Mantém capacidade de actions (tools locais)
3. Faz fila de requisições para quando voltar
4. Notifica usuário: "Estou em modo offline, mas ainda posso ajudar!"

---

## 9. Agendamento de IA

### Tarefas Automáticas da IA

| Horário | Ação |
|---------|------|
| 07:00 | Bom dia + resumo do dia |
| 09:00 | Verificar se há tarefas sem responsável |
| 12:00 | Sugestão de almoço / pausa |
| 18:00 | Resumo do que falta fazer hoje |
| 21:00 | Lembrete de hábitos noturnos |
| Dom 20:00 | Gerar reunião semanal automática |

---

## 10. Modos de Operação

### Modo Correria
```
Ativado quando: >5 tarefas pendentes para hoje
Comportamento: Sugere pular hábitos não essenciais,
               redistribui tarefas automaticamente,
               foco no essencial
```

### Modo Foco
```
Ativado quando: Usuário marca "Modo Foco"
Comportamento: Suprime notificações não urgentes,
               Sugere pomodoro,
               "Vou guardar suas notificações. Foco total!"
```

### Modo Família
```
Ativado quando: Final de semana
Comportamento: Sugere atividades em casal,
               Relembra metas compartilhadas,
               "Que tal um cinema hoje à noite?"
```

---

## 11. Considerações Éticas

| Princípio | Implementação |
|-----------|--------------|
| Privacidade | IA nunca compartilha dados fora da família |
| Transparência | Usuário sabe quando é IA vs humano |
| Controle | Usuário pode desativar IA a qualquer momento |
| Não-manipulação | IA sugere, nunca impõe |
| Dados mínimos | Apenas dados necessários para funcionamento |
| Viés | Treinada para ser neutra em gênero, raça, etc. |
