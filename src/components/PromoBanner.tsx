import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Promo {
  id: string; plato_id: string; tipo_descuento: string; valor_descuento: number;
  mensaje: string | null; activa: boolean; expira_en: string;
}
interface Plato { id: string; nombre: string; precio: number; }

const formatTimeLeft = (diff: number): string => {
  if (diff <= 0) return "";
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  if (h >= 24) return "";
  if (h >= 1) return `${h}h ${m}m ${s}s`;
  if (m >= 1) return `${m}m ${s}s`;
  return `${s}s`;
};

const PromoBannerItem = ({ promo, plato }: { promo: Promo; plato: Plato }) => {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const update = () => {
      const diff = new Date(promo.expira_en).getTime() - Date.now();
      if (diff <= 0) { setTimeLeft(""); return; }
      setTimeLeft(formatTimeLeft(diff));
    };
    update();
    const iv = setInterval(update, 1000);
    return () => clearInterval(iv);
  }, [promo.expira_en]);

  const descText = promo.tipo_descuento === "porcentaje"
    ? `${promo.valor_descuento}% de descuento`
    : `$${promo.valor_descuento} de descuento`;

  return (
    <p className="font-body text-sm text-[#f0e8d0]">
      {promo.mensaje && <span className="font-semibold text-[#C8860A]">{promo.mensaje} — </span>}
      <span className="font-medium">{plato.nombre}</span> con <span className="text-[#C8860A] font-semibold">{descText}</span>
      {" "}por tiempo limitado
      {timeLeft && (
        <span className="ml-2 text-[#C8860A] font-mono text-xs bg-[#C8860A]/10 px-2 py-0.5 rounded inline-flex items-center gap-1 transition-all duration-300">
          ⏱ Termina en: {timeLeft}
        </span>
      )}
    </p>
  );
};

const PromoBanner = () => {
  const [promos, setPromos] = useState<Promo[]>([]);
  const [platos, setPlatos] = useState<Record<string, Plato>>({});

  const fetchPromos = async () => {
    const { data } = await supabase.from("promociones").select("*").eq("activa", true);
    const active = (data || []).filter(p => new Date(p.expira_en) > new Date());
    setPromos(active);
    if (active.length > 0) {
      const ids = [...new Set(active.map(p => p.plato_id))];
      const { data: pl } = await supabase.from("platos").select("id, nombre, precio").in("id", ids);
      if (pl) {
        const map: Record<string, Plato> = {};
        pl.forEach(p => map[p.id] = p);
        setPlatos(map);
      }
    }
  };

  useEffect(() => {
    fetchPromos();
    const ch = supabase.channel("promo-public")
      .on("postgres_changes", { event: "*", schema: "public", table: "promociones" }, () => fetchPromos())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  const validPromos = promos.filter(p => platos[p.plato_id] && new Date(p.expira_en) > new Date());
  if (validPromos.length === 0) return null;

  return (
    <div className="bg-gradient-to-r from-[#1a1206] via-[#2a1d0a] to-[#1a1206] border-b border-[#C8860A]/20 py-3 px-4">
      <div className="max-w-5xl mx-auto text-center space-y-1">
        {validPromos.map(promo => (
          <PromoBannerItem key={promo.id} promo={promo} plato={platos[promo.plato_id]} />
        ))}
      </div>
    </div>
  );
};

export default PromoBanner;
