import { Canvas } from "./canvas";

export function Hero() {
  return (
    <section className="hero-section relative w-full h-svh overflow-hidden">
      <Canvas />
      <div className="hero-content absolute left-0 bottom-0 w-full flex justify-between p-8 text-white md:items-end-safe sm:items-start sm:flex-col-reverse sm:gap-4 ">
        <h1 className="text-4xl font-bold text-[4rem] tracking-widest leading-1 sm:w-full">
          Fractal Glass Parallax Effect
        </h1>
        <p>Move your mouse to interact ✨</p>
      </div>
    </section>
  );
}
