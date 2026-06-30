# 06 — DATABASE MODEL

> **Documento:** Modelo de Dados
> **Versão:** 2.0 (Proposta)
> **Status:** ✅ Finalizado

---

## 1. Modelo Atual (v1.x)

### Estrutura

```typescript
interface FamilyState {
  users: { [username: string]: UserProfile };
  tasks: Task[];
  goals: Goal[];
  habits: Habit[];
  shoppingList: ShoppingItem[];
  calendarEvents: CalendarEvent[];
  history: HistoryLog[];
  notifications: Notification[];
  chatHistory: ChatMessage[];
  groupChat?: GroupMessage[];
  lastWeeklyMeetingSummary?: string;
}
```

### Tipo de Dados — UserProfile (Atual)

```typescript
interface UserProfile {
  id: string;
  name: string;
  avatar: string;
  points: number;
  level: number;
  streak: number;
  streakUpdatedAt: string;
  email?: string;
  password?: string;    // ⚠️ PLAINTEXT PASSWORD
  provider?: string;
  gender?: "Masculino" | "Feminino";
}
```

---

## 2. Modelo PROPOSTO (v2.0)

### Coleções e Documentos

```
├── families/                        # Raiz do multi-tenant
├── users/                           # Perfis globais de usuário
└── {familyId}/                      # Dados por família
    ├── info
    ├── members/
    ├── tasks/
    ├── goals/
    ├── habits/
    ├── habits/{habitId}/history/
    ├── shopping/
    ├── events/
    ├── chat/
    ├── notifications/
    └── history/
```

---

## 3. Modelo Detalhado — Coleção `users`

### Documento: `users/{userId}`

```typescript
interface UserDocument {
  // Identificação
  uid: string;               // Firebase Auth UID
  email: string;             // Email do usuário
  displayName: string;       // Nome de exibição
  photoURL: string;          // URL do avatar
  
  // Preferências
  preferredLanguage: "pt-BR" | "en" | "es";
  theme: "dark" | "light" | "system";
  notificationsEnabled: boolean;
  
  // Metadados
  createdAt: Timestamp;
  lastLoginAt: Timestamp;
  updatedAt: Timestamp;
}
```

### Regras de Negócio

- `uid` = Firebase Auth UID (chave primária)
- `email` unique (garantido pelo Firebase Auth)
- `displayName` entre 3-50 caracteres

---

## 4. Modelo Detalhado — Coleção `families`

### Documento: `families/{familyId}`

```typescript
interface FamilyDocument {
  // Identificação
  id: string;                // ID único da família
  name: string;              // Nome da família (ex: "Família Silva")
  ownerId: string;           // UID do criador
  
  // Configuração
  plan: "free" | "premium" | "family";
  maxMembers: number;        // Limite de membros
  settings: {
    weeklyMeetingDay: 0;     // 0=Domingo
    weeklyMeetingTime: string; // "20:00"
    defaultTheme: "dark" | "light";
    aiEnabled: boolean;
    gamificationEnabled: boolean;
  };
  
  // Métricas agregadas
  metrics: {
    totalTasksCompleted: number;
    totalPointsEarned: number;
    currentStreak: number;
    longestStreak: number;
  };
  
  // Metadados
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

---

## 5. Modelo Detalhado — Subcoleção `members`

### Documento: `families/{familyId}/members/{userId}`

```typescript
interface FamilyMember {
  uid: string;               // Firebase Auth UID
  role: "owner" | "admin" | "member" | "child";
  nickname: string;          // Apelido na família
  joinedAt: Timestamp;
  invitedBy: string;         // UID de quem convidou
  
  // Gamificação (por família)
  points: number;            // Pontos acumulados
  level: number;             // Nível atual
  streak: number;            // Streak atual
  longestStreak: number;     // Maior streak
  streakUpdatedAt: string;   // Data do último streak
  
  // Estatísticas
  stats: {
    tasksCompleted: number;
    habitsCompleted: number;
    goalsAchieved: number;
    shoppingItemsBought: number;
  };
  
