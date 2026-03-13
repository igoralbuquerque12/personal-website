export interface Project {
    type: string;
    title: string;
    tagline: string;
    description: string;
    features: string[];
    stack: string[];
    githubUrl?: string;
    demoUrl?: string;
    image?: string;
}

export const projects: Project[] = [
    {
        type: "Freelance · Produção",
        title: "PixelPhone",
        tagline: "Gestão inteligente de ligações com IA para clínicas",
        description:
            "Sistema completo que realiza e gerencia ligações telefônicas, transcreve chamadas com IA, e entrega dashboards semanais com score de atendimento personalizado para cada recepcionista.",
        features: [
            "Gravação e transcrição automática de ligações com controle de saldo e proteção contra race conditions",
            "Dashboard por recepcionista: score personalizado pelos gestores, meta semanal, consultas agendadas e melhores horários",
            "Recomendações semanais geradas por IA sobre rendimento individual",
            "Fila BullMQ para auditoria assíncrona sem impacto na performance",
            "Integração com API de telefonia, pagamentos e cronjobs automatizados",
        ],
        stack: ["Next.js", "PostgreSQL", "Prisma", "Docker", "CI/CD", "BullMQ", "OpenAI", "API Telefonia", "Pagarme"],
        githubUrl: "#",
        image: "/pixelphone-logo.png",
    },
    {
        type: "Produto · Público",
        title: "Fala Comigo",
        tagline: "Aprenda idiomas conversando com pessoas reais, com IA",
        description:
            "Plataforma para prática de idiomas via conversas em tempo real com WebSockets. Para cada mensagem enviada, uma IA corrige e traduz instantaneamente, gerando trilhas de aprendizado personalizadas.",
        features: [
            "Chat em tempo real via WebSockets com perfis de aprendizado por objetivos",
            "IA (Groq) que corrige e traduz cada mensagem em tempo real, gerando aprendizados para revisão posterior",
            "Cache com React Query no frontend para evitar recarregamento excessivo de mensagens",
            "Salvamento assíncrono de mensagens via BullMQ + Redis, sem impacto na experiência",
        ],
        stack: ["Next.js", "NestJS", "MongoDB", "Prisma", "Redis", "BullMQ", "WebSockets", "Groq", "React Query", "Docker", "Jest", "CI/CD"],
        githubUrl: "#",
        demoUrl: "#",
        image: "/fala-comigo-logo.png",
    },
    {
        type: "Open Source · npm",
        title: "vibe-git",
        tagline: "Vibe code o seu versionamento em menos de 60 segundos",
        description:
            "Biblioteca npm que automatiza commits semânticos, PRs e separação de tasks com IA. Nasceu de uma dor real no trabalho: um processo que levava 15 minutos, agora em menos de 1 minuto.",
        features: [
            "Gera commits seguindo uma ordem lógica: banco → back → front, respeitando a história do código",
            "Cria PRs automaticamente no padrão da empresa com descrição contextualizada",
            "Lida com múltiplas tasks simultâneas, separando e direcionando cada uma corretamente",
            "Integração com OpenAI e Gemini para máxima flexibilidade de modelo",
        ],
        stack: ["JavaScript", "npm", "OpenAI API", "Gemini API", "CLI"],
        githubUrl: "https://github.com/igoralbuquerque12/vibe-git",
        demoUrl: "https://www.npmjs.com/package/vibe-git",
        image: "/vibe-git-logo.png",
    },
];
