import { ChevronDown } from "lucide-react";

const Hero = () => {
  const handleNav = (href: string) => {
    document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section id="inicio" className="relative min-h-screen bg-negro flex items-center pt-[72px] overflow-hidden">
      {/* Background decorative logo */}
      <img
        src="/images/logo.png"
        alt=""
        aria-hidden="true"
        className="absolute pointer-events-none z-0 opacity-[0.04] w-[260px] md:w-[480px] right-[-60px] bottom-[-20px]"
        style={{ filter: "invert(1)" }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 lg:px-6 w-full py-16 md:py-0">
        <div className="max-w-[680px]">
          {/* Label */}
          <div className="flex items-center gap-4 mb-8">
            <span className="w-12 h-px bg-ambar" />
            <span className="label-amber">DESDE 1991</span>
            <span className="w-12 h-px bg-ambar" />
          </div>

          {/* Logo */}
          <img
            src="/images/logo.png"
            alt="Estación 27"
            className="w-[160px] md:w-[220px] mb-7"
            style={{ filter: "invert(1)", opacity: 0.92 }}
          />

          {/* H1 */}
          <h1>
            <span className="block font-display font-black italic text-crema leading-[1.05]" style={{ fontSize: "clamp(2.8rem, 5vw, 5.5rem)" }}>
              Cocina de Autor.
            </span>
            <span className="block font-display font-normal text-crema2 leading-[1.10] mt-1" style={{ fontSize: "clamp(2rem, 3.5vw, 3.8rem)" }}>
              Córdoba, desde siempre.
            </span>
          </h1>

          {/* Separator */}
          <div className="w-14 h-px bg-ambar my-6" />

          {/* Subtitle */}
          <p className="font-body font-light text-[1.05rem] text-gris leading-[1.80] max-w-[440px]">
            Lomitos, parrilla, cocina de autor y buen bar.<br />
            En el corazón del Centro de Córdoba.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap gap-3.5 mt-8">
            <button onClick={() => handleNav("#carta")} className="btn-primary">
              VER LA CARTA
            </button>
            <button onClick={() => handleNav("#reservas")} className="btn-outline">
              HACER UNA RESERVA
            </button>
          </div>

          {/* Quick data */}
          <div className="flex flex-wrap gap-x-6 gap-y-2 mt-8 font-body text-[0.78rem] text-gris">
            <span>(0351) 425-1651</span>
            <span className="text-ambar">·</span>
            <span>27 de Abril 366</span>
            <span className="text-ambar">·</span>
            <span>Lun–Sáb 8 a 2hs</span>
          </div>
        </div>
      </div>

      {/* Scroll indicator desktop */}
      <div className="hidden md:block absolute bottom-7 left-1/2 -translate-x-1/2 animate-bounce-gentle">
        <ChevronDown size={28} className="text-ambar/40" />
      </div>
    </section>
  );
};

export default Hero;
