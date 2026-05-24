# Agendaly API

API HTTP do Agendaly, construída com **AdonisJS (v7)** + **TypeScript** e **PostgreSQL**.

## O que existe hoje

A API cobre autenticação, gestão de profissionais (SUPERADMIN), perfil e landing, serviços, disponibilidade, slots, agendamentos (público e admin), dashboard, notificações WhatsApp (via worker) e integração com o painel.

Rotas definidas em `start/routes.ts`.

### Resumo por área

| Área | Autenticação | Rotas |
|------|----------------|-------|
| Health | — | `GET /` |
| Auth | cookie + JWT | `POST /api/login`, `POST /api/refresh`, `POST /api/logout`, `PATCH /api/me/senha`, `GET /api/me` |
| Usuários (SUPERADMIN) | JWT | `GET /api/users`, `POST /api/users`, `POST /api/users/impersonate/:slug` |
| Público (`:slug`) | — | `GET /api/public/:slug/perfil`, `servicos`, `slots`; `POST /api/public/:slug/agendar` |
| Admin (`:slug`) | JWT | perfil, serviços, dashboard, agenda, slots, disponibilidade, WhatsApp |

Detalhes de auth e exemplos abaixo; demais handlers em `app/controllers/`.

## Requisitos

- Node.js 20+ (recomendado LTS)
- PostgreSQL
- npm

## Como rodar (dev)

Dentro da pasta `api/`:

```bash
npm install
cp .env.example .env
```

Preencha pelo menos:

- `APP_KEY` (chave forte, >= 32 caracteres)
- `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_DATABASE`
- `JWT_ACCESS_SECRET` (>= 32 caracteres)

Migrations e dados de demonstração (opcional):

```bash
node ace migration:run
node ace db:seed
```

O seeder `database/seeders/user_seeder.ts` cria:

| E-mail | Senha | Perfil | Slug |
|--------|-------|--------|------|
| `superadmin@agendaly.com` | `admin123456` | SUPERADMIN | `superadmin` |
| `prof@agendaly.com` | `prof123456` | PROFISSIONAL | `prof-demo` |

Suba a API:

```bash
npm run dev
```

Por padrão: **http://localhost:3333**

Em desenvolvimento, o CORS aceita qualquer origem com `credentials: true` (`config/cors.ts`), para o front enviar cookies de refresh em `localhost:5173`.

## Scripts úteis

```bash
npm run dev        # servidor com HMR
npm run build      # build para produção
npm start          # inicia em produção (após build)
npm test           # testes
npm run lint       # eslint
npm run typecheck  # tsc --noEmit
npm run format     # prettier
node ace db:seed   # dados de demo
```

## Variáveis de ambiente

Exemplo completo em `.env.example`.

### App

- `TZ`, `PORT`, `HOST`, `NODE_ENV`, `LOG_LEVEL`, `APP_KEY`, `APP_URL`

### Banco (PostgreSQL)

- `DB_CONNECTION`, `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_DATABASE`

### Auth

- `JWT_ACCESS_SECRET`: assina o access token (JWT)
- `JWT_REFRESH_SECRET`: presente no `.env.example`; o refresh atual usa **token opaco em cookie**, não JWT. Mantenha por compatibilidade.

### WhatsApp (opcional)

Integração com **`whatsapp-worker`** (`../whatsapp-worker/README.md`). Sem configurar, o painel indica integração desligada e nenhuma mensagem é enviada.

- `WHATSAPP_BRIDGE_URL` — ex.: `http://127.0.0.1:3334`
- `WHATSAPP_BRIDGE_SECRET` — mesmo valor do worker (Bearer server-to-server)

Rotas admin:

- `GET /api/admin/:slug/whatsapp/status`
- `POST /api/admin/:slug/whatsapp/conectar`
- `POST /api/admin/:slug/whatsapp/desconectar`

Notificações ao cliente: `app/services/notificacao_agendamento_service.ts` + `WhatsappBridgeService`.

## Autenticação

Fluxo pensado para SPA com **cookie httpOnly** no refresh e **JWT no header** no access token.

1. `POST /api/login` com `email` e `password`:
   - Resposta JSON: `{ "token": "<jwt>" }`
   - Cookie `refresh_token` (httpOnly, `SameSite=Lax`, 7 dias)
