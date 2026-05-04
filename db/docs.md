/** 
Requisitos:

Charset utf8mb4 em todas as tabelas (suporte a emojis)

Índices em: email, slug, profissional_id, status, lembrete_enviado

Transações ACID obrigatórias para agendamentos

Migrations reversíveis (up/down)

Critério de Aceitação:

Schema validado contra dados de teste

Migrations up/down funcionam sem erro

Emoji em nome de serviço salva e retorna corretamente

// Colunas WhatsApp presentes e com valores default corretos 

*/