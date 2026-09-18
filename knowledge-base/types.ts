export type ProjectCategory =
  "Backend & Cloud" | "IA & produtos" | "Dev tools" | "Pesquisa & web";

export interface ProjectImage {
  src: string;
  alt: string;
  caption: string;
  kind: "logo" | "screenshot" | "architecture";
}

export interface ArchitectureStep {
  label: string;
  detail: string;
}

export interface Project {
  id: string;
  name: string;
  category: ProjectCategory;
  context: string;
  /** Menor número aparece primeiro. Critério editorial, não nota de qualidade. */
  rank: number;
  rankingReason: string;
  featured: boolean;
  summary: string;
  stack: string[];
  tags: string[];
  role: string;
  problem: string;
  solution: string;
  highlights: { title: string; description: string }[];
  architecture: {
    title: string;
    description: string;
    steps: ArchitectureStep[];
    notes: string[];
  };
  outcomes: string[];
  /** Limites e evoluções propostas; nunca apresentados como implementação pronta. */
  tradeoffs: string[];
  images: ProjectImage[];
  links: {
    label: string;
    url: string;
    kind: "github" | "website" | "document";
  }[];
  /** Evidências locais para futuras revisões editoriais. */
  sources: string[];
}

export interface Experience {
  id: string;
  company: string;
  role: string;
  period: string;
  current?: boolean;
  description: string;
  highlights: string[];
  stack: string[];
}

export interface Publication {
  id: string;
  type: string;
  title: string;
  description: string;
  venue: string;
  tags: string[];
  url: string;
  linkLabel: string;
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  year: string;
  url?: string;
}