  // Preferências na família
  preferences: {
    notificationsEnabled: boolean;
    digestFrequency: "daily" | "weekly" | "never";
    color: string;           // Cor do membro na UI
    avatar: string;          // Avatar personalizado
  };
}
```

---

## 6. Modelo Detalhado — Collections de Dados

### 6.1 Tasks

**Collection:** `families/{familyId}/tasks/{taskId}`

```typescript
interface TaskDocument {
  id: string;
  title: string;
  description: string;
  
  // Atribuição
  createdBy: string;         // UID
  responsible: string[];     // UIDs dos responsáveis
  assignedTo: string[];      // UIDs designados
  
  // Classificação
  category: string;           // "Casa" | "Trabalho" | "Finanças" | ...
  priority: "low" | "medium" | "high" | "urgent";
  status: "todo" | "in_progress" | "done" | "cancelled" | "waiting";
  
  // Tempo
  date: string;              // "2026-07-01"
  time?: string;             // "14:30"
  durationEstimate: number;  // minutos
  startTime?: string;
  endTime?: string;
  completedAt?: Timestamp;
  
  // Financeiro
  cost?: number;
  
  // Detalhes
  checklist: {
    id: string;
    text: string;
    completed: boolean;
    completedBy?: string;
  }[];
  attachments: string[];     // URLs de arquivos
  tags: string[];
  recurrence: "none" | "daily" | "weekly" | "monthly" | "yearly";
  notes?: string;
  
  // Progresso
  percentCompleted: number;  // 0-100
  
  // Metadados
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

**Índices:**
- `(status, date, priority)` — Tasks pendentes por data
- `(responsible, status)` — Tasks por responsável
- `(createdAt, desc)` — Tasks recentes

---

### 6.2 Goals

**Collection:** `families/{familyId}/goals/{goalId}`

```typescript
interface GoalDocument {
  id: string;
  title: string;
  description: string;
  
  // Financeiro / Métrica
  type: "financial" | "savings" | "project" | "custom";
  targetValue?: number;
  currentValue?: number;
  currency: "BRL" | "USD" | "EUR";
  
  // Tempo
  deadline: string;
  startedAt: Timestamp;
  completedAt?: Timestamp;
  
  // Progresso
  progress: number;          // 0-100 (calculado)
  status: "in_progress" | "completed" | "paused" | "cancelled";
  
  // Subtarefas
  subtasks: {
    id: string;
    text: string;
    completed: boolean;
    completedBy?: string;
    completedAt?: Timestamp;
  }[];
  
  category: string;
  icon: string;
  createdBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

---

### 6.3 Habits

**Collection:** `families/{familyId}/habits/{habitId}`

```typescript
interface HabitDocument {
  id: string;
  title: string;
  description: string;
  responsible: string[];     // UIDs
  
  // Identidade visual
  icon: string;
  color: string;
  
  createdBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

**Subcollection:** `families/{familyId}/habits/{habitId}/history/{date}`

```typescript
interface HabitHistoryEntry {
  date: string;              // "2026-07-01"
  completed: boolean;
  completedBy?: string;      // UID
  completedAt?: Timestamp;
  notes?: string;
}
```

---

### 6.4 Shopping

**Collection:** `families/{familyId}/shopping/{itemId}`

```typescript
interface ShoppingDocument {
  id: string;
  name: string;
  quantity: number;
  unit: string;              // "un" | "kg" | "L" | "pacote"
  estimatedCost: number;
  actualCost?: number;
  purchased: boolean;
  purchasedBy?: string;
  purchasedAt?: Timestamp;
  
  category: "supermercado" | "farmácia" | "roupa" | "outro";
  responsible: string[];
  createdBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

---

### 6.5 Events

**Collection:** `families/{familyId}/events/{eventId}`

```typescript
interface EventDocument {
  id: string;
  title: string;
  description: string;
  
  // Tempo
  date: string;              // "2026-07-01"
  startTime: string;         // "14:00"
  endTime: string;           // "15:30"
  allDay: boolean;
  
