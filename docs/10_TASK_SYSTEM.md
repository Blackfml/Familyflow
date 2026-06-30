# 10 — TASK SYSTEM

> **Documento:** Sistema de Tarefas
> **Versão:** 2.0 (Proposta)
> **Status:** ✅ Finalizado

---

## 1. Visão Geral

O sistema de tarefas é o núcleo do FamilyFlow. Ele permite que casais criem, atribuam, acompanhem e concluam tarefas de forma colaborativa.

---

## 2. Modelo de Dados (Proposto v2.0)

```typescript
interface Task {
  id: string;
  title: string;
  description: string;
  
  // Atribuição
  createdBy: string;
  responsible: string[];     // Múltiplos responsáveis
  assignedTo: string[];
  
  // Classificação
  category: TaskCategory;
  priority: TaskPriority;
  status: TaskStatus;
  
  // Tempo
  date: string;
  time?: string;
  durationEstimate: number;
  startTime?: string;
  completedAt?: Timestamp;
  
  // Financeiro
  cost?: number;
  
  // Detalhes
  checklist: ChecklistItem[];
  tags: string[];
  recurrence: RecurrenceType;
  
  // Progresso
  percentCompleted: number;
  
  // Metadados
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

type TaskCategory = "Casa" | "Trabalho" | "Finanças" | "Saúde" 
                  | "Educação" | "Lazer" | "Compras" | "Família" | "Geral";

type TaskPriority = "low" | "medium" | "high" | "urgent";

type TaskStatus = "todo" | "in_progress" | "done" | "cancelled" | "waiting";

type RecurrenceType = "none" | "daily" | "weekly" | "monthly" | "yearly" | "custom";
```

---

## 3. Estados da Tarefa

```
┌──────────┐
│ A Fazer  │
└────┬─────┘
     │
     ▼
┌──────────┐     ┌──────────┐
│Fazendo   │────▶│Concluído │
└────┬─────┘     └──────────┘
     │
     ▼
┌──────────┐     ┌──────────┐
│Aguardando│────▶│Cancelado │
└──────────┘     └──────────┘
```

### Regras de Transição

| De | Para | Condição |
|----|------|----------|
| A Fazer | Fazendo | Usuário iniciou |
| A Fazer | Cancelado | Usuário cancelou |
| Fazendo | Concluído | 100% checklist ou manual |
| Fazendo | Aguardando | Dependência externa |
| Aguardando | Fazendo | Dependência resolvida |
| Aguardando | Cancelado | Desistência |
| Concluído | A Fazer | Reabertura |

---

## 4. Sistema de Prioridades

| Prioridade | Cor | Pontos | Tempo Máximo |
|-----------|-----|--------|--------------|
| 🔵 Baixa | `#3B82F6` | 10 pts | 7 dias |
| 🟡 Média | `#F59E0B` | 25 pts | 3 dias |
| 🟠 Alta | `#F97316` | 50 pts | 24 horas |
| 🔴 Urgente | `#EF4444` | 80 pts | 4 horas |

---

## 5. Recorrência

| Tipo | Comportamento |
|------|--------------|
| Nenhuma | Tarefa única |
| Diária | Replica a cada dia |
| Semanal | Replica no mesmo dia da semana |
| Mensal | Replica no mesmo dia do mês |
| Anual | Replica na mesma data |
| Personalizada | Intervalo customizado (ex: a cada 15 dias) |

### Regras de Recorrência

1. Ao concluir tarefa recorrente, nova tarefa é criada para o próximo período
2. A nova tarefa mantém o mesmo título, descrição e configurações
3. O checklist e progresso são resetados
4. Histórico da tarefa original é mantido

---

## 6. Checklist (Subtarefas)

```typescript
interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
  completedBy?: string;
  completedAt?: Timestamp;
}
```

- **Progresso automático:** `percentCompleted = (completedItems / totalItems) * 100`
- Concluir todos os itens = concluir tarefa
- Cada item pode ter responsável diferente

---

## 7. Gamificação

### Pontuação por Ação

| Ação | Pontos | Quem recebe |
|------|--------|-------------|
| Criar tarefa | 5 pts | Criador |
| Concluir tarefa (Baixa) | 10 pts | Responsável |
| Concluir tarefa (Média) | 25 pts | Responsável |
| Concluir tarefa (Alta) | 50 pts | Responsável |
| Concluir tarefa (Urgente) | 80 pts | Responsável |
| Concluir checklist item | 3 pts | Quem concluiu |
| Tarefa em dupla (Ambos) | Bônus 2x | Ambos |

