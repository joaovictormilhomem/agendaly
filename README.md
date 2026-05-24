# Agendaly

Monorepo do produto: API (**AdonisJS**), frontend (**Vite + React**) e serviço **WhatsApp Web**.

| Pasta | Descrição | Documentação |
|-------|-----------|----------------|
| `api/` | API HTTP, JWT, agenda, notificações | [api/README.md](api/README.md) |
| `front/` | Painel admin, master e páginas públicas | [front/README.md](front/README.md) |
| `whatsapp-worker/` | Sessão WhatsApp Web + bridge HTTP para a API | [whatsapp-worker/README.md](whatsapp-worker/README.md) |
| `db/` | Referência de schema SQL (legado); migrations oficiais em `api/database/migrations/` | [db/docs.md](db/docs.md) |

## Desenvolvimento local

### 1. PostgreSQL

Crie um banco (ex.: `agendaly`) e anote host, porta, usuário e senha.

### 2. API

```bash
cd api
npm install
cp .env.example .env
# Preencha APP_KEY, DB_* e JWT_ACCESS_SECRET
node ace migration:run
node ace db:seed    # opcional: superadmin + profissional demo
npm run dev
```

API em **http://localhost:3333**. Credenciais do seed: [api/README.md](api/README.md#como-rodar-dev).

### 3. Frontend

```bash
cd front
npm install
npm run dev
```

Painel em **http://localhost:5173**. Variáveis em `.env.development` (`VITE_API_BASE_URL`, `VITE_USE_MOCKS`).

### 4. WhatsApp (opcional)

Para mensagens reais no painel e notificações automáticas:

```bash
cd whatsapp-worker
npm install
export WHATSAPP_BRIDGE_SECRET="um-segredo-longo"
npm run dev
```

Na API (`api/.env`), defina `WHATSAPP_BRIDGE_URL` (ex.: `http://127.0.0.1:3334`) e o mesmo `WHATSAPP_BRIDGE_SECRET`.

### Modo rápido sem API

No front: `VITE_USE_MOCKS=true npm run dev` — credenciais em [front/README.md](front/README.md).
