"use client";

import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Observer } from "gsap/Observer";

if (typeof window !== "undefined") {
  gsap.registerPlugin(Observer, useGSAP);
}

const images = [
  "/radavilleImages/image1.webp",
  "/radavilleImages/image2.webp",
  "/radavilleImages/image3.webp",
  "/radavilleImages/image4.webp",
  "/radavilleImages/image5.webp",
];

export default function RadavilleImageGallery() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [minimapIndex, setMinimapIndex] = useState(1);

  const containerRef = useRef<HTMLDivElement>(null);
  const minimapRef = useRef<HTMLDivElement>(null);
  const isAnimating = useRef(false);

  const currentIndexRef = useRef(0);
  const minimapIndexRef = useRef(1);

  const goNextRef = useRef<() => void>(() => {});
  const goPrevRef = useRef<() => void>(() => {});

  useEffect(() => {
    currentIndexRef.current = currentIndex;
    minimapIndexRef.current = minimapIndex;
  }, [currentIndex, minimapIndex]);

  useGSAP(
    () => {
      if (!containerRef.current || !minimapRef.current) return;

      //create slide animation with direction and easing

      const createSlideAnimation = (
        container: HTMLDivElement,
        currentIdx: number,
        targetIdx: number,
        direction: "left" | "right",
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

        // Ensure current element is below the next element
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

        const ease = "cubic-bezier(0,1,0,1)";
        const duration = 1;

        if (direction === "left") {
          tl.to(currentEl, { x: "50%", duration, ease, scale: 1.1 }, 0);
          gsap.set(nextEl, {
            opacity: 1,
            x: "-25%",
            scale: 1.1,
            clipPath: "inset(0 75% 0 0)",
            zIndex: 2,
          });
          tl.to(
            nextEl,
            { x: "0%", scale: 1, clipPath: "inset(0 0% 0 0)", duration, ease },
            0,
          );
        } else {
          tl.to(currentEl, { x: "-50%", duration, ease, scale: 1.1 }, 0);
          gsap.set(nextEl, {
            opacity: 1,
            x: "25%",
            scale: 1.1,
            clipPath: "inset(0 0 0 75%)",
            zIndex: 2,
          });
          tl.to(
            nextEl,
            { x: "0%", scale: 1, clipPath: "inset(0 0 0 0%)", duration, ease },
            0,
          );
        }
      };

      // handle navigation with animation state management

      const navigate = (dir: "next" | "prev") => {
        if (isAnimating.current) return;
        isAnimating.current = true;

        const delta = dir === "next" ? 1 : -1;
        const target =
          (currentIndexRef.current + delta + images.length) % images.length;
        const targetMini = (target + 1) % images.length;
        const slideDir = dir === "next" ? "right" : "left";

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

      //pre-calculate parallax bounds for mouse tracking

      const screenW = window.innerWidth;
      const screenH = window.innerHeight;
      const screenRatio = screenW / screenH;

      const parallax = images.map((_, i) => {
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
          x: gsap.quickSetter(inner, "x", "px"),
          y: gsap.quickSetter(inner, "y", "px"),
        };
      });

      //setup pointer observer for parallax effect and clicks

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
              p.x((nx - 0.5) * -p.maxX * 2);
              p.y((ny - 0.5) * -p.maxY * 2);
            }
          });
        },
        onClick: (self) => {
          if (!self.event) return;
          const x = (self.event as MouseEvent).clientX;
          if (x < screenW * 0.5) {
            goPrevRef.current();
          } else {
            goNextRef.current();
          }
        },
      });
      // handle arrow key navigation

      const handleKey = (e: KeyboardEvent) => {
        if (e.key === "ArrowLeft") {
          goPrevRef.current();
        } else if (e.key === "ArrowRight") {
          goNextRef.current();
        }
      };
      window.addEventListener("keydown", handleKey);
      return () => {
        window.removeEventListener("keydown", handleKey);
      };
    },
    { scope: containerRef },
  );

  return (
    <main className="h-screen w-screen overflow-hidden">
      <div className="relative h-full w-full cursor-pointer" ref={containerRef}>
        {images.map((src, i) => (
          <div
            key={i}
            data-image-index={i}
            className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden"
            style={{ opacity: i === 0 ? 1 : 0, zIndex: 0 }}
          >
            <div className="current-image-inner relative">
              <Image
                src={src}
                alt={`image ${i + 1}`}
                width={0}
                height={0}
                className="h-auto min-h-screen w-auto max-w-none min-w-screen"
                priority={i === 0}
                sizes="100vw"
              />
            </div>
          </div>
        ))}

        <div className="absolute right-8 bottom-8 z-10 w-48 cursor-pointer overflow-hidden">
          <div
            className="relative aspect-video overflow-hidden"
            ref={minimapRef}
          >
            {images.map((src, i) => (
              <div
                key={i}
                className="pointer-events-none absolute inset-0"
                data-minimap-index={i}
                style={{ opacity: i === 1 ? 1 : 0, zIndex: 0 }}
              >
                <Image
                  src={src}
                  alt={`preview ${i + 1}`}
                  fill
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
