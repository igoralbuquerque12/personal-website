export interface ExperienceItem {
    period: string;
    company: string;
    role: string;
    badge: "current" | "past";
    badgeLabel: string;
    description: string;
    subItems: string[];
    active?: boolean;
}

export const experiences: ExperienceItem[] = [
    {
        period: "Junho 2025 — atual",
        company: "Nocorp · Software House",
        role: "Desenvolvedor de Software Júnior",
        badge: "current",
        badgeLabel: "atual",
        description:
            "Atua no desenvolvimento de sistemas web em produção para clientes reais, trabalhando com regras de negócio complexas e arquiteturas modernas.",
        subItems: [
            "Sistema de gestão de concessionárias multi-tenant com regras de negócio densas — React + Vite, NestJS, PostgreSQL (Supabase)",
            "Sistema de gestão de RH com arquitetura DDD e comunicação via tRPC — Next.js, PostgreSQL",
            "Features para e-commerce de hortifruti mexicano em JavaScript",
        ],
        active: true,
    },
    {
        period: "2024/1 — Mai 2025",
        company: "UNIMONTES · Lab. Computação Aplicada",
        role: "Estagiário — Pesquisa & Desenvolvimento",
        badge: "past",
        badgeLabel: "estágio",
        description:
            "Dois ciclos distintos: primeiro focado em pesquisa científica com IA e dados, depois em desenvolvimento de sistemas web reais.",
        subItems: [
            "Análise de dados com modelos de ML e deep learning — publicação de 2 artigos",
            "Plataforma de biodigestor indiano com persistência local em JavaScript",
            "Backend de sistema para gestão de eventos acadêmicos — Python, Django, PostgreSQL",
        ],
    },
    {
        period: "2023/2",
        company: "UNIMONTES",
        role: "Bolsista de Iniciação Científica",
        badge: "past",
        badgeLabel: "bolsista",
        description:
            "Início da trajetória acadêmica e prática, construindo páginas web em ambiente universitário.",
        subItems: [
            "Construção de páginas web com WordPress para projetos da universidade",
        ],
    },
];
