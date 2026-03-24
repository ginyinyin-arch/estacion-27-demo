import { useState, useEffect } from "react";
import { Wine } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Plato {
  id: string;
  categoria: string;
  nombre: string;
  descripcion: string | null;
  precio: number;
  imagen_url: string | null;
  disponible: boolean;
  disponible_hasta: string | null;
  orden: number;
}

const categoryMap: Record<string, string> = {
  "Lomos": "LOMOS",
  "Hamburguesas": "HAMBURGUESAS",
  "Tex Mex": "TEX MEX",
  "Ensaladas": "ENSALADAS",
  "Picadas": "PICADAS",
  "Bar": "BAR",
};

const categoryImages: Record<string, string> = {
  "Lomos": "/images/lomo.jpg",
  "Tex Mex": "/images/tacos.jpg",
  "Ensaladas": "/images/wrap.jpg",
};

const categorySubtitles: Record<string, string> = {
  "Lomos": "EL LOMO ESTACIÓN — Nuestra especialidad.",
};

const categorias = ["Lomos", "Hamburguesas", "Tex Mex", "Ensaladas", "Picadas", "Bar"];

const MenuSection = () => {
  const [active, setActive] = useState("Lomos");
  const [platos, setPlatos] = useState<Plato[]>([]);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from("platos").select("*").order("orden", { ascending: true });
      if (data) setPlatos(data);
    };
    fetch();

    const channel = supabase
      .channel("platos-public")
      .on("postgres_changes", { event: "*", schema: "public", table: "platos" }, () => fetch())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const activePlatos = platos.filter((p) => p.categoria === active);
  const image = categoryImages[active];
  const subtitle = categorySubtitles[active];

  return (
    <section id="carta" className="bg-negro py-24 px-4 lg:px-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-4 mb-4">
            <span className="w-12 h-px bg-ambar" />
            <span className="label-amber">LA CARTA</span>
            <span className="w-12 h-px bg-ambar" />
          </div>
          <h2 className="font-display font-bold italic text-crema" style={{ fontSize: "clamp(1.8rem, 3vw, 2.8rem)" }}>
            Treinta años perfeccionando cada plato.
          </h2>
          <p className="font-body font-light text-[0.95rem] text-crema2 mt-3">
            Cocina de autor, ingredientes frescos, recetas propias.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex overflow-x-auto gap-1 mb-10 pb-2" style={{ scrollbarWidth: "none" }}>
          {categorias.map((c) => (
            <button
              key={c}
              onClick={() => setActive(c)}
              className={`font-body font-medium text-[0.73rem] uppercase tracking-[0.18em] px-[18px] py-2.5 whitespace-nowrap transition-colors duration-200 border-b-2 ${
                active === c
                  ? "text-ambar border-ambar"
                  : "text-gris border-transparent hover:text-crema"
              }`}
            >
              {categoryMap[c] || c}
            </button>
          ))}
        </div>

        {/* Content */}
        <div key={active} className="animate-fade-in-up">
          {active === "Bar" ? (
            <div className="bg-madera rounded p-8 md:p-12 text-center">
              <Wine size={40} className="text-ambar mx-auto mb-4" />
              <h3 className="font-display font-bold italic text-2xl text-crema mb-3">
                Gin, Vermouth & Coctelería
              </h3>
              <p className="font-body font-light text-crema2 max-w-md mx-auto">
                {activePlatos[0]?.descripcion || "Carta de tragos, gin tonic de autor, vermouths clásicos y cocteles de la casa. Preguntanos en el salón."}
              </p>
            </div>
          ) : (
            <>
              {image && (
                <div className="mb-8">
                  <div className="relative w-full h-[280px] md:h-[360px] rounded overflow-hidden">
                    <img src={image} alt="" className="absolute inset-0 w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-negro/70 via-negro/20 to-transparent pointer-events-none" />
                    {subtitle && (
                      <p className="absolute bottom-4 left-0 right-0 text-center font-display font-semibold italic text-crema/80 text-sm">
                        {subtitle}
                      </p>
                    )}
                  </div>
                </div>
              )}
              <div className="grid md:grid-cols-2 gap-4">
                {activePlatos.map((d) => (
                  <div
                    key={d.id}
                    className={`bg-carbon border rounded p-5 flex justify-between items-start gap-4 transition-all duration-200 hover:-translate-y-0.5 ${
                      !d.disponible ? "opacity-60" : ""
                    }`}
                    style={{ borderColor: "rgba(240,232,208,0.06)" }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = "rgba(200,134,10,0.22)";
                      e.currentTarget.style.boxShadow = "0 4px 24px rgba(0,0,0,0.35)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "rgba(240,232,208,0.06)";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`font-display font-semibold text-[1.05rem] text-crema ${!d.disponible ? "line-through" : ""}`}>
                          {d.nombre}
                        </span>
                        {!d.disponible && (
                          <span className="text-[0.6rem] font-body font-bold uppercase tracking-wider text-gris border border-gris/40 px-1.5 py-0.5 rounded-sm">
                            No disponible
                          </span>
                        )}
                        {d.nombre.includes("★") && d.disponible && (
                          <span className="text-[0.6rem] font-body font-bold uppercase tracking-wider text-ambar border border-ambar px-1.5 py-0.5 rounded-sm">
                            ESPECIALIDAD
                          </span>
                        )}
                      </div>
                      {d.descripcion && (
                        <p className="font-body font-light text-[0.84rem] text-crema2 leading-[1.65] mt-1 max-w-[85%]">
                          {d.descripcion}
                        </p>
                      )}
                    </div>
                    {d.precio > 0 && (
                      <span className="font-body font-medium text-[0.92rem] text-ambar whitespace-nowrap">
                        ${d.precio.toLocaleString()}
                      </span>
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
