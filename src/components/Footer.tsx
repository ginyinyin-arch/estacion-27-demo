import { MapPin, Phone } from "lucide-react";
import { useLang } from "@/contexts/LangContext";

const Footer = () => {
  const { t } = useLang();

  const handleNav = (href: string) => {
    document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
  };

  const navLinks = [
    { label: t("footer.carta"), href: "#carta" },
    { label: t("footer.nosotros"), href: "#nosotros" },
    { label: t("footer.horarios"), href: "#horarios" },
    { label: t("footer.reservas"), href: "#reservas" },
  ];

  return (
    <footer className="pt-14 pb-7 px-4 lg:px-6" style={{ background: "#080605", borderTop: "1px solid rgba(240,232,208,0.08)" }}>
      <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-10 mb-10">
        <div>
          <img src="/images/logo.png" alt="Estación 27" className="h-[72px] mb-3" style={{ filter: "invert(1)", opacity: 0.75 }} />
          <p className="font-display font-bold text-[1.1rem] text-crema tracking-[0.10em]">ESTACIÓN 27</p>
          <p className="font-body font-light text-[0.82rem] text-crema2 mt-1">{t("footer.tagline")}</p>
        </div>

        <div>
          <h4 className="font-body font-medium text-[0.68rem] uppercase tracking-[0.20em] mb-4" style={{ color: "rgba(240,232,208,0.35)" }}>
            {t("footer.nav")}
          </h4>
          <div className="flex flex-col gap-2.5">
            {navLinks.map((l) => (
              <a key={l.href} href={l.href} onClick={(e) => { e.preventDefault(); handleNav(l.href); }}
                className="font-body font-light text-[0.86rem] text-crema2 hover:text-crema transition-colors duration-200">
                {l.label}
              </a>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-body font-medium text-[0.68rem] uppercase tracking-[0.20em] mb-4" style={{ color: "rgba(240,232,208,0.35)" }}>
            {t("footer.contacto")}
          </h4>
          <div className="space-y-2.5 font-body font-light text-[0.86rem] text-crema2">
            <p className="flex items-center gap-2"><MapPin size={14} className="text-ambar" /> 27 de Abril 366, Centro, Córdoba</p>
            <p className="flex items-center gap-2"><Phone size={14} className="text-ambar" /> (0351) 425-1651</p>
            <p className="flex items-center gap-2">
              <svg className="text-ambar w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
              <a href="https://instagram.com/estacionveintisiete" target="_blank" rel="noopener noreferrer" className="hover:text-crema transition-colors">
                @estacionveintisiete
              </a>
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap justify-between items-center pt-5" style={{ borderTop: "1px solid rgba(240,232,208,0.07)" }}>
        <span className="font-body font-light text-[0.74rem]" style={{ color: "rgba(240,232,208,0.30)" }}>
          © 2026 Estación 27 · Córdoba, Argentina
        </span>
        <a href="/baja" className="font-body font-light text-[0.7rem] hover:underline transition-colors" style={{ color: "rgba(240,232,208,0.25)" }}>
          {t("footer.cancelar_alertas")}
        </a>
      </div>

      <div className="text-center pt-8 pb-2">
        <a
          href="https://mgwebstudio.link"
          target="_blank"
          rel="noopener noreferrer"
          className="font-body font-light text-[0.875rem] transition-all duration-200 hover:underline hover:underline-offset-4"
          style={{ color: "rgba(200,134,10,0.7)" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(200,134,10,1)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(200,134,10,0.7)")}
        >
          Sitio creado por MG Web Studio
        </a>
      </div>
    </footer>
  );
};

export default Footer;
