"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { projects, projectCategories, type Project } from "@/knowledge-base";
import { Icon } from "./icons";
import { SystemSketch } from "./system-sketch";
import { ProjectDialog } from "./project-dialog";

function ProjectArtwork({ project }: { project: Project }) {
  const picture = project.images[0];
  return (
    <div className={`project-art art-${project.id}`} aria-hidden="true">
      {picture ? (
        <Image
          src={picture.src}
          alt=""
          fill
          sizes="(max-width: 700px) 90vw, (max-width: 1000px) 45vw, 380px"
        />
      ) : (
        <div className="art-placeholder">
          <div className="placeholder-glyph">
            <Icon name="layers" size={38} />
          </div>
          <span>{project.name}</span>
          <small>Grau técnico · engenharia em detalhe</small>
        </div>
      )}
      <span className="art-index mono">
        {String(project.rank).padStart(2, "0")}
      </span>
    </div>
  );
}

export function ProjectBrowser() {
  const [category, setCategory] = useState("Todos");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Project | null>(null);
  useEffect(() => {
    const readUrl = () => {
      const id = new URL(window.location.href).searchParams.get("project");
      setSelected(projects.find((project) => project.id === id) ?? null);
    };
    readUrl();
    window.addEventListener("popstate", readUrl);
    return () => window.removeEventListener("popstate", readUrl);
  }, []);
  const open = (project: Project) => {
    const url = new URL(window.location.href);
    url.searchParams.set("project", project.id);
    window.history.pushState({ portfolioProject: true }, "", url);
    setSelected(project);
  };
  const close = useCallback(() => {
    const url = new URL(window.location.href);
    url.searchParams.delete("project");
    window.history.replaceState(null, "", url);
    setSelected(null);
  }, []);
  const normalize = (value: string) =>
    value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
  const filtered = projects.filter(
    (project) =>
      (category === "Todos" || category === project.category) &&
      normalize(
        [project.name, project.summary, ...project.stack, ...project.tags].join(
          " ",
        ),
      ).includes(normalize(query.trim())),
  );
  const featured = filtered.filter((project) => project.featured);
  const catalog = filtered.filter((project) => !project.featured);
  return (
    <>
      <div className="project-toolbar">
        <div
          className="project-filters"
          role="group"
          aria-label="Filtrar projetos por área"
        >
          {["Todos", ...projectCategories].map((item) => (
            <button
              key={item}
              type="button"
              className={category === item ? "active" : ""}
              aria-pressed={category === item}
              onClick={() => setCategory(item)}
            >
              {item}
              {item === "Todos" && <span>{projects.length}</span>}
            </button>
          ))}
        </div>
        <label className="project-search">
          <Icon name="search" size={17} />
          <input
            aria-label="Buscar projetos por nome ou tecnologia"
            placeholder="Buscar projeto ou stack"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Limpar busca"
            >
              <Icon name="close" size={15} />
            </button>
          )}
        </label>
      </div>
      <p className="result-count mono" aria-live="polite">
        {filtered.length} {filtered.length === 1 ? "PROJETO" : "PROJETOS"} ·{" "}
        {category === "Todos" && !query
          ? "DA ARQUITETURA AO PRODUTO"
          : "RESULTADOS DA SELEÇÃO"}
      </p>
      <div className="featured-grid">
        {featured.map((project) =>
          project.id === "mailworks" ? (
            <article key={project.id} className="flagship-project">
              <div className="flagship-copy">
                <div className="flagship-label mono">
                  <span /> CASE EM DESTAQUE{" "}
                  <span className="flagship-open">OPEN SOURCE</span>
                </div>
                <h3>
                  {project.name}
                  <Icon name="arrow" size={35} />
                </h3>
                <p>{project.summary}</p>
                <div className="flagship-tags">
                  {project.tags.map((tag) => (
                    <span key={tag}>{tag}</span>
                  ))}
                </div>
                <div className="tags dark-tags">
                  {project.stack.slice(0, 5).map((tech) => (
                    <span key={tech}>{tech}</span>
                  ))}
                </div>
                <div className="flagship-actions">
                  <button
                    className="button button-lime"
                    onClick={() => open(project)}
                  >
                    Explorar o projeto <Icon name="arrow" size={17} />
                  </button>
                  <a
                    href={project.links[0].url}
                    target="_blank"
                    rel="noreferrer"
                    aria-label="MailWorks no GitHub"
                  >
                    <Icon name="github" size={21} />
                  </a>
                </div>
              </div>
              <button
                className="flagship-visual"
                onClick={() => open(project)}
                aria-label="Ver arquitetura do MailWorks"
              >
                <SystemSketch variant="mail" />
              </button>
            </article>
          ) : (
            <article className="project-card" key={project.id}>
              <button
                className="art-button"
                onClick={() => open(project)}
                aria-label={`Explorar ${project.name}`}
              >
                <ProjectArtwork project={project} />
              </button>
              <div className="project-card-body">
                <p className="project-context mono">{project.context}</p>
                <button className="project-title" onClick={() => open(project)}>
                  <h3>{project.name}</h3>
                  <Icon name="arrow" />
                </button>
                <p className="project-summary">{project.summary}</p>
                <div className="tags">
                  {project.stack.slice(0, 4).map((tech) => (
                    <span key={tech}>{tech}</span>
                  ))}
                  {project.stack.length > 4 && (
                    <span title={project.stack.slice(4).join(", ")}>
                      +{project.stack.length - 4}
                    </span>
                  )}
                </div>
                <div className="project-card-footer">
                  <button onClick={() => open(project)}>
                    Ver case completo <span>→</span>
                  </button>
                  {project.links.find((link) => link.kind === "github") ? (
                    <a
                      href={
                        project.links.find((link) => link.kind === "github")!
                          .url
                      }
                      target="_blank"
                      rel="noreferrer"
                      aria-label={`${project.name} no GitHub`}
                    >
                      <Icon name="github" size={17} />
                    </a>
                  ) : (
                    <span className="mono">PRIVADO</span>
                  )}
                </div>
              </div>
            </article>
          ),
        )}
      </div>
      {catalog.length > 0 && (
        <div className="catalog">
          <div className="catalog-heading">
            <h3>
              Mais problemas resolvidos<span>.</span>
            </h3>
            <p>Outras entregas, experimentos e pesquisa aplicada.</p>
          </div>
          <div className="catalog-grid">
            {catalog.map((project) => (
              <article key={project.id} className="catalog-card">
                <div className="catalog-symbol" aria-hidden="true">
                  {project.images[0] ? (
                    <Image
                      src={project.images[0].src}
                      alt=""
                      width={45}
                      height={45}
                    />
                  ) : (
                    <Icon
                      name={
                        project.category === "Dev tools"
                          ? "code"
                          : project.category === "Backend & Cloud"
                            ? "server"
                            : "layers"
                      }
                      size={23}
                    />
                  )}
                </div>
                <div className="catalog-copy">
                  <span className="project-context mono">
                    {project.context}
                  </span>
                  <button
                    className="project-title"
                    onClick={() => open(project)}
                  >
                    <h4>{project.name}</h4>
                    <Icon name="arrow" size={19} />
                  </button>
                  <p>{project.summary}</p>
                  <div className="catalog-stack">
                    {project.stack.slice(0, 3).join(" / ")}
                  </div>
                  <div className="catalog-links">
                    <button
                      onClick={() => open(project)}
                      aria-label={`Detalhes de ${project.name}`}
                    >
                      Explorar projeto →
                    </button>
                    {project.links
                      .filter((link) => link.kind === "github")
                      .map((link) => (
                        <a
                          key={link.url}
                          href={link.url}
                          target="_blank"
                          rel="noreferrer"
                          aria-label={`${project.name} no GitHub`}
                        >
                          <Icon name="github" size={16} /> GitHub
                        </a>
                      ))}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}
      {filtered.length === 0 && (
        <div className="empty-projects">
          <Icon name="search" size={32} />
          <h3>Nenhum projeto por aqui.</h3>
          <p>Tente outra tecnologia ou explore a seleção completa.</p>
          <button
            className="button button-dark"
            onClick={() => {
              setQuery("");
              setCategory("Todos");
            }}
          >
            Ver todos os projetos <Icon name="arrow" size={16} />
          </button>
        </div>
      )}
      {selected && (
        <ProjectDialog key={selected.id} project={selected} onClose={close} />
      )}
    </>
  );
}
