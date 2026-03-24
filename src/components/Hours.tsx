import { useEffect, useState } from "react";
import { Clock, MapPin, Phone } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useLang } from "@/contexts/LangContext";

interface Horario {
  dia: string;
  hora_apertura: string;
  hora_cierre: string;
  cerrado: boolean;
}

const Hours = () => {
  const [horarios, setHorarios] = useState<Horario[]>([]);
  const { t } = useLang();

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from("horarios").select("*");
      if (data) setHorarios(data);
    };
    fetch();
    const channel = supabase.channel("horarios-public")
      .on("postgres_changes", { event: "*", schema: "public", table: "horarios" }, () => fetch())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const formatHorarios = () => {
    if (horarios.length === 0) return null;
    const lunesSabado = horarios.filter((h) => h.dia !== "domingo");
    const domingo = horarios.find((h) => h.dia === "domingo");
    const allSame = lunesSabado.every(
      (h) => !h.cerrado && h.hora_apertura === lunesSabado[0]?.hora_apertura && h.hora_cierre === lunesSabado[0]?.hora_cierre
    );

    return (
      <>
        {allSame && lunesSabado[0] && !lunesSabado[0].cerrado ? (
          <p>{t("hours.lunsab")}: {lunesSabado[0].hora_apertura} a {lunesSabado[0].hora_cierre} hs</p>
        ) : (
          lunesSabado.map((h) => (
            <p key={h.dia} className="capitalize">
              {h.dia}: {h.cerrado ? t("hours.cerrado") : `${h.hora_apertura} a ${h.hora_cierre} hs`}
            </p>
          ))
        )}
        {domingo && (
          <p>{t("hours.dom")}: {domingo.cerrado ? t("hours.cerrado") : `${domingo.hora_apertura} a ${domingo.hora_cierre} hs`}</p>
        )}
      </>
    );
  };

  return (
    <section id="horarios" className="bg-carbon py-20 px-4 lg:px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-4 mb-4">
            <span className="w-12 h-px bg-ambar" />
            <span className="label-amber">{t("hours.label")}</span>
            <span className="w-12 h-px bg-ambar" />
          </div>
          <h2 className="font-display font-bold text-crema" style={{ fontSize: "clamp(1.8rem, 3vw, 2.8rem)" }}>
            {t("hours.title")}
          </h2>
        </div>

        <div className="grid lg:grid-cols-2 gap-10">
          <div className="space-y-6">
            <InfoCard icon={<Clock size={24} className="text-ambar" />} title={t("hours.horarios")}>
              {formatHorarios() || (
                <>
                  <p>{t("hours.lunsab")}: 08:00 a 02:00 hs</p>
                  <p>{t("hours.dom")}: 20:00 a 02:00 hs</p>
                </>
              )}
            </InfoCard>
            <InfoCard icon={<MapPin size={24} className="text-ambar" />} title={t("hours.direccion")}>
              <a href="https://www.google.com/maps/place/estacion+27+cordoba/data=!4m2!3m1!1s0x9432a2818788c5bd:0xe90868ad3279c90b" target="_blank" rel="noopener noreferrer" className="underline decoration-ambar/60 underline-offset-4 hover:decoration-ambar hover:text-ambar transition-colors cursor-pointer select-text">
                <p>27 de Abril 366, Centro</p>
                <p>Córdoba, Argentina</p>
              </a>
            </InfoCard>
            <InfoCard icon={<Phone size={24} className="text-ambar" />} title={t("hours.contacto")}>
              <p>(0351) 425-1651</p>
              <a href="https://instagram.com/estacionveintisiete" target="_blank" rel="noopener noreferrer" className="text-ambar hover:underline">
                @estacionveintisiete
              </a>
            </InfoCard>
          </div>

          <div className="rounded overflow-hidden" style={{ border: "1px solid rgba(240,232,208,0.10)" }}>
            <iframe src="https://maps.google.com/maps?q=27+de+Abril+366+Córdoba+Argentina&output=embed"
              width="100%" height="320" style={{ border: 0, display: "block", minHeight: 320 }} loading="lazy" title="Ubicación de Estación 27" />
          </div>
        </div>
      </div>
    </section>
  );
};

const InfoCard = ({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) => (
  <div className="flex gap-4">
    <div className="mt-1">{icon}</div>
    <div>
      <h3 className="font-body font-semibold text-crema mb-1">{title}</h3>
      <div className="font-body font-normal text-[0.90rem] text-crema2 space-y-0.5">{children}</div>
    </div>
  </div>
);

export default Hours;
