# 08 — UI/UX

> **Documento:** Experiência do Usuário
> **Versão:** 2.0 (Proposta)
> **Status:** ✅ Finalizado

---

## 1. User Personas

### Persona 1: Alessandro (34 anos)

| Atributo | Detalhe |
|----------|---------|
| Profissão | Designer / Dev freelancer |
| Rotina | Home office, cuida das crianças à tarde |
| Dores | Esquece compromissos, acumula tarefas |
| Objetivo | Ter visibilidade da rotina da família |
| Comportamento | Usa app na hora do almoço e à noite |
| Frase | "Preciso de um lugar único pra ver tudo que tenho que fazer" |

### Persona 2: Brenda (32 anos)

| Atributo | Detalhe |
|----------|---------|
| Profissão | Professora / Gestora |
| Rotina | Sai cedo, chega tarde, cuida da casa |
| Dores | Sobrecarga mental, sente que faz tudo sozinha |
| Objetivo | Dividir tarefas de forma justa |
| Comportamento | Usa app de manhã cedo e antes de dormir |
| Frase | "Queria que ele visse o quanto eu faço sem ninguém pedir" |

### Persona 3: Casal com filhos

| Atributo | Detalhe |
|----------|---------|
| Perfil | 2 adultos, 1-2 crianças |
| Rotina | Escola, trabalho, atividades, médico |
| Dores | Comunicação falha, tarefas duplicadas |
| Objetivo | Sincronia total na rotina familiar |

---

## 2. Fluxo do Usuário — Atual

```
                   ┌──────────┐
                   │  Acesso  │
                   └────┬─────┘
                        │
              ┌─────────▼─────────┐
              │   Auth Screen     │
              │ Login / Register  │
              └─────────┬─────────┘
                        │
              ┌─────────▼─────────┐
              │    Dashboard      │
              │  (Home Tab)       │
              └─────────┬─────────┘
                        │
        ┌───────────────┼───────────────┐
        │               │               │
  ┌─────▼────┐   ┌──────▼──────┐   ┌───▼────┐
  │  Home    │   │   Tasks     │   │  Chat  │
  │ Dashboard│   │ Objetivos   │   │  IA    │
  │ Agenda   │   │ Hábitos     │   │ Família│
  │ Rotina   │   │ Compras     │   │        │
  └──────────┘   └─────────────┘   └────────┘
```

---

## 3. Fluxo do Usuário — Proposto (v2.0)

```
                   ┌──────────┐
                   │ Onboarding│
                   │ (3 telas) │
                   └────┬─────┘
                        │
              ┌─────────▼─────────┐
              │   Auth / Sign Up  │
              │ Google/Apple/Email│
              └─────────┬─────────┘
                        │
              ┌─────────▼─────────┐
              │   Create/Join     │
              │   Family Group    │
              └─────────┬─────────┘
                        │
              ┌─────────▼─────────┐
              │    Dashboard      │
              │  "O que fazer     │
              │   hoje?"          │
              └─────────┬─────────┘
                        │
        ┌───────────────┼───────────────────┐
        │               │                   │
  ┌─────▼────┐   ┌──────▼──────┐   ┌───────▼────┐
  │  Hoje    │   │  Organizar  │   │  Assistente│
  │ ─ Tarefas│   │ ─ Tarefas   │   │ ─ Chat IA  │
  │ ─ Agenda │   │ ─ Metas     │   │ ─ Sugestões│
  │ ─ Hábitos│   │ ─ Hábitos   │   │ ─ Relatório│
  │ ─ Rotina │   │ ─ Compras   │   │ ─ Semanal  │
  └──────────┘   └─────────────┘   └────────────┘
```

---

## 4. Mapa de Navegação

### Tab Bar Principal

| Tab | Ícone | Conteúdo |
|-----|-------|----------|
| **Hoje** | `home` | Dashboard, agenda do dia, resumo, rotina |
| **Organizar** | `checklist` | Tarefas, Metas, Hábitos, Compras |
| **Agenda** | `calendar` | Timeline semanal, eventos |
| **Assistente** | `smart_toy` | Chat IA, sugestões, relatórios |
| **Família** | `people` | Chat em grupo, membros, perfil |
| **Perfil** | `person` | Configurações, estatísticas, gamificação |

