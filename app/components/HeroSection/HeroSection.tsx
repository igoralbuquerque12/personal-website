"use client";

import { personalInfo, heroStats } from "@/app/data/personal";
import { useFadeIn } from "@/app/hooks/useFadeIn";
import { useCounterAnimation } from "@/app/hooks/useCounterAnimation";
import Image from "next/image";
import styles from "./HeroSection.module.css";

function StatItem({ number, suffix, label }: { number: number; suffix: string; label: string }) {
    const { ref, count } = useCounterAnimation(number);

    return (
        <div className={styles.stat}>
            <div className={styles.statNumber}>
                <span ref={ref} className="num">{count}</span>
                {suffix && <span>{suffix}</span>}
            </div>
            <div className={styles.statLabel}>{label}</div>
        </div>
    );
}

export default function HeroSection() {
    const fadeLeft = useFadeIn();
    const fadeRight = useFadeIn();

    return (
        <div id="hero" className={styles.hero}>
            <div
                ref={fadeLeft.ref}
                className={`fadeIn ${fadeLeft.isVisible ? "fadeInVisible" : ""}`}
            >
                <h1 className={styles.heroName}>
                    <div className={styles.first}>{personalInfo.firstName}</div>
                    <div className={styles.last}>{personalInfo.lastName}</div>
                </h1>
                <p className={styles.heroRole}>{personalInfo.role}</p>
                <p
                    className={styles.heroDesc}
                    dangerouslySetInnerHTML={{ __html: personalInfo.description }}
                />
                <div className={styles.heroActions}>
                    <a href="#projetos" className={styles.btnPrimary}>
                        Ver projetos →
                    </a>
                    <a href="#contato" className={styles.btnSecondary}>
                        Entrar em contato
                    </a>
                    <a href={personalInfo.cvUrl} className={styles.btnSecondary} download>
                        ↓ CV
                    </a>
                </div>
                <div className={styles.heroStats}>
                    {heroStats.map((stat) => (
                        <StatItem key={stat.label} {...stat} />
                    ))}
                </div>
            </div>

            <div
                ref={fadeRight.ref}
                className={`${styles.heroRight} fadeIn ${fadeRight.isVisible ? "fadeInVisible" : ""}`}
            >
                <div className={styles.photoFrame}>
                    <div className={styles.photoInner}>
                        <Image
                            src="/my-picture.jpeg"
                            alt="Igor Albuquerque"
                            fill
                            style={{ objectFit: "cover" }}
                            priority
                        />
                        <div className={`${styles.photoCorner} ${styles.tl}`} />
                        <div className={`${styles.photoCorner} ${styles.tr}`} />
                        <div className={`${styles.photoCorner} ${styles.bl}`} />
                        <div className={`${styles.photoCorner} ${styles.br}`} />
                    </div>
                    <div className={styles.photoBadge}>
                        <div className={styles.photoBadgeDot} />
                        <span className={styles.photoBadgeText}>{personalInfo.location}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
