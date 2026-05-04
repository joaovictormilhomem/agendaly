-- ==========================================
-- 1. MIGRATION UP (Criação)
-- ==========================================

-- PostgreSQL usa UTF8 por padrão (suporta emojis nativamente)
-- Transações ACID são nativas do motor do PostgreSQL.

-- Criação de Tipos ENUM (PostgreSQL exige que tipos sejam criados antes das tabelas)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('SUPERADMIN', 'PROFISSIONAL');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'appointment_status') THEN
        CREATE TYPE appointment_status AS ENUM ('PENDENTE', 'CONFIRMADO', 'CANCELADO');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'confirmation_status') THEN
        CREATE TYPE confirmation_status AS ENUM ('pendente', 'confirmado_cliente', 'cancelado_cliente', 'cancelado_timeout');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'wa_msg_type') THEN
        CREATE TYPE wa_msg_type AS ENUM ('confirmacao', 'lembranca', 'timeout', 'confirmado', 'desmarcado', 'invalido');
    END IF;
END $$;

-- 1. Profissional
CREATE TABLE profissional (
  id UUID PRIMARY KEY,
  nome VARCHAR(150) NOT NULL,
  email VARCHAR(100) NOT NULL,
  senha_hash VARCHAR(255) NOT NULL,
  slug VARCHAR(50) NOT NULL,
  role user_role DEFAULT 'PROFISSIONAL',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uk_profissional_email UNIQUE (email),
  CONSTRAINT uk_profissional_slug UNIQUE (slug)
);

-- 2. Configuração
CREATE TABLE configuracao (
  id UUID PRIMARY KEY,
  profissional_id UUID NOT NULL,
  nome_exibicao VARCHAR(100),
  imagem_perfil_url VARCHAR(255),
  bio_resumida TEXT,
  cor_tema VARCHAR(7) DEFAULT '#FF007A',
  whatsapp_contato VARCHAR(20) NOT NULL,
  instagram_url VARCHAR(255),
  CONSTRAINT fk_configuracao_profissional FOREIGN KEY (profissional_id) REFERENCES profissional(id) ON DELETE CASCADE,
  CONSTRAINT uk_configuracao_profissional UNIQUE (profissional_id)
);

-- 3. Serviço (Ajustado para Emoji e tipos Booleanos)
CREATE TABLE servico (
  id UUID PRIMARY KEY,
  profissional_id UUID NOT NULL,
  emoji VARCHAR(20) NOT NULL, 
  nome VARCHAR(100) NOT NULL,
  preco DECIMAL(10,2) NOT NULL,
  duracao_minutos INT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  deleted_at TIMESTAMP WITH TIME ZONE NULL,
  CONSTRAINT fk_servico_profissional FOREIGN KEY (profissional_id) REFERENCES profissional(id)
);

-- 4. Disponibilidade
CREATE TABLE disponibilidade_semanal (
  id UUID PRIMARY KEY,
  profissional_id UUID NOT NULL,
  dia_semana INT NOT NULL,
  hora_inicio TIME NOT NULL,
  hora_fim TIME NOT NULL,
  tempo_intervalo INT DEFAULT 30,
  CONSTRAINT fk_disponibilidade_profissional FOREIGN KEY (profissional_id) REFERENCES profissional(id)
);

-- 5. Bloqueio
CREATE TABLE bloqueio_agenda (
  id UUID PRIMARY KEY,
  profissional_id UUID NOT NULL,
  data_hora_inicio TIMESTAMP WITH TIME ZONE NOT NULL,
  data_hora_fim TIMESTAMP WITH TIME ZONE NOT NULL,
  descricao VARCHAR(255),
  CONSTRAINT fk_bloqueio_profissional FOREIGN KEY (profissional_id) REFERENCES profissional(id)
);

-- 6. Agendamento (Índices e Valores Default)
CREATE TABLE agendamento (
  id UUID PRIMARY KEY,
  profissional_id UUID NOT NULL,
  servico_id UUID NOT NULL,
  cliente_nome VARCHAR(150) NOT NULL,
  cliente_whatsapp VARCHAR(20) NOT NULL DEFAULT 'não informado',
  data_hora_inicio TIMESTAMP WITH TIME ZONE NOT NULL,
  data_hora_fim TIMESTAMP WITH TIME ZONE NOT NULL,
  status appointment_status DEFAULT 'PENDENTE',
  notas_internas TEXT NULL,
  lembrete_enviado BOOLEAN DEFAULT FALSE,
  status_confirmacao confirmation_status DEFAULT 'pendente',
  reminder_sent_at TIMESTAMP WITH TIME ZONE NULL,
  cliente_resposta VARCHAR(50) NULL,
  cliente_resposta_at TIMESTAMP WITH TIME ZONE NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_agendamento_profissional FOREIGN KEY (profissional_id) REFERENCES profissional(id),
  CONSTRAINT fk_agendamento_servico FOREIGN KEY (servico_id) REFERENCES servico(id)
);

-- 7. Log WhatsApp (PostgreSQL usa SERIAL para auto incremento)
CREATE TABLE whatsapp_mensagem_log (
  id SERIAL PRIMARY KEY,
  agendamento_id UUID NOT NULL,
  tipo wa_msg_type,
  profissional_id UUID NOT NULL,
  cliente_telefone VARCHAR(20) NOT NULL,
  destinatario_tipo VARCHAR(20),
  mensagem TEXT NOT NULL,
  meta_message_id VARCHAR(100),
  status_envio VARCHAR(20) DEFAULT 'enviado',
  erro_mensagem TEXT NULL,
  tentativas_envio INT DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (agendamento_id) REFERENCES agendamento(id),
  FOREIGN KEY (profissional_id) REFERENCES profissional(id)
);

-- ==========================================
-- 8. ÍNDICES OBRIGATÓRIOS (Performance)
-- ==========================================
-- email e slug já indexados pelos UNIQUE
CREATE INDEX idx_agendamento_status ON agendamento(status);
CREATE INDEX idx_agendamento_lembrete_enviado ON agendamento(lembrete_enviado);
CREATE INDEX idx_agendamento_profissional_id ON agendamento(profissional_id);
CREATE INDEX idx_servico_profissional_id ON servico(profissional_id);
CREATE INDEX idx_whatsapp_log_agendamento ON whatsapp_mensagem_log(agendamento_id);

-- ==========================================
-- 9. MIGRATION DOWN (Reversão)
-- ==========================================
/*
DROP TABLE IF EXISTS whatsapp_mensagem_log;
DROP TABLE IF EXISTS agendamento;
DROP TABLE IF EXISTS bloqueio_agenda;
DROP TABLE IF EXISTS disponibilidade_semanal;
DROP TABLE IF EXISTS servico;
DROP TABLE IF EXISTS configuracao;
DROP TABLE IF EXISTS profissional;
DROP TYPE IF EXISTS wa_msg_type;
DROP TYPE IF EXISTS confirmation_status;
DROP TYPE IF EXISTS appointment_status;
DROP TYPE IF EXISTS user_role;
*/
