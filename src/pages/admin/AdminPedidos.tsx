import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Eye, X, Check } from "lucide-react";
import type { Json } from "@/integrations/supabase/types";
import NuevoPedidoModal, { type PedidoNuevo } from "@/components/admin/NuevoPedidoModal";

interface PedidoItem {
  id: string;
  nombre: string;
  precio: number;
  cantidad: number;
}

interface Pedido {
  id: string;
  created_at: string;
  nombre_cliente: string;
  email: string | null;
  telefono: string | null;
  notas: string | null;
  items: Json;
  total: number;
  estado: string;
  metodo_pago: string;
  programado_para: string | null;
  mp_payment_id: string | null;
}

const ESTADOS = ["todos", "pendiente", "pendiente_efectivo", "pagado", "en_espera", "en_preparacion", "listo", "cancelado", "rechazado"] as const;

const estadoBadge = (estado: string) => {
  switch (estado) {
    case "pagado":
      return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
    case "en_espera":
      return "bg-amber-500/20 text-amber-400 border-amber-500/30";
    case "en_preparacion":
      return "bg-indigo-500/20 text-indigo-400 border-indigo-500/30";
    case "listo":
      return "bg-green-500/20 text-green-400 border-green-500/30";
    case "cancelado":
    case "rechazado":
      return "bg-red-500/20 text-red-400 border-red-500/30";
    case "pendiente_efectivo":
      return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    case "pendiente":
    default:
      return "bg-[#C8860A]/20 text-[#C8860A] border-[#C8860A]/30";
  }
};

const estadoLabel = (estado: string) => {
  switch (estado) {
    case "pagado": return "Pagado";
    case "en_espera": return "En espera";
    case "en_preparacion": return "En preparación";
    case "listo": return "Listo ✓";
    case "cancelado": return "Cancelado";
    case "rechazado": return "Rechazado";
    case "pendiente_efectivo": return "💵 Pendiente efectivo";
    case "pendiente": return "Pendiente";
    default: return estado;
  }
};

function parseItems(items: Json): PedidoItem[] {
  if (!Array.isArray(items)) return [];
  return items.map((i: any) => ({
    id: i.id || "",
    nombre: i.nombre || i.name || "—",
    precio: Number(i.precio || i.price || 0),
    cantidad: Number(i.cantidad || i.qty || i.quantity || 1),
  }));
}

function resumenItems(items: Json): string {
  const parsed = parseItems(items);
  if (parsed.length === 0) return "—";
  const first = parsed.slice(0, 2).map(i => `${i.cantidad}x ${i.nombre}`).join(", ");
  return parsed.length > 2 ? `${first} +${parsed.length - 2} más` : first;
}

