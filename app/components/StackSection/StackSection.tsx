"use client";

import { stackGroups } from "@/app/data/stack";
import { useFadeIn } from "@/app/hooks/useFadeIn";
import SectionHeader from "@/app/components/SectionHeader/SectionHeader";
import styles from "./StackSection.module.css";

export default function StackSection() {
    const fadeHeader = useFadeIn();
    const fadeGrid = useFadeIn();

    return (
        <section id="stack" className={styles.section}>
            <div
                ref={fadeHeader.ref}
                className={`fadeIn ${fadeHeader.isVisible ? "fadeInVisible" : ""}`}
            >
                <SectionHeader
                    tag="02 — Stack"
                    title="Tecnologias"
                    subtitle="O que uso no dia a dia para construir sistemas completos, do banco de dados ao deploy."
                />
            </div>

            <div
                ref={fadeGrid.ref}
                className={`${styles.stackGroups} fadeIn ${fadeGrid.isVisible ? "fadeInVisible" : ""}`}
            >
                {stackGroups.map((group, i) => (
                    <div
                        key={group.title}
                        className={styles.stackGroup}
                        style={{ transitionDelay: `${i * 80}ms` }}
                    >
                        <div className={styles.stackGroupTitle}>{group.title}</div>
                        <div className={styles.stackPills}>
                            {group.pills.map((pill) => (
                                <span key={pill} className={styles.pill}>
                                    {pill}
                                </span>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
