"use client";

import { experiences } from "@/app/data/experience";
import { useFadeIn } from "@/app/hooks/useFadeIn";
import SectionHeader from "@/app/components/SectionHeader/SectionHeader";
import styles from "./ExperienceSection.module.css";

export default function ExperienceSection() {
    const fadeHeader = useFadeIn();

    return (
        <section id="experiencia" className={styles.section}>
            <div
                ref={fadeHeader.ref}
                className={`fadeIn ${fadeHeader.isVisible ? "fadeInVisible" : ""}`}
            >
                <SectionHeader tag="03 — Experiência" title="Trajetória" />
            </div>

            <div className={styles.timeline}>
                {experiences.map((exp, i) => (
                    <TimelineItem key={i} experience={exp} index={i} />
                ))}
            </div>
        </section>
    );
}

function TimelineItem({
    experience,
    index,
}: {
    experience: (typeof experiences)[0];
    index: number;
}) {
    const fade = useFadeIn();

    return (
        <div
            ref={fade.ref}
            className={`${styles.timelineItem} fadeIn ${fade.isVisible ? "fadeInVisible" : ""}`}
            style={{ transitionDelay: `${index * 80}ms` }}
        >
            <div
                className={`${styles.timelineDot} ${experience.active ? styles.timelineDotActive : ""
                    }`}
            />
            <div className={styles.timelineLeft}>
                <div className={styles.timelinePeriod}>{experience.period}</div>
                <div className={styles.timelineCompany}>{experience.company}</div>
            </div>
            <div>
                <div className={styles.timelineRole}>{experience.role}</div>
                <span
                    className={`${styles.timelineBadge} ${experience.badge === "current"
                            ? styles.badgeCurrent
                            : styles.badgePast
                        }`}
                >
                    {experience.badgeLabel}
                </span>
                <p className={styles.timelineDesc}>{experience.description}</p>
                <div className={styles.timelineSub}>
                    {experience.subItems.map((item, j) => (
                        <div key={j} className={styles.timelineSubItem}>
                            {item}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
