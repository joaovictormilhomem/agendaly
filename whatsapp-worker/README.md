# whatsapp-worker

Serviço Node separado que mantém sessões **WhatsApp Web** via [`whatsapp-web.js`](https://github.com/pedroslopez/whatsapp-web.js) (Puppeteer/Chromium) e expõe uma **API HTTP interna** consumida pela API Agendaly. Cada profissional (UUID `userId`) pode ter sua própria sessão e QR Code.

## Por que existe um processo à parte?

O WhatsApp Web exige um navegador estável, armazenamento de sessão e tempo de vida longo. Rodar isso dentro do mesmo processo da API Adonis (com HMR/restarts) é frágil. O worker fica dedicado a isso; a API só chama HTTP com um segredo compartilhado.

## Requisitos

- Node.js 20+ (recomendado LTS)
- Chromium instalado ou baixado pelo Puppeteer (dependência transitiva do `whatsapp-web.js`)
- No Windows, uso normal; em Linux em container costuma ser necessário manter os args `--no-sandbox` já presentes no código.

## Variáveis de ambiente

| Variável | Obrigatória | Descrição |
|----------|-------------|-----------|
| `WHATSAPP_BRIDGE_SECRET` | Sim | Mesmo valor que `WHATSAPP_BRIDGE_SECRET` na API. Enviado como `Authorization: Bearer <segredo>`. |
| `PORT` | Não | Porta HTTP do worker (padrão `3334`). |

Defina o segredo antes de subir:

```bash
# Windows PowerShell
$env:WHATSAPP_BRIDGE_SECRET="troque-por-um-segredo-longo"
npm run dev

# Linux/macOS
export WHATSAPP_BRIDGE_SECRET="troque-por-um-segredo-longo"
npm run dev
```

## Scripts

```bash
npm install   # aplica também patch-package (postinstall)
npm run dev   # node --watch: reinicia ao editar server.js
npm start     # produção simples
```

## API HTTP (uso interno)

Todas as rotas abaixo (exceto `GET /health`) exigem header:

`Authorization: Bearer <WHATSAPP_BRIDGE_SECRET>`

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/health` | Saúde do processo (sem auth). |
| `GET` | `/sessions/:userId` | Estado da sessão: `disconnected`, `qr`, `ready`, etc.; pode incluir `qr_data_url` (data URL) quando em `qr`. |
| `POST` | `/sessions/:userId/start` | Inicia cliente WhatsApp para esse `userId` (gera QR se necessário). |
| `POST` | `/sessions/:userId/logout` | Encerra sessão e remove vínculo no aparelho. |
| `POST` | `/send` | Body JSON: `{ "userId": "<uuid>", "to": "<somente dígitos>", "message": "<texto>" }`. |

Resposta de sucesso em `/send` pode incluir `message_id`, `chat_id` e `digits_used` para diagnóstico.

## Patch em `whatsapp-web.js` (LID / “No LID for user”)

O WhatsApp Web passou a exigir resolução de **LID** para contatos sem conversa. A versão publicada em npm ainda falha em alguns casos. Este pacote inclui:

- **`patches/whatsapp-web.js+1.34.7.patch`** — ajusta `WWebJS.getChat` (fallback com `WAWebContactSyncUtils` + `findOrCreateLatestChat` com `.catch`).
- **`postinstall": "patch-package"`** — reaplica o patch após cada `npm install`.

Se atualizar a versão de `whatsapp-web.js`, pode ser preciso **regenerar o patch** (`npx patch-package whatsapp-web.js`) depois de portar a mesma lógica para o novo arquivo, se o diff não aplicar mais.

## Dados locais

Sessões ficam em `.wwebjs_auth/` e cache em `.wwebjs_cache/` (ignorados no git). Em produção, persista esses diretórios se não quiser pedir QR a cada deploy.

## Ligação com a API Agendaly

Na pasta `api/`, configure no `.env`:

- `WHATSAPP_BRIDGE_URL` — URL base do worker (ex.: `http://127.0.0.1:3334`).
- `WHATSAPP_BRIDGE_SECRET` — idêntico ao do worker.

Sem essas variáveis, a API não chama o worker e as notificações por WhatsApp ficam desligadas (comportamento documentado no painel).

## Aviso

O uso de automação no **WhatsApp Web** pode conflitar com os termos do WhatsApp. Para produção em escala ou compliance, avalie a **WhatsApp Cloud API** oficial.
