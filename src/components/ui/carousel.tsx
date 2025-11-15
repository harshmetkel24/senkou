import { ChevronLeft, ChevronRight, type LucideIcon } from "lucide-react";
import {
  Children,
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
  type ElementRef,
  type HTMLAttributes,
  type MouseEvent,
  type MutableRefObject,
  type PointerEvent,
  type Ref,
} from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type CarouselContextValue = {
  activeIndex: number;
  slideCount: number;
  setSlideCount: (count: number) => void;
  goTo: (index: number) => void;
  next: () => void;
  previous: () => void;
  isDragging: boolean;
  setIsDragging: (value: boolean) => void;
  dragPercent: number;
  setDragPercent: (value: number) => void;
  containerRef: MutableRefObject<HTMLDivElement | null>;
  pause: () => void;
  resume: () => void;
};

const CarouselContext = createContext<CarouselContextValue | null>(null);

const useCarouselContext = () => {
  const context = useContext(CarouselContext);
  if (!context) {
    throw new Error("Carousel components must be used within <Carousel>");
  }
  return context;
};

type CarouselProps = HTMLAttributes<HTMLDivElement> & {
  autoPlayInterval?: number;
  loop?: boolean;
  pauseOnHover?: boolean;
};

const clampIndex = (index: number, count: number) => {
  if (count <= 0) return 0;
  if (index < 0) return 0;
  if (index >= count) return count - 1;
  return index;
};

const interactiveSelector =
  "button, a, input, textarea, select, [role='button'], [data-carousel-interactive='true']";

const isInteractiveTarget = (target: EventTarget | null) => {
  if (!(target instanceof Element)) return false;
  return Boolean(target.closest(interactiveSelector));
};

function setNodeRef<T>(
  node: T | null,
  ref: Ref<T> | null | undefined,
  setState: (value: T | null) => void,
) {
  setState(node);
  if (!ref) return;
  if (typeof ref === "function") {
    ref(node);
  } else {
    (ref as MutableRefObject<T | null>).current = node;
  }
}

export const Carousel = forwardRef<ElementRef<"div">, CarouselProps>(
  (
    {
      children,
      className,
      autoPlayInterval = 2000,
      loop = true,
      pauseOnHover = true,
      ...props
    },
    ref,
  ) => {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [activeIndex, setActiveIndex] = useState(0);
    const [slideCount, setSlideCount] = useState(0);
    const [dragPercent, setDragPercent] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [isManuallyPaused, setIsManuallyPaused] = useState(false);
    const derivedPause = pauseOnHover && isHovered;
    const isPaused = isManuallyPaused || derivedPause;

    const goTo = useCallback(
      (index: number) => {
        setActiveIndex((prev) => {
          if (!slideCount) return prev;
          if (loop) {
            const normalized = ((index % slideCount) + slideCount) % slideCount;
            return normalized;
          }
          return clampIndex(index, slideCount);
        });
      },
      [loop, slideCount],
    );

    const next = useCallback(() => {
      setActiveIndex((prev) => {
        if (!slideCount) return prev;
        if (loop) {
          return (prev + 1) % slideCount;
        }
        return Math.min(prev + 1, slideCount - 1);
      });
    }, [loop, slideCount]);

    const previous = useCallback(() => {
      setActiveIndex((prev) => {
        if (!slideCount) return prev;
        if (loop) {
          return (prev - 1 + slideCount) % slideCount;
        }
        return Math.max(prev - 1, 0);
      });
    }, [loop, slideCount]);

    useEffect(() => {
      if (!slideCount) return;
      setActiveIndex((prev) => Math.min(prev, slideCount - 1));
    }, [slideCount]);

    useEffect(() => {
      if (!slideCount || autoPlayInterval <= 0) return;
      const id = window.setInterval(() => {
        if (isPaused || isDragging) return;
        setActiveIndex((prev) => {
          if (!slideCount) return prev;
          if (loop) {
            return (prev + 1) % slideCount;
          }
          return prev === slideCount - 1 ? prev : prev + 1;
        });
      }, autoPlayInterval);
      return () => window.clearInterval(id);
    }, [autoPlayInterval, isDragging, isPaused, loop, slideCount]);

    const pause = useCallback(() => setIsManuallyPaused(true), []);
    const resume = useCallback(() => setIsManuallyPaused(false), []);

    const value = useMemo<CarouselContextValue>(
      () => ({
        activeIndex,
        slideCount,
        setSlideCount,
        goTo,
        next,
        previous,
        isDragging,
        setIsDragging,
        dragPercent,
        setDragPercent,
        containerRef,
        pause,
        resume,
      }),
      [
        activeIndex,
        dragPercent,
        goTo,
        isDragging,
        next,
        pause,
        previous,
        resume,
        slideCount,
      ],
    );

    const setContainer = useCallback(
      (node: HTMLDivElement | null) =>
        setNodeRef(node, ref, (value) => {
          containerRef.current = value;
        }),
      [ref],
    );

    return (
      <CarouselContext.Provider value={value}>
        <div
          ref={setContainer}
          className={cn("relative", className)}
          onPointerEnter={() => setIsHovered(true)}
          onPointerLeave={() => setIsHovered(false)}
          {...props}
        >
          {children}
        </div>
      </CarouselContext.Provider>
    );
  },
);
Carousel.displayName = "Carousel";

