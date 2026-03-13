"use client";

import { personalInfo } from "@/app/data/personal";
import { useFadeIn } from "@/app/hooks/useFadeIn";
import styles from "./ContactSection.module.css";

export default function ContactSection() {
    const fade = useFadeIn();

    return (
        <section id="contato" className={styles.section}>
            <div
                ref={fade.ref}
                className={`fadeIn ${fade.isVisible ? "fadeInVisible" : ""}`}
            >
                <p className={styles.contactTag}>07 — Contato</p>
                <h2 className={styles.contactTitle}>
                    Tem um problema
                    <br />
                    <span className={styles.outline}>interessante?</span>
                </h2>
                <p className={styles.contactDesc}>
                    Estou aberto a oportunidades fullstack. Se você tem um desafio real
                    para resolver, me manda uma mensagem.
                </p>
                <div className={styles.contactLinks}>
                    <a
                        href={`mailto:${personalInfo.email}`}
                        className={`${styles.contactLink} ${styles.email}`}
                    >
                        ✉ {personalInfo.email}
                    </a>
                    <a
                        href={personalInfo.linkedin}
                        className={`${styles.contactLink} ${styles.secondary}`}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        LinkedIn ↗
                    </a>
                    <a
                        href={personalInfo.github}
                        className={`${styles.contactLink} ${styles.secondary}`}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        GitHub ↗
                    </a>
                    <a
                        href={personalInfo.cvUrl}
                        className={`${styles.contactLink} ${styles.secondary}`}
                        download
                    >
                        ↓ Baixar CV
                    </a>
                </div>
            </div>
        </section>
    );
}
