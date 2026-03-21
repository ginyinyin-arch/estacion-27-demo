import { useState } from "react";

const images = [
  "/images/lomo.jpg",
  "/images/costeleta.jpg",
  "/images/pollo.jpg",
  "/images/salmon1.jpg",
  "/images/salmon2.jpg",
  "/images/tacos.jpg",
  "/images/wrap.jpg",
  "/images/noquis.jpg",
];

const Gallery = () => {
  return (
    <section className="bg-carbon py-20 px-4 lg:px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-4 mb-4">
            <span className="w-12 h-px bg-ambar" />
            <span className="label-amber">LA COCINA</span>
            <span className="w-12 h-px bg-ambar" />
          </div>
          <h2 className="font-display font-bold text-crema" style={{ fontSize: "clamp(1.8rem, 3vw, 2.8rem)" }}>
            Cada plato, una firma.
          </h2>
          <p className="font-body font-light text-[0.95rem] text-crema2 mt-3">
            Fotos reales de nuestra cocina.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {images.map((src, i) => (
            <GalleryImage key={i} src={src} />
          ))}
        </div>
      </div>
    </section>
  );
};

const GalleryImage = ({ src }: { src: string }) => {
  const [hover, setHover] = useState(false);

  return (
    <div
      className="relative rounded overflow-hidden cursor-pointer"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <img src={src} alt="Plato de Estación 27" className="w-full h-auto block" loading="lazy" />
      <div
        className="absolute inset-0 flex items-center justify-center transition-opacity duration-300"
        style={{
          background: "rgba(14,12,8,0.45)",
          opacity: hover ? 1 : 0,
        }}
      >
        <img src="/images/logo.png" alt="" className="h-12 opacity-80" style={{ filter: "invert(1)" }} />
      </div>
    </div>
  );
};

export default Gallery;