---

## 5. Wireframes das Telas Principais

### 5.1 Dashboard / "Hoje"

```
┌─────────────────────────────────┐
│ ☀️ Bom dia, Alessandro!      🔔│
│ Sex, 03 Jul 2026               │
├─────────────────────────────────┤
│ ┌─────────────────────────────┐ │
│ │ 📊 Organização do Dia      │ │
│ │  75%                        │ │
│ │ ─────────────────────       │ │
│ │ 📋 4 tarefas pendentes      │ │
│ │ 📅 2 eventos hoje           │ │
│ │ 🎯 1 meta ativa             │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ ⏰ PRÓXIMA TAREFA           │ │
│ │ "Finalizar relatório"       │ │
│ │ 14:00 · Alta prioridade     │ │
│ │ [Concluir] [Adiar]          │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ 🤖 SUGESTÃO DA IA           │ │
│ │ Brenda está com 5 tarefas   │ │
│ │ pendentes. Que tal assumir  │ │
│ │ "Levar carro no mecânico"?  │ │
│ └─────────────────────────────┘ │
│                                 │
│ 🌅 Rotina Matinal               │
│ ☑️ ☕ Café (Brenda)             │
│ ☑️ 📚 Levar crianças (Aless)   │
│ ⬜ 🏃 Exercício (Ambos)        │
│                                 │
│ 📋 Atividade Recente            │
│ • Alessandro concluiu "..."     │
│ • Brenda criou tarefa "..."     │
└─────────────────────────────────┘
```

### 5.2 Organizar / Tarefas

```
┌─────────────────────────────────┐
│ ← Voltar           Organizar    │
├─────────────────────────────────┤
│ [Tarefas] [Metas] [Hábitos] [Compras] │
├─────────────────────────────────┤
│ 🔍 Buscar tarefas...            │
│                                 │
│ Filtros: [Todas] [Alessandro] [Brenda] │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ 📋 Compras do mês           │ │
│ │ 👤 Brenda   🔴 Alta         │ │
│ │ 📅 03/07    💰 R$ 200       │ │
│ │ ⬜ Item 1   ⬜ Item 2       │ │
│ │ [─── 40% ────]              │ │
│ │ [Concluir] [✏️] [🗑️]       │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ 🏠 Limpeza da casa          │ │
│ │ 👤 Alessandro   🟡 Média    │ │
│ │ 📅 04/07                    │ │
│ │ Status: A Fazer             │ │
│ │ [Concluir] [✏️] [🗑️]       │ │
│ └─────────────────────────────┘ │
│                                 │
│                    [➕ Nova Tarefa] │
└─────────────────────────────────┘
```

### 5.3 Modal de Criação

```
┌─────────────────────────────────┐
│ ✕ Criar Nova Tarefa            │
├─────────────────────────────────┤
│ Título                          │
│ ┌─────────────────────────────┐ │
│ │ Ex: "Comprar material...    │ │
│ └─────────────────────────────┘ │
│                                 │
│ Descrição                       │
│ ┌─────────────────────────────┐ │
│ │                             │ │
│ └─────────────────────────────┘ │
│                                 │
│ Responsável    Prioridade       │
│ [Ambos ▼]      [Média ▼]       │
│                                 │
│ Data           Horário          │
│ [03/07/2026]   [14:00]         │
│                                 │
│ Categoria      Custo            │
│ [Casa ▼]       [R$ 0,00]      │
│                                 │
│ Recorrência                     │
│ [Nenhuma ▼]                     │
│                                 │
│ Checklist                       │
│ ⬜ Item 1                       │
│ ⬜ Item 2                       │
│ [+ Adicionar]                   │
│                                 │
│ Tags                            │
│ [compras] [urgente]             │
│                                 │
│ ┌─────────────────────────────┐ │
│ │         CRIAR TAREFA        │ │
│ └─────────────────────────────┘ │
└─────────────────────────────────┘
```

