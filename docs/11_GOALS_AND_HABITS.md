# 11 — GOALS AND HABITS

> **Documento:** Sistema de Metas e Hábitos
> **Versão:** 2.0 (Proposta)
> **Status:** ✅ Finalizado

---

## 1. Visão Geral

Metas e hábitos formam o sistema de **crescimento familiar** do FamilyFlow. Enquanto tarefas são afazeres pontuais, metas representam objetivos de longo prazo e hábitos representam compromissos diários.

---

## 2. Metas (Goals)

### 2.1 Modelo de Dados

```typescript
interface Goal {
  id: string;
  title: string;
  description: string;
  
  // Tipo e Métrica
  type: "financial" | "savings" | "project" | "health" | "custom";
  targetValue: number;
  currentValue: number;
  
  // Tempo
  deadline: string;
  startedAt: Timestamp;
  completedAt?: Timestamp;
  
  // Progresso
  progress: number;  // 0-100, calculado automaticamente
  status: "in_progress" | "completed" | "paused" | "cancelled";
  
  // Subtarefas
  subtasks: {
    id: string;
    text: string;
    completed: boolean;
    completedBy?: string;
    completedAt?: Timestamp;
  }[];
  
  // Metadados
  category: string;
  icon: string;
  createdBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### 2.2 Estados da Meta

```
┌──────────────┐
│ Em Progresso │
└──────┬───────┘
       │
    ┌──┴──┐
    ▼     ▼
┌────────┐ ┌────────┐
│Pausado │ │Concluído│
└────────┘ └────────┘
    │
    ▼
┌──────────┐
│ Cancelado│
└──────────┘
```

### 2.3 Tipos de Meta

| Tipo | Exemplo | Métrica |
|------|---------|---------|
| Financeira | Economizar R$ 5.000 | Valor acumulado |
| Poupança | Reserva de emergência | % do objetivo |
| Projeto | Reformar a cozinha | Subtarefas concluídas |
| Saúde | Perder 10kg | Progresso (kg) |
| Customizado | Ler 12 livros no ano | Unidades |

### 2.4 Cálculo de Progresso

```
Para metas financeiras:
  progress = (currentValue / targetValue) * 100

Para metas de projeto:
  progress = (subtasksCompleted / totalSubtasks) * 100

Para metas mistas:
  progress = weighted average dos componentes
```

### 2.5 Gamificação de Metas

| Marco | Pontos | Bônus |
|-------|--------|-------|
| Criar meta | 10 | - |
| 25% progresso | 25 | - |
| 50% progresso | 50 | Streak bônus |
| 75% progresso | 75 | - |
| 100% (concluído) | 200 | 🏆 Badge especial |

---

## 3. Hábitos (Habits)

### 3.1 Modelo de Dados

```typescript
interface Habit {
  id: string;
  title: string;
  description: string;
  responsible: string[];  // Múltiplos membros
  
  // Identidade visual
  icon: string;
  color: string;
  
  // Metadados
  createdBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  
  // Estatísticas (calculadas do history)
  currentStreak: number;
  longestStreak: number;
  totalCompletions: number;
}
```

### 3.2 Histórico de Hábitos

```typescript
// Subcollection: habits/{habitId}/history/{date}
interface HabitHistoryEntry {
  date: string;           // "2026-07-01"
  completed: boolean;
  completedBy?: string;   // UID
  completedAt?: Timestamp;
  notes?: string;
}
```

### 3.3 Visualização de Streak

```
Hábito: Beber 2L de água
Responsável: Brenda

┌─────┬─────┬─────┬─────┬─────┬─────┬─────┐
│ Dom │ Seg │ Ter │ Qua │ Qui │ Sex │ Sáb │
├─────┼─────┼─────┼─────┼─────┼─────┼─────┤
│  ✅ │  ✅ │  ✅ │  ✅ │  ✅ │  ✅ │  ⬜ │
└─────┴─────┴─────┴─────┴─────┴─────┴─────┘

🔥 Streak atual: 6 dias
🏆 Maior streak: 15 dias
📊 Total: 42 dias
```

### 3.4 Gamificação de Hábitos

| Ação | Pontos |
|------|--------|
| Completar hábito | 15 pts |
| Streak de 7 dias | Bônus +50 pts |
| Streak de 30 dias | Bônus +200 pts 🏆 |
| Streak de 100 dias | Bônus +1000 pts 👑 |
| Ambos completam mesmo hábito | +10 pts cada |

---

## 4. Integração com IA

### Sugestões Inteligentes

| Situação | Sugestão da IA |
|----------|---------------|
| Streak quebrado | "Que tal recomeçar hoje sem culpa?" |
| Meta estagnada | "Brenda, sua meta está parada há 2 semanas. Vamos revisar?" |
| Casal sem metas | "Que tal criar uma meta de viagem para o fim do ano?" |
| Hábito muito difícil | "Que tal dividir em 2 hábitos menores?" |

### Metas Sugeridas pela IA

Baseado no perfil do casal, a IA pode sugerir:
- "Economizar para viagem de férias"
- "Reserva de emergência de 3 meses"
- "Reforma do quarto das crianças"

---

## 5. UI Proposta

### Card de Meta

```
┌──────────────────────────────────────┐
│ 🎯 Viagem de Férias                  │
│ 📊 R$ 2.500 de R$ 10.000            │
│ ┌────────────────────────────────┐   │
│ │ ████████░░░░░░░░░░░░░░░░░ 25% │   │
│ └────────────────────────────────┘   │
│ 📅 Prazo: 31/12/2026                 │
│                                      │
│ ✅ Passagem comprada                 │
│ ⬜ Reservar hotel                    │
│ ⬜ Planejar roteiro                  │
│                                      │
│ [Atualizar] [✏️]                     │
│                                      │
│ 🔥 Streak do casal: 6 dias           │
└──────────────────────────────────────┘
```

### Card de Hábito

```
┌──────────────────────────────────────┐
│ 💧 Beber 2L de água                  │
│ 👤 Brenda                             │
│                                      │
│ 🔥 6 dias consecutivos               │
│                                      │
│ [✅ Completar hoje]                   │
└──────────────────────────────────────┘
```

---

## 6. API Endpoints

### Metas

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/families/{id}/goals` | Listar metas |
| POST | `/families/{id}/goals` | Criar meta |
| PATCH | `/families/{id}/goals/{id}` | Atualizar meta |
| DELETE | `/families/{id}/goals/{id}` | Excluir meta |
| POST | `/families/{id}/goals/{id}/progress` | Atualizar progresso |

### Hábitos

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/families/{id}/habits` | Listar hábitos |
| POST | `/families/{id}/habits` | Criar hábito |
| PATCH | `/families/{id}/habits/{id}` | Atualizar hábito |
| DELETE | `/families/{id}/habits/{id}` | Excluir hábito |
| POST | `/families/{id}/habits/{id}/toggle` | Completar/desmarcar dia |

---

## 7. Regras de Negócio

1. Meta precisa de título e prazo
2. Progresso mínimo: 0%, máximo: 100%
3. Meta concluída não pode ser editada (apenas reaberta)
4. Hábito sem histórico = streak 0
5. Streak quebra se pular 1 dia completo
6. Máximo de 20 hábitos ativos por família
7. Máximo de 10 metas ativas por família
