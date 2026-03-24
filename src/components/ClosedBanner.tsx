import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useLang } from "@/contexts/LangContext";

interface EstadoLocal {
  abierto: boolean;
  motivo_cierre: string | null;
  fecha_vuelta: string | null;
}

const ClosedBanner = () => {
  const [estado, setEstado] = useState<EstadoLocal | null>(null);
  const { t } = useLang();

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from("estado_local").select("*").limit(1).single();
      if (data) setEstado(data);
    };
    fetch();
    const channel = supabase.channel("estado-public")
      .on("postgres_changes", { event: "*", schema: "public", table: "estado_local" }, () => fetch())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  if (!estado || estado.abierto) return null;

  const { motivo_cierre, fecha_vuelta } = estado;
  let message = "";
  if (motivo_cierre && fecha_vuelta) {
    message = `${t("closed.cerrados")} ${t("closed.por")} ${motivo_cierre}. ${t("closed.volvemos")} ${fecha_vuelta}.`;
  } else if (motivo_cierre) {
    message = `${t("closed.cerrados")} ${t("closed.por")} ${motivo_cierre}. ${t("closed.pronto")}.`;
  } else if (fecha_vuelta) {
    message = `${t("closed.cerrados")}. ${t("closed.volvemos")} ${fecha_vuelta}.`;
  } else {
    message = `${t("closed.cerrados")}. ${t("closed.pronto")}.`;
  }

  return (
    <div className="fixed top-[72px] left-0 right-0 z-[998] bg-[#1a1a1a] border-b border-[#333] py-3 px-4 text-center">
      <p className="font-body text-sm text-[#f0e8d0]">{message}</p>
    </div>
  );
};

export default ClosedBanner;
