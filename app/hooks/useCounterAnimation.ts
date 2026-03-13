"use client";

import { useEffect, useRef, useState } from "react";

export function useCounterAnimation(target: number, duration = 1200, threshold = 0.5) {
    const ref = useRef<HTMLSpanElement>(null);
    const [count, setCount] = useState(0);
    const hasAnimated = useRef(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting && !hasAnimated.current) {
                        hasAnimated.current = true;
                        const start = performance.now();
                        const animate = (timestamp: number) => {
                            const progress = Math.min((timestamp - start) / duration, 1);
                            const ease = 1 - Math.pow(1 - progress, 3);
                            setCount(Math.floor(ease * target));
                            if (progress < 1) requestAnimationFrame(animate);
                        };
                        requestAnimationFrame(animate);
                        observer.unobserve(el);
                    }
                });
            },
            { threshold }
        );

        observer.observe(el);
        return () => observer.disconnect();
    }, [target, duration, threshold]);

    return { ref, count };
}
