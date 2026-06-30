# 05 — FIREBASE

> **Documento:** Arquitetura Firebase
> **Versão:** 2.0 (Proposta)
> **Status:** ✅ Finalizado

---

## 1. Configuração Atual

### Projeto Firebase

| Parâmetro | Valor |
|-----------|-------|
| Project ID | `compact-petal-zdckx` |
| App ID | `1:347308256598:web:e38dff58d78a38c4defaf7` |
| API Key | `AIzaSyDJLdksOtCZJZNNy-famUGUgQJ_2BxqCb4` |
| Auth Domain | `compact-petal-zdckx.firebaseapp.com` |
| Database ID | `ai-studio-familyflow-943ecba4-7e23-4db0-82c0-37ca5da3706f` |
| Storage Bucket | `compact-petal-zdckx.firebasestorage.app` |

### Problemas da Configuração Atual

| Problema | Severidade | Descrição |
|----------|-----------|-----------|
| API Key exposta no repositório | 🔴 CRÍTICO | `firebase-applet-config.json` versionado com chave |
| Sem variáveis de ambiente | 🟠 MÉDIO | Configurações hardcoded |
| Sem regras de segurança | 🔴 CRÍTICO | Firestore Rules não definidas |
| Database ID customizado | 🟡 BAIXO | Dificulta migração |

---

## 2. Firestore — Modelo Atual

### Coleção Única

```
appState/
  └── familyState/          (documento único)
        ├── users: { ... }
        ├── tasks: [ ... ]
        ├── goals: [ ... ]
        ├── habits: [ ... ]
        ├── shoppingList: [ ... ]
        ├── calendarEvents: [ ... ]
        ├── history: [ ... ]
        ├── notifications: [ ... ]
        ├── chatHistory: [ ... ]
        ├── groupChat: [ ... ]
        └── lastWeeklyMeetingSummary: ""
```

### Análise de Tamanho

| Campo | Estimativa (1 mês) | Estimativa (1 ano) |
|-------|-------------------|-------------------|
| users | ~500 bytes | ~1 KB |
| tasks | ~50 KB | ~500 KB |
| goals | ~10 KB | ~100 KB |
| habits | ~5 KB | ~50 KB |
| shoppingList | ~5 KB | ~50 KB |
| calendarEvents | ~10 KB | ~100 KB |
| history | ~50 KB | ~1 MB ⚠️ |
| notifications | ~20 KB | ~200 KB |
| chatHistory | ~30 KB | ~500 KB |
| groupChat | ~30 KB | ~300 KB |

**⚠️ Risco real de atingir o limite de 1MB do Firestore em menos de 6 meses de uso intenso.**

---

## 3. Modelo PROPOSTO (v2.0)

### Collections Normalizadas

```
families/                              # Multi-tenant
  └── {familyId}/
        ├── info: { name, createdAt, plan, settings }
        ├── members/{userId}           # Subcollection
        │     └── {userId}:
        │           { role, joinedAt, nickname }
        │
        ├── tasks/{taskId}             # Cada tarefa é um documento
        │     └── {taskId}:
        │           { title, description, responsible, status,
        │             priority, date, time, cost, checklist,
        │             recurrence, tags, percentCompleted,
        │             createdBy, createdAt, updatedAt }
        │
        ├── goals/{goalId}
        │     └── {goalId}:
        │           { title, description, targetAmount,
        │             currentAmount, deadline, progress,
        │             category, status, createdBy, createdAt }
        │
        ├── habits/{habitId}
        │     └── {habitId}:
        │           { title, description, responsible,
        │             icon, color, createdBy, createdAt }
        │     └── history/{dateStr}    # Subcollection
        │           └── {dateStr}:
        │                 { completed: boolean, updatedAt }
        │
        ├── shopping/{itemId}
        ├── events/{eventId}
        ├── chat/{messageId}
        ├── notifications/{notificationId}
        └── history/{logId}
```

### Benefícios da Normalização

| Aspecto | Antes (single doc) | Depois (collections) |
|---------|-------------------|---------------------|
| Tamanho | Todo documento em 1 | Cada item independente |
| Leituras | Sempre o documento inteiro | Apenas o necessário |
| Escrita | Documento inteiro a cada mudança | Apenas o documento afetado |
| Regras de segurança | Impossível granular | Por coleção/documento |
| Queries | Sem filtros | Queries específicas |
| Concorrência | Transações pesadas | Transações leves |
| Escalabilidade | 1MB total | Ilimitado (cada doc <1MB) |

---

