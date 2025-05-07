import { useEffect, useRef } from "react";

type UseAutoScrollOptions = {
  containerRef: React.RefObject<HTMLElement | null>;
  isDragging: boolean;
  pointerY: number | null;
  threshold?: number;
  maxSpeed?: number;
};

export function useAutoScroll({
  containerRef,
  isDragging,
  pointerY,
  threshold = 60,
  maxSpeed = 20,
}: UseAutoScrollOptions) {
  const scrollIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !isDragging || pointerY == null) {
      if (scrollIntervalRef.current !== null) {
        clearInterval(scrollIntervalRef.current);
        scrollIntervalRef.current = null;
      }
      return;
    }

    const doScroll = () => {
      const rect = container.getBoundingClientRect();

      if (pointerY < rect.top + threshold) {
        const distance = Math.max(1, rect.top + threshold - pointerY);
        const ratio = distance / threshold;
        const scrollAmount = -Math.min(maxSpeed, ratio * maxSpeed);
        container.scrollBy({ top: scrollAmount, behavior: "auto" }); // or "smooth"
      } else if (pointerY > rect.bottom - threshold) {
        const distance = Math.max(1, pointerY - (rect.bottom - threshold));
        const ratio = distance / threshold;
        const scrollAmount = Math.min(maxSpeed, ratio * maxSpeed);
        container.scrollBy({ top: scrollAmount, behavior: "auto" }); // or "smooth"
      }
    };

    scrollIntervalRef.current = window.setInterval(doScroll, 16); // ~60fps

    return () => {
      if (scrollIntervalRef.current !== null) {
        clearInterval(scrollIntervalRef.current);
        scrollIntervalRef.current = null;
      }
    };
  }, [containerRef, isDragging, pointerY, threshold, maxSpeed]);
}
