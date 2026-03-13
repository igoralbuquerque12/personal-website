export interface OtherProject {
    emoji: string;
    status: "dev" | "done";
    statusLabel: string;
    title: string;
    description: string;
    stack: string[];
}

export const otherProjects: OtherProject[] = [
    {
        emoji: "🏥",
        status: "dev",
        statusLabel: "Em dev · TCC",
        title: "Care Copilot",
        description:
            "Sistema de gestão de pacientes e clínicas com ferramentas de IA para automatização de consultas médicas. Projeto de TCC.",
        stack: ["Next.js", "Prisma", "Supabase"],
    },
    {
        emoji: "🎬",
        status: "done",
        statusLabel: "Concluído",
        title: "MovieWish",
        description:
            "App mobile para descoberta de filmes por gênero com watchlist. Cada filme sugerido gera novas recomendações por afinidade.",
        stack: ["Flutter", "NestJS", "API Filmes"],
    },
    {
        emoji: "💳",
        status: "done",
        statusLabel: "Concluído",
        title: "Transaction API",
        description:
            "API construída sobre desafio técnico do Itaú com foco em qualidade: testes unitários, carga, logs e observabilidade.",
        stack: ["JavaScript", "Jest", "Artillery", "Winston"],
    },
];
