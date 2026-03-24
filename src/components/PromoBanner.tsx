import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Promo {
  id: string; plato_id: string; tipo_descuento: string; valor_descuento: number;
  mensaje: string | null; activa: boolean; expira_en: string;
}
interface Plato { id: string; nombre: string; precio: number; }

const PromoBanner = () => {
  const [promo, setPromo] = useState<Promo | null>(null);
  const [plato, setPlato] = useState<Plato | null>(null);
  const [timeLeft, setTimeLeft] = useState("");

  const fetchPromo = async () => {
    const { data } = await supabase.from("promociones").select("*").eq("activa", true).limit(1).maybeSingle();
    if (data && new Date(data.expira_en) > new Date()) {
      setPromo(data);
      const { data: p } = await supabase.from("platos").select("id, nombre, precio").eq("id", data.plato_id).maybeSingle();
      if (p) setPlato(p);
    } else {
      setPromo(null); setPlato(null);
    }
  };

  useEffect(() => {
    fetchPromo();
    const ch = supabase.channel("promo-public")
      .on("postgres_changes", { event: "*", schema: "public", table: "promociones" }, () => fetchPromo())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  useEffect(() => {
    if (!promo) return;
    const update = () => {
      const diff = new Date(promo.expira_en).getTime() - Date.now();
      if (diff <= 0) { setPromo(null); setTimeLeft(""); return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      if (h < 24) setTimeLeft(`${h}h ${m}m ${s}s`);
      else setTimeLeft("");
    };
    update();
    const iv = setInterval(update, 1000);
    return () => clearInterval(iv);
  }, [promo]);

  if (!promo || !plato) return null;

  const descText = promo.tipo_descuento === "porcentaje"
    ? `${promo.valor_descuento}% de descuento`
    : `$${promo.valor_descuento} de descuento`;

  return (
    <div className="bg-gradient-to-r from-[#1a1206] via-[#2a1d0a] to-[#1a1206] border-b border-[#C8860A]/20 py-3 px-4">
      <div className="max-w-5xl mx-auto text-center">
        <p className="font-body text-sm text-[#f0e8d0]">
          {promo.mensaje && <span className="font-semibold text-[#C8860A]">{promo.mensaje} — </span>}
          <span className="font-medium">{plato.nombre}</span> con <span className="text-[#C8860A] font-semibold">{descText}</span>
          {" "}por tiempo limitado
          {timeLeft && (
            <span className="ml-2 text-[#C8860A] font-mono text-xs bg-[#C8860A]/10 px-2 py-0.5 rounded">
              ⏱ {timeLeft}
            </span>
          )}
        </p>
      </div>
    </div>
  );
};

export default PromoBanner;
