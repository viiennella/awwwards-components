export function Hero() {
  return (
    <section className="hero-section">
      <div className="glass-texture hidden">
        <img src={"glassTexture.jpg"} width={500} height={500} alt="" />
      </div>
      <div className="hero-content absolute left-0 bottom-0 w-full flex justify-between">
        <h1 className="w-xl">Fractal Glass Parallax Effect</h1>
        <p> Fractal Glass Parallax Effect </p>
      </div>
    </section>
  );
}
