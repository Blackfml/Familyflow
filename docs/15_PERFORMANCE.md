# 15 — PERFORMANCE

> **Documento:** Performance e Otimização
> **Versão:** 2.0 (Proposta)
> **Status:** ✅ Finalizado

---

## 1. Performance Atual

### Problemas Identificados

| Problema | Impacto | Severidade |
|----------|---------|-----------|
| Polling a cada 5s | 12 req/min desnecessárias | 🟠 ALTO |
| Estado global useState | Re-render de toda árvore | 🟠 ALTO |
| Sem code splitting | Bundle único grande | 🟠 ALTO |
| Single Firestore doc | Escrita/leitura completa | 🔴 CRÍTICO |
| Sem lazy loading | Todos componentes carregam upfront | 🟠 ALTO |
| Sem memoization | Re-renders desnecessários | 🟡 MÉDIO |
| AudioContext sem pool | Memory leak potencial | 🟡 MÉDIO |
| Imagens externas | Dependente de CDN | 🟡 MÉDIO |
| Sem cache de Service Worker | Sem oflline, sem cache | 🟡 MÉDIO |
| Animações spring em listas | Pode causar jank | 🟡 MÉDIO |

---

## 2. Métricas de Performance (Metas v2.0)

| Métrica | Atual | Meta |
|---------|-------|------|
| **LCP** (Largest Contentful Paint) | ~3s | <1.5s |
| **FCP** (First Contentful Paint) | ~2s | <1s |
| **TTI** (Time to Interactive) | ~3s | <2s |
| **TBT** (Total Blocking Time) | ~300ms | <100ms |
| **CLS** (Cumulative Layout Shift) | ~0.2 | <0.05 |
| **Bundle size (initial)** | ~500KB | <150KB |
| **Bundle size (total)** | ~800KB | <300KB |
| **Firestore reads/day** | ~720 | <100 |
| **Firestore writes/action** | 1 doc inteiro | 1 campo apenas |
| **Re-renders/action** | Toda árvore | Apenas componente afetado |
| **Memory (idle)** | ~50MB | <30MB |

---

## 3. Estratégias de Otimização

### 3.1 Code Splitting

```typescript
// ❌ Atual: tudo importado de uma vez
import HomeDashboard from "./components/HomeDashboard";
import TasksView from "./components/TasksView";

// ✅ Proposto: lazy loading por rota
const HomeDashboard = React.lazy(() => import("./pages/HomeDashboard"));
const TasksView = React.lazy(() => import("./pages/TasksView"));
```

### 3.2 Memoization

```typescript
// ❌ Atual: toda mudança re-renderiza
function TaskCard({ task }: { task: Task }) {
  return <div>{task.title}</div>;
}

// ✅ Proposto: memo com comparação rasa
const TaskCard = React.memo(({ task }: { task: Task }) => {
  return <div>{task.title}</div>;
}, (prev, next) => prev.task.id === next.task.id);
```

### 3.3 Virtualização de Listas

```typescript
// ❌ Atual: renderiza N tarefas
{tasks.map(task => <TaskCard key={task.id} task={task} />)}

// ✅ Proposto: virtualizado (apenas visíveis)
<VirtualList
  items={tasks}
  itemHeight={80}
  windowHeight={600}
  renderItem={(task) => <TaskCard task={task} />}
/>
```

### 3.4 State Management

```typescript
// ❌ Atual: estado centralizado, tudo re-renderiza
const [state, setState] = useState<FamilyState>(...);
// Qualquer mudança → App inteiro re-renderiza

// ✅ Proposto: stores separadas
const useTaskStore = create((set) => ({
  tasks: [],
  addTask: (task) => set((state) => ({ tasks: [...state.tasks, task] })),
}));

const useUserStore = create((set) => ({
  user: null,
  login: (user) => set({ user }),
}));
```

### 3.5 Firestore Optimization

```typescript
// ❌ Atual: escreve documento inteiro
await docRef.set(fullState);

// ✅ Proposto: apenas campos alterados
await docRef.update({
  "tasks.3.status": "completed",
  "tasks.3.percentCompleted": 100,
});
```

### 3.6 Web Worker para IA

```typescript
// Processamento pesado da IA em background
const aiWorker = new Worker("ai.worker.js");
aiWorker.postMessage({ prompt, context });
aiWorker.onmessage = (e) => {
  setResponse(e.data);
};
```

---

## 4. Network Optimization

### 4.1 Compressão

- ✅ Ativar gzip/br no servidor Express
- ✅ Comprimir assets com Vite (build minify)
- ✅ Otimizar imagens (WebP)

### 4.2 Cache Strategy

| Recurso | Cache | Estratégia |
|---------|-------|-----------|
| HTML | Service Worker | Network First |
| JS/CSS | CDN + SW | Cache First (1 ano) |
| API Data | IndexedDB | Stale While Revalidate |
| Images | CDN | Cache First (1 mês) |
| Fonts | CDN | Cache First (1 ano) |

### 4.3 Bundle Analysis

```
Antes (v1.x):
  react: 42KB
  lucide-react: 38KB
  motion: 25KB
  firebase: 72KB
  express (server): 112KB
  Total client: ~500KB

Depois (v2.0 meta):
  react: 42KB
  zustand: 3KB  (vs useState)
  react-router: 12KB
  socket.io-client: 16KB
  firebase: 72KB (lazy)
  Lucide (tree-shaken): 15KB
  Total client: ~180KB
```

---

## 5. Animations Performance

| Prática | Recomendação |
|---------|-------------|
| Use `transform` e `opacity` | GPU-acelerado, sem layout |
| Evite `width`, `height`, `top` | Causam reflow |
| `will-change` com moderação | Não exagerar |
| `content-visibility: auto` | Fora da tela não renderiza |
| `motion` `spring` para interação | Suave mas pesado |
| `motion` `tween` para listas | Mais leve que spring |

---

## 6. Monitoring

| Ferramenta | O que monitorar |
|-----------|----------------|
| **Lighthouse CI** | Core Web Vitals em cada PR |
| **Firebase Performance** | Latência de queries |
| **Web Vitals (JS)** | CLS, LCP, FCP, INP |
| **Bundle Analyzer** | Tamanho do bundle |
| **Error Tracking** | Erros no cliente e servidor |
| **Logging** | Logs de performance no servidor |

---

## 7. Performance Budget

| Recurso | Budget |
|---------|--------|
| JavaScript inicial | <150KB gzip |
| CSS inicial | <20KB gzip |
| Fonte (Inter) | <30KB |
| Imagem (Hero) | <100KB WebP |
| Total página | <300KB |
| Tempo de carregamento | <2s |
| TTI | <2s |
| Firestore leituras/dia | <500 |
| API latency (p95) | <300ms |