  // Classificação
  category: "work" | "appointment" | "school" | "leisure" | "health" | "other";
  color: string;
  
  // Responsáveis
  responsible: string[];
  createdBy: string;
  
  // Local
  location?: string;
  
  // Financeiro
  cost?: number;
  
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

---

### 6.6 Chat Messages

**Collection:** `families/{familyId}/chat/{messageId}`

```typescript
interface ChatMessageDocument {
  id: string;
  type: "user" | "ai" | "system";
  
  sender: string;            // UID do remetente (null para IA)
  senderName: string;        // Nome de exibição
  
  content: string;
  
  // Metadados
  replyTo?: string;          // ID da mensagem original
  attachments: string[];
  
  timestamp: Timestamp;
}
```

---

### 6.7 Notifications

**Collection:** `families/{familyId}/notifications/{notificationId}`

```typescript
interface NotificationDocument {
  id: string;
  
  // Conteúdo
  title: string;
  body: string;
  
  // Destino
  type: "task" | "habit" | "goal" | "chat" | "achievement" | "system" | "ai";
  targetUsers: string[];     // UIDs (vazio = todos)
  
  // Leitura
  readBy: string[];          // UIDs que leram
  readAt: Timestamp;
  
  // Ação
  actionUrl?: string;        // Deep link para ação
  actionData?: {             // Dados para ação
    taskId?: string;
    goalId?: string;
    habitId?: string;
  };
  
  // Prioridade
  priority: "low" | "normal" | "high" | "urgent";
  
  timestamp: Timestamp;
}
```

---

### 6.8 History Log

**Collection:** `families/{familyId}/history/{logId}`

```typescript
interface HistoryLogDocument {
  id: string;
  
  actor: string;             // UID
  actorName: string;
  
  action: string;            // "criou" | "concluiu" | "editou" | "removeu"
  entityType: "task" | "goal" | "habit" | "shopping" | "event" | "member";
  entityId: string;
  entityName: string;
  
  // Detalhes da mudança
  changes?: {
    field: string;
    from: any;
    to: any;
  }[];
  
  timestamp: Timestamp;
}
```

---

## 7. Sumário de Entidades

| Entidade | Tipo | Collection | Tamanho estimado |
|----------|------|-----------|------------------|
| User | Documento | `users/{uid}` | ~500 bytes |
| Family | Documento | `families/{id}` | ~1 KB |
| Member | Documento | `families/{id}/members/{uid}` | ~500 bytes |
| Task | Documento | `families/{id}/tasks/{id}` | ~2 KB |
| Goal | Documento | `families/{id}/goals/{id}` | ~1 KB |
| Habit | Documento | `families/{id}/habits/{id}` | ~500 bytes |
| Habit History | Documento | `.../habits/{id}/history/{date}` | ~200 bytes |
| Shopping Item | Documento | `families/{id}/shopping/{id}` | ~500 bytes |
| Event | Documento | `families/{id}/events/{id}` | ~1 KB |
| Chat Message | Documento | `families/{id}/chat/{id}` | ~1 KB |
| Notification | Documento | `families/{id}/notifications/{id}` | ~500 bytes |
| History Log | Documento | `families/{id}/history/{id}` | ~500 bytes |

---

## 8. Comparação: Antes vs Depois

| Aspecto | Antes (single doc) | Depois (collections) |
|---------|-------------------|---------------------|
| Tamanho máximo | 1MB total | Ilimitado |
| Leituras | 1 doc = tudo | N docs = só o necessário |
| Escritas | 1 doc inteiro | 1 doc específico |
| Queries | Nenhuma (filtro manual) | Queries nativas Firestore |
| Regras de segurança | Impossível granular | Por coleção |
| Concorrência | Transação pesada | Transação leve |
| Offline | complexo | Firestore persistence |
| Migração | Difícil | Fácil (adicionar campos) |
| Histórico | Acumula no doc | Collection separada |
| Expansão | Travada em 1MB | Escala horizontal |
