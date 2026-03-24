import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from "@/components/ui/alert-dialog";

interface Plato { id: string; nombre: string; categoria: string; precio: number; }
interface Promo {
  id: string; plato_id: string; tipo_descuento: string; valor_descuento: number;
  mensaje: string | null; activa: boolean; expira_en: string; created_at: string;
  platos?: Plato;
}

const AdminPromociones = () => {
  const { toast } = useToast();
  const [platos, setPlatos] = useState<Plato[]>([]);
  const [promos, setPromos] = useState<Promo[]>([]);
  const [platoId, setPlatoId] = useState("");
  const [tipoDescuento, setTipoDescuento] = useState("porcentaje");
  const [valorDescuento, setValorDescuento] = useState("");
  const [duracion, setDuracion] = useState("24");
  const [unidadDuracion, setUnidadDuracion] = useState("horas");
  const [mensaje, setMensaje] = useState("");
  const [loading, setLoading] = useState(false);
  const [confirmReplace, setConfirmReplace] = useState(false);

  const fetchData = async () => {
    const [{ data: p }, { data: pr }] = await Promise.all([
      supabase.from("platos").select("id, nombre, categoria, precio").order("categoria").order("orden"),
      supabase.from("promociones").select("*").order("created_at", { ascending: false }),
    ]);
    if (p) setPlatos(p);
    if (pr) setPromos(pr);
  };

  useEffect(() => {
    fetchData();
    const ch = supabase.channel("admin-promos")
      .on("postgres_changes", { event: "*", schema: "public", table: "promociones" }, () => fetchData())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  const activePromo = promos.find(p => p.activa);

  const activarPromo = async (force = false) => {
    if (!platoId || !valorDescuento || !duracion) {
      toast({ title: "Completá todos los campos", variant: "destructive" }); return;
    }
    if (activePromo && !force) { setConfirmReplace(true); return; }

    setLoading(true);
    try {
      if (activePromo) {
        await supabase.from("promociones").update({ activa: false }).eq("id", activePromo.id);
      }
      const durMs = Number(duracion) * (unidadDuracion === "horas" ? 3600000 : 86400000);
      const expira = new Date(Date.now() + durMs).toISOString();
      await supabase.from("promociones").insert({
        plato_id: platoId, tipo_descuento: tipoDescuento,
        valor_descuento: Number(valorDescuento), mensaje: mensaje || null,
        activa: true, expira_en: expira,
      });
      toast({ title: "Promoción activada" });
      setPlatoId(""); setValorDescuento(""); setMensaje(""); setDuracion("24");
    } catch { toast({ title: "Error", variant: "destructive" }); }
    setLoading(false);
  };

  const cancelarPromo = async (id: string) => {
    await supabase.from("promociones").update({ activa: false }).eq("id", id);
    toast({ title: "Promoción cancelada" });
  };

  const platoNombre = (id: string) => platos.find(p => p.id === id)?.nombre || "—";

  return (
    <div>
      <h1 className="text-xl font-semibold text-[#f0e8d0] mb-6">Promoción activa</h1>

      {activePromo && (
        <div className="bg-[#C8860A]/10 border border-[#C8860A]/30 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#f0e8d0] font-medium">{platoNombre(activePromo.plato_id)}</p>
              <p className="text-[#999] text-sm">
                {activePromo.tipo_descuento === "porcentaje" ? `${activePromo.valor_descuento}% OFF` : `$${activePromo.valor_descuento} OFF`}
                {activePromo.mensaje && ` — ${activePromo.mensaje}`}
              </p>
              <p className="text-[#666] text-xs mt-1">
                Expira: {new Date(activePromo.expira_en).toLocaleString("es-AR")}
              </p>
            </div>
            <button onClick={() => cancelarPromo(activePromo.id)}
              className="text-sm text-red-400 hover:text-red-300 border border-red-400/30 px-3 py-1.5 rounded">
              Cancelar
            </button>
          </div>
        </div>
      )}

      <div className="bg-[#1a1a1a] border border-[#222] rounded-lg p-5 space-y-4">
        <div>
          <label className="block text-sm text-[#999] mb-1">Plato</label>
          <Select value={platoId} onValueChange={setPlatoId}>
            <SelectTrigger className="bg-[#111] border-[#333] text-[#f0e8d0]">
              <SelectValue placeholder="Seleccionar plato" />
            </SelectTrigger>
            <SelectContent className="bg-[#1a1a1a] border-[#333]">
              {platos.map(p => (
                <SelectItem key={p.id} value={p.id} className="text-[#f0e8d0]">
                  {p.categoria} — {p.nombre} (${p.precio})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-[#999] mb-1">Tipo de descuento</label>
            <Select value={tipoDescuento} onValueChange={setTipoDescuento}>
              <SelectTrigger className="bg-[#111] border-[#333] text-[#f0e8d0]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1a1a] border-[#333]">
                <SelectItem value="porcentaje" className="text-[#f0e8d0]">Porcentaje (%)</SelectItem>
                <SelectItem value="fijo" className="text-[#f0e8d0]">Monto fijo ($)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-sm text-[#999] mb-1">Valor</label>
            <input type="number" value={valorDescuento} onChange={e => setValorDescuento(e.target.value)}
              className="w-full bg-[#111] border border-[#333] text-[#f0e8d0] rounded px-3 py-2 text-sm" placeholder="Ej: 20" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-[#999] mb-1">Duración</label>
            <input type="number" value={duracion} onChange={e => setDuracion(e.target.value)}
              className="w-full bg-[#111] border border-[#333] text-[#f0e8d0] rounded px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm text-[#999] mb-1">Unidad</label>
            <Select value={unidadDuracion} onValueChange={setUnidadDuracion}>
              <SelectTrigger className="bg-[#111] border-[#333] text-[#f0e8d0]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1a1a] border-[#333]">
                <SelectItem value="horas" className="text-[#f0e8d0]">Horas</SelectItem>
                <SelectItem value="dias" className="text-[#f0e8d0]">Días</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <label className="block text-sm text-[#999] mb-1">Mensaje (opcional)</label>
          <input type="text" value={mensaje} onChange={e => setMensaje(e.target.value)}
            className="w-full bg-[#111] border border-[#333] text-[#f0e8d0] rounded px-3 py-2 text-sm"
            placeholder="Semana del Lomo, Happy Hour..." />
        </div>

        <button onClick={() => activarPromo()} disabled={loading}
          className="w-full bg-[#C8860A] hover:bg-[#a06d08] text-white font-semibold py-2.5 rounded transition-colors disabled:opacity-50">
          {loading ? "Activando..." : "ACTIVAR PROMOCIÓN"}
        </button>
      </div>

      {/* Historial */}
      {promos.filter(p => !p.activa).length > 0 && (
        <div className="mt-8">
          <h2 className="text-sm font-medium text-[#999] mb-3">Historial</h2>
          <div className="space-y-2">
            {promos.filter(p => !p.activa).slice(0, 10).map(p => (
              <div key={p.id} className="bg-[#1a1a1a] border border-[#222] rounded p-3 flex justify-between text-sm">
                <span className="text-[#999]">{platoNombre(p.plato_id)} — {p.tipo_descuento === "porcentaje" ? `${p.valor_descuento}%` : `$${p.valor_descuento}`}</span>
                <span className="text-[#666]">{new Date(p.created_at).toLocaleDateString("es-AR")}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <AlertDialog open={confirmReplace} onOpenChange={setConfirmReplace}>
        <AlertDialogContent className="bg-[#1a1a1a] border-[#333]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[#f0e8d0]">Ya hay una promoción activa</AlertDialogTitle>
            <AlertDialogDescription className="text-[#999]">
              ¿Cancelarla y crear esta nueva?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-[#333] text-[#999]">No</AlertDialogCancel>
            <AlertDialogAction onClick={() => activarPromo(true)} className="bg-[#C8860A] hover:bg-[#a06d08]">
              Sí, reemplazar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminPromociones;
