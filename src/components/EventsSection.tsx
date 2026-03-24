import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useLang } from "@/contexts/LangContext";

interface Evento {
  id: string; nombre: string; nombre_en: string | null;
  descripcion: string | null; descripcion_en: string | null;
  fecha: string; hora_inicio: string; imagen_url: string | null;
  precio_entrada: number; requiere_reserva: boolean; activo: boolean;
}

const EventsSection = () => {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const { lang, t } = useLang();

  const fetchEventos = async () => {
    const hoy = new Date().toISOString().split("T")[0];
    const { data } = await supabase.from("eventos").select("*")
      .eq("activo", true).gte("fecha", hoy).order("fecha", { ascending: true });
    if (data) setEventos(data as Evento[]);
  };

  useEffect(() => {
    fetchEventos();
    const ch = supabase.channel("eventos-public")
      .on("postgres_changes", { event: "*", schema: "public", table: "eventos" }, () => fetchEventos())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  if (eventos.length === 0) return null;

  const getName = (e: Evento) => (lang === "en" && e.nombre_en) ? e.nombre_en : e.nombre;
  const getDesc = (e: Evento) => (lang === "en" && e.descripcion_en) ? e.descripcion_en : e.descripcion;

  return (
    <section className="bg-negro py-24 px-4 lg:px-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-4 mb-4">
            <span className="w-12 h-px bg-ambar" />
            <span className="label-amber">{t("events.label")}</span>
            <span className="w-12 h-px bg-ambar" />
          </div>
          <h2 className="font-display font-bold italic text-crema" style={{ fontSize: "clamp(1.8rem, 3vw, 2.8rem)" }}>
            {t("events.title")}
          </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {eventos.map(e => {
            const fechaObj = new Date(e.fecha + "T12:00:00");
            const dia = fechaObj.getDate();
            const mes = fechaObj.toLocaleDateString(lang === "en" ? "en-US" : "es-AR", { month: "short" }).toUpperCase();
            const diaSemana = fechaObj.toLocaleDateString(lang === "en" ? "en-US" : "es-AR", { weekday: "long" });

            return (
              <div key={e.id} className="bg-carbon border rounded-lg overflow-hidden transition-all hover:-translate-y-1"
                style={{ borderColor: "rgba(240,232,208,0.06)" }}>
                {e.imagen_url && (
                  <div className="h-40 overflow-hidden">
                    <img src={e.imagen_url} alt={getName(e)} className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="p-5">
                  <div className="flex items-start gap-4">
                    <div className="text-center shrink-0">
                      <span className="block font-display font-bold text-ambar text-2xl leading-none">{dia}</span>
                      <span className="block font-body text-[0.65rem] uppercase tracking-wider text-gris">{mes}</span>
                    </div>
                    <div>
                      <h3 className="font-display font-semibold text-crema text-lg leading-tight">{getName(e)}</h3>
                      <p className="font-body text-xs text-gris mt-1 capitalize">{diaSemana} — {e.hora_inicio}hs</p>
                    </div>
                  </div>
                  {getDesc(e) && (
                    <p className="font-body text-sm text-crema2 mt-3 leading-relaxed">{getDesc(e)}</p>
                  )}
                  <div className="flex items-center justify-between mt-4 pt-3 border-t" style={{ borderColor: "rgba(240,232,208,0.06)" }}>
                    <span className="font-body text-sm text-ambar font-medium">
                      {e.precio_entrada > 0 ? `$${e.precio_entrada.toLocaleString()}` : t("events.gratis")}
                    </span>
                    {e.requiere_reserva && (
                      <a href="#reservas"
                        className="font-body text-xs uppercase tracking-wider text-[#C8860A] border border-[#C8860A]/40 px-3 py-1 rounded-sm hover:bg-[#C8860A]/10 transition-colors">
                        {t("events.reservar")}
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default EventsSection;
