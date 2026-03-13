"use client";

import { aboutTexts, highlights } from "@/app/data/personal";
import { useFadeIn } from "@/app/hooks/useFadeIn";
import SectionHeader from "@/app/components/SectionHeader/SectionHeader";
import styles from "./AboutSection.module.css";

export default function AboutSection() {
    const fadeLeft = useFadeIn();
    const fadeRight = useFadeIn();

    return (
        <div id="sobre" className={styles.about}>
            <div
                ref={fadeLeft.ref}
                className={`fadeIn ${fadeLeft.isVisible ? "fadeInVisible" : ""}`}
            >
                <SectionHeader
                    tag="01 — Sobre mim"
                    title=""
                    titleHtml="Construo sistemas.<br/>Resolvo problemas."
                />
                {aboutTexts.map((text, i) => (
                    <p
                        key={i}
                        className={styles.text}
                        dangerouslySetInnerHTML={{ __html: text }}
                    />
                ))}
            </div>

            <div
                ref={fadeRight.ref}
                className={`fadeIn ${fadeRight.isVisible ? "fadeInVisible" : ""}`}
            >
                <div className={styles.highlights}>
                    {highlights.map((item, i) => (
                        <div
                            key={i}
                            className={styles.highlightItem}
                            style={{ transitionDelay: `${i * 80}ms` }}
                        >
                            <div className={styles.highlightIcon}>{item.emoji}</div>
                            <div className={styles.highlightText}>
                                <strong>{item.title}</strong>
                                <span>{item.subtitle}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