2. Endpoints protegidos: `Authorization: Bearer <token>`
3. Renovar access token: `POST /api/refresh` **com o cookie** (body vazio; `credentials: 'include'` no browser)
4. Logout: `POST /api/logout` com JWT; revoga sessão e limpa o cookie

Claims do JWT: `role`, `user_id`, `slug`, `email`, `name`, `sid` (id da sessão server-side).

### Endpoints de auth (detalhe)

#### `GET /`

```json
{ "hello": "world" }
```

#### `POST /api/login`

Body:

```json
{ "email": "prof@agendaly.com", "password": "prof123456" }
```

Resposta 200:

```json
{ "token": "eyJhbGciOi..." }
```

+ header `Set-Cookie: refresh_token=...`

Erros: `401` `{ "message": "Credenciais inválidas" }`

#### `POST /api/refresh`

Sem body. Requer cookie `refresh_token`.

Resposta 200:

```json
{ "token": "novo_jwt" }
```

+ novo cookie `refresh_token`

Erros: `401` (`Refresh token ausente`, `Refresh token inválido`, `Sessão inválida`, `Usuário não encontrado`)

#### `POST /api/logout`

Header: `Authorization: Bearer <token>`

Resposta 200:

```json
{ "message": "Logout efetuado" }
```

#### `PATCH /api/me/senha`

Body: `{ "senha_atual": "...", "nova_senha": "..." }`

#### `GET /api/me`

Resposta 200:

```json
{ "id": "<uuid>", "role": "PROFISSIONAL", "slug": "prof-demo", "email": "...", "name": "..." }
```

### SUPERADMIN — usuários

#### `GET /api/users`

Lista profissionais (`role: PROFISSIONAL`).

#### `POST /api/users`

Body:

```json
{
  "name": "Maria",
  "email": "maria@exemplo.com",
  "password": "my-strong-password",
  "slug": "maria-estetica",
  "role": "PROFISSIONAL"
}
```

Resposta `201` com `id`, `name`, `email`, `slug`, `role`, `created_at`.

#### `POST /api/users/impersonate/:slug`

Retorna `{ "token": "<jwt>" }` da profissional (sem novo refresh cookie).

### Público (`/api/public/:slug/...`)

Sem JWT. `:slug` identifica a profissional.

| Método | Rota | Uso |
|--------|------|-----|
| `GET` | `/perfil` | Dados da landing |
| `GET` | `/servicos` | Serviços ativos |
| `GET` | `/slots` | Horários disponíveis (query: serviço, data) |
| `POST` | `/agendar` | Novo agendamento pelo cliente |

### Admin (`/api/admin/:slug/...`)

JWT obrigatório. Acesso ao próprio `slug` ou SUPERADMIN.

| Método | Rota | Uso |
|--------|------|-----|
| `GET` / `PUT` | `/perfil` | Configuração da landing |
| `GET` / `POST` / `PUT` / `DELETE` | `/servicos`, `/servicos/:id` | CRUD serviços |
| `GET` | `/dashboard` | Métricas do painel |
| `GET` | `/agenda` | Listagem (filtros por data/status) |
| `GET` | `/agenda/:id` | Detalhe |
| `POST` | `/agenda/manual` | Agendamento manual |
| `PATCH` | `/agenda/:id/status` | Confirmar / cancelar |
| `GET` | `/slots` | Slots para o admin |
| `GET` / `PUT` | `/disponibilidade` | Grade semanal |
| `GET` | `/whatsapp/status` | Estado da sessão WA |
| `POST` | `/whatsapp/conectar` | Inicia sessão / QR |
| `POST` | `/whatsapp/desconectar` | Encerra sessão |

## Testes

Use banco dedicado (ver comentários em `.env.test` / `.env.example`).

```bash
npm test
```

## Estrutura (alto nível)

- `start/routes.ts` — rotas HTTP
- `app/controllers/` — handlers
- `app/middleware/` — JWT, SUPERADMIN, validação de slug
- `app/services/` — JWT, refresh, slots, notificações WhatsApp
- `app/models/` — Lucid (users, serviços, agendamentos, etc.)
- `database/migrations/` — schema PostgreSQL
- `database/seeders/` — dados de demonstração
