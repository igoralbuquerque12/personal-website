"use client";

import { useEffect, useRef } from "react";

export function useNavScroll() {
    const navRef = useRef<HTMLElement>(null);

    useEffect(() => {
        const handleScroll = () => {
            const nav = navRef.current;
            if (!nav) return;
            if (window.scrollY > 60) {
                nav.style.background = "rgba(2,8,23,0.95)";
            } else {
                nav.style.background = "rgba(2,8,23,0.7)";
            }
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return navRef;
}
