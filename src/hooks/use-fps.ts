import { useEffect, useRef, useState } from "react";

export interface UseFpsOptions {
    /**
     * Calculate the FPS on every x frames.
     * @default 10
     */
    every?: number;
}

export function useFps({ every = 20 }: UseFpsOptions = {}): number {
    const [fps, setFps] = useState(0);
    const frameCount = useRef(0);
    const lastTime = useRef(performance.now());
    const fpsRef = useRef(0);

    useEffect(() => {
        const update = () => {
            frameCount.current += 1;
            if (frameCount.current >= every) {
                const now = performance.now();
                const delta = now - lastTime.current;
                fpsRef.current = (frameCount.current * 1000) / delta;

                setFps(fpsRef.current);  // Update state less frequently
                frameCount.current = 0;
                lastTime.current = now;
            }

            requestAnimationFrame(update);
        };

        const rafId = requestAnimationFrame(update);

        return () => {
            cancelAnimationFrame(rafId);  // Clean up
        };
    }, [every]);

    return fps;
}

const useFpsMock = (options?: UseFpsOptions) => 0;

export default typeof performance === "undefined" ? useFpsMock : useFps;
