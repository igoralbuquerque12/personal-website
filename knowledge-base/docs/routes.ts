import type { DocLocale, DocPage, Project } from "../types";

/** Segmento de URL de cada idioma. O idioma padrão do projeto não usa segmento. */
export const docLocaleSegments: Record<DocLocale, string> = {
  "pt-BR": "pt-br",
  en: "en",
};

/** Segmento de URL de cada página. O guia é a raiz da página do projeto. */
export const docPageSegments: Record<DocPage, string | null> = {
  guide: null,
  manual: "docs",
};

export const docPages = Object.keys(docPageSegments) as DocPage[];

/** Páginas que o projeto publica, na ordem das abas. */
export function projectDocPages(project: Project): DocPage[] {
  if (!project.docs) return [];
  return project.docs.pages ?? docPages;
}

/** Caminho após `/projetos/<id>` para uma combinação de página e idioma. */
export function projectDocPath(
  project: Project,
  page: DocPage,
  locale: DocLocale,
) {
  const isDefault = locale === project.docs?.locales[0];
  return [
    isDefault ? null : docLocaleSegments[locale],
    docPageSegments[page],
  ].filter((segment): segment is string => segment !== null);
}

export function projectDocHref(
  project: Project,
  page: DocPage = "guide",
  locale: DocLocale | undefined = project.docs?.locales[0],
) {
  return [
    "/projetos",
    project.id,
    ...projectDocPath(project, page, locale!),
  ].join("/");
}
