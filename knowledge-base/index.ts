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
  Project,
  ProjectCategory,
  ProjectImage,
} from "./types";
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
