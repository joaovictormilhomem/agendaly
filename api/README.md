# Agendaly API

API HTTP do Agendaly, construída com **AdonisJS (v7)** + **TypeScript** e **PostgreSQL**.

## Status (o que existe hoje)

No momento, a API expõe endpoints de **autenticação via JWT + refresh token** e um endpoint para consultar o usuário autenticado:

- `GET /` (healthcheck)
- `POST /api/login`
- `POST /api/refresh`
- `POST /api/logout` (requer JWT)
- `GET /api/me` (requer JWT)
- `POST /api/users` (requer JWT + role `SUPERADMIN`)

As rotas ficam em `start/routes.ts`.

## Requisitos

- Node.js (recomendado LTS)
- PostgreSQL
- npm

## Como rodar (dev)

Dentro da pasta `api/`:

```bash
npm install
```

Crie seu `.env`:

```bash
copy .env.example .env
```

Preencha pelo menos:

- `APP_KEY` (use uma chave forte, >= 32 chars)
- `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_DATABASE`
- `JWT_ACCESS_SECRET` (>= 32 chars)

Rode as migrations:

```bash
node ace migration:run
```

Suba a API:

```bash
npm run dev
```

Por padrão:

- **URL**: `http://localhost:3333`

## Scripts úteis

```bash
npm run dev        # servidor com HMR
npm run build      # build para produção
npm start          # inicia em produção (após build)
npm test           # testes
npm run lint       # eslint
npm run typecheck  # tsc --noEmit
npm run format     # prettier
```

## Variáveis de ambiente

Exemplo completo em `.env.example`.

### App

- `TZ`: timezone (ex: `UTC`)
- `PORT`: porta HTTP (ex: `3333`)
- `HOST`: host de bind (ex: `localhost`)
- `NODE_ENV`: `development` | `production` | `test`
- `LOG_LEVEL`: `info`, `debug`, etc.
- `APP_KEY`: chave do app (obrigatória)
- `APP_URL`: URL base (ex: `http://${HOST}:${PORT}`)

### Banco (PostgreSQL)

- `DB_CONNECTION`: `pg`
- `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_DATABASE`

### Auth (JWT)

- `JWT_ACCESS_SECRET`: segredo usado para assinar o access token (JWT)
- `JWT_REFRESH_SECRET`: atualmente presente no `.env.example`, mas o fluxo de refresh **usa token opaco persistido** (não JWT). Mantenha definido por compatibilidade/expansão futura.

## Autenticação

O fluxo atual é:

1. `POST /api/login` retorna:
   - `token`: JWT (access token)
   - `refresh_token`: token opaco para rotação
2. Para endpoints protegidos, envie o header:
   - `Authorization: Bearer <token>`
3. Quando o access token expirar, use `POST /api/refresh` com `refresh_token` para obter um novo par.
4. Para encerrar, `POST /api/logout` (requer JWT) e envie o `refresh_token` para revogar também.

## Endpoints

### Healthcheck

#### `GET /`

Resposta:

```json
{ "hello": "world" }
```

### Login

#### `POST /api/login`

Body (JSON):

```json
{ "email": "prof@exemplo.com", "password": "my-password" }
```

Resposta 200:

```json
{
  "token": "eyJhbGciOi...",
  "refresh_token": "opaque_refresh_token"
}
```

O `token` (JWT) contém os dados necessários para o frontend decidir o redirecionamento, via claims:

- `role`: `SUPERADMIN` | `PROFISSIONAL`
- `user_id`: UUID do usuário
- `slug`: slug do usuário
- `email`: email do usuário
- `name`: user name
- `sid`: id da sessão (server-side)

Erros comuns:

- `401`: `{ "message": "Credenciais inválidas" }`

### Refresh

#### `POST /api/refresh`

Body (JSON):

```json
{ "refresh_token": "opaque_refresh_token" }
```

Resposta 200:

```json
{
  "token": "novo_jwt",
  "refresh_token": "novo_refresh_token"
}
```

Erros comuns:

- `401`: `{ "message": "Refresh token inválido" }`
- `401`: `{ "message": "Sessão inválida" }`
- `401`: `{ "message": "Usuário não encontrado" }`

### Logout (protegido)

#### `POST /api/logout`

Headers:

- `Authorization: Bearer <token>`

Body (JSON):

```json
{ "refresh_token": "opaque_refresh_token" }
```

Resposta 200:

```json
{ "message": "Logout efetuado" }
```

### Me (protegido)

#### `GET /api/me`

Headers:

- `Authorization: Bearer <token>`

Resposta 200:

```json
{ "id": "<uuid>", "role": "SUPERADMIN", "slug": "<slug>", "email": "user@exemplo.com", "name": "Name" }
```

Resposta 401:

```json
{ "message": "Unauthorized" }
```

### Criar usuário (protegido - SUPERADMIN)

#### `POST /api/users`

Headers:

- `Authorization: Bearer <token>`

Body (JSON):

```json
{
  "name": "Maria",
  "email": "maria@exemplo.com",
  "password": "my-strong-password",
  "slug": "maria-estetica",
  "role": "PROFISSIONAL"
}
```

Resposta 201:

```json
{
  "id": "<uuid>",
  "name": "Maria",
  "email": "maria@exemplo.com",
  "slug": "maria-estetica",
  "role": "PROFISSIONAL",
  "created_at": "2026-01-01T00:00:00.000Z"
}
```

Erros comuns:

- `403`: `{ "message": "Acesso restrito a SUPERADMIN" }`
- `401`: `{ "message": "Missing Bearer token" }` / `{ "message": "Invalid or expired token" }`
- `422`: erros de validação (ex.: email/slug duplicados)

## Testes

O arquivo `.env.test` já documenta a intenção de usar um **banco dedicado** para `npm test`.

```bash
npm test
```

## Estrutura (alto nível)

- `start/routes.ts`: rotas HTTP
- `app/controllers/`: handlers dos endpoints
- `app/middleware/`: autenticação/validações de request
- `database/migrations/`: migrations do Postgres (Lucid)
- `app/services/`: JWT e refresh token

