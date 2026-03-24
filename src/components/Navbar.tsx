import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { useLang } from "@/contexts/LangContext";
import { useWhatsappNumber } from "@/hooks/use-whatsapp-number";

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { lang, setLang, t } = useLang();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { label: t("nav.carta"), href: "#carta" },
    { label: t("nav.nosotros"), href: "#nosotros" },
    { label: t("nav.horarios"), href: "#horarios" },
    { label: t("nav.reservas"), href: "#reservas" },
  ];

  const handleNav = (href: string) => {
    setOpen(false);
    document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <nav
        className="fixed top-0 left-0 w-full z-[1000] transition-shadow duration-300"
        style={{
          height: 72,
          background: "rgba(14,12,8,0.96)",
          backdropFilter: "blur(10px)",
          borderBottom: "1px solid rgba(240,232,208,0.07)",
          boxShadow: scrolled ? "0 4px 32px rgba(0,0,0,0.55)" : "none",
        }}
      >
        <div className="max-w-7xl mx-auto h-full flex items-center justify-between px-4 lg:px-6">
          <a href="#inicio" onClick={(e) => { e.preventDefault(); handleNav("#inicio"); }} className="flex items-center gap-3 hover:opacity-85 transition-opacity">
            <img src="/images/logo.png" alt="Estación 27" className="h-11 object-contain" style={{ filter: "invert(1)" }} />
            <span className="font-display font-semibold text-base tracking-[0.10em] text-crema hidden sm:inline">ESTACIÓN 27</span>
          </a>

          <div className="hidden lg:flex items-center gap-8">
            {links.map((l) => (
              <a key={l.href} href={l.href} onClick={(e) => { e.preventDefault(); handleNav(l.href); }}
                className="font-body font-normal text-[0.73rem] uppercase tracking-[0.22em] text-crema2 hover:text-crema transition-colors duration-200">
                {l.label}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-3">
            {/* Language selector */}
            <div className="hidden lg:flex items-center gap-1 text-[0.7rem] font-body">
              <button onClick={() => setLang("es")}
                className={`px-1.5 py-0.5 rounded-sm transition-colors ${lang === "es" ? "text-ambar font-semibold" : "text-gris hover:text-crema"}`}>
                🇦🇷 ES
              </button>
              <span className="text-gris/40">|</span>
              <button onClick={() => setLang("en")}
                className={`px-1.5 py-0.5 rounded-sm transition-colors ${lang === "en" ? "text-ambar font-semibold" : "text-gris hover:text-crema"}`}>
                🇬🇧 EN
              </button>
            </div>
            <a href="https://wa.me/543514251651?text=Hola%20Estación%2027!" target="_blank" rel="noopener noreferrer"
              className="hidden lg:flex items-center justify-center w-8 h-8 text-crema2 hover:text-[#25D366] transition-colors duration-200" aria-label="WhatsApp">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            </a>
            <a href="https://www.instagram.com/estacionveintisiete/" target="_blank" rel="noopener noreferrer"
              className="hidden lg:flex items-center justify-center w-8 h-8 text-crema2 hover:text-ambar transition-colors duration-200" aria-label="Instagram">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="5"/><circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none"/></svg>
            </a>
            <a href="#reservas" onClick={(e) => { e.preventDefault(); handleNav("#reservas"); }}
              className="hidden lg:inline-block font-body font-medium text-[0.72rem] uppercase tracking-[0.18em] text-ambar border border-ambar px-[18px] py-2 rounded-sm bg-transparent hover:bg-ambar hover:text-negro transition-all duration-200">
              {t("nav.reservar")}
            </a>
            <button className="lg:hidden text-crema" onClick={() => setOpen(true)} aria-label="Abrir menú">
              <Menu size={22} strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </nav>

      {open && (
        <div className="fixed inset-0 z-[1001] bg-negro flex flex-col items-center justify-center">
          <button className="absolute top-5 right-5 text-crema" onClick={() => setOpen(false)} aria-label="Cerrar menú">
            <X size={28} strokeWidth={1.5} />
          </button>
          {/* Mobile language selector */}
          <div className="absolute top-5 left-5 flex items-center gap-1 text-sm font-body">
            <button onClick={() => setLang("es")} className={`px-2 py-1 rounded ${lang === "es" ? "text-ambar font-semibold" : "text-gris"}`}>🇦🇷 ES</button>
            <span className="text-gris/40">|</span>
            <button onClick={() => setLang("en")} className={`px-2 py-1 rounded ${lang === "en" ? "text-ambar font-semibold" : "text-gris"}`}>🇬🇧 EN</button>
          </div>
          <img src="/images/logo.png" alt="Estación 27" className="h-20 mb-12" style={{ filter: "invert(1)" }} />
          <div className="flex flex-col items-center gap-8">
            {links.map((l) => (
              <a key={l.href} href={l.href} onClick={(e) => { e.preventDefault(); handleNav(l.href); }}
                className="font-display font-bold italic text-3xl text-crema hover:text-ambar transition-colors">
                {l.label}
              </a>
            ))}
          </div>
          <a href="#reservas" onClick={(e) => { e.preventDefault(); handleNav("#reservas"); }}
            className="mt-12 font-body font-medium text-[0.72rem] uppercase tracking-[0.18em] text-ambar border border-ambar px-6 py-3 rounded-sm hover:bg-ambar hover:text-negro transition-all duration-200">
            {t("nav.reservar")}
          </a>
        </div>
      )}
    </>
  );
};

export default Navbar;