function formatHora(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleString("es-AR", {
    timeZone: "America/Argentina/Buenos_Aires",
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const AdminPedidos = () => {
  const { toast } = useToast();
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [filtro, setFiltro] = useState<string>("todos");
  const [detalle, setDetalle] = useState<Pedido | null>(null);
  const [loading, setLoading] = useState(true);
  const [alertQueue, setAlertQueue] = useState<PedidoNuevo[]>([]);

  const fetchPedidos = async () => {
    const { data, error } = await supabase
      .from("pedidos")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) setPedidos(data as Pedido[]);
    setLoading(false);
  };

  const handleInsert = useCallback((payload: any) => {
    const row = payload.new;
    if (row && (row.estado === "pagado" || row.estado === "pendiente_efectivo")) {
      setAlertQueue(prev => {
        if (prev.some(p => p.id === row.id)) return prev;
        return [...prev, {
          id: row.id,
          nombre_cliente: row.nombre_cliente,
          items: row.items,
          total: row.total,
          metodo_pago: row.metodo_pago || "mercadopago",
          programado_para: row.programado_para,
          telefono: row.telefono,
          notas: row.notas,
        }];
      });
    }
  }, []);

  useEffect(() => {
    fetchPedidos();
    const channel = supabase
      .channel("admin-pedidos")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "pedidos" }, (payload) => {
        handleInsert(payload);
        fetchPedidos();
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "pedidos" }, () => {
        fetchPedidos();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [handleInsert]);

  const handleAlertAction = (id: string) => {
    setAlertQueue(prev => prev.filter(p => p.id !== id));
  };

  const updateEstado = async (id: string, estado: string) => {
    const { error } = await supabase.from("pedidos").update({ estado }).eq("id", id);
    if (error) {
      toast({ title: "Error al actualizar", variant: "destructive" });
    } else {
      toast({ title: `Pedido ${estado === "listo" ? "marcado como listo" : estado === "en_preparacion" ? "aceptado" : "rechazado"}` });
    }
  };

  const filtered = filtro === "todos" ? pedidos : pedidos.filter(p => p.estado === filtro);

  if (loading) return <div className="min-h-[200px]" />;

  return (
    <div>
      <h1 className="text-xl font-semibold text-[#f0e8d0] mb-4">Pedidos</h1>

      {/* Filtros */}
      <div className="flex flex-wrap gap-2 mb-4">
        {ESTADOS.map(e => (
          <button
            key={e}
            onClick={() => setFiltro(e)}
            className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
              filtro === e
                ? "bg-[#C8860A] text-white"
                : "bg-[#1a1a1a] text-[#999] border border-[#333] hover:text-[#f0e8d0]"
            }`}
          >
            {e === "todos" ? "Todos" : estadoLabel(e)}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="text-[#666] text-sm py-8 text-center">No hay pedidos{filtro !== "todos" ? ` con estado "${filtro}"` : ""}.</p>
      ) : (
        <div className="space-y-2">
          {filtered.map(p => (
            <div key={p.id} className="bg-[#1a1a1a] border border-[#222] rounded-lg p-4 flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-[#666]">{formatHora(p.created_at)}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${estadoBadge(p.estado)}`}>
                    {estadoLabel(p.estado)}
                  </span>
                </div>
                <p className="text-sm text-[#f0e8d0] font-medium mt-1">{p.nombre_cliente}</p>
                <p className="text-xs text-[#888] truncate">{resumenItems(p.items)}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0 flex-wrap">
                <span className="text-sm font-semibold text-[#f0e8d0]">${p.total.toLocaleString("es-AR")}</span>
                {p.estado === "pagado" && (
                  <button
                    onClick={() => updateEstado(p.id, "listo")}
                    className="flex items-center gap-1 px-3 py-1.5 rounded bg-green-600 hover:bg-green-700 text-white text-xs font-medium transition-colors"
                  >
                    <Check size={14} /> Listo
                  </button>
                )}
                {p.estado === "en_espera" && (
                  <>
                    <button
                      onClick={() => updateEstado(p.id, "en_preparacion")}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded bg-green-600 hover:bg-green-700 text-white text-xs font-medium transition-colors"
                    >
                      <Check size={14} /> Confirmar
                    </button>
                    <button
                      onClick={() => updateEstado(p.id, "rechazado")}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded bg-red-600 hover:bg-red-700 text-white text-xs font-medium transition-colors"
                    >
                      <X size={14} /> Rechazar
                    </button>
                  </>
                )}
                <button
                  onClick={() => setDetalle(p)}
                  className="p-2 rounded hover:bg-[#ffffff10] text-[#999] hover:text-[#f0e8d0] transition-colors"
                  aria-label="Ver detalle"
                >
                  <Eye size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detalle modal */}
      {detalle && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4" onClick={() => setDetalle(null)}>
          <div className="bg-[#1a1a1a] border border-[#333] rounded-lg w-full max-w-md max-h-[80vh] overflow-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-[#222]">
              <h2 className="text-sm font-semibold text-[#f0e8d0]">Detalle del pedido</h2>
              <button onClick={() => setDetalle(null)} className="text-[#666] hover:text-[#f0e8d0]"><X size={18} /></button>
            </div>
            <div className="p-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-[#888]">Cliente</span>
                <span className="text-[#f0e8d0]">{detalle.nombre_cliente}</span>
              </div>
              {detalle.telefono && (
                <div className="flex justify-between">
                  <span className="text-[#888]">Teléfono</span>
                  <span className="text-[#f0e8d0]">{detalle.telefono}</span>
                </div>
              )}
              {detalle.email && (
                <div className="flex justify-between">
                  <span className="text-[#888]">Email</span>
                  <span className="text-[#f0e8d0]">{detalle.email}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-[#888]">Hora</span>
                <span className="text-[#f0e8d0]">{formatHora(detalle.created_at)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#888]">Estado</span>
                <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${estadoBadge(detalle.estado)}`}>
                  {estadoLabel(detalle.estado)}
                </span>
              </div>
              <div className="border-t border-[#222] pt-3">
                <p className="text-[#888] mb-2">Items</p>
                {parseItems(detalle.items).map((item, i) => (
                  <div key={i} className="flex justify-between py-1">
                    <span className="text-[#f0e8d0]">{item.cantidad}x {item.nombre}</span>
                    <span className="text-[#999]">${(item.precio * item.cantidad).toLocaleString("es-AR")}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between border-t border-[#222] pt-3 font-semibold">
                <span className="text-[#888]">Total</span>
                <span className="text-[#f0e8d0]">${detalle.total.toLocaleString("es-AR")}</span>
              </div>
              {detalle.notas && (
                <div className="border-t border-[#222] pt-3">
                  <p className="text-[#888] mb-1">Notas</p>
                  <p className="text-[#f0e8d0]">{detalle.notas}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Alert modal for new orders */}
      <NuevoPedidoModal queue={alertQueue} onAction={handleAlertAction} />
    </div>
  );
};

export default AdminPedidos;
