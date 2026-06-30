# 07 — DESIGN SYSTEM

> **Documento:** Design System do FamilyFlow
> **Versão:** 2.0 (Proposta)
> **Status:** ✅ Finalizado

---

## 1. Filosofia de Design

O FamilyFlow segue uma estética **premium, sóbria e acolhedora**, inspirada em:
- **Todoist** — Clareza e simplicidade
- **Linear** — UI limpa e profissional
- **Notion** — Flexibilidade visual
- **Apple Reminders** — Toque nativo e minimalista
- **Dark mode como padrão** — Cansativo visualmente para leitura prolongada, mas premium

### Princípios Visuais

1. **Dark mode first** — Experiência premium com fundo escuro
2. **Glassmorphism leve** — Cards com backdrop-filter e bordas sutis
3. **Micro-animações** — Feedback em cada interação
4. **Tipografia hierárquica** — Inter para corpo, JetBrains Mono para dados
5. **Ícones consistentes** — Material Symbols + Lucide
6. **Espaçamento generoso** — Respiração entre elementos
7. **Gradientes sutis** — Detalhes que elevam sem poluir

---

## 2. Paleta de Cores

### Cores Primárias

| Token | HEX | Uso |
|-------|-----|-----|
| `--bg-primary` | `#090B14` | Fundo principal |
| `--bg-card` | `#151B2C` | Cards e superfícies |
| `--bg-elevated` | `#1E2538` | Modais, bottom sheets |
| `--bg-hover` | `#1C2340` | Hover states |

### Cores de Ação

| Token | HEX | Uso |
|-------|-----|-----|
| `--brand-primary` | `#4F6BFF` | Botões primários, links, tabs ativas |
| `--brand-success` | `#22C55E` | Conclusão, sucesso |
| `--brand-warning` | `#F59E0B` | Alerta, atenção |
| `--brand-danger` | `#EF4444` | Erro, perigo |
| `--brand-purple` | `#7C5CFF` | Elementos de IA |

### Cores de Texto

| Token | HEX | Uso |
|-------|-----|-----|
| `--text-primary` | `#F1F5F9` | Texto principal |
| `--text-secondary` | `#94A3B8` | Texto secundário |
| `--text-muted` | `#64748B` | Texto desabilitado |
| `--text-inverse` | `#0F172A` | Texto em fundo claro |

### Cores de Borda

| Token | HEX | Uso |
|-------|-----|-----|
| `--border-default` | `rgba(255,255,255,0.08)` | Bordas de cards |
| `--border-hover` | `rgba(255,255,255,0.15)` | Hover de bordas |
| `--border-active` | `#4F6BFF` | Borda de foco/seleção |

---

## 3. Tipografia

### Font Family

```css
--font-sans: "Inter", ui-sans-serif, system-ui, sans-serif;
--font-mono: "JetBrains Mono", ui-monospace, SFMono-Regular, monospace;
```

### Escala Tipográfica

| Nível | Tamanho | Weight | Line Height | Uso |
|-------|---------|--------|-------------|-----|
| **Hero** | 24px | 900 | 1.2 | Título principal |
| **H1** | 18px | 800 | 1.3 | Título de seção |
| **H2** | 15px | 700 | 1.4 | Subtítulo |
| **H3** | 13px | 700 | 1.5 | Título de card |
| **Body** | 12px | 500 | 1.6 | Texto corrido |
| **Body Small** | 11px | 500 | 1.5 | Texto auxiliar |
| **Caption** | 10px | 600 | 1.4 | Labels, timestamps |
| **Micro** | 9px | 700 | 1.2 | Badges, tags |
| **Mono** | 11px | 500 | 1.4 | Dados numéricos |

---

## 4. Espaçamento (Spacing Scale)

| Token | Pixels | Uso |
|-------|--------|-----|
| `space-1` | 2px | Ícones pequenos |
| `space-2` | 4px | Gaps internos |
| `space-3` | 8px | Padding pequeno |
| `space-4` | 12px | Padding card |
| `space-5` | 16px | Padding seção |
| `space-6` | 20px | Margem entre cards |
| `space-7` | 24px | Margem de seção |
| `space-8` | 32px | Padding página |
| `space-9` | 40px | Espaço entre seções |
| `space-10` | 48px | Header spacing |

---

## 5. Border Radius

| Token | Valor | Uso |
|-------|-------|-----|
| `radius-sm` | 8px | Inputs, botões pequenos |
| `radius-md` | 12px | Cards, botões |
| `radius-lg` | 16px | Modais, bottom sheets |
| `radius-xl` | 24px | Containers grandes |
| `radius-full` | 999px | Badges, avatares |

---

## 6. Sombras

| Token | Valor | Uso |
|-------|-------|-----|
| `shadow-sm` | `0 2px 8px rgba(0,0,0,0.3)` | Cards sutis |
| `shadow-md` | `0 4px 16px rgba(0,0,0,0.4)` | Cards elevados |
| `shadow-lg` | `0 8px 32px rgba(0,0,0,0.5)` | Modais |
| `shadow-xl` | `0 12px 48px rgba(0,0,0,0.6)` | Bottom sheets |
| `shadow-glow` | `0 0 20px rgba(79,107,255,0.3)` | Glow de foco |

---

## 7. Glassmorphism

```css
.glass {
  background: rgba(21, 27, 44, 0.7);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.05);
}
```

### Variações

