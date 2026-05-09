import type { Servico } from "@/types/servico"

export const servicosMock: Servico[] = [
  {
    id: "svc-001",
    nome: "Alongamento em Gel",
    emoji: "💅",
    descricao: "Alongamento completo com gel UV, inclui nail art simples.",
    duracao_minutos: 90,
    preco: 140,
    ativo: true,
  },
  {
    id: "svc-002",
    nome: "Manutenção",
    emoji: "✨",
    descricao: "Manutenção do alongamento existente com retoque de gel.",
    duracao_minutos: 60,
    preco: 90,
    ativo: true,
  },
  {
    id: "svc-003",
    nome: "Nail Art",
    emoji: "🎨",
    descricao: "Arte personalizada nas unhas, por unidade ou kit completo.",
    duracao_minutos: 45,
    preco: 80,
    ativo: true,
  },
  {
    id: "svc-004",
    nome: "Esmaltação em Gel",
    emoji: "🌸",
    descricao: "Esmaltação durável em gel UV, longa duração.",
    duracao_minutos: 60,
    preco: 70,
    ativo: true,
  },
  {
    id: "svc-005",
    nome: "Remoção",
    emoji: "🧼",
    descricao: "Remoção segura de gel ou acrigel sem danificar a unha natural.",
    duracao_minutos: 30,
    preco: 40,
    ativo: false,
  },
]
