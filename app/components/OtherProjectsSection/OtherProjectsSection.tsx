"use client";

import { otherProjects } from "@/app/data/otherProjects";
import { useFadeIn } from "@/app/hooks/useFadeIn";
import SectionHeader from "@/app/components/SectionHeader/SectionHeader";
import styles from "./OtherProjectsSection.module.css";

export default function OtherProjectsSection() {
    const fadeHeader = useFadeIn();
    const fadeGrid = useFadeIn();

    return (
        <section id="outros-projetos" className={styles.section}>
            <div
                ref={fadeHeader.ref}
                className={`fadeIn ${fadeHeader.isVisible ? "fadeInVisible" : ""}`}
            >
                <SectionHeader
                    tag="06 — Outros projetos"
                    title="Laboratório"
                    subtitle="Projetos de aprendizado, experimentos e trabalhos em andamento."
                />
            </div>

            <div
                ref={fadeGrid.ref}
                className={`${styles.miniGrid} fadeIn ${fadeGrid.isVisible ? "fadeInVisible" : ""}`}
            >
                {otherProjects.map((project, i) => (
                    <div
                        key={project.title}
                        className={styles.miniCard}
                        style={{ transitionDelay: `${i * 80}ms` }}
                    >
                        <div className={styles.miniCardTop}>
                            <span className={styles.miniEmoji}>{project.emoji}</span>
                            <span
                                className={`${styles.miniStatus} ${project.status === "dev" ? styles.statusDev : styles.statusDone
                                    }`}
                            >
                                {project.statusLabel}
                            </span>
                        </div>
                        <h4 className={styles.miniTitle}>{project.title}</h4>
                        <p className={styles.miniDesc}>{project.description}</p>
                        <div className={styles.miniStack}>
                            {project.stack.map((tag) => (
                                <span key={tag} className={styles.miniTag}>
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
