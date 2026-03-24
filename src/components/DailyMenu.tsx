import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface MenuDia {
  id: string; entrada: string | null; plato_principal: string; postre: string | null;
  bebida_incluida: boolean; precio: number; valido_hasta_hora: string; fecha: string; activo: boolean;
}

const DailyMenu = () => {
  const [menu, setMenu] = useState<MenuDia | null>(null);

  const fetchMenu = async () => {
    const hoy = new Date().toISOString().split("T")[0];
    const { data } = await supabase.from("menu_del_dia").select("*")
      .eq("fecha", hoy).eq("activo", true).limit(1).maybeSingle();
    if (data) {
      // Check if still valid by hour
      const [h, m] = data.valido_hasta_hora.split(":").map(Number);
      const now = new Date();
      const limit = new Date(); limit.setHours(h, m, 0, 0);
      if (now <= limit) setMenu(data);
      else setMenu(null);
    } else setMenu(null);
  };

  useEffect(() => {
    fetchMenu();
    const ch = supabase.channel("menu-dia-public")
      .on("postgres_changes", { event: "*", schema: "public", table: "menu_del_dia" }, () => fetchMenu())
      .subscribe();
    const iv = setInterval(fetchMenu, 60000); // Re-check every minute for hour expiry
    return () => { supabase.removeChannel(ch); clearInterval(iv); };
  }, []);

  if (!menu) return null;

  return (
    <section className="bg-gradient-to-b from-[#1a1206] to-negro py-16 px-4 lg:px-6">
      <div className="max-w-3xl mx-auto text-center">
        <div className="flex items-center justify-center gap-4 mb-6">
          <span className="w-12 h-px bg-ambar" />
          <span className="label-amber">MENÚ DEL DÍA</span>
          <span className="w-12 h-px bg-ambar" />
        </div>

        <div className="bg-carbon border rounded-lg p-8 md:p-10" style={{ borderColor: "rgba(200,134,10,0.20)" }}>
          <div className="space-y-3 mb-6">
            {menu.entrada && (
              <div>
                <span className="text-[0.7rem] font-body uppercase tracking-[0.15em] text-gris">Entrada</span>
                <p className="font-display font-semibold text-crema text-lg">{menu.entrada}</p>
              </div>
            )}
            <div>
              <span className="text-[0.7rem] font-body uppercase tracking-[0.15em] text-gris">Plato principal</span>
              <p className="font-display font-bold italic text-crema text-xl">{menu.plato_principal}</p>
            </div>
            {menu.postre && (
              <div>
                <span className="text-[0.7rem] font-body uppercase tracking-[0.15em] text-gris">Postre</span>
                <p className="font-display font-semibold text-crema text-lg">{menu.postre}</p>
              </div>
            )}
          </div>

          <div className="flex items-center justify-center gap-4">
            <span className="font-display font-bold text-ambar text-3xl">${menu.precio.toLocaleString()}</span>
            {menu.bebida_incluida && (
              <span className="text-[0.65rem] font-body uppercase tracking-wider text-ambar border border-ambar/40 px-2 py-0.5 rounded-sm">
                Bebida incluida
              </span>
            )}
          </div>

          <p className="text-gris text-xs mt-4 font-body">
            Disponible hasta las {menu.valido_hasta_hora}hs
          </p>
        </div>
      </div>
    </section>
  );
};

export default DailyMenu;
