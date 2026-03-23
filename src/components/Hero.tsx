import { ChevronDown } from "lucide-react";
import { useEffect, useRef } from "react";

const igImages = Array.from({ length: 20 }, (_, i) =>
  `/images/instagram/ig_${String(i + 1).padStart(2, "0")}.jpg`
);
const allImages = [...igImages, ...igImages];

const rotations = [
  -3, 2, -1.5, 3, -2, 1, -2.5, 3.5, -1, 2.5,
  -3, 2, -1.5, 3, -2, 1, -2.5, 3.5, -1, 2.5,
  -3, 2, -1.5, 3, -2, 1, -2.5, 3.5, -1, 2.5,
  -3, 2, -1.5, 3, -2, 1, -2.5, 3.5, -1, 2.5,
];

const Hero = () => {
  const trackRef = useRef<HTMLDivElement>(null);

  const handleNav = (href: string) => {
    document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const items = track.querySelectorAll<HTMLElement>('.hook-item');
    const handlers: Array<{ el: HTMLElement; handler: (e: MouseEvent) => void }> = [];

    items.forEach(item => {
      const baseRotation = parseFloat(item.dataset.baseRotation || '0');
      const handler = (e: MouseEvent) => {
        const rect = item.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const direction = e.clientX < centerX ? 1 : -1;
        const swingAngle = direction * 14;

        const swings = [
          { deg: baseRotation + swingAngle, delay: 0 },
          { deg: baseRotation - swingAngle * 0.6, delay: 180 },
          { deg: baseRotation + swingAngle * 0.35, delay: 360 },
          { deg: baseRotation - swingAngle * 0.18, delay: 520 },
          { deg: baseRotation + swingAngle * 0.08, delay: 660 },
          { deg: baseRotation, delay: 780 },
        ];

        swings.forEach(({ deg, delay }) => {
          setTimeout(() => {
            item.style.transition = `transform ${delay === 0 ? 80 : 160}ms ease-out`;
            item.style.transform = `rotate(${deg}deg)`;
          }, delay);
        });
      };
      item.addEventListener('mouseenter', handler);
      handlers.push({ el: item, handler });
    });

    return () => {
      handlers.forEach(({ el, handler }) => el.removeEventListener('mouseenter', handler));
    };
  }, []);

  return (
    <section id="inicio" className="relative min-h-screen bg-negro flex items-center pt-[72px] overflow-hidden">
      {/* Hooks conveyor background */}
      <div className="hooks-wrapper">
        <div className="hooks-track">
          {allImages.map((src, i) => (
            <div
              key={i}
              className="hook-item"
              style={{ transform: `rotate(${rotations[i]}deg)` }}
            >
              <div className="hook-line" />
              <div className="photo-wrapper">
                <svg className="hook-svg" viewBox="0 0 24 40" xmlns="http://www.w3.org/2000/svg">
                  <line x1="12" y1="0" x2="12" y2="18" stroke="#C8860A" strokeWidth="2.5" strokeLinecap="round"/>
                  <path d="M12 18 Q12 30 4 32 Q0 33 0 28" fill="none" stroke="#C8860A" strokeWidth="2.5" strokeLinecap="round"/>
                </svg>
                <div className="hook-hole" />
                <img src={src} alt="" draggable={false} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Hero content */}
      <div className="relative z-[2] max-w-7xl mx-auto px-4 lg:px-6 w-full py-16 md:py-0">
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
