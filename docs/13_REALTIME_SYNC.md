# 13 — REALTIME SYNC

> **Documento:** Sincronização em Tempo Real
> **Versão:** 2.0 (Proposta)
> **Status:** ✅ Finalizado

---

## 1. Problema Atual

O FamilyFlow atual usa **polling HTTP a cada 5 segundos** para simular tempo real.

### Problemas do Polling

| Problema | Impacto |
|----------|---------|
| Latência de até 5s | Usuário vê dados desatualizados |
| 12 requisições/minuto | Consumo de banda desnecessário |
| Sem mudanças = requisição igual | Banda e CPU desperdiçados |
| Escrita + leitura no mesmo ciclo | Risco de conflitos |
| Firestore lido a cada 5s | Alto custo de leituras |

---

## 2. Arquitetura Proposta

```
┌──────────┐                    ┌──────────┐
│  Client  │                    │  Server  │
│  (React) │                    │ (Express)│
└────┬─────┘                    └────┬─────┘
     │                               │
     │ ────────── WebSocket ────────▶│
     │ ◀──────── WebSocket ─────────│
     │                               │
     │ ───── REST (mutations) ──────▶│
     │ ◀─── WebSocket (broadcast) ───│
     │                               │
     │ ───── SSE (server events) ───▶│ (fallback)
```

---

## 3. Tecnologia: WebSocket

### 3.1 Conexão

```
Cliente conecta: ws://server/ws?familyId={id}&userId={uid}
       │
       ▼
Servidor valida token JWT
       │
       ▼
Adiciona cliente à sala da família
       │
       ▼
Notifica outros membros: "Alessandro está online"
```

### 3.2 Eventos

#### Eventos do Cliente → Servidor

| Evento | Payload | Descrição |
|--------|---------|-----------|
| `ping` | `{}` | Keep-alive |
| `typing` | `{ chatId }` | Digitando no chat |
| `read` | `{ notificationId }` | Leu notificação |

#### Eventos do Servidor → Cliente

| Evento | Payload | Descrição |
|--------|---------|-----------|
| `pong` | `{}` | Keep-alive response |
| `state_update` | `{ entity, data }` | Dado atualizado |
| `notification` | `{ notification }` | Nova notificação |
| `member_status` | `{ userId, status }` | Online/offline |
| `typing` | `{ userId, chatId }` | Outro está digitando |
| `error` | `{ message }` | Erro |

### 3.3 Reconexão

```
WebSocket fecha inesperadamente
        │
        ▼
Aguardar 1s → tentar reconectar
        │
        ▼
Falhou? Aguardar 3s → tentar novamente
        │
        ▼
Falhou? Aguardar 10s → tentar novamente
        │
        ▼
Máximo 10 tentativas → modo offline
        │
        ▼
Notificar usuário: "Conexão perdida. Alterações serão salvas localmente."
```

---

## 4. Estratégia de Sincronização

### 4.1 Otimista (Optimistic UI)

```
Usuário faz ação (ex: concluir tarefa)
        │
        ▼
1. ✅ Atualizar UI IMEDIATAMENTE (otimista)
2. 📤 Enviar mudança via WebSocket
3. ⏳ Aguardar confirmação do servidor
        │
        ├── Sucesso: ✅ Manter UI atualizada
        └── Falha:   🔄 Reverter UI + mostrar erro
```

### 4.2 Resolução de Conflitos

| Conflito | Estratégia |
|----------|-----------|
| Dois usuários editam mesma tarefa | **Last Write Wins** (LWW) |
| Um exclui, outro edita | **Exclusão vence** (tombstone) |
| Offline + Online (mesmo dado) | **Timestamp comparison** |
| Dois completam mesma tarefa | **Primeiro vence** |

### 4.3 Delta Sync

Em vez de enviar o estado inteiro, apenas as **mudanças** são trafegadas.

```
❌ Atual: { tarefas: [...] } — envia tudo
✅ Novo: { type: "task_update", data: { id: "123", status: "done" } }
```

---

## 5. Fallback: Server-Sent Events (SSE)

Caso WebSocket não seja suportado (ex: algumas redes corporativas), usar SSE como fallback.

```
Cliente → EventSource('/api/sse?token=...')
Servidor → Envia eventos conforme ocorrem
Cliente → Faz POST para mutações
```

---

## 6. Sincronização Offline

### 6.1 Cache Local

