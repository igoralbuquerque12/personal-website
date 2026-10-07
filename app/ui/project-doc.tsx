import Link from "next/link";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import {
  profile,
  projectDocHref,
  projectDocPages,
  type DocLocale,
  type DocPage,
  type Project,
} from "@/knowledge-base";
import type { ProjectDocument } from "@/knowledge-base/docs/content";
import { DocToc } from "./doc-toc";
import { Icon } from "./icons";
import "../project-doc.css";

const copy: Record<
  DocLocale,
  {
    skip: string;
    home: string;
    projects: string;
    back: string;
    language: string;
    languageName: string;
    pagesNav: string;
    toc: string;
    enlarge: string;
    top: string;
    pages: Record<DocPage, { tab: string; eyebrow: string }>;
    /** Chamada exibida ao fim de uma página, apontando para a outra. */
    next: Record<DocPage, { title: string; text: string; action: string }>;
  }
> = {
  "pt-BR": {
    skip: "Pular para o conteúdo",
    home: "Igor Albuquerque, início",
    projects: "Projetos",
    back: "Voltar ao projeto",
    language: "Idioma",
    languageName: "PT-BR",
    pagesNav: "Páginas do projeto",
    toc: "Nesta página",
    enlarge: "Ampliar",
    top: "VOLTAR AO TOPO",
    pages: {
      guide: { tab: "Como funciona", eyebrow: "GUIA TÉCNICO" },
      manual: { tab: "Docs", eyebrow: "DOCUMENTAÇÃO" },
    },
    next: {
      guide: {
        title: "Pronto para usar?",
        text: "A documentação cobre cada comando, flag, arquivo de configuração e erro comum.",
        action: "Abrir a documentação",
      },
      manual: {
        title: "Quer entender o porquê?",
        text: "O guia técnico explica a arquitetura e as decisões de design por trás da ferramenta.",
        action: "Ler como funciona",
      },
    },
  },
  en: {
    skip: "Skip to content",
    home: "Igor Albuquerque, home",
    projects: "Projects",
    back: "Back to the project",
    language: "Language",
    languageName: "EN",
    pagesNav: "Project pages",
    toc: "On this page",
    enlarge: "Enlarge",
    top: "BACK TO TOP",
    pages: {
      guide: { tab: "How it works", eyebrow: "TECHNICAL GUIDE" },
      manual: { tab: "Docs", eyebrow: "DOCUMENTATION" },
    },
    next: {
      guide: {
        title: "Ready to use it?",
        text: "The documentation covers every command, flag, configuration file and common error.",
        action: "Open the documentation",
      },
      manual: {
        title: "Want to know why?",
        text: "The technical guide explains the architecture and the design decisions behind the tool.",
        action: "Read how it works",
      },
    },
  },
};

export function ProjectDoc({
  project,
  page,
  locale,
  document,
}: {
  project: Project;
  page: DocPage;
  locale: DocLocale;
  document: ProjectDocument;
}) {
  const text = copy[locale];
  const locales = project.docs?.locales ?? [locale];
  const pages = projectDocPages(project);
  const other = pages.find((item) => item !== page);
  return (
    <div className="doc-page" lang={locale}>
      <a className="skip-link" href="#conteudo">
        {text.skip}
      </a>
      <header className="site-header doc-header">
        <div className="header-inner">
          <Link href="/" className="brand" aria-label={text.home}>
            <span className="brand-mark">
              ia<span>↗</span>
            </span>
            <span>
              igor<span className="brand-surname">.albuquerque</span>
              <span className="brand-dot">.</span>
            </span>
          </Link>
          <div className="doc-header-actions">
            <Link
              className="doc-back"
              href={`/?project=${project.id}#projetos`}
            >
              <span aria-hidden="true">←</span> {text.back}
            </Link>
            {locales.length > 1 && (
              <nav className="doc-locales" aria-label={text.language}>
                {locales.map((item) => (
                  <Link
                    key={item}
                    href={projectDocHref(project, page, item)}
                    hrefLang={item}
                    lang={item}
                    aria-current={item === locale ? "true" : undefined}
                  >
                    {copy[item].languageName}
                  </Link>
                ))}
              </nav>
            )}
          </div>
        </div>
      </header>
      <main id="conteudo" className="section-shell doc-main">
        <div className="doc-hero">
          <p className="eyebrow">
            <span>
              {text.projects} / {project.name} /
            </span>{" "}
            {text.pages[page].eyebrow}
          </p>
          <h1>
            {document.title}
            <span className="accent-dot">.</span>
          </h1>
          <div className="doc-hero-bar">
            {pages.length > 1 && (
              <nav className="doc-tabs" aria-label={text.pagesNav}>
                {pages.map((item) => (
                  <Link
                    key={item}
                    href={projectDocHref(project, item, locale)}
                    aria-current={item === page ? "page" : undefined}
                  >
                    {text.pages[item].tab}
                  </Link>
                ))}
              </nav>
            )}
            <div className="doc-links">
              {project.links.map((link) => (
                <a
                  key={link.url}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Icon
                    name={link.kind === "github" ? "github" : "globe"}
                    size={15}
                  />
                  {link.kind === "github" ? "GitHub" : "npm"}
                  <Icon name="arrow" size={13} />
                </a>
              ))}
            </div>
          </div>
        </div>
        <div className="doc-layout">
          <DocToc label={text.toc} sections={document.sections} />
          <div className="doc-body">
            <article className="doc-prose">
              <Markdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeSlug]}
                components={{
                  a: ({ href = "", children }) =>
                    href.startsWith("#") ? (
                      <a href={href}>{children}</a>
                    ) : (
                      <a href={href} target="_blank" rel="noopener noreferrer">
                        {children}
                      </a>
                    ),
                  // Tabelas e blocos de código rolam sozinhos em telas estreitas.
                  table: ({ children }) => (
                    <div className="doc-scroll" tabIndex={0}>
                      <table>{children}</table>
                    </div>
                  ),
                  pre: ({ children }) => <pre tabIndex={0}>{children}</pre>,
                  // Diagramas abrem em tamanho real; o arquivo já vem otimizado.
                  img: ({ src, alt = "" }) =>
                    typeof src === "string" ? (
                      <a
                        className="doc-figure"
                        href={src}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`${text.enlarge}: ${alt}`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={src} alt={alt} loading="lazy" />
                      </a>
                    ) : null,
                }}
              >
                {document.body}
              </Markdown>
            </article>
            {other && (
              <aside className="doc-next">
                <div>
                  <h2>{text.next[page].title}</h2>
                  <p>{text.next[page].text}</p>
                </div>
                <Link
                  className="button button-dark"
                  href={projectDocHref(project, other, locale)}
                >
                  {text.next[page].action} <Icon name="arrow" size={17} />
                </Link>
              </aside>
            )}
          </div>
        </div>
      </main>
      <footer className="site-footer section-shell">
        <Link className="brand" href="/">
          <span className="brand-mark">
            ia<span>↗</span>
          </span>
          <span>Igor Albuquerque</span>
        </Link>
        <a href={`mailto:${profile.email}`}>{profile.email}</a>
        <a className="mono" href="#conteudo">
          {text.top} <Icon name="arrow" size={15} />
        </a>
      </footer>
    </div>
  );
}
