import type { Project } from "../types";

type CatalogEntry = Pick<
  Project,
  | "id"
  | "name"
  | "category"
  | "context"
  | "rank"
  | "summary"
  | "stack"
  | "role"
  | "problem"
  | "solution"
  | "highlights"
  | "outcomes"
> &
  Partial<Pick<Project, "links" | "sources" | "tradeoffs" | "architecture">>;

/** Registros menores usam o mesmo contrato; detalhes só são publicados quando há evidência. */
function entry(item: CatalogEntry): Project {
  return {
    featured: false,
    rankingReason:
      "Ordenação complementar por relevância para backend, integração e amplitude técnica.",
    tags: [],
    images: [],
    links: [],
    tradeoffs: [],
    sources: ["about-me/public/eu-igor/index.md"],
    architecture: {
      title: "Como a solução foi organizada",
      description: item.solution,
      steps: [],
      notes: [],
    },
    ...item,
  };
}

export const catalogProjects: Project[] = [
  entry({
    id: "crm-nocorp",
    name: "CRM de vendas & comissões",
    category: "Backend & Cloud",
    context: "Nocorp · Produto privado",
    rank: 8,
    summary:
      "Gestão de finanças, metas e comissões para uma operação com múltiplas concessionárias.",
    stack: ["NestJS", "PostgreSQL", "Prisma", "React", "Supabase"],
    role: "Construção do CRM e das regras de negócio no contexto da equipe Nocorp.",
    problem:
      "Consolidar operações de unidades diferentes, com comissionamento, metas e acompanhamento de atendimento no mesmo sistema.",
    solution:
      "Um CRM multi-tenant reúne os dados operacionais e traduz as regras comerciais em fluxos, projeções e dashboards de auditoria.",
    highlights: [
      {
        title: "Regras comerciais no centro",
        description:
          "Modelagem de consórcios, comissões, planos de ação e indicadores financeiros.",
      },
      {
        title: "Visibilidade sobre a operação",
        description:
          "Painéis de metas e SLAs permitem acompanhar atendimento humano e por IA.",
      },
    ],
    outcomes: [
      "Utilizado por 5 concessionárias e aproximadamente 100 vendedores, conforme a documentação profissional.",
    ],
  }),
  entry({
    id: "agente-comercial",
    name: "Agente comercial com RAG",
    category: "IA & produtos",
    context: "Nocorp · Produto privado",
    rank: 9,
    summary:
      "Atendimento comercial por WhatsApp com contexto de negócio e acompanhamento em tempo real.",
    stack: ["Node.js", "LLMs", "RAG", "WhatsApp API", "WebSockets", "React"],
    role: "Desenvolvimento do agente, das integrações e da interface de acompanhamento na Nocorp.",
    problem:
      "Atender leads com contexto, encaminhar ações comerciais e permitir que a equipe acompanhe a atuação da IA.",
    solution:
      "Webhooks recebem as interações do WhatsApp; o agente consulta contexto via RAG e conduz o atendimento, enquanto WebSockets atualizam o painel dos vendedores.",
    highlights: [
      {
        title: "Execuções coordenadas",
        description:
          "Controle de claimed runs para evitar que a mesma execução de IA seja assumida simultaneamente.",
      },
      {
        title: "IA dentro da operação",
        description:
          "O atendimento participa do funil de vendas e permanece visível para a equipe comercial.",
      },
    ],
    outcomes: [
      "Atendimento a milhares de leads e conversões autônomas relatadas no currículo.",
    ],
  }),
  entry({
    id: "ingestao-nocorp",
    name: "Pipeline de dados comerciais",
    category: "Backend & Cloud",
    context: "Nocorp · Infraestrutura privada",
    rank: 10,
    summary:
      "Integrações e robôs que abastecem a operação comercial com leads, vendas e comissões.",
    stack: ["Node.js", "Kafka", "Puppeteer", "Playwright", "Docker", "Grafana"],
    role: "Desenvolvimento dos serviços de ingestão e participação na arquitetura orientada a eventos.",
    problem:
      "Trazer dados de portais e APIs externas para o CRM, lidando com falhas parciais e reprocessamento.",
    solution:
      "Serviços conteinerizados coletam dados e os integram ao ecossistema por mensageria. Retentativas e regras de idempotência reduzem o impacto de interrupções e duplicidades.",
    highlights: [
      {
        title: "Processamento desacoplado",
        description:
          "Kafka conecta serviços de ingestão e negócio, permitindo tratar falhas por etapa.",
      },
      {
        title: "Operação observável",
        description:
          "Logs e métricas com Grafana, Prometheus e Loki ajudam a acompanhar a saúde dos serviços.",
      },
    ],
    outcomes: [
      "Rotinas para centenas de leads e milhares de registros de vendas diariamente, segundo o relato profissional.",
    ],
  }),
  entry({
    id: "mcp-vibe-git",
    name: "MCP vibe-git",
    category: "Dev tools",
    context: "Open source · Integração para agentes",
    rank: 11,
    summary:
      "Uma interface MCP para conectar agentes de IA ao fluxo de finalização de entregas com Git.",
    stack: ["Node.js", "MCP", "Git", "GitHub API"],
    role: "Desenvolvimento da integração complementar ao CLI vibe-git.",
    problem:
      "Permitir que agentes utilizem um fluxo estruturado para finalizar alterações e preparar pull requests.",
    solution:
      "A ferramenta vibe_git_finalize_delivery expõe o fluxo de entrega pelo Model Context Protocol.",
    highlights: [
      {
        title: "Um contrato para agentes",
        description:
          "O MCP fornece uma entrada específica para o fluxo de finalização, reaproveitando o contexto de automação do vibe-git.",
      },
    ],
    outcomes: [
      "Integração disponível em um repositório próprio, separada do pacote CLI.",
    ],
    links: [
      {
        label: "Repositório no GitHub",
        url: "https://github.com/igoralbuquerque12/mcp-vibe-git",
        kind: "github",
      },
    ],
  }),
  entry({
    id: "eventos",
    name: "Gestão de eventos",
    category: "Backend & Cloud",
    context: "Pesquisa & desenvolvimento",
    rank: 12,
    summary:
      "Inscrições, ingressos e programação de eventos com integridade nas reservas simultâneas.",
    stack: ["Python", "Django", "Transações"],
    role: "Desenvolvedor backend principal no laboratório de pesquisa.",
    problem:
      "Várias pessoas podem tentar reservar a última vaga ao mesmo tempo. Verificar disponibilidade sem controlar a concorrência permite exceder a capacidade.",
    solution:
      "Implementei controle transacional e bloqueios na reserva, junto aos módulos de usuários, palestrantes, cronogramas e ingressos.",
    highlights: [
      {
        title: "Concorrência como requisito",
        description:
          "A proteção da reserva acontece na operação transacional, mantendo a disponibilidade consistente diante de acessos simultâneos.",
      },
    ],
    outcomes: [
      "Backend com gestão de eventos e tratamento explícito de condições de corrida.",
    ],
  }),
  entry({
    id: "transaction-api",
    name: "Transaction API",
    category: "Backend & Cloud",
    context: "Estudo · Desafio técnico",
    rank: 13,
    summary:
      "Uma API de transações construída para exercitar testes, carga, logs e observabilidade.",
    stack: ["JavaScript", "Jest", "Artillery", "Winston"],
    role: "Implementação de um projeto de estudo baseado em desafio técnico do Itaú.",
    problem:
      "Ir além dos endpoints e investigar como uma API pode ser validada e observada.",
    solution:
      "Combinei testes unitários, experimentos de carga e logs estruturados no desenvolvimento da API.",
    highlights: [
      {
        title: "Qualidade como parte da entrega",
        description:
          "Jest verifica comportamento, Artillery exercita carga e Winston organiza os registros da aplicação.",
      },
    ],
    outcomes: [
      "Projeto de estudo concluído. Não há métricas de benchmark anexadas para publicar resultados de desempenho.",
    ],
    sources: [
      "app/data/otherProjects.ts (inventário anterior, preservado em knowledge-base/SOURCES.md)",
    ],
  }),
  entry({
    id: "diabetes-ml",
    name: "Classificação de diabetes",
    category: "Pesquisa & web",
    context: "Pesquisa acadêmica",
    rank: 14,
    summary:
      "Comparação de classificadores e balanceamento de classes em uma base de indicadores de saúde.",
    stack: ["Python", "Scikit-learn", "TensorFlow", "XGBoost", "CatBoost"],
    role: "Pesquisa em coautoria com Artur Pereira Neto na UNIMONTES.",
    problem:
      "Em uma base com muito mais casos negativos, acurácia isolada pode esconder dificuldade para identificar os indivíduos positivos.",
    solution:
      "O estudo compara modelos com e sem oversampling, utilizando recall como métrica de interesse e uma divisão de treino e teste.",
    highlights: [
      {
        title: "Métrica alinhada ao problema",
        description:
          "O foco no recall aproxima a avaliação do problema dos falsos negativos, em vez de depender apenas da acurácia global.",
      },
      {
        title: "Comparação experimental",
        description:
          "A apresentação examina redes neurais, árvores, florestas, CatBoost e XGBoost em uma base original de 253.680 indivíduos.",
      },
    ],
    outcomes: ["Pesquisa apresentada no 2º Congresso de Educação e Inovação."],
    tradeoffs: [
      "Os resultados se referem à base e ao protocolo do estudo; não constituem validação de um sistema de diagnóstico em produção.",
    ],
    links: [
      {
        label: "Apresentação da pesquisa",
        url: "/documents/research/diabetes-apresentacao.pdf",
        kind: "document",
      },
    ],
    sources: [
      "about-me/public/projetos/artigos/2-uni-congress-apresentation.pdf",
    ],
  }),
  entry({
    id: "dimensionalidade",
    name: "Redução de dimensionalidade",
    category: "Pesquisa & web",
    context: "Pesquisa · ENMC 2024",
    rank: 15,
    summary:
      "Seleção de características para investigar as questões mais relevantes em um teste de adicção à internet.",
    stack: ["Python", "PCA", "Algoritmos genéticos"],
    role: "Participação na pesquisa e apresentação de trabalho em coautoria.",
    problem:
      "Explorar subconjuntos de questões por força bruta se torna custoso à medida que o espaço de combinações cresce.",
    solution:
      "Apliquei técnicas de redução de dimensionalidade e busca heurística para investigar representações mais compactas do instrumento.",
    highlights: [
      {
        title: "Otimização aplicada",
        description:
          "Algoritmos genéticos ajudam a explorar o espaço de características sem depender de enumerar todas as combinações.",
      },
    ],
    outcomes: ["Trabalho apresentado no XXVII ENMC, em outubro de 2024."],
    links: [
      {
        label: "Certificado de apresentação",
        url: "/documents/research/enmc-2024-certificado.pdf",
        kind: "document",
      },
    ],
  }),
  entry({
    id: "biodigestores",
    name: "Dimensionamento de biodigestores",
    category: "Pesquisa & web",
    context: "Pesquisa & desenvolvimento",
    rank: 16,
    summary:
      "Uma ferramenta web para dimensionar biodigestores indianos a partir de parâmetros do usuário.",
    stack: ["React", "Vite", "JavaScript", "Persistência local"],
    role: "Projeto e desenvolvimento da aplicação frontend no laboratório.",
    problem:
      "Traduzir cálculos estruturais em uma experiência acessível para uso no contexto rural.",
    solution:
      "Uma aplicação que roda no navegador, com formulários em etapas, recálculo reativo e armazenamento local dos dados.",
    highlights: [
      {
        title: "Domínio técnico acessível",
        description:
          "A interface organiza a entrada de parâmetros e atualiza os resultados conforme o usuário modifica os valores.",
      },
    ],
    outcomes: [
      "Ferramenta standalone, sem depender de um backend para executar os cálculos.",
    ],
  }),
  entry({
    id: "moviewish",
    name: "MovieWish",
    category: "IA & produtos",
    context: "Projeto mobile",
    rank: 17,
    summary:
      "Descoberta de filmes por gênero, recomendações por afinidade e uma lista para assistir depois.",
    stack: ["Flutter", "NestJS", "API de filmes"],
    role: "Desenvolvimento de aplicação mobile e integração com catálogo de filmes.",
    problem:
      "Facilitar a descoberta de títulos relacionados aos interesses do usuário e organizar o que ele quer assistir.",
    solution:
      "Um app Flutter combina descoberta por gênero, recomendações relacionadas e watchlist, com backend NestJS e integração externa de filmes.",
    highlights: [
      {
        title: "Experiência conectada ao catálogo",
        description:
          "As sugestões permitem explorar novos filmes por afinidade e manter uma lista pessoal.",
      },
    ],
    outcomes: ["Projeto mobile concluído, conforme o inventário anterior."],
    sources: [
      "app/data/otherProjects.ts (inventário anterior, preservado em knowledge-base/SOURCES.md)",
    ],
  }),
  entry({
    id: "ecommerce",
    name: "E-commerce internacional",
    category: "Pesquisa & web",
    context: "Nocorp · Projeto para cliente",
    rank: 18,
    summary:
      "Desenvolvimento de uma loja online com integração à plataforma Wix e alinhamento com cliente estrangeiro.",
    stack: ["React", "JavaScript", "Wix APIs"],
    role: "Desenvolvimento de ponta a ponta e participação em reuniões de requisitos.",
    problem:
      "Transformar requisitos comerciais de um cliente internacional em uma experiência de compra integrada à plataforma existente.",
    solution:
      "Construí a aplicação utilizando React e APIs do Wix, participando do alinhamento técnico e de negócio com o cliente.",
    highlights: [
      {
        title: "Engenharia e comunicação",
        description:
          "A entrega envolveu tanto implementação quanto entendimento direto dos requisitos em reuniões com o cliente estrangeiro.",
      },
    ],
    outcomes: [
      "Experiência de desenvolvimento e comunicação técnica em contexto internacional.",
    ],
  }),
  entry({
    id: "portais-unimontes",
    name: "Portais institucionais UNIMONTES",
    category: "Pesquisa & web",
    context: "Iniciação científica · 2023",
    rank: 19,
    summary:
      "Presença digital para a pós-graduação em Modelagem Computacional e o Núcleo de Planejamento Urbano.",
    stack: ["HTML", "CSS", "JavaScript", "WordPress"],
    role: "Desenvolvimento e manutenção dos dois portais institucionais.",
    problem:
      "Organizar pesquisas, editais e informações acadêmicas em canais institucionais acessíveis.",
    solution:
      "Customização de interfaces responsivas e gestão de conteúdo com WordPress para os dois departamentos.",
    highlights: [
      {
        title: "Informação a serviço da comunidade",
        description:
          "Estruturei páginas e publicação de conteúdo para apoiar a comunicação acadêmica dos departamentos.",
      },
    ],
    outcomes: [
      "Portais do programa de pós-graduação e do NPU desenvolvidos e mantidos no período da bolsa.",
    ],
  }),
  entry({
    id: "tv-boxes",
    name: "TV boxes para inclusão digital",
    category: "Pesquisa & web",
    context: "Colaboração em pesquisa",
    rank: 20,
    summary:
      "Reaproveitamento de TV boxes apreendidas como microcomputadores de baixo custo.",
    stack: ["Hardware", "Reaproveitamento tecnológico", "Pesquisa aplicada"],
    role: "Acadêmico integrante da equipe de pesquisa da UNIMONTES.",
    problem:
      "Investigar como reaproveitar equipamentos apreendidos para ampliar o acesso a recursos de computação.",
    solution:
      "Colaboração no projeto institucional de construção de microcomputadores de baixo custo a partir de TV boxes.",
    highlights: [
      {
        title: "Tecnologia com finalidade social",
        description:
          "A proposta aproxima reutilização de hardware e inclusão digital em um projeto de pesquisa universitário.",
      },
    ],
    outcomes: [
      "Participação registrada na Resolução CEPEx/UNIMONTES nº 830/2025, com período previsto de outubro de 2025 a setembro de 2026.",
    ],
    links: [
      {
        label: "Documento institucional",
        url: "/documents/research/tv-boxes-resolucao.pdf",
        kind: "document",
      },
    ],
    sources: ["about-me/public/projetos/artigos/tv-boxs-project.pdf"],
  }),
];
