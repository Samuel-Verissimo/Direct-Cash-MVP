# DirectCash MVP

Aplicação full-stack para gestão de campanhas publicitárias com IA — autenticação JWT, CRUD completo e geração de campanhas via linguagem natural.

<p align="center">
  <img src="./login.png" alt="Tela de login do DirectCash MVP" width="920" />
</p>
<p align="center">
  <em>Fluxo de autenticação inicial da aplicação.</em>
</p>

## Stack

| Camada   | Tecnologia                           |
| -------- | ------------------------------------ |
| Frontend | Next.js 16 (App Router) + TypeScript |
| Backend  | NestJS 11 + TypeScript               |
| Banco    | PostgreSQL 16 + Prisma 7             |
| IA       | OpenAI `gpt-4o-mini`                 |
| Infra    | Docker Compose, pnpm monorepo        |

## Arquitetura

### Backend — Modular com Repository Pattern

Cada domínio (`auth`, `campaigns`, `ads`, `ai`) é um módulo NestJS isolado com a seguinte estrutura:

```
modules/<domínio>/
  repositories/
    <domínio>.repository.ts           ← interface (contrato)
    prisma-<domínio>.repository.ts    ← implementação com Prisma
  <domínio>.service.ts                ← lógica de aplicação
  <domínio>.controller.ts             ← HTTP, validação de entrada
  <domínio>.module.ts                 ← DI: registra providers
  dto/                                ← DTOs com class-validator
```

**Por quê Repository Pattern?** Desacopla a lógica de negócio do Prisma. O service depende apenas da interface — trocar o ORM não afeta o domínio. Alternativa considerada: Active Record (mais simples, mas acopla service ao ORM).

**Injeção de dependência:**

```ts
{ provide: 'CAMPAIGNS_REPOSITORY', useClass: PrismaCampaignsRepository }

@Inject('CAMPAIGNS_REPOSITORY') private readonly repo: ICampaignsRepository
```

**Infraestrutura global** registrada em `app.module.ts`:

- `JwtAuthGuard` — guard global, bypass via `@Public()`
- `TransformInterceptor` — envelope de resposta `{ data, timestamp, path }`
- `PrismaExceptionFilter` — tratamento de erros do banco

### Frontend — Feature-based com Hooks Layer

```
src/
  app/           ← Next.js App Router (layout e pages apenas)
  features/      ← lógica por domínio (hooks, helpers, constants)
  components/    ← UI reutilizável sem lógica de domínio
  lib/           ← API client, types e utilitários genéricos
```

**Por quê feature-based?** Agrupa por domínio em vez de tipo de arquivo — `features/campaigns/` contém hooks, helpers e constantes de campanhas juntos. Escala melhor do que separar por `hooks/`, `utils/`, `constants/` globais.

**Dependência unidirecional:**

```
lib/ → sem imports de features/ ou components/
features/ → pode importar de lib/
components/ → pode importar de lib/ e features/
app/ → pode importar de tudo
```

## Decisões Técnicas

1. **pnpm workspaces (monorepo)** — frontend e backend versionados juntos, scripts de qualidade compartilhados na raiz. Alternativa: repositórios separados (mais overhead de CI e versioning).

2. **Prisma 7 com adapter `PrismaPg`** — conexão via driver nativo do PostgreSQL, sem depender do binário query engine padrão. Exige passar o adapter explicitamente no construtor do `PrismaClient`.

3. **JWT access + refresh token** — access token de vida curta (15min) em memória, refresh token (7d) em cookie `HttpOnly`. Evita exposição do refresh token via JavaScript.

4. **`class-validator` nos DTOs** — validação declarativa na fronteira da API, antes de chegar ao service. Controllers nunca contêm lógica de negócio.

5. **`next-intl`** — internacionalização com suporte a PT-BR, EN e ES. Locale persistido em cookie para funcionar no App Router sem depender de `searchParams`.

6. **`output: 'standalone'` no Next.js** — gera um servidor Node.js autossuficiente para Docker, sem precisar da `node_modules` completa na imagem de produção.

