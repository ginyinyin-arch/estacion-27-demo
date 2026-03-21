import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { label: "CARTA", href: "#carta" },
    { label: "NOSOTROS", href: "#nosotros" },
    { label: "HORARIOS", href: "#horarios" },
    { label: "RESERVAS", href: "#reservas" },
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
          {/* Logo */}
          <a
            href="#inicio"
            onClick={(e) => { e.preventDefault(); handleNav("#inicio"); }}
            className="flex items-center gap-3 hover:opacity-85 transition-opacity"
          >
            <img src="/images/logo.png" alt="Estación 27" className="h-11 object-contain" style={{ filter: "invert(1)" }} />
            <span className="font-display font-semibold text-base tracking-[0.10em] text-crema hidden sm:inline">
              ESTACIÓN 27
            </span>
          </a>

          {/* Desktop links */}
          <div className="hidden lg:flex items-center gap-8">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={(e) => { e.preventDefault(); handleNav(l.href); }}
                className="font-body font-normal text-[0.73rem] uppercase tracking-[0.22em] text-crema2 hover:text-crema transition-colors duration-200"
              >
                {l.label}
              </a>
            ))}
          </div>

          {/* Right */}
          <div className="flex items-center gap-4">
            <a
              href="#reservas"
              onClick={(e) => { e.preventDefault(); handleNav("#reservas"); }}
              className="hidden lg:inline-block font-body font-medium text-[0.72rem] uppercase tracking-[0.18em] text-ambar border border-ambar px-[18px] py-2 rounded-sm bg-transparent hover:bg-ambar hover:text-negro transition-all duration-200"
            >
              RESERVAR MESA
            </a>
            <button
              className="lg:hidden text-crema"
              onClick={() => setOpen(true)}
              aria-label="Abrir menú"
            >
              <Menu size={22} strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-[1001] bg-negro flex flex-col items-center justify-center">
          <button
            className="absolute top-5 right-5 text-crema"
            onClick={() => setOpen(false)}
            aria-label="Cerrar menú"
          >
            <X size={28} strokeWidth={1.5} />
          </button>
          <img src="/images/logo.png" alt="Estación 27" className="h-20 mb-12" style={{ filter: "invert(1)" }} />
          <div className="flex flex-col items-center gap-8">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={(e) => { e.preventDefault(); handleNav(l.href); }}
                className="font-display font-bold italic text-3xl text-crema hover:text-ambar transition-colors"
              >
                {l.label}
              </a>
            ))}
          </div>
          <a
            href="#reservas"
            onClick={(e) => { e.preventDefault(); handleNav("#reservas"); }}
            className="mt-12 font-body font-medium text-[0.72rem] uppercase tracking-[0.18em] text-ambar border border-ambar px-6 py-3 rounded-sm hover:bg-ambar hover:text-negro transition-all duration-200"
          >
            RESERVAR MESA
          </a>
        </div>
      )}
    </>
  );
};

export default Navbar;
