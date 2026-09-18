import type { Certification, Experience, Publication } from "./types";

export const profile = {
  name: "Igor Albuquerque",
  fullName: "Igor Costa Lins de Albuquerque",
  role: "Engenheiro de Software",
  focus: "Backend · Cloud · Inteligência Artificial",
  location: "Montes Claros, MG · Brasil",
  email: "igorcostalins2005@gmail.com",
  github: "https://github.com/igoralbuquerque12",
  linkedin: "https://www.linkedin.com/in/igor-albuquerque-30b751304/",
  website: "https://www.igoralbuquerque.site",
  portrait: "/images/profile/igor.webp",
  cv: { url: "/cv/igor-albuquerque.pdf", filename: "Igor-Albuquerque-CV.pdf" },
  introduction:
    "Construo backends, conecto serviços e transformo regras de negócio complexas em produtos que funcionam no dia a dia. Do primeiro desenho à operação em produção.",
  about:
    "Meu trabalho começa entendendo o problema. Depois vêm as decisões: como modelar os dados, onde colocar uma fila, como lidar com uma falha e o que monitorar. Atuo de ponta a ponta, com foco em backend e arquitetura — e com a visão de produto de quem também constrói a interface e conversa com o cliente.",
  languages: "Português nativo · Inglês avançado",
  education: {
    degree: "Bacharelado em Sistemas de Informação",
    institution: "Universidade Estadual de Montes Claros",
    acronym: "UNIMONTES",
    period: "2023 — 2026",
    status: "Em conclusão · previsão: dez. 2026",
    description:
      "Uma base em computação que levo para a prática: engenharia de software, modelagem de dados, otimização e pesquisa aplicada em inteligência artificial.",
  },
};

export const experiences: Experience[] = [
  {
    id: "nocorp",
    company: "Nocorp",
    role: "Engenheiro de Software Júnior",
    period: "JUN 2025 — ATUAL",
    current: true,
    description:
      "Construção de um ecossistema de vendas: CRM, integrações, agentes de IA e serviços orientados a eventos. Participo do levantamento de requisitos às decisões de arquitetura e à operação em produção.",
    highlights: [
      "CRM multi-tenant utilizado por 5 concessionárias e cerca de 100 vendedores.",
      "Kafka, retries e idempotência no processamento diário de vendas e comissões.",
      "Agente comercial com RAG e WhatsApp, acompanhamento via WebSockets e observabilidade com Grafana, Prometheus e Loki.",
    ],
    stack: ["NestJS", "Kafka", "PostgreSQL", "AWS", "Docker"],
  },
  {
    id: "freelance",
    company: "Projetos independentes",
    role: "Engenheiro de Software Full-Stack",
    period: "MAI—OUT 2025 · MAI—AGO 2026",
    description:
      "Responsabilidade integral por dois produtos sob demanda: entender a operação, propor a solução e construir o sistema que passa a fazer parte do trabalho do cliente.",
    highlights: [
      "Grau Técnico: automação acadêmica e financeira, milhares de cobranças e integração com sistema legado por RPA.",
      "PixelPhone: análise de chamadas com IA, avaliação de atendimento e cobrança por consumo.",
    ],
    stack: ["NestJS", "Next.js", "Python", "BullMQ", "Redis"],
  },
  {
    id: "lica",
    company: "Laboratório de Inteligência Computacional Aplicada",
    role: "Estagiário de Pesquisa & Desenvolvimento",
    period: "JAN 2024 — MAI 2025",
    description:
      "A pesquisa me ensinou a testar hipóteses e medir resultados. Apliquei esse cuidado tanto em modelos de machine learning quanto em sistemas web com regras de concorrência.",
    highlights: [
      "Backend Django para reservas de eventos com controle transacional de vagas.",
      "Modelagem preditiva em saúde, redução de dimensionalidade e algoritmos genéticos.",
      "Ferramenta React para dimensionamento de biodigestores no contexto rural.",
    ],
    stack: ["Python", "Django", "React", "Machine Learning"],
  },
  {
    id: "unimontes",
    company: "UNIMONTES",
    role: "Bolsista de Iniciação Científica · Desenvolvimento Web",
    period: "JUL — DEZ 2023",
    description:
      "Meus primeiros projetos institucionais: construção e manutenção dos portais do programa de pós-graduação em Modelagem Computacional e Sistemas e do Núcleo de Planejamento Urbano.",
    highlights: [
      "Interfaces responsivas e publicação de pesquisas, editais e informações acadêmicas.",
    ],
    stack: ["JavaScript", "HTML & CSS", "WordPress"],
  },
];

export const expertise = [
  {
    title: "Backend & arquitetura",
    text: "Node.js, NestJS, Python, Django, FastAPI, tRPC, DDD e sistemas multi-tenant.",
  },
  {
    title: "Dados & eventos",
    text: "PostgreSQL, MongoDB, Prisma, Redis, Kafka, BullMQ e AWS SQS.",
  },
  {
    title: "Cloud & operação",
    text: "AWS, Docker, Traefik, CI/CD, Grafana, Prometheus e Loki.",
  },
  {
    title: "IA & produto",
    text: "LLMs, RAG, processamento de áudio, React, Next.js e machine learning.",
  },
];

export const publications: Publication[] = [
  {
    id: "dimensionalidade",
    type: "TRABALHO APRESENTADO · 2024",
    title: "Menos questões. Mais informação relevante.",
    description:
      "Pesquisa sobre redução de dimensionalidade de um teste de adicção à internet, explorando seleção de características e otimização para identificar as questões mais relevantes do instrumento.",
    venue: "XXVII Encontro Nacional de Modelagem Computacional",
    tags: ["Algoritmos genéticos", "Otimização"],
    url: "/documents/research/enmc-2024-certificado.pdf",
    linkLabel: "Ver certificado de apresentação",
  },
  {
    id: "diabetes",
    type: "PESQUISA PUBLICADA",
    title: "O que muda quando os dados estão desbalanceados?",
    description:
      "Comparação de modelos na classificação de indivíduos diabéticos e não diabéticos. O estudo investiga como o balanceamento de classes afeta o recall e a identificação dos casos positivos.",
    venue: "2º Congresso de Educação e Inovação",
    tags: ["Machine Learning", "Saúde"],
    url: "/documents/research/diabetes-apresentacao.pdf",
    linkLabel: "Ler apresentação",
  },
  {
    id: "tv-boxes",
    type: "COLABORAÇÃO EM PESQUISA · 2025—2026",
    title: "Uma nova vida para hardware apreendido.",
    description:
      "Participação no projeto de pesquisa que propõe transformar TV boxes apreendidas em microcomputadores de baixo custo, aproximando reaproveitamento tecnológico e inclusão digital.",
    venue: "UNIMONTES · Projeto de pesquisa",
    tags: ["Inclusão digital", "Reuso de hardware"],
    url: "/documents/research/tv-boxes-resolucao.pdf",
    linkLabel: "Ver documento institucional",
  },
];

/** A seção só aparece quando habilitada E houver itens. */
export const certifications: { enabled: boolean; items: Certification[] } = {
  enabled: false,
  items: [],
};