| Variação | Background | Blur | Border |
|----------|-----------|------|--------|
| Glass Card | `rgba(21,27,44,0.7)` | 12px | `rgba(255,255,255,0.05)` |
| Glass Modal | `rgba(15,18,30,0.95)` | 20px | `rgba(255,255,255,0.08)` |
| Glass Overlay | `rgba(0,0,0,0.6)` | 4px | Nenhuma |

---

## 8. Componentes

### 8.1 Botões

| Tipo | Padding | Background | Hover | Ativo |
|------|---------|-----------|-------|-------|
| **Primary** | `8px 16px` | `#4F6BFF` | `#3B56E0` | `#2E45CC` |
| **Secondary** | `8px 16px` | `#1E2538` | `#2A3450` | `#151B2C` |
| **Ghost** | `8px 16px` | Transparent | `rgba(79,107,255,0.1)` | `rgba(79,107,255,0.15)` |
| **Danger** | `8px 16px` | `#EF4444` | `#DC2626` | `#B91C1C` |
| **Icon** | `8px` | Transparent | `rgba(255,255,255,0.05)` | `rgba(255,255,255,0.1)` |

### 8.2 Cards

```
┌────────────────────────────────┐
│  ┌──┐                          │
│  │Icon│  Título do Card  ▶    │
│  └──┘                          │
│  Descrição secundária          │
│  ─────────────────────────    │
│  Progresso / Conteúdo          │
│  ─────────────────────────    │
│  Tag 1   Tag 2   ▶ Ação       │
└────────────────────────────────┘
```

- **Padding:** 16px
- **Border Radius:** 12px
- **Background:** `#151B2C`
- **Border:** `rgba(255,255,255,0.05)`
- **Gap interno:** 8px
- **Sombra:** `shadow-sm`

### 8.3 Bottom Sheet (FAB)

- **Trigger:** FAB no canto inferior direito
- **Abertura:** Slide up com spring animation
- **Overlay:** Backdrop escuro com blur
- **Conteúdo:** Grid 2 colunas com opções
- **Fechamento:** Tap no overlay ou botão close

### 8.4 Floating Notifications (Toast)

```
┌──────────────────────┐
│  ❌                  │
│  ⏰  Título          │
│      Mensagem        │
│  ┌──────┐ ┌──────┐  │
│  │Ação 1│ │Ação 2│  │
│  └──────┘ └──────┘  │
└──────────────────────┘
```

- **Posição:** Topo, stack vertical
- **Duração:** 7 segundos
- **Animação:** Slide down com spring
- **Ações:** Botões inline (ex: "Concluir", "Adiar")

### 8.5 Timeline/Agenda

```
  Seg  Ter  Qua  Qui  Sex  Sáb  Dom
┌────┬────┬────┬────┬────┬────┬────┐
│ 08 │    │    │    │    │    │    │
├────┼────┼────┼────┼────┼────┼────┤
│ 09 │📅  │    │    │    │    │    │
├────┼────┼────┼────┼────┼────┼────┤
│ 10 │    │    │    │    │    │    │
└────┴────┴────┴────┴────┴────┴────┘
```

### 8.6 Navigation (Bottom Tab Bar)

- 6 tabs: Home, Agenda, Tarefas, Chat, Gemini, Perfil
- Ícone + label (9px)
- Active state: cor primária + indicador superior
- Inactive: cor secundária

---

## 9. Micro-animações

| Elemento | Animação | Duração | Easing |
|----------|----------|---------|--------|
| Tab switch | Fade + slide Y | 180ms | easeOut |
| Card entry | Fade in + scale | 200ms | spring |
| Checkbox toggle | Scale + rotate | 150ms | spring |
| FAB open | Expand + slide up | 300ms | spring |
| Notification | Slide down + fade | 250ms | spring |
| Bottom sheet | Slide up | 300ms | spring |
| Toast | Slide down | 200ms | spring |
| Button press | Scale (0.95) | 100ms | easeOut |
| Modal open | Fade + scale | 200ms | easeOut |

---

## 10. Ícones

| Contexto | Sistema | Exemplos |
|----------|---------|----------|
| Interface (ações) | Lucide React | Check, X, Plus, Bell, Home, etc. |
| Decorativos | Material Symbols Rounded | add, home, calendar_month, smart_toy, etc. |
| Status | Emoji | 🎉, ✅, ⏰, 🔥, 🏆 |
| Avatares | Imagens (upload ou geradas) | Fotos de perfil |

---

## 11. Dark Mode / Light Mode

### Dark Mode (Padrão)

```
bg: #090B14
card: #151B2C
text: #F1F5F9
text-secondary: #94A3B8
border: rgba(255,255,255,0.08)
```

### Light Mode

```
bg: #FFFFFF
card: #F8FAFC
text: #0F172A
text-secondary: #475569
border: rgba(0,0,0,0.08)
```

---

## 12. Responsividade

| Breakpoint | Largura | Layout |
|------------|---------|--------|
| Mobile S | <375px | Single column, compact |
| Mobile L | 375-480px | Single column, normal |
| Tablet | 480-768px | Single column, wider |
| Desktop | 768-1024px | Centralizado (max-w-md) |
| Desktop+ | >1024px | Centralizado + backgrounds |

---

## 13. Assets e Mídia

| Tipo | Formato | Tamanho máximo | Localização |
|------|---------|---------------|-------------|
| Avatares | WebP | 200KB | Firebase Storage |
| Ícones | SVG inline | 2KB | Lucide/Material |
| Imagens de fundo | WebP | 500KB | `/public/` |
| Ilustrações | SVG | 50KB | `/src/assets/` |
| Sons | MP3/WebM | 100KB | `/public/sounds/` |
