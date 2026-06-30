# 12 — NOTIFICATION SYSTEM

> **Documento:** Sistema de Notificações
> **Versão:** 2.0 (Proposta)
> **Status:** ✅ Finalizado

---

## 1. Visão Geral

O sistema de notificações do FamilyFlow opera em múltiplas camadas para garantir que os usuários nunca percam informações importantes, estejam dentro ou fora do aplicativo.

---

## 2. Arquitetura de Notificações

```
┌──────────────────────────────────────────────┐
│              FamilyFlow App                    │
│                                                │
│  ┌────────────────────────────────────────┐  │
│  │      Notification Manager             │  │
│  │                                        │  │
│  │  ┌────────────┐  ┌───────────────┐   │  │
│  │  │ In-App     │  │ Floating      │   │  │
│  │  │ Toast      │  │ Alert (Push)  │   │  │
│  │  └────────────┘  └───────┬───────┘   │  │
│  │                          │            │  │
│  │  ┌────────────┐  ┌──────▼────────┐  │  │
│  │  │ Sound      │  │ Service       │  │  │
│  │  │ (Web Audio)│  │ Worker (Push) │  │  │
│  │  └────────────┘  └──────┬────────┘  │  │
│  └────────────────────────┼─────────────┘  │
└───────────────────────────┼─────────────────┘
                            │
              ┌─────────────▼─────────────┐
              │     FCM / Web Push        │
              │        (Server)           │
              └─────────────┬─────────────┘
                            │
              ┌─────────────▼─────────────┐
              │   Firebase Cloud          │
              │   Messaging (FCM)         │
              └───────────────────────────┘
```

---

## 3. Canais de Notificação

### 3.1 In-App Toast

| Característica | Descrição |
|---------------|-----------|
| Posição | Topo da tela |
| Duração | 7 segundos |
| Animação | Slide down com spring |
| Som | Sim (opcional) |
| Ação | Botões inline (Concluir, Adiar, etc.) |

### 3.2 Floating Alerts (Push-style)

| Característica | Descrição |
|---------------|-----------|
| Posição | Topo, stack vertical |
| Máximo visível | 5 |
| Duração | 7 segundos |
| Prioridade | Tasks > Notifications > System |
| Avatar | Mostra avatar do responsável |
| Ação | Botões de ação rápida |

### 3.3 Native Push (Service Worker / FCM)

| Característica | Descrição |
|---------------|-----------|
| App fechado | ✅ Sim |
| App em background | ✅ Sim |
| App aberto | ✅ Sim (toast) |
| Ações | "Concluir", "Adiar 10 min", "Abrir" |
| Som | ✅ Sim |
| Vibrar | ✅ Sim |
| Badge | ✅ Sim (futuro) |

### 3.4 Notification Center (Histórico)

| Característica | Descrição |
|---------------|-----------|
| Persistência | 30 dias |
| Ordem | Mais recente primeiro |
| Filtro | Não lidas / Todas |
| Ação | Tap para abrir contexto |
| Marcar lida | Automático ao abrir |

---

## 4. Tipos de Notificação

| Tipo | Exemplo | Prioridade | Som |
|------|---------|-----------|-----|
| **Tarefa nova** | "Alessandro criou tarefa para você" | Alta | ✅ |
| **Lembrete** | "Tarefa 'Comprar leite' às 14:00" | Alta | ✅ |
| **Conclusão** | "Brenda concluiu 'Limpeza da sala'" | Média | ✅ |
| **Hábito** | "Hora de beber água! 💧" | Média | ✅ |
| **Meta** | "Meta 'Viagem' está em 75%!" | Média | ✅ |
| **Chat** | "Nova mensagem de Alessandro" | Baixa | ❌ |
| **IA Sugestão** | "IA reorganizou sua agenda" | Baixa | ❌ |
| **Sistema** | "Bem-vindo ao FamilyFlow!" | Baixa | ❌ |
| **Conquista** | "🎉 Streak de 7 dias!" | Alta | ✅ |

---

## 5. Configuração de Canais (Usuário)

### Canais Configuráveis

| Canal | Som | Vibrar | Prioridade | Noturno |
|-------|-----|--------|-----------|---------|
| Tarefas | ✅ | ✅ | Alta | 🚫 Silenciar |
| Lembretes | ✅ | ✅ | Alta | 🚫 Silenciar |
| IA | ✅ | ❌ | Média | 🔕 Suave |
| Mensagens | ❌ | ✅ | Baixa | 🔕 Suave |
| Conquistas | ✅ | ✅ | Média | ✅ Normal |
| Sistema | ❌ | ❌ | Baixa | 🔕 Suave |

### Horário Silencioso

- **Início:** 22:00
- **Fim:** 07:00
- **Comportamento:** Apenas notificações urgentes (tarefas com prioridade Urgente)
- **Override:** Usuário pode desabilitar

---

## 6. Comportamento por State do App

| App State | In-App Toast | Floating Alert | Native Push | Sound |
|-----------|-------------|----------------|-------------|-------|
| Aberto (ativo) | ✅ | ✅ | ❌ (já tem toast) | ✅ |
| Aberto (background) | ❌ | ❌ | ✅ | ✅ |
| Fechado | ❌ | ❌ | ✅ | ✅ |
| Foco (Modo Foco) | ❌ | ❌ | Apenas Urgente | ❌ |

---

## 7. Fila de Notificações

### Processamento

```
Evento ocorre (ex: tarefa criada)
        │
        ▼
Cria objeto Notification no Firestore
        │
        ▼
Verifica:
  - Usuário target existe?
  - Está no horário silencioso?
  - Usuário tem notificações habilitadas?
        │
        ▼
Se online: dispara WebSocket event
Se offline: enfileira para push (FCM)
        │
        ▼
App recebe e decide como exibir
```

### Retry Policy

| Tentativa | Tempo |
|-----------|-------|
| 1ª | Imediato |
| 2ª | 30 segundos |
| 3ª | 5 minutos |
| 4ª | 30 minutos |
| Final | Desiste (marca como falha) |

---

## 8. Sons

| Tipo | Frequência | Duração |
|------|-----------|---------|
| Tarefa | C5 → E5 → G5 (ascendente) | 300ms |
| Notificação | A4 → C#5 → E5 (ascendente) | 250ms |
| Sucesso | C5 → E5 (curto) | 150ms |
| Erro | E4 → C4 (descendente) | 400ms |
| IA | A4 → E5 (suave) | 500ms |

---

## 9. Badges e Indicadores

| Indicador | Local | Comportamento |
|-----------|-------|---------------|
| Badge numérico | Ícone do sino no header | Total de não lidas |
| Ponto azul | Card de notificação | Não lida individual |
| Badge app (mobile) | Ícone do app (futuro) | Total de não lidas |
| Indicador tab | Tab "Sino" | Não lidas relevantes |

---

## 10. API Endpoints

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/notifications` | Listar notificações |
| POST | `/notifications/read` | Marcar como lida |
| POST | `/notifications/read-all` | Marcar todas como lidas |
| DELETE | `/notifications/{id}` | Excluir notificação |
| PATCH | `/notifications/settings` | Atualizar preferências |

---

## 11. Boas Práticas

1. **Agrupar notificações similares** — evitar spam
2. **Priorizar por relevância** — Urgente > Alta > Média > Baixa
3. **Respeitar horário silencioso** — sem notificações noturnas
4. **Permitir ação direta** — "Concluir" direto na notificação
5. **Não repetir** — mesma notificação não aparece duas vezes
6. **Contexto claro** — título + corpo + ação
7. **Som opcional** — usuário configura por canal
