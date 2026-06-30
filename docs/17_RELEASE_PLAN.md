# 17 — RELEASE PLAN

> **Documento:** Plano de Release e Deploy
> **Versão:** 2.0 (Proposta)
> **Status:** ✅ Finalizado

---

## 1. Ambientes

| Ambiente | URL | Propósito | Acesso |
|----------|-----|-----------|--------|
| **Development** | `localhost:3000` | Desenvolvimento local | Dev team |
| **Staging** | `staging.familyflow.app` | QA, testes, validação | Equipe + testers |
| **Production** | `app.familyflow.app` | Usuários finais | Público |

---

## 2. Infraestrutura de Deploy

### Atual

```
Google AI Studio → Cloud Run → Firestore
```

### Proposto (v2.0)

```
┌─────────────────────────────────────────┐
│              GitHub                      │
│  ┌──────────┐  ┌──────────┐             │
│  │   Code   │  │   CI/CD  │             │
│  │  (main)  │  │ (Actions)│             │
│  └──────────┘  └──────────┘             │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│           Google Cloud Run               │
│  ┌──────────────────────────────────┐   │
│  │     Docker Container (Node)      │   │
│  │  Express + Vite SSR (opcional)  │   │
│  └──────────────────────────────────┘   │
└─────────────────┬───────────────────────┘
                  │
        ┌─────────┴──────────┐
        ▼                    ▼
┌──────────────┐   ┌──────────────────┐
│   Firestore  │   │  Firebase Auth   │
│   (Dados)    │   │  (Auth/Users)    │
└──────────────┘   └──────────────────┘
```

### Opções de Deploy

| Opção | Prós | Contras | Custo |
|-------|------|---------|-------|
| **Google Cloud Run** | Escala automática, integração Firebase | Cold start | $ |
| **Vercel** | Simples, bom para frontend | Serverless limits | $ |
| **Railway** | Simples, bom custo-benefício | Menos recursos | $ |
| **Self-hosted (VPS)** | Controle total | Manutenção | $$ |

### Recomendação: Google Cloud Run

---

## 3. Pipeline CI/CD

### GitHub Actions

```yaml
name: Deploy

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm run lint
      - run: npm run test:unit
      - run: npm run test:integration
      - run: npm run build

  e2e:
    needs: quality
    runs-on: ubuntu-latest
    steps:
      - run: npm run test:e2e

  deploy-staging:
    needs: [quality, e2e]
    if: github.event_name == 'pull_request'
    runs-on: ubuntu-latest
    steps:
      - run: npm run deploy:staging

  deploy-production:
    needs: [quality, e2e]
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - run: npm run deploy:production
```

---

## 4. Versionamento

### Esquema

```
v{MAJOR}.{MINOR}.{PATCH}

MAJOR: Mudanças que quebram compatibilidade
MINOR: Novas funcionalidades (backward compatible)
PATCH: Bug fixes
```

### Releases

| Versão | Tipo | Previsão | Conteúdo |
|--------|------|----------|----------|
| v1.0.0 | Atual | - | MVP funcional |
| v2.0.0 | Major | Sprint 5-6 | Nova arquitetura, design, IA |
| v2.1.0 | Minor | Sprint 7-8 | Widgets, modo família |
| v2.2.0 | Minor | Sprint 9-10 | Ajustes de IA, performance |
| v3.0.0 | Major | Futuro | Voz, integrações |
| v4.0.0 | Major | Futuro | IA preditiva, casa inteligente |

---

## 5. Deploy Checklist

### Pré-Deploy

- [ ] Todos os testes passando
- [ ] Code review aprovado
- [ ] Changelog atualizado
- [ ] Variáveis de ambiente configuradas
- [ ] Firestore Rules aplicadas
- [ ] Índices do Firestore criados
- [ ] Build de produção testado localmente
- [ ] Performance budget verificado
- [ ] Backup do banco realizado

### Deploy

```bash
# 1. Build
npm run build

# 2. Run migrations (se houver)
npm run migrate

# 3. Deploy server
gcloud run deploy familyflow \
  --source . \
  --region us-central1 \
  --allow-unauthenticated

# 4. Deploy Firestore Rules
gcloud firestore deployments apply firestore.rules

# 5. Verificar health
curl https://app.familyflow.app/api/health

# 6. Smoke test
npm run test:smoke
```

### Pós-Deploy

- [ ] Monitoring ativo
- [ ] Logs verificados
- [ ] Notificação aos usuários (se aplicável)
- [ ] Rollback preparado

---

## 6. Rollback Plan

| Cenário | Ação | Tempo estimado |
|---------|------|---------------|
| Bug crítico | Reverter para versão anterior no Cloud Run | 5 min |
| Performance degradada | Reverter + escalar recursos | 10 min |
| Dados corrompidos | Restaurar backup do Firestore + reverter | 30 min |
| Violação de segurança | Reverter, revogar tokens, notificar | 15 min |

### Rollback Script

```bash
gcloud run deploy familyflow \
  --image gcr.io/project/familyflow:v1.0.0 \
  --region us-central1
```

---

## 7. Monitoramento e Alertas

| Métrica | Alerta | Ação |
|---------|--------|------|
| Erro 5xx > 1% | 🔴 Crítico | Rollback imediato |
| Latência p95 > 1s | 🟠 Alerta | Escalar servidores |
| Firestore reads > 100k/dia | 🟡 Warning | Revisar queries |
| Uptime < 99.9% | 🔴 Crítico | Investigar causa |
| Bundle size > budget | 🟡 Warning | Otimizar código |

---

## 8. Backup Strategy

| Dado | Frequência | Retenção |
|------|-----------|----------|
| Firestore | Diário | 30 dias |
| Config | A cada deploy | Indefinido |
| .env secrets | Manual | Cofre seguro |
| Código | A cada commit | Git histórico |

---

## 9. Performance & Scaling

| Métrica | Limite | Ação |
|---------|--------|------|
| Conexões simultâneas | > 1000 | Aumentar Cloud Run instances |
| Firestore writes/s | > 500 | Implementar fila/batch |
| DB size | > 10GB | Revisar modelo de dados |
| Response time | > 2s | Otimizar queries |

---

## 10. Release Communication

| Release | Canais | Conteúdo |
|---------|--------|----------|
| Major | Email + In-app + Social | Novidades, changelog, tutorial |
| Minor | In-app notification | Principais mudanças |
| Patch | In-app toast (se relevante) | Bug fixes |
