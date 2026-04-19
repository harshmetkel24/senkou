import { useEffect, useRef, useState } from "react";

export function useIntersectionObserver(options?: IntersectionObserverInit) {
  const ref = useRef<HTMLDivElement>(null);
  const optionsRef = useRef(options);
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
    }, optionsRef.current);

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return { ref, isIntersecting };
}
