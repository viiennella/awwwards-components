"use client";

import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Observer } from "gsap/Observer";

if (typeof window !== "undefined") {
  gsap.registerPlugin(Observer);
}

const images = [
  "/radavilleImages/image1.webp",
  "/radavilleImages/image2.webp",
  "/radavilleImages/image3.webp",
  "/radavilleImages/image4.webp",
  "/radavilleImages/image5.webp",
];

// Animation configuration constants
const ANIMATION_CONFIG = {
  DURATION: 1,
  EASE: "cubic-bezier(0,1,0,1)",
  SCALE: 1.1,
  SLIDE_DISTANCE: "50%",
  SLIDE_DISTANCE_HALF: "25%",
  CLIP_INSET: "75%",
  FADE_IN_DURATION: 0.8,
  FADE_IN_EASE: "power2.out",
} as const;

// UI timing constants
const UI_CONFIG = {
  HINTS_AUTO_HIDE_DELAY: 3000, // 3 seconds
  HINTS_TRANSITION_DURATION: 500, // 0.5 seconds
  RESIZE_DEBOUNCE_DELAY: 150, // 150ms debounce for resize
} as const;

// Layout constants
const LAYOUT = {
  CLICK_ZONE_SPLIT: 0.5, // 50% split for left/right click zones
  PARALLAX_MULTIPLIER: 2,
} as const;

// Type definitions
type Direction = "left" | "right";
type ParallaxData = {
  maxX: number;
  maxY: number;
  x: (value: number) => void;
  y: (value: number) => void;
} | null;

// Utility function for debouncing
const debounce = <T extends (...args: unknown[]) => void>(
  fn: T,
  delay: number,
): ((...args: Parameters<T>) => void) => {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
};

