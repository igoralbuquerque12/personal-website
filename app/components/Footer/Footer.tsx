import { personalInfo } from "@/app/data/personal";
import styles from "./Footer.module.css";

export default function Footer() {
    return (
        <footer className={styles.footer}>
            <span className={styles.footerText}>
                © 2025 {personalInfo.firstName} {personalInfo.lastName} ·{" "}
                {personalInfo.location}
            </span>
            <div className={styles.footerLinks}>
                <a href={personalInfo.github} target="_blank" rel="noopener noreferrer">
                    GitHub
                </a>
                <a
                    href={personalInfo.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    LinkedIn
                </a>
                <a href={`mailto:${personalInfo.email}`}>Email</a>
            </div>
        </footer>
    );
}
