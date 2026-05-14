# Agendaly

Monorepo do produto: API (**AdonisJS**), frontend (**Vite + React**) e serviço **WhatsApp Web**.

| Pasta | Descrição | Documentação |
|-------|-------------|----------------|
| `api/` | API HTTP, JWT, agenda, notificações | [api/README.md](api/README.md) |
| `front/` | Painel admin e páginas públicas | [front/README.md](front/README.md) |
| `whatsapp-worker/` | Sessão WhatsApp Web + bridge HTTP para a API | [whatsapp-worker/README.md](whatsapp-worker/README.md) |

Fluxo típico em desenvolvimento: subir PostgreSQL, `api` (`npm run dev`), `front` (`npm run dev`); se quiser mensagens automáticas no WhatsApp, suba também o **whatsapp-worker** e configure as variáveis na API conforme `api/.env.example`.