```
IndexedDB (Web) / Hive (Flutter)
├── tasks: Task[]              (cache completo)
├── goals: Goal[]
├── habits: Habit[]
├── pendingChanges: Change[]   (fila de mudanças offline)
└── lastSyncAt: Timestamp
```

### 6.2 Fila de Mudanças Offline

```typescript
interface PendingChange {
  id: string;
  type: "create" | "update" | "delete";
  entity: "task" | "goal" | "habit" | "shopping" | "event";
  data: any;
  createdAt: Timestamp;
  retries: number;
  status: "pending" | "syncing" | "failed";
}
```

### 6.3 Sincronização ao Voltar

```
App detecta conectividade
        │
        ▼
1. 🔄 Enviar fila de mudanças pendentes (ordem cronológica)
2. 📥 Buscar mudanças do servidor desde lastSyncAt
3. ✅ Atualizar cache local
4. 🔔 Notificar usuário: "Sincronizado! 3 mudanças aplicadas."
```

---

## 7. Heartbeat e Health Check

| Componente | Intervalo | Ação se falhar |
|-----------|-----------|---------------|
| WebSocket ping | 30s | Tentar reconexão |
| SSE reconnect | 5s | EventSource reconecta automático |
| REST health check | 60s | Mostrar "Servidor indisponível" |
| Firestore listener | Contínuo | Firebase SDK gerencia |

---

## 8. Eventos de Sincronização (Exemplos)

### Usuário A cria tarefa

```
1. Usuário A → POST /api/task (REST)
2. Servidor → Salva no Firestore
3. Servidor → Emite WebSocket: { type: "task_created", data: task }
4. Usuário A → Recebe confirmação + dados atualizados
5. Usuário B → Recebe evento em tempo real
6. Usuário B → UI atualiza com animação
```

### Usuário A marca hábito

```
1. Usuário A → Toggle hábito (otimista)
2. UI já mostra como completo
3. WebSocket → { type: "habit_toggled", data: { ... } }
4. Servidor → Salva
5. Confirmação → WebSocket → "habit_updated"
```

---

## 9. Métricas de Sincronização

| Métrica | Atual (polling) | Proposto (WebSocket) |
|---------|----------------|---------------------|
| Latência | ~5s | <100ms |
| Requisições/min (idle) | 12 | 2 (ping/pong) |
| Dados trafegados/hora (idle) | ~50MB | ~2KB |
| Escrita Firestore | Documento inteiro | Apenas campos alterados |
| Leituras Firestore | 720/dia | ~0 (apenas writes) |
| UX de conflito | Não tratado | Timestamp + LWW |
| Suporte offline | ❌ | ✅ (fila + cache) |

---

## 10. Implementação Técnica

### Server (Socket.IO)

```typescript
import { Server } from "socket.io";

const io = new Server(httpServer, {
  cors: { origin: "*" },
  pingInterval: 30000,
  pingTimeout: 10000,
});

io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  const user = verifyToken(token);
  if (!user) return next(new Error("Unauthorized"));
  socket.data.user = user;
  next();
});

io.on("connection", (socket) => {
  const familyId = socket.handshake.query.familyId;
  socket.join(`family:${familyId}`);
  
  // Broadcast para membros
  socket.to(`family:${familyId}`).emit("member_status", {
    userId: socket.data.user.uid,
    status: "online",
  });
  
  socket.on("typing", (data) => {
    socket.to(`family:${familyId}`).emit("typing", {
      userId: socket.data.user.uid,
      chatId: data.chatId,
    });
  });
  
  socket.on("disconnect", () => {
    socket.to(`family:${familyId}`).emit("member_status", {
      userId: socket.data.user.uid,
      status: "offline",
    });
  });
});
```

### Client

```typescript
import { io, Socket } from "socket.io-client";

class RealtimeService {
  private socket: Socket;
  
  connect(familyId: string, token: string) {
    this.socket = io(WS_URL, {
      auth: { token },
      query: { familyId },
      transports: ["websocket", "polling"],
    });
    
    this.socket.on("state_update", this.handleUpdate);
    this.socket.on("notification", this.handleNotification);
    this.socket.on("member_status", this.handleMemberStatus);
  }
  
  private handleUpdate(data: StateUpdate) {
    // Atualizar store (Zustand/Bloc)
    stateStore.updateEntity(data.entity, data.data);
  }
}
```
