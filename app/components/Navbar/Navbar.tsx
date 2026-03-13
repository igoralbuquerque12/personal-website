"use client";

import { useNavScroll } from "@/app/hooks/useNavScroll";
import { personalInfo } from "@/app/data/personal";
import styles from "./Navbar.module.css";

const navItems = [
    { href: "#sobre", label: "Sobre" },
    { href: "#experiencia", label: "Experiência" },
    { href: "#projetos", label: "Projetos" },
    { href: "#publicacoes", label: "Pesquisa" },
    { href: "#contato", label: "Contato" },
];

export default function Navbar() {
    const navRef = useNavScroll();

    return (
        <nav ref={navRef} className={styles.nav}>
            <div className={styles.logo}>
                ig.<span>dev</span>
            </div>
            <ul className={styles.links}>
                {navItems.map((item) => (
                    <li key={item.href}>
                        <a href={item.href}>{item.label}</a>
                    </li>
                ))}
            </ul>
            <a href={personalInfo.cvUrl} className={styles.cta} target="_blank" rel="noopener noreferrer">
                ↓ Currículo
            </a>
        </nav>
    );
}
