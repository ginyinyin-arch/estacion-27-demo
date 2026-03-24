import { useState, useEffect } from "react";
import { Wine, Bell } from "lucide-react";
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
  const [promo, setPromo] = useState<Promo | null>(null);
  const { lang, t } = useLang();

  useEffect(() => {
    const fetchPlatos = async () => {
      const { data } = await supabase.from("platos").select("*").order("orden", { ascending: true });
      if (data) setPlatos(data as Plato[]);
    };
    const fetchPromo = async () => {
      const { data } = await supabase.from("promociones").select("plato_id, tipo_descuento, valor_descuento, activa, expira_en")
        .eq("activa", true).limit(1).maybeSingle();
      if (data && new Date(data.expira_en) > new Date()) setPromo(data);
      else setPromo(null);
    };
    fetchPlatos(); fetchPromo();

    const ch1 = supabase.channel("platos-public")
      .on("postgres_changes", { event: "*", schema: "public", table: "platos" }, () => fetchPlatos())
      .subscribe();
    const ch2 = supabase.channel("promo-menu")
      .on("postgres_changes", { event: "*", schema: "public", table: "promociones" }, () => fetchPromo())
      .subscribe();
    return () => { supabase.removeChannel(ch1); supabase.removeChannel(ch2); };
  }, []);

  const [alertPlatoId, setAlertPlatoId] = useState<string | null>(null);

  const activePlatos = platos.filter((p) => p.categoria === active);
  const image = categoryImages[active];

  const getName = (p: Plato) => (lang === "en" && p.nombre_en) ? p.nombre_en : p.nombre;
  const getDesc = (p: Plato) => (lang === "en" && p.descripcion_en) ? p.descripcion_en : p.descripcion;

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

        <div className="flex overflow-x-auto gap-1 mb-10 pb-2" style={{ scrollbarWidth: "none" }}>
          {categorias.map((c) => (
            <button key={c} onClick={() => setActive(c)}
              className={`font-body font-medium text-[0.73rem] uppercase tracking-[0.18em] px-[18px] py-2.5 whitespace-nowrap transition-colors duration-200 border-b-2 ${
                active === c ? "text-ambar border-ambar" : "text-gris border-transparent hover:text-crema"
              }`}>
              {t(`menu.tab.${c}`)}
            </button>
          ))}
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
                {activePlatos.map((d) => (
                  <div key={d.id}
                    className={`bg-carbon border rounded p-5 flex justify-between items-start gap-4 transition-all duration-200 hover:-translate-y-0.5 ${!d.disponible ? "opacity-60" : ""}`}
                    style={{ borderColor: "rgba(240,232,208,0.06)" }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(200,134,10,0.22)"; e.currentTarget.style.boxShadow = "0 4px 24px rgba(0,0,0,0.35)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(240,232,208,0.06)"; e.currentTarget.style.boxShadow = "none"; }}>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`font-display font-semibold text-[1.05rem] text-crema ${!d.disponible ? "line-through" : ""}`}>
                          {getName(d)}
                        </span>
                        {!d.disponible && (
                          <span className="text-[0.6rem] font-body font-bold uppercase tracking-wider text-gris border border-gris/40 px-1.5 py-0.5 rounded-sm">
                            {t("menu.badge.nodisponible")}
                          </span>
                        )}
                        {promo && promo.plato_id === d.id && d.disponible && (
                          <span className="text-[0.6rem] font-body font-bold uppercase tracking-wider text-negro bg-ambar px-1.5 py-0.5 rounded-sm">
                            {t("menu.badge.oferta")} {promo.tipo_descuento === "porcentaje" ? `-${promo.valor_descuento}%` : `-$${promo.valor_descuento}`}
                          </span>
                        )}
                        {d.nombre.includes("★") && d.disponible && !(promo?.plato_id === d.id) && (
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
                    {d.precio > 0 && (
                      <div className="text-right whitespace-nowrap">
                        {promo && promo.plato_id === d.id ? (
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
                        {d.disponible && (
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
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
};

export default MenuSection;
