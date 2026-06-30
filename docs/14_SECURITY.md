# 14 — SECURITY

> **Documento:** Segurança do Sistema
> **Versão:** 2.0 (Proposta)
> **Status:** ✅ Finalizado

---

## 1. Análise de Segurança Atual

### Problemas Críticos

| # | Problema | Severidade | Descrição |
|---|----------|-----------|-----------|
| 1 | Senha armazenada em plaintext | 🔴 CRÍTICO | `UserProfile.password` sem hash |
| 2 | API Key exposta | 🔴 CRÍTICO | `firebase-applet-config.json` versionado |
| 3 | Sem autenticação real | 🔴 CRÍTICO | Login por nome, sem JWT |
| 4 | Sem Firestore Rules | 🔴 CRÍTICO | Banco 100% aberto |
| 5 | Sem CORS configurado | 🟠 ALTO | MiddlewareMode expõe API |
| 6 | Sem rate limiting | 🟠 ALTO | Qualquer um pode chamar APIs |
| 7 | Sem sanitização de input | 🟠 ALTO | Dados não validados |
| 8 | Dados excessivos no client | 🟠 ALTO | Estado inteiro enviado ao frontend |

---

## 2. Plano de Segurança (v2.0)

### 2.1 Autenticação

#### Atual vs Proposto

| Aspecto | Atual | Proposto |
|---------|-------|----------|
| Método | Nome + senha (plaintext) | Firebase Auth + JWT |
| Provider | Custom | Google, Apple, Email |
| Sessão | localStorage | JWT + refresh token |
| 2FA | ❌ | Futuro |
| Expiração | Nunca | 7 dias (refresh) |

#### Fluxo de Autenticação

```
Usuário → Login Google/Apple/Email
        │
        ▼
Firebase Auth → Retorna JWT + Refresh Token
        │
        ▼
Servidor → Verifica JWT → Cria/retorna sessão
        │
        ▼
Cliente → Armazena token (httpOnly cookie ou secure storage)
        │
        ▼
Toda requisição → Authorization: Bearer <token>
```

### 2.2 Firestore Security Rules

Ver documento `05_FIREBASE.md` para regras completas. Resumo:

- Ler apenas se for membro da família
- Escrever apenas se for membro
- Excluir apenas se for owner
- Validação de tipos e tamanhos
- Rate limiting via Firestore (burst limits)

### 2.3 API Security

| Medida | Implementação |
|--------|--------------|
| **JWT Validation** | Middleware em todas as rotas |
| **Rate Limiting** | 100 req/min por IP |
| **CORS** | Whitelist de origens |
| **Input Validation** | Zod schemas em todas as rotas |
| **SQL Injection** | Firestore previne (NoSQL) |
| **XSS** | React sanitiza output automaticamente |
| **CSRF** | Token + SameSite cookies |
| **Helmet** | Headers de segurança HTTP |

#### Rate Limiting

```
GET /api/state:       30 req/min
POST /api/*:          20 req/min
DELETE /api/*:        10 req/min
POST /api/gemini/*:   5 req/min   (custo alto)
```

### 2.4 Dados Sensíveis

| Dado | Onde armazenar | Proteção |
|------|---------------|----------|
| Senha | Firebase Auth apenas | Hash bcrypt + salt |
| JWT Secret | Variável de ambiente | NUNCA no código |
| API Keys | Variável de ambiente | NUNCA no repositório |
| Dados pessoais | Firestore (com regras) | Criptografado em repouso |
| Tokens | httpOnly cookie | Secure + SameSite |

### 2.5 Privacidade de Dados

| Princípio | Implementação |
|-----------|--------------|
| **Data minimization** | Apenas dados necessários |
| **Right to delete** | Exclusão total de perfil |
| **Data portability** | Exportar dados em JSON |
| **Encryption at rest** | Firestore encrypts by default |
| **Encryption in transit** | HTTPS obrigatório |
| **Logs anônimos** | Sem PII em logs |

### 2.6 Checklist de Segurança para Deploy

- [ ] Firebase Authentication configurado
- [ ] Firestore Rules testadas e aplicadas
- [ ] JWT implementado e validado
- [ ] HTTPS habilitado (Cloud Run / Vercel)
- [ ] Variáveis de ambiente configuradas
- [ ] Rate limiting ativo
- [ ] Helmet headers configurados
- [ ] CORS whitelist definida
- [ ] Logs sem dados sensíveis
- [ ] Testes de penetração básicos
- [ ] Backup automático do Firestore
- [ ] Monitoramento de segurança (alertas)

---

## 3. Headers de Segurança

```
Content-Security-Policy: default-src 'self'; 
  script-src 'self' 'unsafe-inline'; 
  style-src 'self' 'unsafe-inline'; 
  img-src 'self' https: data:;
  connect-src 'self' https://*.firebaseio.com wss://*;

X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000; includeSubDomains
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=(self)
```

---

## 4. Vulnerabilidades Conhecidas (Atual)

| Vulnerabilidade | Risco | Mitigação |
|----------------|-------|-----------|
| Plaintext password | 🔴 | Migrar para Firebase Auth |
| No JWT validation | 🔴 | Middleware JWT |
| No input validation | 🟠 | Zod schemas |
| XSS via Markdown | 🟠 | Sanitizar output da IA |
| No HTTPS enforcement | 🟠 | Configurar no deploy |
| API key exposta | 🟠 | Rotacionar + .env |
| CORS aberto | 🟠 | Configurar whitelist |
| No rate limiting | 🟠 | Implementar middleware |

---

## 5. Resposta a Incidentes

| Etapa | Ação |
|-------|------|
| 1. Detectar | Monitoramento + logs |
| 2. Analisar | Identificar escopo e causa |
| 3. Conter | Revogar tokens, bloquear IPs |
| 4. Corrigir | Patch de segurança |
| 5. Notificar | Comunicar usuários afetados |
| 6. Documentar | Post-mortem + melhorias |

---

## 6. Compliance Futuro

| Regulamentação | Status | Ação necessária |
|----------------|--------|----------------|
| LGPD (Brasil) | 📝 Planejado | Política de privacidade, direito de exclusão |
| GDPR (Europa) | 🔮 Futuro | Consentimento, portabilidade |
| COPPA (EUA) | 🔮 Futuro | Proteção de dados infantis |
| CCPA (Califórnia) | 🔮 Futuro | Opt-out de venda de dados |
