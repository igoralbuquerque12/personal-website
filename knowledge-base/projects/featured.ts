import type { Project } from "../types";

const base = "about-me/public/eu-igor/index.md";

export const featuredProjects: Project[] = [
  {
    id: "mailworks",
    name: "MailWorks",
    category: "Backend & Cloud",
    context: "Open source · Arquitetura AWS",
    rank: 1,
    featured: true,
    rankingReason:
      "Case mais completo de backend: eventos, cloud, isolamento de clientes, tratamento de falhas e discussão explícita de trade-offs.",
    summary:
      "Uma API de e-mails que separa receber uma requisição de entregar uma mensagem. Assíncrona, multi-tenant e rastreável.",
    stack: [
      "NestJS",
      "TypeScript",
      "AWS Lambda",
      "SQS",
      "SES",
      "PostgreSQL",
      "Prisma",
      "CloudWatch",
    ],
    tags: ["Event-driven", "Serverless", "Multi-tenant"],
    role: "Concepção e desenvolvimento da API, modelagem de dados, workers e infraestrutura serverless.",
    problem:
      "Enviar e-mail dentro de uma requisição HTTP acopla a experiência do cliente à latência e às falhas do provedor. Em campanhas, esse desenho também dificulta acompanhar o que foi enviado e recuperar falhas individuais.",
    solution:
      "Modelei cada envio como um job persistido. A API identifica o tenant, registra a intenção e publica no SQS; uma Lambda independente faz a entrega. O estado do job permite consultar o resultado sem manter a conexão HTTP aberta.",
    highlights: [
      {
        title: "Falhas isoladas por mensagem",
        description:
          "Partial Batch Response devolve ao SQS apenas os itens que falharam. Após as tentativas configuradas, a DLQ recebe a mensagem e um alarme CloudWatch sinaliza o problema.",
      },
      {
        title: "Isolamento desde a entrada",
        description:
          "Uma API key armazenada como hash SHA-256 resolve o tenant e seu provider. Templates, campanhas e consultas de status respeitam esse contexto.",
      },
      {
        title: "Providers que podem mudar",
        description:
          "Factory e adapters encapsulam SES e SMTP. A escolha do provedor é resolvida por cliente, sem espalhar condicionais pelo domínio.",
      },
      {
        title: "Estado de entrega explícito",
        description:
          "O ciclo PENDING → PROCESSING → SENT/FAILED dá rastreabilidade ao processamento. Jobs já marcados como SENT são ignorados em novas entregas da fila.",
      },
      {
        title: "Um pipeline, diferentes usos",
        description:
          "Envios unitários, templates, campanhas e códigos 2FA reutilizam a infraestrutura assíncrona. Os desafios 2FA têm hash, validade e registro de consumo.",
      },
    ],
    architecture: {
      title: "Receber rápido. Processar em separado. Rastrear até o fim.",
      description:
        "A fronteira da fila separa a API do trabalho de rede. PostgreSQL guarda o estado; SQS transporta a intenção; o worker resolve o provider e executa a entrega.",
      steps: [
        { label: "API Gateway", detail: "Entrada HTTP" },
        { label: "Lambda · NestJS", detail: "Tenant + job no PostgreSQL" },
        { label: "SQS", detail: "Fila de entrega" },
        { label: "Lambda Worker", detail: "Processa cada job" },
        { label: "SES / SMTP", detail: "Provider por tenant" },
      ],
      notes: [
        "API retorna 202 após publicar na fila.",
        "Falhas por item → retry → DLQ → alarme CloudWatch.",
        "Campanhas agregam os estados dos jobs; o consumidor consulta o progresso.",
      ],
    },
    outcomes: [
      "Envio de e-mail desacoplado da duração da requisição HTTP.",
      "Status consultável por job e por campanha.",
      "Infraestrutura descrita com Serverless Framework e provedores substituíveis.",
    ],
    tradeoffs: [
      "Persistir o job e publicar no SQS são operações separadas. Transactional Outbox é uma evolução documentada para fechar essa janela de falha.",
      "Checar o estado SENT reduz reenvios, mas não garante exactly-once se o provider entregar e a atualização do banco falhar.",
      "Separar filas por prioridade e aceitar idempotency key na entrada HTTP são próximos passos documentados, ainda não funcionalidades prontas.",
    ],
    images: [
      {
        src: "/images/projects/mailworks/brand.webp",
        alt: "Identidade visual laranja do MailWorks",
        caption: "Identidade visual do MailWorks.",
        kind: "logo",
      },
    ],
    links: [
      {
        label: "Repositório no GitHub",
        url: "https://github.com/igoralbuquerque12/MailWorks-API",
        kind: "github",
      },
    ],
    sources: [base, "about-me/public/projetos/mail-work/README.md"],
  },
  {
    id: "care-copilot",
    name: "Care Copilot",
    category: "IA & produtos",
    context: "Open source · SaaS clínico",
    rank: 2,
    featured: true,
    rankingReason:
      "Une áudio no navegador, filas serverless, contratos de IA e consistência transacional em um produto completo.",
    summary:
      "A conversa da consulta vira uma anamnese estruturada, com processamento de áudio e IA em segundo plano.",
    stack: [
      "Next.js",
      "tRPC",
      "PostgreSQL",
      "Prisma",
      "Supabase",
      "QStash",
      "Groq",
      "ONNX",
    ],
    tags: ["Áudio em tempo real", "IA estruturada", "Transações"],
    role: "Desenvolvimento full-stack, pipeline de voz, integrações de IA e organização do domínio clínico.",
    problem:
      "Registrar uma consulta exige atenção e gera trabalho administrativo. Processar todo o áudio em uma única requisição ainda cria espera, limita o tamanho da sessão e prende a interface à inferência.",
    solution:
      "Dividi o fluxo em pequenos lotes: o navegador detecta fala, a API recebe o áudio e um worker transcreve e consolida os campos clínicos. O profissional acompanha as atualizações e revisa o resultado antes de finalizar.",
    highlights: [
      {
        title: "Inteligência já no navegador",
        description:
          "VAD com ONNX identifica atividade de voz localmente. Lotes WAV com sobreposição preservam o contexto entre trechos e permitem processar a consulta progressivamente.",
      },
      {
        title: "IA com contrato de saída",
        description:
          "A transcrição passa por extração estruturada e validação Zod. O formulário atual participa do merge para incorporar novas informações sem simplesmente concatenar respostas.",
      },
      {
        title: "Créditos e prontuário na mesma transação",
        description:
          "O débito, a atualização do formulário e a marcação do lote processado são persistidos juntos. O processamento fica vinculado a um registro de lote idempotente.",
      },
      {
        title: "Contexto clínico longitudinal",
        description:
          "Anamneses anteriores alimentam uma análise separada, com contexto limitado e suporte a múltiplos provedores. As credenciais cadastradas são cifradas com AES-256-GCM.",
      },
    ],
    architecture: {
      title: "Da fala ao dado estruturado, lote a lote.",
      description:
        "O fluxo pesado sai da requisição do usuário. Um adapter permite usar QStash em produção e execução inline em desenvolvimento, preservando o contrato do domínio.",
      steps: [
        { label: "VAD + WAV", detail: "Captura no navegador" },
        { label: "Ingestão", detail: "Storage privado + lote" },
        { label: "QStash", detail: "Worker assíncrono" },
        { label: "Whisper + LLM", detail: "Transcrição e extração" },
        { label: "Prisma + Realtime", detail: "Transação e atualização" },
      ],
      notes: [
        "Dados escopados ao perfil autenticado.",
        "URLs assinadas para áudio; remoção do arquivo após processamento bem-sucedido.",
        "O profissional revisa o conteúdo gerado antes de concluir o registro.",
      ],
    },
    outcomes: [
      "Preenchimento progressivo sem interromper a captura da consulta.",
      "Histórico, análise e contexto reunidos no perfil do paciente.",
      "Separação entre rotas tRPC, serviços de negócio e integrações externas.",
    ],
    tradeoffs: [
      "A qualidade do merge depende da transcrição e do modelo; revisão profissional faz parte do fluxo do produto.",
      "O desenho considera isolamento por profissional. Controles institucionais e políticas de retenção exigem evolução específica para cada contexto de uso.",
    ],
    images: [
      {
        src: "/images/projects/care-copilot/brand.webp",
        alt: "Símbolo verde do Care Copilot",
        caption: "Identidade visual do Care Copilot.",
        kind: "logo",
      },
    ],
    links: [
      {
        label: "Repositório no GitHub",
        url: "https://github.com/igoralbuquerque12/care-copilot",
        kind: "github",
      },
    ],
    sources: [
      base,
      "about-me/public/projetos/care-copilot/README.md",
      "about-me/public/eu-igor/curriculo.pdf",
    ],
  },
  {
    id: "grau-tecnico",
    name: "Grau Técnico",
    category: "Backend & Cloud",
    context: "Freelance · Sistema privado",
    rank: 3,
    featured: true,
    rankingReason:
      "Demonstra entrega integral, integração com legado, conciliação financeira e orquestração entre runtimes.",
    summary:
      "Cobranças, pagamentos e comunicação acadêmica em uma operação integrada a um sistema legado.",
    stack: [
      "NestJS",
      "React",
      "PostgreSQL",
      "Prisma",
      "Redis",
      "BullMQ",
      "Python",
      "FastAPI",
    ],
    tags: ["Multi-tenant", "RPA", "Conciliação"],
    role: "Levantamento de requisitos, desenho da arquitetura e desenvolvimento integral da plataforma como freelancer.",
    problem:
      "Dados financeiros presos em relatórios PDF e operações de um sistema desktop exigiam trabalho manual para acompanhar cobranças, pagamentos e comunicação com os alunos.",
    solution:
      "Conectei o legado a uma API modular: um serviço Python exporta relatórios no Windows, devolve arquivos e status por callbacks e alimenta o fluxo de importação e conciliação. Filas coordenam os envios em lote.",
    highlights: [
      {
        title: "Legado tratado como uma integração",
        description:
          "O RPA fica em um serviço FastAPI separado. A API principal acompanha suas execuções por webhooks, sem depender da sessão gráfica para responder ao usuário.",
      },
      {
        title: "Conciliação sem duplicar recebíveis",
        description:
          "Chaves naturais e transações orientam a importação dos PDFs. O domínio também trata pagamentos antecipados, além de cobranças e pagamentos convencionais.",
      },
      {
        title: "Isolamento de organizações",
        description:
          "Alunos, cobranças e execuções são associados a organizationId. O escopo da organização acompanha a operação até a persistência.",
      },
      {
        title: "Envios com controle de ritmo",
        description:
          "Workers BullMQ processam mensagens em lote com limites de concorrência, rate limiting e retries, absorvendo o trabalho fora da API.",
      },
    ],
    architecture: {
      title: "Um núcleo de negócio. Um serviço dedicado ao legado.",
      description:
        "Monólito modular NestJS com um serviço satélite de automação desktop. A fronteira assíncrona organiza as diferentes velocidades do sistema web e do legado.",
      steps: [
        { label: "React", detail: "Operação acadêmica" },
        { label: "NestJS", detail: "Domínios + organização" },
        { label: "Python / RPA", detail: "Exportação no Acadweb" },
        { label: "Importação", detail: "PDF + conciliação" },
        { label: "BullMQ", detail: "Comunicação em lote" },
      ],
      notes: [
        "PostgreSQL guarda o estado financeiro e das execuções.",
        "Callbacks conectam a automação Windows ao backend.",
        "Redis coordena filas; Docker e Traefik compõem a infraestrutura web.",
      ],
    },
    outcomes: [
      "Plataforma entregue para uma operação com milhares de cobranças.",
      "Dados acadêmicos e financeiros consolidados em um painel.",
      "Responsabilidade de ponta a ponta, dos requisitos à implementação.",
    ],
    tradeoffs: [
      "Automação de interface depende do ambiente Windows e das telas do legado. Isolar o RPA reduz o alcance dessas mudanças no restante do produto.",
    ],
    images: [],
    links: [],
    sources: [base, "about-me/public/eu-igor/curriculo.pdf"],
  },
  {
    id: "jarvis",
    name: "Jarvis",
    category: "IA & produtos",
    context: "Open source · Assistente pessoal",
    rank: 4,
    featured: true,
    rankingReason:
      "Forte integração entre domínios, tool calling controlado, recorrências e um motor financeiro externo.",
    summary:
      "Um assistente no WhatsApp que transforma conversas em lembretes, rotinas e registros financeiros.",
    stack: [
      "NestJS",
      "React",
      "PostgreSQL",
      "Redis",
      "n8n",
      "Baileys",
      "Docker",
      "Securo",
    ],
    tags: ["Tool calling", "Integrações", "Recorrência"],
    role: "Desenvolvimento do Jarvis e integração do Securo, motor financeiro open source de terceiros.",
    problem:
      "Um assistente só é útil quando consegue agir com contexto e manter o estado das ações. Conectar conversa, agenda e finanças exige contratos claros entre IA e regras de negócio.",
    solution:
      "O NestJS mantém o domínio e disponibiliza ferramentas ao agente no n8n. O modelo interpreta a intenção; os serviços validam e executam a ação. Integrei a API do Securo para finanças, preservando usuários e workspaces separados.",
    highlights: [
      {
        title: "IA opera por capacidades explícitas",
        description:
          "O agente recebe histórico e catálogo de ferramentas. Toda alteração retorna ao backend por endpoints controlados, em vez de permitir acesso direto do modelo ao banco.",
      },
      {
        title: "Integração sem contaminar o domínio",
        description:
          "Uma camada de adaptação traduz os contratos do Jarvis para a API do Securo. O cadastro provisiona o workspace financeiro em segundo plano.",
      },
      {
        title: "Recorrência com controle de colisões",
        description:
          "Fusos são normalizados com Luxon e uma restrição única por série e horário evita persistir a mesma ocorrência duas vezes. O scheduler trata as colisões do Prisma.",
      },
      {
        title: "Superfícies de acesso separadas",
        description:
          "Sessão web, chave administrativa M2M e API pública têm papéis distintos. A sessão do WhatsApp é armazenada cifrada no PostgreSQL.",
      },
    ],
    architecture: {
      title: "A linguagem é flexível. As operações têm contrato.",
      description:
        "Um monólito modular concentra as regras do Jarvis; n8n e Securo funcionam como serviços satélites especializados.",
      steps: [
        { label: "WhatsApp", detail: "Mensagem via Baileys" },
        { label: "NestJS", detail: "Perfil + contexto" },
        { label: "n8n + LLM", detail: "Seleciona uma ferramenta" },
        { label: "API de tools", detail: "Valida e executa" },
        { label: "Agenda / Securo", detail: "Persiste a ação" },
      ],
      notes: [
        "Redis mantém caches do scheduler e da integração financeira.",
        "O Securo e seus workers pertencem ao serviço financeiro integrado.",
        "Rede interna Docker e chave administrativa protegem as chamadas M2M documentadas no README atual.",
      ],
    },
    outcomes: [
      "Conversas, eventos e finanças conectados por uma única experiência.",
      "Reuso de um motor financeiro existente com isolamento por perfil.",
      "Backend mantém validações e execução independentes do modelo de linguagem.",
    ],
    tradeoffs: [
      "A integração reduz a necessidade de reconstruir o domínio financeiro, mas cria dependência do contrato e da disponibilidade do Securo.",
      "Restrições únicas protegem o registro das ocorrências; isso não implica garantia exactly-once para toda entrega externa.",
    ],
    images: [
      {
        src: "/images/projects/jarvis/brand.webp",
        alt: "Logo Jarvis laranja sobre azul",
        caption: "Identidade visual do assistente Jarvis.",
        kind: "logo",
      },
    ],
    links: [
      {
        label: "Repositório no GitHub",
        url: "https://github.com/igoralbuquerque12/jarvis",
        kind: "github",
      },
    ],
    sources: [base, "about-me/public/projetos/jarvis/README.md"],
    docs: { locales: ["pt-BR", "en"], pages: ["guide"] },
  },
  {
    id: "fala-comigo",
    name: "Fala Comigo",
    category: "IA & produtos",
    context: "Colaborativo · Plataforma de idiomas",
    rank: 5,
    featured: true,
    rankingReason:
      "Autoria documentada em autenticação, criptografia, persistência e IA, dentro de uma arquitetura de chat assíncrono.",
    summary:
      "Conversas reais para praticar idiomas, com tradução, correções e uma biblioteca de aprendizado gerada por IA.",
    stack: [
      "NestJS",
      "Next.js",
      "MongoDB",
      "Prisma",
      "Redis",
      "BullMQ",
      "Socket.IO",
      "Groq",
    ],
    tags: ["Tempo real", "AES-256-GCM", "IA"],
    role: "Projeto colaborativo. Minhas entregas incluem autenticação, modelagem, integração Groq, DeepCorrections, criptografia e interfaces de aprendizado.",
    problem:
      "Uma conversa de prática oferece oportunidades de aprendizado que se perdem no histórico. O desafio era converter essas mensagens em feedback reutilizável e integrar isso ao chat sem romper sua experiência.",
    solution:
      "Implementei uma integração de IA com resposta estruturada para tradução e correções. As explicações aprofundadas viram registros consultáveis de estudo. No backend, também trabalhei na autenticação, na modelagem e na proteção do conteúdo das mensagens.",
    highlights: [
      {
        title: "Correção que vira material de estudo",
        description:
          "Criei o domínio DeepCorrections, do contrato da resposta de IA à persistência em lote, busca, paginação e interface de revisão.",
      },
      {
        title: "Criptografia antes da fila",
        description:
          "Implementei AES-256-GCM com IV aleatório e tag de autenticação. O conteúdo entra cifrado no processamento assíncrono e é decifrado pelos serviços na composição da resposta.",
      },
      {
        title: "Identidade coerente entre camadas",
        description:
          "Implementei JWT/Passport e guards no NestJS, criação transacional de usuário e perfil e integração de sessão com NextAuth no frontend.",
      },
      {
        title: "Integração de IA encapsulada",
        description:
          "Provider Groq, contratos de resposta e prompt estruturado isolam a inferência do restante do produto. A interface apresenta tradução, sugestões e explicações de forma contextual.",
      },
    ],
    architecture: {
      title: "Mensagens, processamento e aprendizado conectados.",
      description:
        "A arquitetura compartilhada usa WebSockets para interação e BullMQ para persistência assíncrona. O projeto também oferece reconciliação após reconexão e histórico local em IndexedDB.",
      steps: [
        { label: "Next.js", detail: "Chat + sessão" },
        { label: "Gateway NestJS", detail: "JWT + criptografia" },
        { label: "BullMQ / Redis", detail: "Fila de mensagens" },
        { label: "Worker + MongoDB", detail: "Persistência" },
        { label: "Socket.IO", detail: "Entrega aos participantes" },
      ],
      notes: [
        "Groq alimenta tradução e correções em uma trilha de análise.",
        "A sincronização e o worker integram a arquitetura do time; a lista de destaques explicita minhas contribuições.",
        "Criptografia em repouso: o servidor consegue decifrar o conteúdo; não se trata de E2EE.",
      ],
    },
    outcomes: [
      "Feedback de IA transformado em uma biblioteca pessoal de aprendizado.",
      "Mensagens protegidas antes de serem enfileiradas.",
      "Entrega em colaboração, com contribuição em backend e frontend.",
    ],
    tradeoffs: [
      "O servidor precisa acessar o texto para compor respostas e análises. A proteção em repouso tem uma fronteira diferente da criptografia ponta a ponta.",
    ],
    images: [
      {
        src: "/images/projects/fala-comigo/login.webp",
        alt: "Tela de acesso do Fala Comigo",
        caption: "Interface de autenticação do Fala Comigo.",
        kind: "screenshot",
      },
    ],
    links: [
      {
        label: "Backend no GitHub",
        url: "https://github.com/marcelomatheus/falacomigo-chat-server",
        kind: "github",
      },
      {
        label: "Frontend no GitHub",
        url: "https://github.com/marcelomatheus/falacomigo-chat-web",
        kind: "github",
      },
    ],
    sources: [base, "about-me/public/projetos/fala-comigo/README.md"],
  },
  {
    id: "pixelphone",
    name: "PixelPhone",
    category: "IA & produtos",
    context: "Freelance · Sistema privado",
    rank: 6,
    featured: true,
    rankingReason:
      "Produto entregue integralmente com integrações de voz, billing por consumo e processamento isolado.",
    summary:
      "Chamadas transformadas em indicadores de atendimento: transcrição, análise de objetivos e scores com IA.",
    stack: [
      "Next.js",
      "PostgreSQL",
      "Prisma",
      "Redis",
      "BullMQ",
      "OpenAI",
      "Docker",
      "Wavoip",
    ],
    tags: ["Análise de voz", "Billing", "Workers"],
    role: "Desenvolvimento integral como freelancer, incluindo integração de telefonia, análise por IA e faturamento por créditos.",
    problem:
      "Avaliar ligações manualmente limita a visibilidade sobre a qualidade do atendimento. Cada operação também precisa de critérios próprios, sem perder o controle do custo de processamento dos áudios.",
    solution:
      "Conectei as gravações à transcrição Whisper e à análise semântica com GPT. O resultado compara o atendimento com objetivos configuráveis e alimenta dashboards; o consumo é vinculado à duração do áudio e ao saldo do usuário.",
    highlights: [
      {
        title: "Integração preparada para instabilidade",
        description:
          "Downloads do Wavoip usam timeout com AbortController e retentativas com backoff exponencial, limitando o tempo ocupado por uma falha externa.",
      },
      {
        title: "Custo tratado como regra de negócio",
        description:
          "Validação prévia de saldo e lógica transacional de créditos vinculam o uso de IA ao consumo de áudio.",
      },
      {
        title: "Qualidade com critérios do cliente",
        description:
          "A análise verifica objetivos de comunicação e produz scores customizáveis, apontando lacunas no atendimento.",
      },
      {
        title: "Auditoria fora da requisição",
        description:
          "BullMQ e Redis delegam auditoria e logs a um worker em container separado. Índices compostos apoiam consolidações semanais por conta e dispositivo.",
      },
    ],
    architecture: {
      title: "Da gravação ao indicador de atendimento.",
      description:
        "Next.js concentra o produto e os serviços de análise. Responsabilidades de auditoria são delegadas a um processo worker separado.",
      steps: [
        { label: "Wavoip", detail: "Áudio da chamada" },
        { label: "Service de análise", detail: "Saldo + download resiliente" },
        { label: "Whisper + GPT", detail: "Transcrição + objetivos" },
        { label: "PostgreSQL", detail: "Créditos + resultados" },
        { label: "Dashboard", detail: "Scores e tendências" },
      ],
      notes: [
        "BullMQ → AuditWorker roda em container próprio.",
        "Autorização delimita acesso por conta e dispositivo.",
        "A fila de auditoria não é apresentada como fila de todo o pipeline de IA.",
      ],
    },
    outcomes: [
      "Plataforma entregue com visão de desempenho e metas de atendimento.",
      "Cobrança por consumo integrada ao fluxo de análise.",
      "Transcrição e avaliação reunidas na operação de telefonia.",
    ],
    tradeoffs: [
      "O sistema depende da disponibilidade dos provedores de áudio e IA; timeouts e retries limitam o impacto dessas integrações.",
    ],
    images: [
      {
        src: "/images/projects/pixelphone/product.webp",
        alt: "Marca PixelPhone e painel de análise de chamadas",
        caption: "Identidade e painel do PixelPhone.",
        kind: "screenshot",
      },
    ],
    links: [],
    sources: [base, "about-me/public/eu-igor/curriculo.pdf"],
  },
  {
    id: "vibe-git",
    name: "vibe-git",
    category: "Dev tools",
    context: "Open source · CLI no npm",
    rank: 7,
    featured: true,
    rankingReason:
      "Ferramenta com adoção real, adapters de IA e separação entre planejamento e execução Git.",
    summary:
      "Do diff ao pull request: IA organiza alterações em um plano revisável de commits e branches.",
    stack: [
      "Node.js",
      "JavaScript",
      "Git",
      "GitHub API",
      "OpenAI",
      "Gemini",
      "Groq",
      "node:test",
    ],
    tags: ["CLI", "Adapters", "Developer experience"],
    role: "Criação da ferramenta a partir de uma necessidade do trabalho, arquitetura, integrações de IA e publicação como pacote npm.",
    problem:
      "Separar alterações, criar commits coerentes e preparar PRs para frontend e backend consumia tempo repetidamente. Automatizar isso exigia preservar a possibilidade de revisar o que seria executado.",
    solution:
      "Separei geração e execução: o CLI lê as alterações e produz um plano JSON editável. Depois da revisão, outro comando executa os commits, branches, pushes e PRs definidos. Também há uma saída Markdown para execução manual.",
    highlights: [
      {
        title: "Plano antes da ação",
        description:
          "A IA sugere a organização das mudanças, mas a execução consome um artefato explícito com arquivos, commits, branches e destino dos PRs.",
      },
      {
        title: "IA substituível",
        description:
          "Adapters e uma factory permitem selecionar OpenAI, Gemini ou Groq sem reescrever os casos de uso do CLI.",
      },
      {
        title: "Regras separadas das integrações",
        description:
          "Comandos, casos de uso e serviços de Git, arquivos e rede têm responsabilidades próprias. Isso permite testar regras sem executar operações reais no repositório.",
      },
      {
        title: "Pouca infraestrutura para rodar",
        description:
          "ES Modules, fetch e node:test nativos mantêm a ferramenta próxima do runtime Node.js e simplificam o ambiente de desenvolvimento.",
      },
    ],
    architecture: {
      title: "Entender o diff. Revisar o plano. Executar a entrega.",
      description:
        "Dois momentos distintos mantêm o planejamento de IA inspecionável antes de qualquer alteração no histórico Git.",
      steps: [
        { label: "Git diff", detail: "Alterações + contexto" },
        { label: "AI adapter", detail: "Provedor configurável" },
        { label: "Plano JSON", detail: "Revisão e edição" },
        { label: "Executor Git", detail: "Branches + commits" },
        { label: "GitHub API", detail: "Pull requests" },
      ],
      notes: [
        "Ordem de commits expressa no plano.",
        "Modo Markdown permite conduzir a execução manualmente.",
        "A integração MCP é um projeto complementar, listado separadamente.",
      ],
    },
    outcomes: [
      "Utilizada diariamente por 10 colaboradores, segundo o relato de uso fornecido.",
      "Economia relatada de cerca de 15 minutos por tarefa.",
      "Distribuída como @igoralbuquerque/vibe-git no npm.",
    ],
    tradeoffs: [
      "Executar o plano altera o repositório e pode fazer push. A revisão do JSON e do destino das branches é parte do uso da ferramenta.",
      "A execução sequencial de comandos Git não equivale a uma transação com rollback automático.",
    ],
    images: [
      {
        src: "/images/projects/vibe-git/product.webp",
        alt: "Apresentação visual da ferramenta vibe-git",
        caption: "Material de apresentação do vibe-git.",
        kind: "screenshot",
      },
    ],
    links: [
      {
        label: "Repositório no GitHub",
        url: "https://github.com/igoralbuquerque12/vibe-git",
        kind: "github",
      },
      {
        label: "Pacote no npm",
        url: "https://www.npmjs.com/package/@igoralbuquerque/vibe-git",
        kind: "website",
      },
    ],
    sources: [
      base,
      "about-me/public/projetos/vibe-giit/README.md",
      "about-me/public/eu-igor/curriculo.pdf",
    ],
    docs: { locales: ["pt-BR", "en"] },
  },
];
