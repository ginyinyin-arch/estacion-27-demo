import { ChevronDown } from "lucide-react";
import { useLang } from "@/contexts/LangContext";
import GoogleReviewsWidget from "@/components/GoogleReviewsWidget";

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
  const { t } = useLang();

  const handleNav = (href: string) => {
    document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section id="inicio" className="relative min-h-screen bg-negro flex items-center pt-[72px] overflow-hidden">
      <div className="hooks-wrapper">
        <div className="hooks-track">
          {allImages.map((src, i) => (
            <div key={i} className="hook-item" style={{ transform: `rotate(${rotations[i]}deg)` }}>
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

      <div className="relative z-[2] max-w-7xl mx-auto px-4 lg:px-6 w-full py-16 md:py-0">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-12 md:gap-8">
          {/* Left column — text & CTAs */}
          <div className="max-w-[680px]">
            <div className="flex items-center gap-4 mb-8">
              <span className="w-12 h-px bg-ambar" />
              <span className="label-amber">{t("hero.label")}</span>
              <span className="w-12 h-px bg-ambar" />
            </div>

            <img src="/images/logo.png" alt="Estación 27" className="w-[160px] md:w-[220px] mb-7" style={{ filter: "invert(1)", opacity: 0.92 }} />

            <h1>
              <span className="block font-display font-black italic text-crema leading-[1.05]" style={{ fontSize: "clamp(2.8rem, 5vw, 5.5rem)" }}>
                {t("hero.h1a")}
              </span>
              <span className="block font-display font-normal text-crema2 leading-[1.10] mt-1" style={{ fontSize: "clamp(2rem, 3.5vw, 3.8rem)" }}>
                {t("hero.h1b")}
              </span>
            </h1>

            <div className="w-14 h-px bg-ambar my-6" />

            <p className="font-body font-light text-[1.05rem] text-gris leading-[1.80] max-w-[440px]">
              {t("hero.sub1")}<br />
              {t("hero.sub2")}
            </p>

            <div className="flex flex-wrap gap-3.5 mt-8">
              <button onClick={() => handleNav("#carta")} className="btn-primary">{t("hero.cta1")}</button>
              <button onClick={() => handleNav("#reservas")} className="btn-outline">{t("hero.cta2")}</button>
            </div>

            {/* Mobile: reviews widget */}
            <div className="md:hidden mt-10">
              <GoogleReviewsWidget />
            </div>

            <div className="flex flex-wrap gap-x-6 gap-y-2 mt-8 font-body text-[0.78rem] text-gris">
              <span>(0351) 425-1651</span>
              <span className="text-ambar">·</span>
              <span>27 de Abril 366</span>
              <span className="text-ambar">·</span>
              <span>{t("hero.hours")}</span>
            </div>
          </div>

          {/* Right column — Google Reviews (desktop) */}
          <div className="hidden md:flex items-center justify-center flex-shrink-0">
            <GoogleReviewsWidget />
          </div>
        </div>
      </div>

      <div className="hidden md:block absolute bottom-7 left-1/2 -translate-x-1/2 animate-bounce-gentle">
        <ChevronDown size={28} className="text-ambar/40" />
      </div>
    </section>
  );
};

export default Hero;
