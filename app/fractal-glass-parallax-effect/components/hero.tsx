import { Canvas } from "./canvas";

export function Hero() {
  return (
    <section className="hero-section relative w-full h-screen overflow-hidden">
      <Canvas />
      <div className="hero-content absolute left-0 bottom-0 w-full flex justify-between p-8 text-white">
        <h1 className="text-4xl font-bold">Fractal Glass Parallax Effect</h1>
        <p>Move your mouse to interact ✨</p>
      </div>
    </section>
  );
}