### Streak

- +1 streak a cada dia com pelo menos 1 tarefa concluída
- Reset se pular 1 dia
- Streak > 7 dias: bônus de +50 pontos por semana

---

## 8. Filtros e Busca

### Filtros Disponíveis

| Filtro | Opções |
|--------|--------|
| Status | A Fazer, Fazendo, Concluído, Cancelado, Aguardando |
| Responsável | Alessandro, Brenda, Ambos |
| Prioridade | Baixa, Média, Alta, Urgente |
| Categoria | Casa, Trabalho, Finanças, etc. |
| Data | Hoje, Amanhã, Esta semana, Este mês |
| Tags | Qualquer tag |

### Busca

- Por título e descrição
- Full-text search
- Autocomplete com sugestões

---

## 9. Notificações Relacionadas

| Evento | Notificação | Destino |
|--------|------------|---------|
| Nova tarefa | "Alessandro criou tarefa para você" | Responsável |
| Tarefa concluída | "Brenda concluiu uma tarefa" | Família |
| Prazo próximo | "Tarefa vence em 2 horas" | Responsável |
| Tarefa atrasada | "Tarefa está atrasada" | Responsável + parceiro |
| Reabertura | "Tarefa foi reaberta" | Criador original |

---

## 10. UI de Tarefas (Proposto)

### Card de Tarefa

```
┌──────────────────────────────────────┐
│ 📋 Compras do mês                    │
│ 🔴 Urgente · 👤 Brenda · 💰 R$ 200  │
│ 📅 03/07 · ⏰ 14:00 · ⏱ 30min       │
│                                      │
│ ⬜ 1. Leite                          │
│ ✅ 2. Pão                            │
│ ⬜ 3. Ovos                           │
│                                      │
│ [─── 33% ─────]                      │
│                                      │
│ [Concluir] [✏️ Editar] [🗑️ Excluir]  │
│ 🔄 Repete semanalmente               │
└──────────────────────────────────────┘
```

### Lista de Tarefas

```
┌─── Tarefas Pendentes (4) ─────────────┐
│ 🔴 Urgente                            │
│ ┌──────────────────────────────────┐  │
│ │ 📋 Levar carro no mecânico      │  │
│ │ 👤 Alessandro  ⏰ 14:00         │  │
│ └──────────────────────────────────┘  │
│                                        │
│ 🟡 Média                              │
│ ┌──────────────────────────────────┐  │
│ │ 🏠 Limpeza da sala              │  │
│ │ 👤 Brenda  📅 Amanhã            │  │
│ └──────────────────────────────────┘  │
│ ┌──────────────────────────────────┐  │
│ │ 💰 Pagar contas                 │  │
│ │ 👤 Ambos  📅 Sex                │  │
│ └──────────────────────────────────┘  │
│                                        │
│ 🔵 Baixa                              │
│ ┌──────────────────────────────────┐  │
│ │ 🛒 Comprar material escolar     │  │
│ │ 👤 Brenda  📅 Próxima semana    │  │
│ └──────────────────────────────────┘  │
└────────────────────────────────────────┘
```

---

## 11. API Endpoints (Proposto)

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/families/{id}/tasks` | Listar tarefas (com filtros) |
| GET | `/families/{id}/tasks/{taskId}` | Detalhe da tarefa |
| POST | `/families/{id}/tasks` | Criar tarefa |
| PATCH | `/families/{id}/tasks/{taskId}` | Atualizar tarefa |
| DELETE | `/families/{id}/tasks/{taskId}` | Excluir tarefa |
| POST | `/families/{id}/tasks/{taskId}/complete` | Concluir tarefa |
| POST | `/families/{id}/tasks/{taskId}/reopen` | Reabrir tarefa |
| POST | `/families/{id}/tasks/batch` | Ações em lote |

---

## 12. Regras de Negócio

1. Toda tarefa precisa de título e responsável
2. Data padrão = hoje (se não especificada)
3. Prioridade padrão = Média
4. Tarefas sem responsável aparecem como "Sem dono"
5. Tarefas concluídas são arquivadas após 30 dias
6. Tarefas atrasadas (>7 dias) viram alerta automático
7. Limite de 500 tarefas ativas por família
