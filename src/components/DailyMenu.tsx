import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useLang } from "@/contexts/LangContext";

interface MenuDia {
  id: string; entrada: string | null; entrada_en: string | null;
  plato_principal: string; plato_principal_en: string | null;
  postre: string | null; postre_en: string | null;
  bebida_incluida: boolean; precio: number; valido_hasta_hora: string;
  fecha: string; activo: boolean;
}

const DailyMenu = () => {
  const [menu, setMenu] = useState<MenuDia | null>(null);
  const { lang, t } = useLang();

  const fetchMenu = async () => {
    const hoy = new Date().toISOString().split("T")[0];
    const { data } = await supabase.from("menu_del_dia").select("*")
      .eq("fecha", hoy).eq("activo", true).limit(1).maybeSingle();
    if (data) {
      const [h, m] = data.valido_hasta_hora.split(":").map(Number);
      const now = new Date();
      const limit = new Date(); limit.setHours(h, m, 0, 0);
      if (now <= limit) setMenu(data as MenuDia);
      else setMenu(null);
    } else setMenu(null);
  };

  useEffect(() => {
    fetchMenu();
    const ch = supabase.channel("menu-dia-public")
      .on("postgres_changes", { event: "*", schema: "public", table: "menu_del_dia" }, () => fetchMenu())
      .subscribe();
    const iv = setInterval(fetchMenu, 60000);
    return () => { supabase.removeChannel(ch); clearInterval(iv); };
  }, []);

  if (!menu) return null;

  const getEntrada = () => (lang === "en" && menu.entrada_en) ? menu.entrada_en : menu.entrada;
  const getPrincipal = () => (lang === "en" && menu.plato_principal_en) ? menu.plato_principal_en : menu.plato_principal;
  const getPostre = () => (lang === "en" && menu.postre_en) ? menu.postre_en : menu.postre;

  return (
    <section className="bg-gradient-to-b from-[#1a1206] to-negro py-16 px-4 lg:px-6">
      <div className="max-w-3xl mx-auto text-center">
        <div className="flex items-center justify-center gap-4 mb-6">
          <span className="w-12 h-px bg-ambar" />
          <span className="label-amber">{t("daily.label")}</span>
          <span className="w-12 h-px bg-ambar" />
        </div>

        <div className="bg-carbon border rounded-lg p-8 md:p-10" style={{ borderColor: "rgba(200,134,10,0.20)" }}>
          <div className="space-y-3 mb-6">
            {getEntrada() && (
              <div>
                <span className="text-[0.7rem] font-body uppercase tracking-[0.15em] text-gris">{t("daily.entrada")}</span>
                <p className="font-display font-semibold text-crema text-lg">{getEntrada()}</p>
              </div>
            )}
            <div>
              <span className="text-[0.7rem] font-body uppercase tracking-[0.15em] text-gris">{t("daily.principal")}</span>
              <p className="font-display font-bold italic text-crema text-xl">{getPrincipal()}</p>
            </div>
            {getPostre() && (
              <div>
                <span className="text-[0.7rem] font-body uppercase tracking-[0.15em] text-gris">{t("daily.postre")}</span>
                <p className="font-display font-semibold text-crema text-lg">{getPostre()}</p>
              </div>
            )}
          </div>

          <div className="flex items-center justify-center gap-4">
            <span className="font-display font-bold text-ambar text-3xl">${menu.precio.toLocaleString()}</span>
            {menu.bebida_incluida && (
              <span className="text-[0.65rem] font-body uppercase tracking-wider text-ambar border border-ambar/40 px-2 py-0.5 rounded-sm">
                {t("daily.bebida")}
              </span>
            )}
          </div>
          <p className="text-gris text-xs mt-4 font-body">{t("daily.hasta")} {menu.valido_hasta_hora}hs</p>
        </div>
      </div>
    </section>
  );
};

export default DailyMenu;
