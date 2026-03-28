# DirectCash MVP

Desafio técnico fullstack — plataforma de gestão de campanhas publicitárias com IA.

## Stack

| Camada   | Tecnologia                                     |
| -------- | ---------------------------------------------- |
| Backend  | NestJS 11 + TypeScript + Prisma 7 + PostgreSQL |
| Frontend | Next.js 16 + React 19 + Tailwind CSS 4         |
| IA       | OpenAI gpt-4o-mini                             |
| Infra    | Docker Compose, pnpm monorepo                  |

---

## API (`apps/api`)

### Arquitetura: Modular com Repository Pattern

```
modules/<domain>/
  repositories/
    <domain>.repository.ts          ← interface do repositório (contrato)
    prisma-<domain>.repository.ts   ← implementação com Prisma
  <domain>.service.ts               ← lógica de aplicação (depende da interface)
  <domain>.controller.ts            ← HTTP, Swagger, validação de entrada
  <domain>.module.ts                ← DI: registra providers e repositórios
  dto/                              ← DTOs com class-validator
```

### Módulos

- `auth` — registro, login, refresh token, logout, JWT strategy
- `campaigns` — CRUD de campanhas com paginação e filtros
- `ads` — CRUD de anúncios vinculados a campanhas
- `ai` — geração de campanhas e anúncios via OpenAI
- `prisma` — serviço singleton de conexão com o banco

### Injeção de repositórios

```ts
{ provide: 'CAMPAIGNS_REPOSITORY', useClass: PrismaCampaignsRepository }

@Inject('CAMPAIGNS_REPOSITORY') private readonly repo: ICampaignsRepository
```

### Infraestrutura global (registrada em `app.module.ts`)

- `JwtAuthGuard` — guard global, bypass via `@Public()`
- `TransformInterceptor` — envelope de resposta `{ data, timestamp, path }`
- `PrismaExceptionFilter` — tratamento de erros de banco

### Regras

- Services nunca importam `PrismaService` — apenas interfaces de repositório
- Controllers nunca contêm lógica de negócio
- Imports relativos com extensão `.js` (requisito ESM do NestJS)

---

## Web (`apps/web`)

### Arquitetura: Feature-based + Hooks Layer

```
src/
  app/                              ← Next.js App Router (layout e pages apenas)

  features/
    auth/
      helpers/
        auth.helpers.ts             ← EMAIL_REGEX e validações de auth
      hooks/
        use-auth.ts                 ← estado de sessão, login, logout
    campaigns/
      constants/
        campaign.constants.ts       ← campaignStatusOptions, defaults de formulário
      helpers/
        campaign.helpers.ts         ← toCampaignPayload, draftFromCampaign, createInitialDraft, getStatusLabel, toneForStatus
      hooks/
        use-campaigns.ts            ← fetch, create, update, delete com tratamento de sessão
    ads/
      constants/
        ad.constants.ts             ← FORMAT_LABELS, FORMAT_BADGE_COLORS, FORMAT_GRADIENT

  components/
    layout/
      AppHeader.tsx                 ← header autenticado (logo, user, locale, theme, logout)
      ThemeToggle.tsx
      LocaleSwitcher.tsx
    ui/                             ← primitivos de UI sem lógica de domínio
      Button.tsx
      Card.tsx
      Modal.tsx
      Badge.tsx
      Alert.tsx
      Spinner.tsx
      EmptyState.tsx
      SectionHeading.tsx
      StatCard.tsx
      TabBar.tsx
      Divider.tsx
      Input.tsx                     ← AppInput, AppSelect, AppTextarea, FieldLabel, AppFormHint
      index.ts                      ← re-exporta tudo
    ui.tsx                          ← re-export de components/ui/index (backward compat)

  lib/
    api/
      client.ts                     ← fetch base, DirectCashApiError, ACCESS_TOKEN_STORAGE_KEY
      auth.api.ts
      campaigns.api.ts
      ads.api.ts
      ai.api.ts
      index.ts
    types/
      auth.types.ts
      campaign.types.ts
      ad.types.ts
      ai.types.ts
      index.ts
    helpers/
      cookie.ts                     ← getLocaleCookie (compartilhado entre features)
    format.ts                       ← formatCurrency, formatDate, formatInputDateValue, shiftDate
    directcash-api.ts               ← re-export de lib/api + lib/types (backward compat)
```

### Regras de responsabilidade

| Onde                           | O que vai                                                    |
| ------------------------------ | ------------------------------------------------------------ |
| `lib/helpers/`                 | Utilitários genéricos sem domínio (cookie, string, date)     |
| `lib/types/`                   | Interfaces e tipos de domínio — sem lógica de runtime        |
| `lib/api/`                     | Funções de HTTP — sem estado, sem React                      |
| `features/<domain>/constants/` | Dados estáticos de domínio (labels, cores, opções de select) |
| `features/<domain>/helpers/`   | Transformações e lógica pura do domínio (sem React, sem API) |
| `features/<domain>/hooks/`     | Estado + efeitos colaterais de domínio (usa API + state)     |
| `components/ui/`               | Primitivos de UI reutilizáveis sem lógica de domínio         |
| `components/layout/`           | Componentes de shell da aplicação (header, sidebar)          |
| `components/` (raiz)           | Componentes de page e de domínio                             |

### Regras de importação (dependência unidirecional)

```
lib/ → sem imports de features/ ou components/
features/ → pode importar de lib/
components/ → pode importar de lib/ e features/
app/ → pode importar de components/, features/ e lib/
```

### Padrão de hook de feature

```ts
export function useCampaigns({ token, onSessionExpired }: Options) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleExpired = useCallback((err) => { ... }, [onSessionExpired, t]);
  const load = useCallback(async () => { ... }, [token, handleExpired, t]);
  const create = useCallback(async (payload) => { ... }, [token, load, handleExpired, t]);

  useEffect(() => { void load(); }, [load]);

  return { data, loading, error, setError, create, reload: load };
}
```

---

## Convenções gerais

- **Idioma do domínio:** português
- **Nomenclatura de arquivos:** `kebab-case`
- **Nomenclatura de código:** `camelCase` (variáveis/funções), `PascalCase` (classes/componentes), `UPPER_SNAKE_CASE` (constantes exportadas)
- **Sem comentários desnecessários** no código
- **Commits:** nunca sem confirmação explícita
