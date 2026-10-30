# Agendaly — Frontend

Interface web do Agendaly: painel da profissional, área master (SUPERADMIN), landing e agendamento público. Stack: **Vite + React 19 + TypeScript**.

## Pré-requisitos

- Node.js 20+
- npm 10+
- API em `http://localhost:3333` ([api/README.md](../api/README.md)), **ou** mocks (`VITE_USE_MOCKS=true`)
- WhatsApp real no painel: API com `WHATSAPP_BRIDGE_*` + processo [whatsapp-worker](../whatsapp-worker/README.md)

## Instalação

```bash
npm install
```

## Variáveis de ambiente

O projeto já inclui `.env` e `.env.development` com valores locais. Para sobrescrever, crie `.env` (ignorado pelo git se configurado) ou edite `.env.development`.

| Variável | Descrição | Padrão no repo |
|----------|-----------|----------------|
| `VITE_API_BASE_URL` | URL base da API | `http://localhost:3333` |
| `VITE_USE_MOCKS` | MSW mocka requisições | `false` |

Se `VITE_API_BASE_URL` não estiver definida, o cliente HTTP usa fallback `http://localhost:3000` em `src/api/client.ts`.

### Proxy no Vite

Em dev, `vite.config.ts` encaminha `/api` para `http://localhost:3333`. O app usa URL absoluta da API (`VITE_API_BASE_URL`); o proxy ajuda se você apontar chamadas relativas no futuro.

Requisições autenticadas usam `withCredentials: true` para o cookie `refresh_token` da API no fluxo de refresh.

## Rodando

### Com a API real

```bash
npm run dev
```

Acesse [http://localhost:5173](http://localhost:5173).

Login com dados do seed da API ([api/README.md](../api/README.md)):

| E-mail | Senha | Perfil |
|--------|-------|--------|
| `superadmin@agendaly.com` | `admin123456` | SUPERADMIN → `/master` |
| `prof@agendaly.com` | `prof123456` | PROFISSIONAL → `/admin/prof-demo` |

Landing pública da demo: [http://localhost:5173/prof-demo](http://localhost:5173/prof-demo)

### Com mocks (sem API)

```bash
VITE_USE_MOCKS=true npm run dev
```

Credenciais **apenas nos mocks** (diferentes do seed da API):

| E-mail | Senha | Perfil |
|--------|-------|--------|
| `admin@agendaly.com` | `Admin1234` | SUPERADMIN |
| `profissional@naile.com` | `Profissional1` | PROFISSIONAL (`naile-studio`) |

## Rotas principais

| Caminho | Descrição |
|---------|-----------|
| `/login` | Login |
| `/master/dashboard` | Painel SUPERADMIN |
| `/admin/:slug/dashboard` | Dashboard da profissional |
| `/admin/:slug/agenda` | Agenda |
| `/admin/:slug/servicos` | Serviços |
| `/admin/:slug/disponibilidade` | Disponibilidade |
| `/admin/:slug/whatsapp` | Conexão WhatsApp |
| `/admin/:slug/personalizar` | Landing / identidade |
| `/:slug` | Landing pública |
| `/:slug/agendar` | Fluxo de agendamento |

## Build

```bash
npm run build
```

Output em `dist/`. Pré-visualizar:

```bash
npm run preview
```
