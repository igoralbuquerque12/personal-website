export interface StackGroup {
    title: string;
    pills: string[];
}
export const stackGroups: StackGroup[] = [
  {
    title: "Frontend",
    pills: [
      "React",
      "Next.js",
      "TypeScript",
      "JavaScript",
      "Vite",
      "Tailwind CSS",
      "React Query",
      "Flutter"
    ],
  },
  {
    title: "Backend",
    pills: [
      "NestJS",
      "Node.js",
      "Django",
      "Python",
      "tRPC",
      "REST",
      "WebSockets"
    ],
  },
  {
    title: "Dados & Infra",
    pills: [
      "PostgreSQL",
      "MongoDB",
      "Supabase",
      "Prisma",
      "Mongoose",
      "Docker",
      "CI/CD",
      "Redis",
      "BullMQ",
      "RabbitMQ"
    ],
  },
  {
    title: "Qualidade & Observabilidade",
    pills: [
      "Jest",
      "Testes unitários",
      "Testes de integração",
      "Prometheus",
      "Grafana",
      "Logs estruturados",
      "Métricas",
      "k6",
      "Testes de carga"
    ],
  },
  {
    title: "IA & Machine Learning",
    pills: [
      "TensorFlow",
      "Pandas",
      "NumPy",
      "OpenAI API",
      "Groq",
      "Gemini API"
    ],
  },
  {
    title: "Arquitetura",
    pills: [
      "DDD",
      "Multi-tenant",
      "Event-driven",
      "Microservices",
      "Mensageria",
      "Background Jobs",
      "Race conditions"
    ],
  }
];