export default function RadavilleImageGallery() {
  // State management
  const [currentIndex, setCurrentIndex] = useState(0);
  const [minimapIndex, setMinimapIndex] = useState(1);
  const [showHints, setShowHints] = useState(true);

  // Refs for DOM elements
  const containerRef = useRef<HTMLDivElement>(null);
  const minimapRef = useRef<HTMLDivElement>(null);

  // Refs for animation state
  const isAnimating = useRef(false);
  const currentIndexRef = useRef(0);
  const minimapIndexRef = useRef(1);
  const hintTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Refs for navigation functions
  const goNextRef = useRef<() => void>(() => {});
  const goPrevRef = useRef<() => void>(() => {});

  // Sync state with refs for use in callbacks
  useEffect(() => {
    currentIndexRef.current = currentIndex;
    minimapIndexRef.current = minimapIndex;
  }, [currentIndex, minimapIndex]);

  // Cleanup hint timer on unmount
  useEffect(() => {
    return () => {
      if (hintTimerRef.current) {
        clearTimeout(hintTimerRef.current);
      }
    };
  }, []);

  useGSAP(
    () => {
      if (!containerRef.current || !minimapRef.current) return;

      // Create slide animation with directional easing and clip-path effects
      const createSlideAnimation = (
        container: HTMLDivElement,
        currentIdx: number,
        targetIdx: number,
        direction: Direction,
        dataAttr: string,
        onComplete: (targetIdx: number) => void,
      ) => {
        const currentEl = container.querySelector(
          `[${dataAttr}="${currentIdx}"]`,
        ) as HTMLElement;
        const nextEl = container.querySelector(
          `[${dataAttr}="${targetIdx}"]`,
        ) as HTMLElement;

        if (!currentEl || !nextEl) return;

        // Ensure proper z-index stacking
        gsap.set(currentEl, { zIndex: 1 });

        const tl = gsap.timeline({
          onComplete: () => {
            onComplete(targetIdx);
            gsap.set(currentEl, { opacity: 0 });
            gsap.set([currentEl, nextEl], {
              clearProps: "x,clipPath,zIndex,scale",
            });
          },
        });

        const {
          EASE,
          DURATION,
          SCALE,
          SLIDE_DISTANCE,
          SLIDE_DISTANCE_HALF,
          CLIP_INSET,
        } = ANIMATION_CONFIG;

        if (direction === "left") {
          tl.to(
            currentEl,
            { x: SLIDE_DISTANCE, duration: DURATION, ease: EASE, scale: SCALE },
            0,
          );
          gsap.set(nextEl, {
            opacity: 1,
            x: `-${SLIDE_DISTANCE_HALF}`,
            scale: SCALE,
            clipPath: `inset(0 ${CLIP_INSET} 0 0)`,
            zIndex: 2,
          });
          tl.to(
            nextEl,
            {
              x: "0%",
              scale: 1,
              clipPath: "inset(0 0% 0 0)",
              duration: DURATION,
              ease: EASE,
            },
            0,
          );
        } else {
          tl.to(
            currentEl,
            {
              x: `-${SLIDE_DISTANCE}`,
              duration: DURATION,
              ease: EASE,
              scale: SCALE,
            },
            0,
          );
          gsap.set(nextEl, {
            opacity: 1,
            x: SLIDE_DISTANCE_HALF,
            scale: SCALE,
            clipPath: `inset(0 0 0 ${CLIP_INSET})`,
            zIndex: 2,
          });
          tl.to(
            nextEl,
            {
              x: "0%",
              scale: 1,
              clipPath: "inset(0 0 0 0%)",
              duration: DURATION,
              ease: EASE,
            },
            0,
          );
        }
      };

      // Navigation handler with animation state management
      const navigate = (dir: "next" | "prev") => {
        if (isAnimating.current) return;
        isAnimating.current = true;

        // Show hints and schedule auto-hide
        setShowHints(true);
        if (hintTimerRef.current) {
          clearTimeout(hintTimerRef.current);
        }
        hintTimerRef.current = setTimeout(() => {
          setShowHints(false);
        }, UI_CONFIG.HINTS_AUTO_HIDE_DELAY);

        const delta = dir === "next" ? 1 : -1;
        const target =
          (currentIndexRef.current + delta + images.length) % images.length;
        const targetMini = (target + 1) % images.length;
        const slideDir: Direction = dir === "next" ? "right" : "left";

        createSlideAnimation(
          containerRef.current!,
          currentIndexRef.current,
          target,
          slideDir,
          "data-image-index",
          (idx) => {
            setCurrentIndex(idx);
            isAnimating.current = false;
          },
        );

        createSlideAnimation(
          minimapRef.current!,
          minimapIndexRef.current,
          targetMini,
          slideDir,
          "data-minimap-index",
          setMinimapIndex,
        );
      };

      const goNext = () => navigate("next");
      const goPrev = () => navigate("prev");

      goNextRef.current = goNext;
      goPrevRef.current = goPrev;

      // Pre-calculate parallax bounds for mouse tracking
      let screenW = window.innerWidth;
      let screenH = window.innerHeight;
      let screenRatio = screenW / screenH;

      const calculateParallaxBounds = (): ParallaxData[] => {
        screenW = window.innerWidth;
        screenH = window.innerHeight;
        screenRatio = screenW / screenH;

        return images.map((_, i) => {
          const img = containerRef.current?.querySelector(
            `[data-image-index="${i}"] img`,
          ) as HTMLImageElement;
          const inner = containerRef.current?.querySelector(
            `[data-image-index="${i}"] .current-image-inner`,
          ) as HTMLElement;

          if (!img || !inner || !img.naturalWidth) return null;

          const naturalRatio = img.naturalWidth / img.naturalHeight;
          let maxX = 0;
          let maxY = 0;

          if (naturalRatio > screenRatio) {
            maxX = (screenH * naturalRatio - screenW) / 2;
          } else {
            maxY = (screenW / naturalRatio - screenH) / 2;
          }

          return {
            maxX,
            maxY,
            x: gsap.quickSetter(inner, "x", "px") as (value: number) => void,
            y: gsap.quickSetter(inner, "y", "px") as (value: number) => void,
          };
        });
      };

      let parallax = calculateParallaxBounds();

      // Debounced resize handler to recalculate parallax bounds
      const handleResize = debounce(() => {
        parallax = calculateParallaxBounds();
      }, UI_CONFIG.RESIZE_DEBOUNCE_DELAY);

      window.addEventListener("resize", handleResize);

      // Setup pointer observer for parallax effect and click navigation
      const hasFinePointer = matchMedia("(pointer: fine)").matches;
      const canHover = matchMedia("(hover: hover)").matches;

      const isMouse = hasFinePointer && canHover;

      Observer.create({
        type: "pointer",
        target: containerRef.current!,
        tolerance: 10,
        onMove: (self) => {
          if (!isMouse) return;
          const nx = (self.x ?? 0) / screenW;
          const ny = (self.y ?? 0) / screenH;
          parallax.forEach((p) => {
            if (p) {
              p.x((nx - 0.5) * -p.maxX * LAYOUT.PARALLAX_MULTIPLIER);
              p.y((ny - 0.5) * -p.maxY * LAYOUT.PARALLAX_MULTIPLIER);
            }
          });
        },
        onClick: (self) => {
          if (!self.event) return;
          const x = (self.event as MouseEvent).clientX;
          if (x < screenW * LAYOUT.CLICK_ZONE_SPLIT) {
            goPrevRef.current();
          } else {
            goNextRef.current();
          }
        },
      });

      // Touch/swipe support for mobile devices
      Observer.create({
        type: "touch",
        target: containerRef.current!,
        onLeft: () => goNextRef.current(),
        onRight: () => goPrevRef.current(),
      });

      // Keyboard navigation handler
      const handleKey = (e: KeyboardEvent) => {
        if (e.key === "ArrowLeft") {
          goPrevRef.current();
        } else if (e.key === "ArrowRight") {
          goNextRef.current();
        }
      };
      window.addEventListener("keydown", handleKey);

      // Fade-in animation on initial load
      gsap.to(containerRef.current, {
        opacity: 1,
        duration: ANIMATION_CONFIG.FADE_IN_DURATION,
        ease: ANIMATION_CONFIG.FADE_IN_EASE,
      });

      // Show hints on initial load and schedule auto-hide
      setShowHints(true);
      hintTimerRef.current = setTimeout(() => {
        setShowHints(false);
      }, UI_CONFIG.HINTS_AUTO_HIDE_DELAY);

      return () => {
        window.removeEventListener("keydown", handleKey);
        window.removeEventListener("resize", handleResize);
      };
    },
    { scope: containerRef },
  );

  return (
    <main
      className="h-screen w-screen overflow-hidden"
      role="region"
      aria-label="Image gallery"
      aria-roledescription="carousel"
    >
      {/* Screen reader instructions */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        Image {currentIndex + 1} of {images.length}
      </div>

      <div
        className="relative h-full w-full cursor-pointer"
        ref={containerRef}
        style={{ opacity: 0 }}
      >
        {/* Navigation hint arrows for desktop */}
        <button
          onClick={() => goPrevRef.current()}
          className="group absolute top-1/2 left-8 z-10 -translate-y-1/2 opacity-0 transition-opacity duration-300 hover:opacity-100"
          aria-label="Previous image"
        >
          <svg
            className="h-12 w-12 text-white drop-shadow-lg transition-transform group-hover:scale-110"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        <button
          onClick={() => goNextRef.current()}
          className="group absolute top-1/2 right-8 z-10 -translate-y-1/2 opacity-0 transition-opacity duration-300 hover:opacity-100"
          aria-label="Next image"
        >
          <svg
            className="h-12 w-12 text-white drop-shadow-lg transition-transform group-hover:scale-110"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>

        {/* Progress indicator */}
        <div
          className={`absolute top-8 left-1/2 z-10 -translate-x-1/2 rounded-full bg-black/30 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm transition-opacity duration-500 ${
            showHints ? "opacity-100" : "opacity-0"
          }`}
        >
          {currentIndex + 1} / {images.length}
        </div>

        {images.map((src, i) => (
          <div
            key={i}
            data-image-index={i}
            className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden"
            style={{ opacity: i === 0 ? 1 : 0, zIndex: 0 }}
            role="img"
            aria-label={`Gallery image ${i + 1} of ${images.length}`}
          >
            <div className="current-image-inner relative">
              <Image
                src={src}
                alt={`Gallery image ${i + 1}`}
                width={0}
                height={0}
                className="h-auto min-h-screen w-auto max-w-none min-w-screen"
                priority={i === 0}
                sizes="100vw"
              />
            </div>
          </div>
        ))}

        {/* Minimap - shows next image */}
        <div
          className="pointer-events-none absolute right-8 bottom-8 z-10 w-48 overflow-hidden"
          role="region"
          aria-label="Next image preview"
        >
          <div
            className="relative aspect-video overflow-hidden"
            ref={minimapRef}
          >
            {images.map((src, i) => (
              <div
                key={i}
                className="pointer-events-none absolute inset-0"
                data-minimap-index={i}
                style={{ opacity: i === minimapIndex ? 1 : 0, zIndex: 0 }}
              >
                <Image
                  src={src}
                  alt={`Next preview ${i + 1}`}
                  fill
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Keyboard navigation hint */}
        <div
          className={`absolute bottom-8 left-8 z-10 rounded bg-black/30 px-3 py-2 text-xs text-white/70 backdrop-blur-sm transition-opacity duration-500 ${
            showHints ? "opacity-100" : "opacity-0"
          }`}
        >
          Use ← → keys or swipe to navigate
        </div>
      </div>
    </main>
  );
}
