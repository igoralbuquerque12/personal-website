import styles from "./BackgroundEffects.module.css";

export default function BackgroundEffects() {
    return (
        <>
            <div className={styles.gridBg} />
            <div className={`${styles.ambient} ${styles.ambient1}`} />
            <div className={`${styles.ambient} ${styles.ambient2}`} />
        </>
    );
}
