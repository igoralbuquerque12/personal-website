"use client";

import { projects } from "@/app/data/projects";
import { useFadeIn } from "@/app/hooks/useFadeIn";
import SectionHeader from "@/app/components/SectionHeader/SectionHeader";
import Image from "next/image";
import styles from "./ProjectsSection.module.css";

const GitHubIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
        <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
);

const ImagePlaceholder = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <polyline points="21 15 16 10 5 21" />
    </svg>
);

export default function ProjectsSection() {
    const fadeHeader = useFadeIn();

    return (
        <section id="projetos" className={styles.section}>
            <div
                ref={fadeHeader.ref}
                className={`fadeIn ${fadeHeader.isVisible ? "fadeInVisible" : ""}`}
            >
                <SectionHeader
                    tag="04 — Projetos"
                    title="O que construí"
                    subtitle="Sistemas com propósito real — arquitetura pensada, problema resolvido."
                />
            </div>

            <div className={styles.projectsGrid}>
                {projects.map((project, i) => (
                    <ProjectCard key={project.title} project={project} index={i} />
                ))}
            </div>
        </section>
    );
}

function ProjectCard({
    project,
    index,
}: {
    project: (typeof projects)[0];
    index: number;
}) {
    const fade = useFadeIn();

    return (
        <div
            ref={fade.ref}
            className={`${styles.projectCard} fadeIn ${fade.isVisible ? "fadeInVisible" : ""}`}
            style={{ transitionDelay: `${index * 80}ms` }}
        >
            <div className={styles.projectContent}>
                <div>
                    <div className={styles.projectHeader}>
                        <span className={styles.projectType}>{project.type}</span>
                        <div className={styles.projectLinks}>
                            {project.githubUrl && (
                                <a
                                    href={project.githubUrl}
                                    className={styles.projectLink}
                                    title="GitHub"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <GitHubIcon />
                                </a>
                            )}
                            {project.demoUrl && (
                                <a
                                    href={project.demoUrl}
                                    className={styles.projectLink}
                                    title="Demo"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    ↗
                                </a>
                            )}
                        </div>
                    </div>
                    <h3 className={styles.projectTitle}>{project.title}</h3>
                    <p className={styles.projectTagline}>{project.tagline}</p>
                    <p className={styles.projectDesc}>{project.description}</p>
                    <div className={styles.projectFeatures}>
                        {project.features.map((feature, j) => (
                            <div key={j} className={styles.projectFeature}>
                                {feature}
                            </div>
                        ))}
                    </div>
                </div>
                <div className={styles.projectStack}>
                    {project.stack.map((tag) => (
                        <span key={tag} className={styles.projectTag}>
                            {tag}
                        </span>
                    ))}
                </div>
            </div>
            <div className={styles.projectImagePanel}>
                {project.image ? (
                    <Image
                        src={project.image}
                        alt={`Screenshot do projeto ${project.title}`}
                        fill
                        style={{ objectFit: "cover" }}
                    />
                ) : (
                    <div className={styles.projectImgPlaceholder}>
                        <ImagePlaceholder />
                        <span>Screenshot do projeto</span>
                    </div>
                )}
            </div>
        </div>
    );
}