7. **ESLint isolado por app** — API e Web têm configs independentes (`eslint.config.mjs`). Evita conflito de regras entre NestJS e React. Alternativa: config flat global (mais simples, menos flexível).

## Qualidade de Código

### Pipeline

| Ferramenta  | Função                                            |
| ----------- | ------------------------------------------------- |
| ESLint      | Linting por app, config isolada                   |
| Prettier    | Formatação automática no pre-commit               |
| Husky       | Git hooks (`pre-commit` e `commit-msg`)           |
| lint-staged | Roda ESLint + Prettier apenas nos arquivos staged |
| commitlint  | Valida mensagens no padrão Conventional Commits   |

**Scopes permitidos:** `api`, `web`, `shared`, `docker`, `ci`, `deps`, `prisma`

**Por quê lint-staged?** Roda apenas nos arquivos modificados — não bloqueia o desenvolvedor com lint do projeto inteiro a cada commit.

### Comandos

```bash
pnpm lint    # ESLint em todos os apps
pnpm build   # build de produção
pnpm test    # testes unitários
```

## Como Rodar

### Modo 1 — Desenvolvimento (com hot reload)

**Pré-requisitos:** Node.js 20+, pnpm 10+, Docker

```bash
cp apps/api/.env.example apps/api/.env
# Edite apps/api/.env e defina OPENAI_API_KEY

pnpm install

# Sobe apenas o banco
docker compose up -d postgres

# Migrações, client Prisma e seed
pnpm --filter api exec npx prisma migrate deploy
pnpm --filter api exec npx prisma generate
pnpm --filter api seed

# Inicia frontend e backend com hot reload
pnpm dev
```

Acessos:

- Frontend: `http://localhost:3100`
- Backend: `http://localhost:3101/api`
- Swagger: `http://localhost:3101/api/docs`

### Modo 2 — Docker Compose (build completo)

**Pré-requisitos:** Docker + Docker Compose

```bash
cp apps/api/.env.example apps/api/.env
# Edite apps/api/.env e defina OPENAI_API_KEY

docker compose up -d --build
```

Para atualizar após alterações no código:

```bash
docker compose build api && docker compose up -d api
# ou
docker compose build web && docker compose up -d web
```

Acessos:

- Frontend: `http://localhost:3100`
- Backend: `http://localhost:3101/api`
- Swagger: `http://localhost:3101/api/docs`

## Variáveis de Ambiente

Referência: [`apps/api/.env.example`](./apps/api/.env.example)

| Variável                 | Descrição                              |
| ------------------------ | -------------------------------------- |
| `DATABASE_URL`           | Connection string do PostgreSQL        |
| `JWT_ACCESS_SECRET`      | Secret do access token                 |
| `JWT_REFRESH_SECRET`     | Secret do refresh token                |
| `JWT_ACCESS_EXPIRATION`  | Expiração do access token (ex: `15m`)  |
| `JWT_REFRESH_EXPIRATION` | Expiração do refresh token (ex: `7d`)  |
| `OPENAI_API_KEY`         | Chave da API da OpenAI                 |
| `FRONTEND_URL`           | URL do frontend (usada no CORS)        |
| `NEXT_PUBLIC_API_URL`    | URL base da API consumida pelo Next.js |

## Dependências Principais

### Workspace (root)

- `concurrently` — executa API e Web em paralelo no desenvolvimento
- `husky` + `lint-staged` — aplica validações no pre-commit
- `@commitlint/*` — valida o padrão de mensagens de commit

### API (`apps/api`)

- Runtime: `@nestjs/*`, `@prisma/client`, `@prisma/adapter-pg`, `openai`, `passport-jwt`, `bcrypt`
- Qualidade e build: `typescript`, `eslint`, `jest`, `prettier`, `prisma`

### Web (`apps/web`)

- Runtime: `next`, `react`, `next-intl`, `next-themes`
- Qualidade e build: `typescript`, `eslint`, `tailwindcss`

## Licença

Uso apenas para avaliação técnica.