export const CarouselContent = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
  const {
    activeIndex,
    dragPercent,
    setDragPercent,
    slideCount,
    setSlideCount,
    isDragging,
    setIsDragging,
    next,
    previous,
    containerRef,
    pause,
    resume,
  } = useCarouselContext();
  const items = Children.toArray(children);
  const pointerIdRef = useRef<number | null>(null);
  const startXRef = useRef(0);

  useEffect(() => {
    setSlideCount(items.length);
  }, [items.length, setSlideCount]);

  useEffect(() => {
    if (!isDragging) {
      setDragPercent(0);
    }
  }, [isDragging, setDragPercent]);

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (items.length <= 1) return;
    if (isInteractiveTarget(event.target)) return;
    pointerIdRef.current = event.pointerId;
    startXRef.current = event.clientX;
    setIsDragging(true);
    pause();
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!isDragging || pointerIdRef.current !== event.pointerId) return;
    const width = containerRef.current?.clientWidth ?? 1;
    const delta = event.clientX - startXRef.current;
    setDragPercent((delta / width) * 100);
  };

  const finalizePointer = (event: PointerEvent<HTMLDivElement>) => {
    if (pointerIdRef.current !== event.pointerId) return;
    const width = containerRef.current?.clientWidth ?? 1;
    const delta = event.clientX - startXRef.current;
    const threshold = Math.max(40, width * 0.15);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    if (Math.abs(delta) > threshold) {
      if (delta < 0) {
        next();
      } else {
        previous();
      }
    }
    setDragPercent(0);
    setIsDragging(false);
    resume();
    pointerIdRef.current = null;
  };

  const style = {
    transform: `translate3d(calc(-${activeIndex * 100}% + ${dragPercent}%), 0, 0)`,
  };

  const combinedRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (typeof ref === "function") {
        ref(node);
      } else if (ref) {
        (ref as MutableRefObject<HTMLDivElement | null>).current = node;
      }
    },
    [ref],
  );

  return (
    <div
      ref={combinedRef}
      className="overflow-hidden"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={finalizePointer}
      onPointerCancel={finalizePointer}
      onPointerLeave={(event) => {
        if (isDragging) {
          finalizePointer(event);
        }
      }}
    >
      <div
        className={cn(
          "flex touch-pan-y select-none",
          isDragging
            ? "cursor-grabbing transition-none"
            : "cursor-grab transition-transform duration-500 ease-out",
          className,
        )}
        style={style}
        {...props}
      >
        {items}
      </div>
    </div>
  );
});
CarouselContent.displayName = "CarouselContent";

export const CarouselItem = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("min-w-0 flex-[0_0_100%] basis-full", className)}
    {...props}
  />
));
CarouselItem.displayName = "CarouselItem";

type ControlProps = ComponentPropsWithoutRef<typeof Button> & {
  icon?: LucideIcon;
};

const baseControlClasses =
  "absolute top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/50 text-white shadow-lg transition hover:bg-black/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary";

const CarouselControl = forwardRef<ElementRef<typeof Button>, ControlProps>(
  ({ className, icon: Icon, ...props }, ref) => (
    <Button
      ref={ref}
      size="icon"
      variant="ghost"
      type="button"
      className={cn(baseControlClasses, className)}
      {...props}
    >
      {Icon ? <Icon className="h-4 w-4" /> : null}
      <span className="sr-only">{props["aria-label"]}</span>
    </Button>
  ),
);
CarouselControl.displayName = "CarouselControl";

export const CarouselPrevious = forwardRef<
  ElementRef<typeof Button>,
  ComponentPropsWithoutRef<typeof Button>
>(({ className, ...props }, ref) => {
  const { slideCount, previous } = useCarouselContext();
  if (slideCount <= 1) return null;
  return (
    <CarouselControl
      ref={ref}
      icon={ChevronLeft}
      aria-label="Previous slide"
      className={cn("left-4", className)}
      onClick={(event: MouseEvent<HTMLButtonElement>) => {
        event.stopPropagation();
        previous();
      }}
      {...props}
    />
  );
});
CarouselPrevious.displayName = "CarouselPrevious";

export const CarouselNext = forwardRef<
  ElementRef<typeof Button>,
  ComponentPropsWithoutRef<typeof Button>
>(({ className, ...props }, ref) => {
  const { slideCount, next } = useCarouselContext();
  if (slideCount <= 1) return null;
  return (
    <CarouselControl
      ref={ref}
      icon={ChevronRight}
      aria-label="Next slide"
      className={cn("right-4", className)}
      onClick={(event: MouseEvent<HTMLButtonElement>) => {
        event.stopPropagation();
        next();
      }}
      {...props}
    />
  );
});
CarouselNext.displayName = "CarouselNext";

export type CarouselIndicatorProps = HTMLAttributes<HTMLDivElement>;

export const CarouselIndicators = ({
  className,
  ...props
}: CarouselIndicatorProps) => {
  const { slideCount, activeIndex, goTo } = useCarouselContext();
  if (slideCount <= 1) return null;
  return (
    <div
      className={cn(
        "absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-2",
        className,
      )}
      {...props}
    >
      {Array.from({ length: slideCount }).map((_, index) => (
        <button
          key={index}
          type="button"
          className={cn(
            "h-2 w-8 rounded-full bg-white/30 transition",
            index === activeIndex
              ? "bg-white shadow-[0_0_16px_rgba(0,0,0,0.45)]"
              : "",
          )}
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            goTo(index);
          }}
        >
          <span className="sr-only">Go to slide {index + 1}</span>
        </button>
      ))}
    </div>
  );
};
