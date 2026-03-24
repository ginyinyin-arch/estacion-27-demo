import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface MenuDia {
  id: string; entrada: string | null; plato_principal: string; postre: string | null;
  bebida_incluida: boolean; precio: number; valido_hasta_hora: string; fecha: string;
  activo: boolean; created_at: string;
}

const AdminMenuDelDia = () => {
  const { toast } = useToast();
  const [menus, setMenus] = useState<MenuDia[]>([]);
  const [entrada, setEntrada] = useState("");
  const [platoPrincipal, setPlatoPrincipal] = useState("");
  const [postre, setPostre] = useState("");
  const [bebida, setBebida] = useState(false);
  const [precio, setPrecio] = useState("");
  const [validoHasta, setValidoHasta] = useState("16:00");
  const [loading, setLoading] = useState(false);

  const fetchMenus = async () => {
    const { data } = await supabase.from("menu_del_dia").select("*").order("fecha", { ascending: false }).limit(8);
    if (data) setMenus(data);
  };

  useEffect(() => {
    fetchMenus();
    const ch = supabase.channel("admin-menu-dia")
      .on("postgres_changes", { event: "*", schema: "public", table: "menu_del_dia" }, () => fetchMenus())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  const hoy = new Date().toISOString().split("T")[0];
  const menuHoy = menus.find(m => m.fecha === hoy && m.activo);

  const publicar = async () => {
    if (!platoPrincipal || !precio) {
      toast({ title: "Plato principal y precio son requeridos", variant: "destructive" }); return;
    }
    setLoading(true);
    // Desactivar menú anterior de hoy si existe
    if (menuHoy) {
      await supabase.from("menu_del_dia").update({ activo: false }).eq("id", menuHoy.id);
    }
    const { data: newMenu } = await supabase.from("menu_del_dia").insert({
      entrada: entrada || null, plato_principal: platoPrincipal,
      postre: postre || null, bebida_incluida: bebida,
      precio: Number(precio), valido_hasta_hora: validoHasta, fecha: hoy,
    }).select("id").single();
    if (newMenu) {
      supabase.functions.invoke("auto-translate", { body: { table: "menu_del_dia", id: newMenu.id, fields: { entrada: entrada || null, plato_principal: platoPrincipal, postre: postre || null } } });
    }
    toast({ title: "Menú del día publicado" });
    setEntrada(""); setPlatoPrincipal(""); setPostre(""); setPrecio(""); setBebida(false);
    setLoading(false);
  };

  const desactivar = async (id: string) => {
    await supabase.from("menu_del_dia").update({ activo: false }).eq("id", id);
    toast({ title: "Menú desactivado" });
  };

  return (
    <div>
      <h1 className="text-xl font-semibold text-[#f0e8d0] mb-6">Menú del Día</h1>

      {menuHoy && (
        <div className="bg-[#C8860A]/10 border border-[#C8860A]/30 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#f0e8d0] font-medium">Menú activo hoy</p>
              <p className="text-[#999] text-sm">
                {menuHoy.entrada && `${menuHoy.entrada} + `}{menuHoy.plato_principal}
                {menuHoy.postre && ` + ${menuHoy.postre}`} — ${menuHoy.precio}
              </p>
              <p className="text-[#666] text-xs mt-1">Válido hasta las {menuHoy.valido_hasta_hora}hs</p>
            </div>
            <button onClick={() => desactivar(menuHoy.id)}
              className="text-sm text-red-400 hover:text-red-300 border border-red-400/30 px-3 py-1.5 rounded">
              Desactivar
            </button>
          </div>
        </div>
      )}

      <div className="bg-[#1a1a1a] border border-[#222] rounded-lg p-5 space-y-4">
        <div>
          <label className="block text-sm text-[#999] mb-1">Entrada (opcional)</label>
          <input type="text" value={entrada} onChange={e => setEntrada(e.target.value)}
            className="w-full bg-[#111] border border-[#333] text-[#f0e8d0] rounded px-3 py-2 text-sm"
            placeholder="Ej: Empanadas, Sopa crema..." />
        </div>
        <div>
          <label className="block text-sm text-[#999] mb-1">Plato principal *</label>
          <input type="text" value={platoPrincipal} onChange={e => setPlatoPrincipal(e.target.value)}
            className="w-full bg-[#111] border border-[#333] text-[#f0e8d0] rounded px-3 py-2 text-sm"
            placeholder="Ej: Milanesa napolitana con papas fritas" />
        </div>
        <div>
          <label className="block text-sm text-[#999] mb-1">Postre (opcional)</label>
          <input type="text" value={postre} onChange={e => setPostre(e.target.value)}
            className="w-full bg-[#111] border border-[#333] text-[#f0e8d0] rounded px-3 py-2 text-sm"
            placeholder="Ej: Flan casero" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-[#999] mb-1">Precio *</label>
            <input type="number" value={precio} onChange={e => setPrecio(e.target.value)}
              className="w-full bg-[#111] border border-[#333] text-[#f0e8d0] rounded px-3 py-2 text-sm" placeholder="Ej: 4500" />
          </div>
          <div>
            <label className="block text-sm text-[#999] mb-1">Válido hasta</label>
            <input type="time" value={validoHasta} onChange={e => setValidoHasta(e.target.value)}
              className="w-full bg-[#111] border border-[#333] text-[#f0e8d0] rounded px-3 py-2 text-sm" />
          </div>
        </div>
        <label className="flex items-center gap-3 cursor-pointer">
          <div className={`w-10 h-5 rounded-full transition-colors relative ${bebida ? "bg-[#C8860A]" : "bg-[#333]"}`}
            onClick={() => setBebida(!bebida)}>
            <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${bebida ? "left-5" : "left-0.5"}`} />
          </div>
          <span className="text-sm text-[#999]">Bebida incluida</span>
        </label>

        <button onClick={publicar} disabled={loading}
          className="w-full bg-[#C8860A] hover:bg-[#a06d08] text-white font-semibold py-2.5 rounded transition-colors disabled:opacity-50">
          {loading ? "Publicando..." : "PUBLICAR MENÚ DEL DÍA"}
        </button>
      </div>

      {/* Historial últimos 7 */}
      {menus.filter(m => m.fecha !== hoy || !m.activo).length > 0 && (
        <div className="mt-8">
          <h2 className="text-sm font-medium text-[#999] mb-3">Últimos menús</h2>
          <div className="space-y-2">
            {menus.filter(m => m.fecha !== hoy || !m.activo).slice(0, 7).map(m => (
              <div key={m.id} className="bg-[#1a1a1a] border border-[#222] rounded p-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#f0e8d0]">{m.plato_principal}</span>
                  <span className="text-[#666]">{new Date(m.fecha + "T12:00:00").toLocaleDateString("es-AR")}</span>
                </div>
                <span className="text-[#999] text-xs">
                  {m.entrada && `${m.entrada} + `}{m.plato_principal}{m.postre && ` + ${m.postre}`} — ${m.precio}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMenuDelDia;
