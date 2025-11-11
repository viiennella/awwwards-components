"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import Lenis from "lenis";

export default function ScrollMotionSlider() {
  const sliderRef = useRef<HTMLDivElement>(null);
  const imagesRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const indicesRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  const slides = [
    {
      image: "img1.jpg",
      title:
        "Under the soft hum of streetlights she watches the world ripple through glass, her calm expression mirrored in the fragments of drifting light.",
    },
    {
      image: "img2.jpg",
      title:
        "Under the soft hum of streetlights she watches the world ripple through glass, her calm expression mirrored in the fragments of drifting light.",
    },
    {
      image: "img3.jpg",
      title:
        "Under the soft hum of streetlights she watches the world ripple through glass, her calm expression mirrored in the fragments of drifting light.",
    },
  ];

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger, SplitText);

    const lenis = new Lenis();
    const update = (time: number) => {
      lenis.raf(time * 1000);
      ScrollTrigger.update();
    };
    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0);

    const slider = sliderRef.current;
    const images = imagesRef.current;
    const title = titleRef.current;
    const indices = indicesRef.current;
    const progress = progressRef.current;

    if (!slider || !images || !title || !indices || !progress) return;

    // --- create indices
    indices.innerHTML = "";
    slides.forEach((_, index) => {
      const indexNum = (index + 1).toString().padStart(2, "0");
      const p = document.createElement("p");
      p.innerHTML = `<span class="marker"></span><span class="index">${indexNum}</span>`;
      indices.appendChild(p);
    });

    let activeSlide = 0;
    let currentSplit: SplitText | null = null;

    function animateIndicators(index: number) {
      if (!indices) return;
      const indicators = indices.querySelectorAll("p");
      indicators.forEach((indicator, i) => {
        const marker = indicator.querySelector(".marker");
        const num = indicator.querySelector(".index");

        if (i === index) {
          gsap.to(marker, { scaleX: 1, duration: 0.3, ease: "power2.out" });
          gsap.to(num, { opacity: 1, duration: 0.3, ease: "power2.out" });
        } else {
          gsap.to(marker, { scaleX: 0, duration: 0.3, ease: "power2.out" });
          gsap.to(num, { opacity: 0.35, duration: 0.3, ease: "power2.out" });
        }
      });
    }

    function animateTitle(index: number) {
      if (currentSplit) currentSplit.revert();
      if (!title) return;
      title.innerHTML = `<h1>${slides[index].title}</h1>`;
      const h1 = title.querySelector("h1");
      if (!h1) return;
      currentSplit = new SplitText(h1, { type: "lines", linesClass: "line" });
      gsap.fromTo(
        currentSplit.lines,
        { yPercent: 100, opacity: 0 },
        {
          yPercent: 0,
          opacity: 1,
          duration: 1,
          stagger: 0.1,
          ease: "power3.out",
        },
      );
    }

    function animateImage(index: number) {
      const img = document.createElement("img");
      img.src = slides[index].image;
      img.alt = slides[index].title;

      gsap.set(img, { opacity: 0, scale: 1.25 });
      if (!images) return;
      images.appendChild(img);

      gsap.to(img, {
        opacity: 1,
        scale: 1,
        duration: 1,
        ease: "power2.out",
      });

      const allImages = images.querySelectorAll("img");
      if (allImages.length > 3) {
        for (let i = 0; i < allImages.length - 3; i++) {
          allImages[i].remove();
        }
      }

      animateTitle(index);
      animateIndicators(index);
    }

    const pinDistance = window.innerHeight * slides.length;

    ScrollTrigger.create({
      trigger: slider,
      pin: true,
      start: "top top",
      end: `+=${pinDistance}`,
      scrub: 1,
      onUpdate: (self) => {
        gsap.set(progress, { scaleY: self.progress });

        const currentSlide = Math.floor(self.progress * slides.length);
        if (currentSlide !== activeSlide && currentSlide < slides.length) {
          activeSlide = currentSlide;
          animateImage(currentSlide);
        }
      },
    });

    // init first slide
    animateImage(0);

    return () => {
      lenis.destroy();
      ScrollTrigger.getAll().forEach((st) => st.kill());
      gsap.ticker.remove(update);
      currentSplit?.revert();
    };
  }, [slides]);

  return (
    <div>
      <section className="intro">
        <h1>
          Scroll to explore the rhythm of still images that move quietly between
          story and sensation.
        </h1>
      </section>

      <section ref={sliderRef} className="slider">
        <div ref={imagesRef} className="slider-images"></div>
        <div ref={titleRef} className="slider-title">
          <h1>
            Under the soft hum of streetlights she watches the world ripple
            through glass, her calm expression mirrored in the fragments of
            drifting light.
          </h1>
        </div>
        <div className="slider-indicator">
          <div ref={indicesRef} className="slider-indices"></div>
          <div className="slider-progress-bar">
            <div ref={progressRef} className="slider-progress"></div>
          </div>
        </div>
      </section>

      <section className="outro">
        <h1>
          Scroll to explore the rhythm of still images that move quietly between
          story and sensation.
        </h1>
      </section>
    </div>
  );
}
