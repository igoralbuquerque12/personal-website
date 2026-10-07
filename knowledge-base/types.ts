export type ProjectCategory =
  "Backend & Cloud" | "IA & produtos" | "Dev tools" | "Pesquisa & web";

export type ProjectOrigin = "open-source" | "freelance";

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

export type DocLocale = "pt-BR" | "en";
export type DocPage = "guide" | "manual";

/**
 * Habilita a página própria do projeto: `/projetos/<id>` (guia) e
 * `/projetos/<id>/docs` (manual). O conteúdo fica em
 * `knowledge-base/docs/<id>/<página>.<idioma>.md`.
 */
export interface ProjectDocs {
  /** O primeiro idioma é o padrão; os demais ganham um segmento na URL. */
  locales: DocLocale[];
  /** Páginas publicadas. Sem este campo, o projeto tem guia e manual. */
  pages?: DocPage[];
}

export interface Project {
  id: string;
  name: string;
  category: ProjectCategory;
  context: string;
  /** Selo do mapa de abertura. Só os projetos que aparecem nele precisam declarar. */
  origin?: ProjectOrigin;
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
  /** Quando presente, o modal vira um resumo que aponta para a página própria. */
  docs?: ProjectDocs;
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

export type EcosystemKind = "mail" | "alert" | "git";

/** Posição do centro do card em frações do mapa (0 a 1) e rotação em graus. */
export interface EcosystemPlacement {
  x: number;
  y: number;
  r: number;
}

export interface EcosystemNode {
  /** `id` do projeto: nome, selo e modal vêm dele. */
  id: string;
  /** `integrated` ganha o card escuro e entra no rodízio da legenda. */
  role: "integrated" | "product";
  subtitle: string;
  /** Legenda do canto: `text` descreve o projeto, `highlight` (em negrito) a integração. */
  caption: { text: string; highlight: string };
  desktop: EcosystemPlacement;
  mobile: EcosystemPlacement;
}

export interface EcosystemConnection {
  /** A direção é a do dado: `from` é quem envia. */
  from: string;
  to: string;
  kind: EcosystemKind;
  /** Frase curta com verbo, sempre visível sobre a linha. */
  label: string;
  /** Linha do log de atividade simulada. */
  event: string;
  /** Curvatura em px; o sinal escolhe o lado para onde a linha dobra. */
  bend: number;
}

export interface Ecosystem {
  nodes: EcosystemNode[];
  connections: EcosystemConnection[];
}
