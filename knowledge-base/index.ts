import { featuredProjects } from "./projects/featured";
import { catalogProjects } from "./projects/catalog";

export {
  profile,
  experiences,
  expertise,
  publications,
  certifications,
} from "./profile";
export type {
  DocLocale,
  DocPage,
  Ecosystem,
  EcosystemConnection,
  EcosystemKind,
  EcosystemNode,
  Project,
  ProjectCategory,
  ProjectImage,
  ProjectOrigin,
} from "./types";
export { ecosystem } from "./ecosystem";
export { projectDocHref, projectDocPages } from "./docs/routes";
export const projects = [...featuredProjects, ...catalogProjects].sort(
  (a, b) => a.rank - b.rank,
);
export const projectCategories = [
  "Backend & Cloud",
  "IA & produtos",
  "Dev tools",
  "Pesquisa & web",
] as const;
