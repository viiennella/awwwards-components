"use client";

import gsap from "gsap";
import Image from "next/image";
import { useGSAP } from "@gsap/react";

import { CustomEase } from "gsap/all";
import { useRef } from "react";

gsap.registerPlugin(useGSAP);

interface Client {
  name: string;
}

export default function HoverTextPicturePopup() {
  const clientsPreviewRef = useRef<HTMLUListElement>(null);
  const clientRefs = useRef<HTMLHeadingElement[]>([]);
  const clientList: Client[] = [
    { name: "Native Instruments" },
    { name: "Oura" },
    { name: "Hender Scheme" },
    { name: "Nike" },
    { name: "Ferrari" },
    { name: "Adidas" },
    { name: "Dior" },
    { name: "Chanel" },
    { name: "Porsche" },
    { name: "Facebook" },
    { name: "Google" },
    { name: "Apple" },
  ];

  useGSAP(() => {
    gsap.registerPlugin(CustomEase);
    CustomEase.create(
      "hop",
      "M0,0 C0.071,0.505 0.192,0.726 0.318,0.852 0.45,0.984 0.504,1 1,1",
    );
  }, []);

  const handleEnter = (index: number) => {
    const clientsPreview = clientsPreviewRef.current;
    if (!clientsPreview) return;

    const wrapper = clientsPreview.querySelectorAll<HTMLLIElement>("li")[index];
    const img = wrapper?.querySelector<HTMLImageElement>("img");
    if (!wrapper || !img) return;

    const tl = gsap.timeline();

    gsap.killTweensOf([wrapper, img]);

    gsap.set(img, { scale: 1.25, opacity: 0 });

    gsap.set(wrapper, {
      opacity: 0,
      clipPath: "polygon(50% 50%, 50% 50%, 50% 50%, 50% 50%)",
    });

    tl.to(wrapper, {
      opacity: 1,
      duration: 0.75,
      ease: "hop",
      clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
    }).to(
      img,
      {
        scale: 1.25,
        opacity: 1,
        duration: 0.25,
        ease: "power2.out",
      },
      "<",
    );
  };

  const handleLeave = (index: number) => {
    const clientsPreview = clientsPreviewRef.current;
    if (!clientsPreview) return;

    const wrapper = clientsPreview.querySelectorAll<HTMLLIElement>("li")[index];
    const img = wrapper?.querySelector<HTMLImageElement>("img");
    if (!wrapper || !img) return;

    gsap.killTweensOf([wrapper, img]);

    // Smoothly fade out & collapse clip-path

    const tl = gsap.timeline();

    tl.to(img, {
      scale: 1,
      opacity: 0.1,
      duration: 0.5,
      ease: "power2.out",
    }).to(img, {
      scale: 1.1,
      opacity: 0,
      duration: 0.25,
      ease: "power2.out",
    });
  };

  return (
    <section className="clients-section relative flex h-svh w-full flex-col items-start justify-end-safe gap-8 overflow-hidden p-8">
      <ul
        ref={clientsPreviewRef}
        className="clients-preview fixed top-1/2 left-1/2 h-full w-full -translate-x-1/2 -translate-y-1/2 list-none"
      >
        {clientList.map((client, index) => (
          <li
            key={client.name}
            className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 list-none opacity-0 will-change-[clip-path] [clip-path:polygon(50%_50%,50%_50%,50%_50%,50%_50%)]"
          >
            <figure className="client-img-wrapper relative inset-0 h-full w-full overflow-hidden">
              <Image
                src={`/httpimg${index}.jpg`}
                className="img relative block h-full w-full translate-x-0 translate-y-0 object-cover will-change-transform"
                alt=""
                loading="eager"
                sizes="100vw"
                width={3840}
                height={2160}
              />
            </figure>
          </li>
        ))}
      </ul>

      <div className="clients-header">
        <p className="relative z-1 inline-block font-mono text-2xl leading-1 font-[550] text-[#acacac] uppercase decoration-0">
          Trusted us
        </p>
      </div>

      <div className="clients-list relative z-2 mb-32 flex w-4/5 flex-wrap justify-start gap-3 mix-blend-difference sm:w-full">
        {clientList.map((client, index) => (
          <h1
            key={client.name}
            ref={(el) => {
              if (el) clientRefs.current[index] = el;
            }}
            onMouseEnter={() => handleEnter(index)}
            onMouseLeave={() => handleLeave(index)}
            className="client-name hover-underline-animation text-5xl leading-1 font-medium text-white sm:text-3xl"
          >
            {client.name}
            {index === clientList.length - 1 ? "." : ","}
          </h1>
        ))}
      </div>
    </section>
  );
}
