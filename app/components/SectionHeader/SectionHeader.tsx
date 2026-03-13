import styles from "./SectionHeader.module.css";

interface SectionHeaderProps {
    tag: string;
    title: string;
    titleHtml?: string;
    subtitle?: string;
    className?: string;
}

export default function SectionHeader({
    tag,
    title,
    titleHtml,
    subtitle,
    className = "",
}: SectionHeaderProps) {
    return (
        <div className={`${styles.header} ${className}`}>
            <div className={styles.tag}>{tag}</div>
            {titleHtml ? (
                <h2
                    className={styles.title}
                    dangerouslySetInnerHTML={{ __html: titleHtml }}
                />
            ) : (
                <h2 className={styles.title}>{title}</h2>
            )}
            {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        </div>
    );
}
