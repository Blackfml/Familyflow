# 16 — TEST PLAN

> **Documento:** Plano de Testes
> **Versão:** 2.0 (Proposta)
> **Status:** ✅ Finalizado

---

## 1. Situação Atual

**Testes:** ❌ Nenhum teste implementado

---

## 2. Estratégia de Testes

### Pirâmide de Testes

```
         ╱╲
        ╱  ╲          E2E (5%)
       ╱    ╲
      ╱────────╲
     ╱          ╲     Integration (20%)
    ╱            ╲
   ╱────────────────╲
  ╱                  ╲  Unit (75%)
 ╱                    ╲
╱────────────────────────╲
```

### Stack de Testes

| Camada | Ferramenta | Cobertura |
|--------|-----------|-----------|
| **Unit (Frontend)** | Vitest + Testing Library | 75%+ |
| **Unit (Backend)** | Vitest | 75%+ |
| **Integration** | Supertest + MSW | 80%+ |
| **E2E** | Playwright | Fluxos críticos |
| **Visual** | Percy / Chromatic | Regressão visual |
| **Mobile** | Detox (futuro) | Fluxos nativos |

---

## 3. Testes Unitários

### Frontend

```typescript
// Componente: TaskCard
describe("TaskCard", () => {
  it("renderiza título e responsável", () => {
    render(<TaskCard task={mockTask} />);
    expect(screen.getByText("Comprar leite")).toBeInTheDocument();
    expect(screen.getByText("Brenda")).toBeInTheDocument();
  });
  
  it("chama onComplete ao clicar em concluir", () => {
    const onComplete = vi.fn();
    render(<TaskCard task={mockTask} onComplete={onComplete} />);
    fireEvent.click(screen.getByText("Concluir"));
    expect(onComplete).toHaveBeenCalledWith(mockTask.id);
  });
  
  it("mostra badge de prioridade correta", () => {
    render(<TaskCard task={{ ...mockTask, priority: "urgent" }} />);
    expect(screen.getByText("Urgente")).toBeInTheDocument();
  });
});
```

### Backend

```typescript
describe("Task Service", () => {
  it("calcula pontos corretamente por prioridade", () => {
    expect(calculatePoints("low")).toBe(10);
    expect(calculatePoints("medium")).toBe(25);
    expect(calculatePoints("high")).toBe(50);
    expect(calculatePoints("urgent")).toBe(80);
  });
  
  it("não permite tarefa sem título", async () => {
    await expect(createTask({ title: "" }))
      .rejects.toThrow("Title is required");
  });
  
  it("incrementa streak apenas 1x por dia", () => {
    const user = { streak: 5, streakUpdatedAt: "2026-07-01" };
    const today = "2026-07-01";
    expect(shouldIncrementStreak(user, today)).toBe(false);
  });
});
```

---

## 4. Testes de Integração

### Fluxos Testados

| Fluxo | Descrição |
|-------|-----------|
| Auth flow | Register + Login + Logout |
| CRUD Tarefa | Criar, editar, concluir, excluir |
| CRUD Meta | Criar, atualizar progresso, concluir |
| CRUD Hábito | Criar, toggle, deletar |
| IA Chat | Mensagem, resposta, fallback |
| Notificações | Criar, marcar lida, push |
| Gamificação | Pontos, streak, nível |

### Exemplo

```typescript
describe("Task CRUD Integration", () => {
  it("cria e conclui tarefa com gamificação", async () => {
    // Register user
    const user = await registerUser("Teste", "teste@email.com");
    
    // Create task
    const task = await createTask({
      title: "Tarefa teste",
      responsible: user.id,
      priority: "high",
    });
    expect(task.title).toBe("Tarefa teste");
    
    // Complete task
    const result = await completeTask(task.id);
    expect(result.pointsEarned).toBe(50);
    expect(result.user.points).toBe(50);
  });
});
```

---

## 5. Testes E2E (Playwright)

### Fluxos Críticos

| Fluxo | Ações |
|-------|-------|
| **Onboarding + Auth** | Abrir app → Criar conta → Login |
| **Criar Tarefa** | Dashboard → FAB → Nova Tarefa → Preencher → Salvar |
| **Completar Hábito** | Hábitos → Tap → Verificar streak |
| **Chat IA** | Tab IA → Digitar pergunta → Ver resposta |
| **Notificações** | Sino → Ver lista → Marcar lidas |
| **Configurações** | Perfil → Alterar tema → Sair |

### Exemplo

```typescript
test("usuário completa fluxo completo de tarefa", async ({ page }) => {
  await page.goto("/");
  await page.fill("[name=name]", "Teste");
  await page.click("text=Criar Perfil");
  
  await page.click("#fab-add-btn");
  await page.click("text=Nova Tarefa");
  await page.fill("[name=title]", "Comprar leite");
  await page.click("text=Criar Tarefa");
  
  await expect(page.locator("text=Comprar leite")).toBeVisible();
  await page.click("text=Concluir");
  await expect(page.locator("text=Tarefa Concluída")).toBeVisible();
});
```

---

## 6. Testes de Regressão Visual

| Componente | Estados |
|-----------|---------|
| TaskCard | Pendente, concluído, atrasado, editando |
| BottomSheet | Aberto, fechado, scroll |
| Notificação | Lida, não lida, com ação |
| Modal | Aberto, erro, validação |
| Header | Com notificação, sem notificação |

---

## 7. Testes de Performance

| Teste | Ferramenta | Métrica |
|-------|-----------|---------|
| Carregamento inicial | Lighthouse | LCP < 1.5s |
| Lista de 100 tarefas | Vitest perf | Render < 100ms |
| WebSocket 50 conexões | k6 | Latência < 200ms |
| Firestore 1000 leituras | Firebase Emulator | < 1s total |

---

## 8. Cobertura Mínima

| Módulo | Cobertura |
|--------|-----------|
| Types/Interfaces | 100% |
| Services (lógica) | 90% |
| Components (UI) | 75% |
| Hooks | 85% |
| Server (routes) | 80% |
| Server (services) | 90% |
| Firebase Rules | Testado com emulador |

---

## 9. CI/CD Pipeline

```
PR Aberto
  │
  ├── Lint (tsc --noEmit)
  ├── Unit Tests (vitest)
  │     └── Falhou → Bloqueia merge
  ├── Integration Tests
  ├── Build (vite build)
  ├── Lighthouse CI (performance budget)
  └── E2E (Playwright)
        └── Falhou → Bloqueia merge

Deploy
  │
  ├── Smoke Tests (health check)
  ├── Performance Tests (k6)
  └── Monitoring (alertas)
```

---

## 10. Checklist de Testes por Sprint

| Sprint | Testes |
|--------|--------|
| **Sprint 1** | Setup do ambiente de teste, testes unitários de types/utils |
| **Sprint 2** | Testes unitários: Task, Goal, Habit services |
| **Sprint 3** | Testes de integração: API endpoints, Firebase Emulator |
| **Sprint 4** | Testes E2E: Fluxo de tarefa, hábito, meta |
| **Sprint 5** | Testes de performance, regressão visual |
| **Sprint 6+** | Testes de segurança, testes de carga |

---

## 11. Regras de Qualidade

1. **Nenhum PR sem teste** — exceto refatorações não-funcionais
2. **Cobertura mínima 75%** — verificado no CI
3. **Todos os testes devem passar** — antes de merge
4. **Mock Firebase Emulator** — nunca usar produção em testes
5. **Testes E2E em staging** — nunca em produção
6. **Report de cobertura** — gerado a cada PR