---

## 6. User Flow por Ação

### Criar Tarefa

```
1. Tap FAB (+)
2. Bottom sheet aparece
3. Selecionar "Nova Tarefa"
4. Modal de criação abre animado
5. Preencher campos
6. Tap "Criar Tarefa"
7. ✅ Toast de confirmação
8. Notificação push para o responsável
9. Timeline atualiza em tempo real
```

### Completar Hábito

```
1. Tap no hábito (check)
2. ✅ Animação de confirmação
3. +15 pontos (toast)
4. Streak atualizado
5. Notificação para o parceiro "Brenda completou Beber Água! +15🔥"
```

### Reunião Semanal

```
1. Tap no card "Reunião Semanal" no dashboard
2. IA processa dados da semana
3. Relatório gerado em Markdown
4. Casal pode ler junto
5. Feedback: "Gostou do resumo?" (👍/👎)
```

---

## 7. Problemas de UX Atuais e Soluções

| Problema Atual | Solução Proposta |
|---------------|-----------------|
| Login confuso (nome + senha) | Firebase Auth com Google/Apple + email |
| Sem onboarding | 3 telas de onboarding na primeira vez |
| Navegação aninhada (sub-tabs confusas) | Tabs planas, sem aninhamento |
| FAB pouco intuitivo | Bottom sheet estilizado com previews |
| Polling (5s de latência) | WebSocket — resposta instantânea |
| Perfil hardcoded "Alessandro/Brenda" | Multi-usuário flexível |
| Sem confirmação em ações destrutivas | AlertDialog em exclusões |
| Texto muito pequeno (9px) | Mínimo de 11px para corpo |
| Sem feedback de erro amigável | Toast + botão "Tentar novamente" |
| Senha em plaintext | Firebase Auth, nunca armazenar senha |

---

## 8. Níveis de Usuário (Gamificação)

| Nível | Pontos Necessários | Título |
|-------|-------------------|--------|
| 1 | 0 | Iniciante |
| 2 | 100 | Aprendiz |
| 3 | 300 | Organizado |
| 4 | 600 | Dedicado |
| 5 | 1000 | Expert |
| 6 | 1500 | Mestre |
| 7 | 2200 | Lenda |
| 8 | 3000 | Família Nota 10 |
| 9 | 4000 | Família dos Sonhos |
| 10 | 5000 | Lenda Viva |

### Recompensas por Gênero (Personalização)

| Gênero | Medalhas |
|--------|----------|
| Masculino | Guardião, Rei do Foco, Mestre de XP |
| Feminino | Estrela Guia, Soberana, Harmonia |
| Neutro | (ícones neutros) |

---

## 9. Onboarding (Proposto)

### Tela 1: "Bem-vindo ao FamilyFlow"
```
🎉 Organize sua família em um só lugar
Tarefas, metas, hábitos e comunicação — tudo com IA
[Continuar]
```

### Tela 2: "Compartilhe com quem você ama"
```
👫 Convide seu parceiro(a)
Os dois veem e atualizam tudo em tempo real
[Continuar]
```

### Tela 3: "IA que entende sua família"
```
🤖 Sugestões inteligentes
Distribuição automática de tarefas
Relatórios semanais personalizados
[Começar]
```

---

## 10. Acessibilidade (Diretrizes)

| Critério | Nível | Ação |
|----------|-------|------|
| Contraste mínimo | WCAG AA | 4.5:1 para texto normal |
| Touch targets | WCAG AA | Mínimo 44x44px |
| Foco visível | WCAG AA | Outline 2px no foco |
| Labels ARIA | WCAG AA | aria-label em botões de ícone |
| Navegação por teclado | WCAG AA | Tab order lógico |
| Redução de movimento | WCAG AA | `prefers-reduced-motion` |
| Texto redimensionável | WCAG AA | Até 200% sem quebra |
