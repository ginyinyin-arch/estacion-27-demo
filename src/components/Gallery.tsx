import { useState, useEffect, useCallback } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { ChevronDown, ChevronUp } from "lucide-react";

const images = [
  "/images/lomo.jpg",
  "/images/salmon2.jpg",
  "/images/costeleta.jpg",
  "/images/noquis.jpg",
  "/images/pollo.jpg",
  "/images/tacos.jpg",
  "/images/salmon1.jpg",
  "/images/wrap.jpg",
];

const Gallery = () => {
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [expanded, setExpanded] = useState(false);
  const isMobile = useIsMobile();
  const sectionRef = useCallback((node: HTMLElement | null) => {
    if (node) (Gallery as any)._sectionRef = node;
  }, []);

  const close = useCallback(() => setLightbox(null), []);
  const prev = useCallback(() => setLightbox((i) => (i !== null ? (i - 1 + images.length) % images.length : null)), []);
  const next = useCallback(() => setLightbox((i) => (i !== null ? (i + 1) % images.length : null)), []);

  useEffect(() => {
    if (lightbox === null) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [lightbox, close, prev, next]);

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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {images.map((src, i) => (
            <div
              key={i}
              className="relative aspect-square overflow-hidden rounded cursor-pointer group"
              onClick={() => setLightbox(i)}
            >
              <img
                src={src}
                alt="Plato de Estación 27"
                className="w-full h-full object-cover transition-transform duration-350 ease-out group-hover:scale-[1.06]"
                style={{ objectPosition: "center top" }}
                loading="lazy"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-negro/50 opacity-0 group-hover:opacity-100 transition-opacity duration-[280ms]">
                <img src="/images/logo.png" alt="" className="h-10 opacity-85 -mt-4" style={{ filter: "invert(1)" }} />
              </div>
            </div>
          ))}

          {/* 9th cell - Instagram CTA */}
          <a
            href="https://www.instagram.com/estacionveintisiete"
            target="_blank"
            rel="noopener noreferrer"
            className="aspect-square rounded bg-madera flex flex-col items-center justify-center gap-3 transition-opacity duration-200 hover:opacity-90"
          >
            <img src="/images/logo2.png" alt="" className="h-14 opacity-70" style={{ filter: "invert(1)" }} />
            <span className="font-display italic text-[0.90rem] text-crema2">@estacionveintisiete</span>
          </a>
        </div>
      </div>

      {/* Lightbox */}
      {lightbox !== null && (
        <div
          className="fixed inset-0 z-[2000] flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.92)" }}
          onClick={close}
        >
          <button
            onClick={(e) => { e.stopPropagation(); close(); }}
            className="absolute top-5 right-5 text-ambar text-3xl font-body hover:opacity-70 transition-opacity z-10"
            aria-label="Cerrar"
          >
            ✕
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); prev(); }}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-ambar text-4xl font-body hover:opacity-70 transition-opacity z-10"
            aria-label="Anterior"
          >
            ‹
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); next(); }}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-ambar text-4xl font-body hover:opacity-70 transition-opacity z-10"
            aria-label="Siguiente"
          >
            ›
          </button>
          <img
            src={images[lightbox]}
            alt="Plato de Estación 27"
            className="max-h-[85vh] max-w-[85vw] object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </section>
  );
};

export default Gallery;
