"use client";

import { publications } from "@/app/data/publications";
import { useFadeIn } from "@/app/hooks/useFadeIn";
import SectionHeader from "@/app/components/SectionHeader/SectionHeader";
import styles from "./PublicationsSection.module.css";

export default function PublicationsSection() {
    const fadeHeader = useFadeIn();
    const fadeGrid = useFadeIn();

    return (
        <section id="publicacoes" className={styles.section}>
            <div
                ref={fadeHeader.ref}
                className={`fadeIn ${fadeHeader.isVisible ? "fadeInVisible" : ""}`}
            >
                <SectionHeader
                    tag="05 — Pesquisa"
                    title="Publicações científicas"
                    subtitle="Pesquisa aplicada em machine learning e otimização, com foco em saúde e dados."
                />
            </div>

            <div
                ref={fadeGrid.ref}
                className={`${styles.papersGrid} fadeIn ${fadeGrid.isVisible ? "fadeInVisible" : ""}`}
            >
                {publications.map((pub, i) => (
                    <a
                        key={i}
                        href={pub.url}
                        className={styles.paperCard}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ transitionDelay: `${i * 80}ms` }}
                    >
                        <div>
                            <div className={styles.paperIcon}>{pub.emoji}</div>
                            <div className={styles.paperEvent}>{pub.event}</div>
                            <h3 className={styles.paperTitle}>{pub.title}</h3>
                            <p className={styles.paperDesc}>{pub.description}</p>
                        </div>
                        <div className={styles.paperFooter}>
                            <span className={styles.paperArea}>{pub.area}</span>
                            <span className={styles.paperArrow}>→</span>
                        </div>
                    </a>
                ))}
            </div>
        </section>
    );
}
