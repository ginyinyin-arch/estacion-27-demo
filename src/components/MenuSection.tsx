import { useState, useEffect, useRef, useCallback } from "react";
import { Wine, Bell, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useLang } from "@/contexts/LangContext";
import PriceAlertModal from "./PriceAlertModal";

interface Plato {
  id: string;
  categoria: string;
  nombre: string;
  nombre_en: string | null;
  descripcion: string | null;
  descripcion_en: string | null;
  precio: number;
  imagen_url: string | null;
  disponible: boolean;
  disponible_hasta: string | null;
  orden: number;
}

interface Promo {
  plato_id: string;
  tipo_descuento: string;
  valor_descuento: number;
  activa: boolean;
  expira_en: string;
  cantidad: number | null;
  cantidad_restante: number | null;
  agotar_al_terminar: boolean;
}

const categoryImages: Record<string, string> = {
  "Lomos": "/images/lomo.jpg",
  "Tex Mex": "/images/tacos.jpg",
  "Ensaladas": "/images/wrap.jpg",
};

const categorias = ["Lomos", "Hamburguesas", "Tex Mex", "Ensaladas", "Picadas", "Bar"];

const MenuSection = () => {
  const [active, setActive] = useState("Lomos");
  const [platos, setPlatos] = useState<Plato[]>([]);
  const [promos, setPromos] = useState<Promo[]>([]);
  const { lang, t } = useLang();
  const tabsRef = useRef<HTMLDivElement>(null);

  const scrollToTab = (cat: string) => {
    const container = tabsRef.current;
    if (!container) return;
    const btn = container.querySelector(`[data-tab="${cat}"]`) as HTMLElement;
    if (!btn) return;
    const left = btn.offsetLeft - container.offsetWidth / 2 + btn.offsetWidth / 2;
    container.scrollTo({ left, behavior: "smooth" });
  };

  useEffect(() => {
    const fetchPlatos = async () => {
      const { data } = await supabase.from("platos").select("*").order("orden", { ascending: true });
      if (data) setPlatos(data as Plato[]);
    };
    const fetchPromos = async () => {
      const { data } = await supabase.from("promociones").select("plato_id, tipo_descuento, valor_descuento, activa, expira_en, cantidad, cantidad_restante, agotar_al_terminar")
        .eq("activa", true);
      if (data) {
        const valid = data.filter(p => new Date(p.expira_en) > new Date());
        setPromos(valid);
      } else {
        setPromos([]);
      }
    };
    fetchPlatos(); fetchPromos();

    const ch1 = supabase.channel("platos-public")
      .on("postgres_changes", { event: "*", schema: "public", table: "platos" }, () => fetchPlatos())
      .subscribe();
    const ch2 = supabase.channel("promo-menu")
      .on("postgres_changes", { event: "*", schema: "public", table: "promociones" }, () => fetchPromos())
      .subscribe();
    return () => { supabase.removeChannel(ch1); supabase.removeChannel(ch2); };
  }, []);

  const [alertPlatoId, setAlertPlatoId] = useState<string | null>(null);
  const [lightboxPlato, setLightboxPlato] = useState<Plato | null>(null);

  const closeLightbox = useCallback(() => setLightboxPlato(null), []);
  useEffect(() => {
    if (!lightboxPlato) return;
    const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") closeLightbox(); };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [lightboxPlato, closeLightbox]);

  const activePlatos = platos.filter((p) => p.categoria === active);
  const image = categoryImages[active];

  const getName = (p: Plato) => (lang === "en" && p.nombre_en) ? p.nombre_en : p.nombre;
  const getDesc = (p: Plato) => (lang === "en" && p.descripcion_en) ? p.descripcion_en : p.descripcion;

  const getPromo = (platoId: string): Promo | null => {
    return promos.find(p => p.plato_id === platoId) || null;
  };

  const isAgotado = (platoId: string): boolean => {
    const p = getPromo(platoId);
    return !!p && p.agotar_al_terminar && p.cantidad_restante !== null && p.cantidad_restante <= 0;
  };

  return (
    <section id="carta" className="bg-negro py-24 px-4 lg:px-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-4 mb-4">
            <span className="w-12 h-px bg-ambar" />
            <span className="label-amber">{t("menu.label")}</span>
            <span className="w-12 h-px bg-ambar" />
          </div>
          <h2 className="font-display font-bold italic text-crema" style={{ fontSize: "clamp(1.8rem, 3vw, 2.8rem)" }}>
            {t("menu.title")}
          </h2>
          <p className="font-body font-light text-[0.95rem] text-crema2 mt-3">{t("menu.subtitle")}</p>
        </div>

        <div className="relative mb-10">
          <div
            ref={tabsRef}
            className="flex overflow-x-auto gap-1 pb-2 scroll-smooth"
            style={{ scrollbarWidth: "none", WebkitOverflowScrolling: "touch", msOverflowStyle: "none" }}
          >
            {categorias.map((c) => (
              <button key={c} onClick={() => { setActive(c); scrollToTab(c); }}
                data-tab={c}
                className={`font-body font-medium text-[0.73rem] uppercase tracking-[0.18em] px-[18px] py-2.5 whitespace-nowrap transition-colors duration-200 border-b-2 ${
                  active === c ? "text-ambar border-ambar" : "text-gris border-transparent hover:text-crema"
                }`}>
                {t(`menu.tab.${c}`)}
              </button>
            ))}
          </div>
          {/* Fade indicators for mobile scroll */}
          <div className="absolute right-0 top-0 bottom-2 w-8 bg-gradient-to-l from-negro to-transparent pointer-events-none md:hidden" />
          <div className="absolute left-0 top-0 bottom-2 w-8 bg-gradient-to-r from-negro to-transparent pointer-events-none md:hidden" />
        </div>

        <div key={active} className="animate-fade-in-up">
          {active === "Bar" ? (
            <div className="bg-madera rounded p-8 md:p-12 text-center">
              <Wine size={40} className="text-ambar mx-auto mb-4" />
              <h3 className="font-display font-bold italic text-2xl text-crema mb-3">{t("menu.bar.title")}</h3>
              <p className="font-body font-light text-crema2 max-w-md mx-auto">
                {(activePlatos[0] ? getDesc(activePlatos[0]) : null) || t("menu.bar.desc")}
              </p>
            </div>
          ) : (
            <>
              {image && (
                <div className="mb-8">
                  <div className="relative w-full h-[280px] md:h-[360px] rounded overflow-hidden">
                    <img src={image} alt="" className="absolute inset-0 w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-negro/70 via-negro/20 to-transparent pointer-events-none" />
                    {active === "Lomos" && (
                      <p className="absolute bottom-4 left-0 right-0 text-center font-display font-semibold italic text-crema/80 text-sm">
                        {t("menu.lomo.subtitle")}
                      </p>
                    )}
                  </div>
                </div>
              )}
              <div className="grid md:grid-cols-2 gap-4">
                {activePlatos.map((d) => {
                  const promo = getPromo(d.id);
                  const agotado = isAgotado(d.id);
                  const promoActiva = promo && !agotado && d.disponible;
                  const itemDisabled = !d.disponible || agotado;

                  return (
                  <div key={d.id}
                    className={`bg-carbon border rounded p-5 flex justify-between items-start gap-4 transition-all duration-200 hover:-translate-y-0.5 ${itemDisabled ? "opacity-50 grayscale" : ""}`}
                    style={{ borderColor: "rgba(240,232,208,0.06)" }}
                    onMouseEnter={(e) => { if (!itemDisabled) { e.currentTarget.style.borderColor = "rgba(200,134,10,0.22)"; e.currentTarget.style.boxShadow = "0 4px 24px rgba(0,0,0,0.35)"; } }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(240,232,208,0.06)"; e.currentTarget.style.boxShadow = "none"; }}>
                    <div className="flex-1 flex gap-3">
                      {d.imagen_url && (
                        <img
                          src={d.imagen_url}
                          alt={getName(d)}
                          className="w-12 h-12 rounded-md object-cover cursor-pointer shrink-0"
                          onClick={() => setLightboxPlato(d)}
                        />
                      )}
                      <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`font-display font-semibold text-[1.05rem] ${agotado ? "text-gris line-through decoration-ambar decoration-2" : !d.disponible ? "text-crema line-through" : "text-crema"} ${d.imagen_url ? "cursor-pointer" : ""}`}
                          onClick={() => d.imagen_url && setLightboxPlato(d)}
                        >
                          {getName(d)}
                        </span>
                        {agotado && (
                          <span className="text-[0.6rem] font-body font-bold uppercase tracking-wider text-gris border border-gris/40 px-1.5 py-0.5 rounded-sm">
                            {t("menu.badge.agotado")}
                          </span>
                        )}
                        {!d.disponible && !agotado && (
                          <span className="text-[0.6rem] font-body font-bold uppercase tracking-wider text-gris border border-gris/40 px-1.5 py-0.5 rounded-sm">
                            {t("menu.badge.nodisponible")}
                          </span>
                        )}
                        {promoActiva && (
                          <span className="text-[0.6rem] font-body font-bold uppercase tracking-wider text-negro bg-ambar px-1.5 py-0.5 rounded-sm">
                            {t("menu.badge.oferta")} {promo.tipo_descuento === "porcentaje" ? `-${promo.valor_descuento}%` : `-$${promo.valor_descuento}`}
                            {promo.cantidad_restante !== null && ` — ${promo.cantidad_restante} uds`}
                          </span>
                        )}
                        {d.nombre.includes("★") && d.disponible && !promo && (
                          <span className="text-[0.6rem] font-body font-bold uppercase tracking-wider text-ambar border border-ambar px-1.5 py-0.5 rounded-sm">
                            {t("menu.badge.especialidad")}
                          </span>
                        )}
                      </div>
                      {getDesc(d) && (
                        <p className="font-body font-light text-[0.84rem] text-crema2 leading-[1.65] mt-1 max-w-[85%]">
                          {getDesc(d)}
                        </p>
                      )}
                      </div>
                    </div>
                    {d.precio > 0 && (
                      <div className="text-right whitespace-nowrap">
                        {promoActiva ? (
                          <>
                            <span className="font-body text-[0.78rem] text-gris line-through block">${d.precio.toLocaleString()}</span>
                            <span className="font-body font-bold text-[1.05rem] text-ambar">
                              ${(promo.tipo_descuento === "porcentaje"
                                ? Math.round(d.precio * (1 - promo.valor_descuento / 100))
                                : Math.max(0, d.precio - promo.valor_descuento)
                              ).toLocaleString()}
                            </span>
                          </>
                        ) : (
                          <span className="font-body font-medium text-[0.92rem] text-ambar">${d.precio.toLocaleString()}</span>
                        )}
                        {d.disponible && !agotado && (
                          <button
                            onClick={(e) => { e.stopPropagation(); setAlertPlatoId(d.id); }}
                            className="flex items-center gap-1 mt-1 font-body text-[0.68rem] text-crema2 hover:text-ambar transition-colors"
                          >
                            <Bell size={10} />
                            {t("alert.btn")}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {alertPlatoId && (
          <PriceAlertModal
            platos={platos}
            initialPlatoId={alertPlatoId}
            onClose={() => setAlertPlatoId(null)}
          />
        )}
      </div>
    </section>
  );
};

export default MenuSection;