## 4. Firestore Security Rules (Propostas)

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Função auxiliar: verificar se é membro da família
    function isMember(familyId) {
      return request.auth != null
        && exists(/databases/$(database)/documents/families/$(familyId)/members/$(request.auth.uid));
    }

    function isOwner(familyId) {
      return request.auth != null
        && get(/databases/$(database)/documents/families/$(familyId)).data.ownerId == request.auth.uid;
    }

    // Famílias
    match /families/{familyId} {
      allow read: if isMember(familyId);
      allow create: if request.auth != null;
      allow update, delete: if isOwner(familyId);

      // Membros
      match /members/{userId} {
        allow read: if isMember(familyId);
        allow write: if isOwner(familyId);
      }

      // Tarefas
      match /tasks/{taskId} {
        allow read: if isMember(familyId);
        allow create: if isMember(familyId)
          && request.resource.data.title is string
          && request.resource.data.title.size() > 0
          && request.resource.data.title.size() < 200;
        allow update: if isMember(familyId)
          && request.resource.data.title is string;
        allow delete: if isMember(familyId);
      }

      // Metas
      match /goals/{goalId} {
        allow read: if isMember(familyId);
        allow write: if isMember(familyId);
      }

      // Hábitos
      match /habits/{habitId} {
        allow read: if isMember(familyId);
        allow write: if isMember(familyId);

        // Histórico de hábitos
        match /history/{date} {
          allow read, write: if isMember(familyId);
        }
      }

      // Compras
      match /shopping/{itemId} {
        allow read, write: if isMember(familyId);
      }

      // Eventos
      match /events/{eventId} {
        allow read, write: if isMember(familyId);
      }

      // Chat
      match /chat/{messageId} {
        allow read, create: if isMember(familyId);
        allow delete: if isMember(familyId)
          && resource.data.senderId == request.auth.uid;
      }

      // Notificações
      match /notifications/{notificationId} {
        allow read, write: if isMember(familyId);
      }

      // Histórico (read-only após criação)
      match /history/{logId} {
        allow read: if isMember(familyId);
        allow create: if isMember(familyId);
        allow update, delete: if false;
      }
    }

    // Perfil do usuário (global)
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;
    }
  }
}
```

---

## 5. Índices Compostos (Necessários)

| Coleção | Campos | Tipo |
|---------|--------|------|
| tasks | status, date, priority | ASC |
| tasks | responsible, status | ASC |
| tasks | familyId, createdAt | DESC |
| goals | status, deadline | ASC |
| habits | responsible, createdAt | ASC |
| notifications | targetUser, timestamp | DESC |
| notifications | readBy, timestamp | DESC |
| chat | familyId, timestamp | ASC |
| history | familyId, timestamp | DESC |

---

## 6. Firebase Services a Utilizar

| Serviço | Uso | Prioridade |
|---------|-----|-----------|
| **Authentication** | Login, registro, OAuth (Google, Apple) | 🔴 Crítica |
| **Firestore** | Banco de dados principal | 🔴 Crítica |
| **Cloud Functions** | Webhooks, processamento em background | 🟠 Alta |
| **Cloud Messaging (FCM)** | Notificações push | 🟠 Alta |
| **Cloud Storage** | Upload de avatares, imagens | 🟡 Média |
| **Performance Monitoring** | Monitoramento de performance | 🟡 Média |
| **Crashlytics** | Relatórios de crash | 🟡 Média |
| **Analytics** | Métricas de uso | 🟢 Baixa (futuro) |
| **Remote Config** | Feature flags | 🟢 Baixa (futuro) |

---

## 7. Estratégia de Leitura/Escrita

### Leituras

| Operação | Custo Atual | Custo Proposto | Economia |
|----------|------------|----------------|----------|
| Abrir app | 1 doc (inteiro) | 1 doc (tasks da semana) | ~90% |
| Ver tarefas | 1 doc (inteiro) | N docs (apenas tasks) | ~70% |
| Ver dashboard | 1 doc (inteiro) | 3 docs (tasks+habits+goals) | ~50% |
| Buscar notificações | 1 doc (inteiro) | 1 doc (últimas 20) | ~95% |
| Sincronizar | Polling 5s (720 leituras/dia) | WebSocket (0 leituras extras) | 100% |

### Escritas

| Operação | Custo Atual | Custo Proposto | Economia |
|----------|------------|----------------|----------|
| Criar tarefa | 1 doc inteiro | 1 doc (task) | ~95% |
| Marcar hábito | 1 doc inteiro | 1 doc (habit.history) | ~95% |
| Concluir tarefa | 1 doc inteiro | 1 doc (task update) | ~95% |
| Sincronizar | 1 doc inteiro | N/A (WebSocket) | 100% |

---

## 8. Offline e Cache

### Estratégia Proposta

| Camada | Tecnologia | Retenção |
|--------|-----------|----------|
| Memória (App) | Zustand/Bloc state | Sessão |
| Cache local | IndexedDB (web) / Hive (Flutter) | 7 dias |
| Servidor | Redis | 1 hora |
| Firebase | Firestore offline persistence | 30 dias |

### Fluxo Offline

```
Usuário faz ação → Salva local (IndexedDB)
                  → Marca como "pending sync"
                  → Quando online: sincroniza
                  → Firestore atualiza
                  → WebSocket notifica outros dispositivos
```

---

## 9. Plano de Migração

### Fase 1 — Setup (Sprint 1)
- [ ] Criar novas regras de segurança
- [ ] Configurar Firebase Authentication
- [ ] Criar estrutura de collections normalizadas
- [ ] Testar em ambiente de staging

### Fase 2 — Migração de Dados (Sprint 2)
- [ ] Script para migrar de single doc → collections
- [ ] Manter compatibilidade com versão antiga
- [ ] Validação de dados migrados

### Fase 3 — Otimização (Sprint 3)
- [ ] Implementar índices compostos
- [ ] Cache local (IndexedDB)
- [ ] Lazy loading e paginação

### Fase 4 — Remoção do Legado (Sprint 4)
- [ ] Remover lógica de single document
- [ ] Remover polling
- [ ] Limpar dados antigos
