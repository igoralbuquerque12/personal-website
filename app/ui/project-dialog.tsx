"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  profile,
  projectDocHref,
  projectDocPages,
  type Project,
} from "@/knowledge-base";
import { Icon } from "./icons";

export function ProjectDialog({
  project,
  onClose,
}: {
  project: Project;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const [tab, setTab] = useState("overview");
  // Projetos com página própria mostram só a visão geral; o restante fica lá.
  const hasPage = Boolean(project.docs);
  const hasManual = projectDocPages(project).includes("manual");
  const tabs = [
    { id: "overview", label: "Visão geral" },
    { id: "architecture", label: "Arquitetura" },
    { id: "engineering", label: "Decisões técnicas" },
  ];

  useEffect(() => {
    const dialog = ref.current;
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    dialog?.showModal();
    document.body.style.overflow = "hidden";
    return () => {
      dialog?.close();
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus({ preventScroll: true });
    };
  }, []);

  return (
    <dialog
      ref={ref}
      className="project-dialog"
      aria-labelledby="project-dialog-title"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          const bounds = event.currentTarget.getBoundingClientRect();
          if (
            event.clientX < bounds.left ||
            event.clientX > bounds.right ||
            event.clientY < bounds.top ||
            event.clientY > bounds.bottom
          )
            onClose();
        }
      }}
    >
      <div className="dialog-topbar">
        <span className="mono">
          PROJETO / {String(project.rank).padStart(2, "0")}
        </span>
        <button
          type="button"
          onClick={onClose}
          className="close-dialog"
          aria-label="Fechar projeto"
          autoFocus
        >
          <span>Fechar</span>
          <kbd>ESC</kbd>
          <Icon name="close" size={18} />
        </button>
      </div>
      <header className="dialog-heading">
        <p className="eyebrow">{project.context}</p>
        <h2 id="project-dialog-title">
          {project.name}
          <span>.</span>
        </h2>
        <p>{project.summary}</p>
        <div className="tags">
          {project.stack.map((tech) => (
            <span key={tech}>{tech}</span>
          ))}
        </div>
        <div className="dialog-links">
          {hasPage && (
            <Link className="dialog-detail-link" href={projectDocHref(project)}>
              Ver com detalhes <Icon name="arrow" size={15} />
            </Link>
          )}
          {project.links.map((link) => (
            <a
              key={link.url}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Icon
                name={
                  link.kind === "github"
                    ? "github"
                    : link.kind === "document"
                      ? "file"
                      : "globe"
                }
                size={16}
              />
              {link.label}
              <Icon name="arrow" size={15} />
            </a>
          ))}
          {project.context.includes("privad") && (
            <span className="private-label">
              Código privado · detalhes técnicos abaixo
            </span>
          )}
        </div>
      </header>
      {!hasPage && (
        <div
          className="dialog-tabs"
          role="tablist"
          aria-label="Detalhes do projeto"
        >
          {tabs.map((item, index) => (
            <button
              key={item.id}
              id={`tab-${item.id}`}
              role="tab"
              type="button"
              aria-selected={tab === item.id}
              aria-controls={`panel-${item.id}`}
              tabIndex={tab === item.id ? 0 : -1}
              onClick={() => setTab(item.id)}
              onKeyDown={(event) => {
                let next = index;
                if (event.key === "ArrowRight")
                  next = (index + 1) % tabs.length;
                else if (event.key === "ArrowLeft")
                  next = (index + tabs.length - 1) % tabs.length;
                else if (event.key === "Home") next = 0;
                else if (event.key === "End") next = tabs.length - 1;
                else return;
                event.preventDefault();
                setTab(tabs[next].id);
                document.getElementById(`tab-${tabs[next].id}`)?.focus();
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
      <div
        className="dialog-content"
        {...(!hasPage && {
          role: "tabpanel",
          id: `panel-${tab}`,
          "aria-labelledby": `tab-${tab}`,
          tabIndex: 0,
        })}
      >
        {tab === "overview" && (
          <>
            <div className="role-callout">
              <Icon name="code" />
              <div>
                <span className="eyebrow">MINHA CONTRIBUIÇÃO</span>
                <p>{project.role}</p>
              </div>
            </div>
            <div className="story-grid">
              <section>
                <h3>O problema</h3>
                <p>{project.problem}</p>
              </section>
              <section>
                <h3>A solução</h3>
                <p>{project.solution}</p>
              </section>
            </div>
            <section className="outcome-section">
              <h3>O que essa entrega representa</h3>
              <ul>
                {project.outcomes.map((outcome) => (
                  <li key={outcome}>
                    <Icon name="check" size={18} />
                    <span>{outcome}</span>
                  </li>
                ))}
              </ul>
            </section>
            {hasPage ? (
              <div className="dialog-more">
                <div>
                  <span className="eyebrow">VÁ ALÉM DO RESUMO</span>
                  <p>
                    {hasManual
                      ? "Arquitetura e decisões técnicas estão no guia. Comandos, flags e configuração, na documentação."
                      : "Arquitetura, fluxos e decisões técnicas estão no guia completo do projeto."}
                  </p>
                </div>
                <div className="dialog-more-links">
                  <Link href={projectDocHref(project)}>
                    Como funciona <Icon name="arrow" size={15} />
                  </Link>
                  {hasManual && (
                    <Link href={projectDocHref(project, "manual")}>
                      Documentação <Icon name="arrow" size={15} />
                    </Link>
                  )}
                </div>
              </div>
            ) : (
              <button
                className="text-button"
                onClick={() => setTab("architecture")}
              >
                Explorar a arquitetura <Icon name="arrow" size={17} />
              </button>
            )}
          </>
        )}
        {tab === "architecture" && (
          <>
            <section>
              <span className="eyebrow">SYSTEM DESIGN</span>
              <h3 className="large-subtitle">{project.architecture.title}</h3>
              <p>{project.architecture.description}</p>
            </section>
            {project.architecture.steps.length > 0 && (
              <div
                className="architecture-flow"
                aria-label="Fluxo de arquitetura"
              >
                {project.architecture.steps.map((step, index) => (
                  <div key={step.label} className="flow-step">
                    <span className="mono">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <strong>{step.label}</strong>
                    <p>{step.detail}</p>
                    {index < project.architecture.steps.length - 1 && (
                      <span className="flow-arrow" aria-hidden="true">
                        →
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
            {project.architecture.notes.length > 0 && (
              <ul className="architecture-notes">
                {project.architecture.notes.map((note) => (
                  <li key={note}>{note}</li>
                ))}
              </ul>
            )}
            <div className="project-gallery">
              {project.images.length > 0 ? (
                project.images.map((picture) => (
                  <figure key={picture.src}>
                    <a
                      href={picture.src}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={`Ampliar: ${picture.alt}`}
                    >
                      <div className={`gallery-image gallery-${picture.kind}`}>
                        <Image
                          src={picture.src}
                          alt={picture.alt}
                          fill
                          sizes="(max-width: 700px) 90vw, 800px"
                        />
                      </div>
                    </a>
                    <figcaption>
                      {picture.caption} <span>↗ Ampliar</span>
                    </figcaption>
                  </figure>
                ))
              ) : (
                <div className="image-placeholder">
                  <Icon name="layers" size={36} />
                  <strong>O projeto vai além da imagem.</strong>
                  <span>Imagens deste projeto serão adicionadas em breve.</span>
                </div>
              )}
            </div>
          </>
        )}
        {tab === "engineering" && (
          <>
            <span className="eyebrow">ENGENHARIA EM DETALHE</span>
            <div className="engineering-list">
              {project.highlights.map((highlight, index) => (
                <section key={highlight.title}>
                  <span className="engineering-number mono">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3>{highlight.title}</h3>
                    <p>{highlight.description}</p>
                  </div>
                </section>
              ))}
            </div>
            {project.tradeoffs.length > 0 && (
              <section className="tradeoffs">
                <span className="eyebrow">TRADE-OFFS & EVOLUÇÃO</span>
                <h3>O desenho também tem escolhas.</h3>
                {project.tradeoffs.map((item) => (
                  <p key={item}>{item}</p>
                ))}
              </section>
            )}
          </>
        )}
      </div>
      <footer className="dialog-footer">
        <span>{project.category}</span>
        <a href={`mailto:${profile.email}`}>
          Vamos falar sobre este projeto <Icon name="arrow" size={16} />
        </a>
      </footer>
    </dialog>
  );
}
