# Agendaly — Frontend

Interface web do Agendaly, construída com Vite + React 19 + TypeScript.

## Pré-requisitos

- Node.js 20+
- npm 10+
- API do Agendaly rodando em `http://localhost:3333` (veja `../api/README.md`)
- Para **WhatsApp real** no painel da profissional: API com `WHATSAPP_BRIDGE_URL` / `WHATSAPP_BRIDGE_SECRET` e o processo **`whatsapp-worker`** ativos (veja `../whatsapp-worker/README.md`). Com mocks (`VITE_USE_MOCKS=true`), a página WhatsApp usa respostas simuladas.

## Instalação

```bash
npm install
```

## Variáveis de ambiente

Copie o arquivo de exemplo e ajuste se necessário:

```bash
cp .env .env.local
```

| Variável | Descrição | Padrão |
|---|---|---|
| `VITE_API_BASE_URL` | URL base da API | `http://localhost:3333` |
| `VITE_USE_MOCKS` | Usa MSW para mockar as requisições | `false` |

## Rodando

### Com a API real

```bash
npm run dev
```

Acesse [http://localhost:5173](http://localhost:5173).

### Com mocks (sem precisar da API)

```bash
VITE_USE_MOCKS=true npm run dev
```

Credenciais disponíveis nos mocks:

| E-mail | Senha | Perfil |
|---|---|---|
| `admin@agendaly.com` | `Admin1234` | SuperAdmin |
| `profissional@naile.com` | `Profissional1` | Profissional |

## Build

```bash
npm run build
```

O output fica em `dist/`. Para pré-visualizar o build:

```bash
npm run preview
```
