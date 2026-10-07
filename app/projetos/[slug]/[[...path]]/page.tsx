import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  projects,
  projectDocHref,
  projectDocPages,
  type DocLocale,
  type DocPage,
} from "@/knowledge-base";
import { loadProjectDocument } from "@/knowledge-base/docs/content";
import {
  docLocaleSegments,
  docPageSegments,
  projectDocPath,
} from "@/knowledge-base/docs/routes";
import { ProjectDoc } from "../../../ui/project-doc";

type Params = { slug: string; path?: string[] };

export const dynamicParams = false;

export function generateStaticParams(): Params[] {
  return projects.flatMap((project) =>
    (project.docs?.locales ?? []).flatMap((locale) =>
      projectDocPages(project).map((page) => ({
        slug: project.id,
        path: projectDocPath(project, page, locale),
      })),
    ),
  );
}

/** `/projetos/<id>[/<idioma>][/docs]` → projeto, idioma e página. */
function resolve({ slug, path = [] }: Params) {
  const project = projects.find((item) => item.id === slug);
  if (!project?.docs) return null;
  const rest = [...path];
  const [defaultLocale, ...extraLocales] = project.docs.locales;
  const locale: DocLocale =
    extraLocales.find((item) => docLocaleSegments[item] === rest[0]) ??
    defaultLocale;
  if (locale !== defaultLocale) rest.shift();
  const page: DocPage | undefined = projectDocPages(project).find(
    (item) => (docPageSegments[item] ?? undefined) === rest[0],
  );
  if (!page || rest.length > (docPageSegments[page] ? 1 : 0)) return null;
  return { project, locale, page };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const route = resolve(await params);
  if (!route) return {};
  const { project, locale, page } = route;
  const document = await loadProjectDocument(project.id, page, locale);
  return {
    title: `${document.title} · ${project.name} — Igor Albuquerque`,
    description: project.summary,
    alternates: {
      canonical: projectDocHref(project, page, locale),
      languages: Object.fromEntries(
        project.docs!.locales.map((item) => [
          item,
          projectDocHref(project, page, item),
        ]),
      ),
    },
  };
}

export default async function ProjectDocPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const route = resolve(await params);
  if (!route) notFound();
  const { project, locale, page } = route;
  return (
    <ProjectDoc
      project={project}
      page={page}
      locale={locale}
      document={await loadProjectDocument(project.id, page, locale)}
    />
  );
}
