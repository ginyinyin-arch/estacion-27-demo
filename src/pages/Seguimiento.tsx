import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";

interface PedidoItem {
  nombre: string;
  precio: number;
  cantidad: number;
}

interface PedidoData {
  estado: string;
  nombre_cliente: string;
  items: Json;
  total: number;
  programado_para: string | null;
  metodo_pago: string;
}

function parseItems(items: Json): PedidoItem[] {
  if (!Array.isArray(items)) return [];
  return items.map((i: any) => ({
    nombre: i.nombre || i.name || "—",
    precio: Number(i.precio || i.price || 0),
    cantidad: Number(i.cantidad || i.qty || i.quantity || 1),
  }));
}

function formatProgramado(dateStr: string): string {
  return new Date(dateStr).toLocaleString("es-AR", {
    timeZone: "America/Argentina/Buenos_Aires",
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const STEPS = ["Recibido", "En preparación", "Listo", "Retirado"];

function stepIndex(estado: string): number {
  switch (estado) {
    case "pagado":
    case "pendiente_efectivo":
    case "en_espera":
      return 0;
    case "en_preparacion":
      return 1;
    case "listo":
      return 2;
    default:
      return 0;
  }
}

const Seguimiento = () => {
  const { pedidoId } = useParams<{ pedidoId: string }>();
  const navigate = useNavigate();
  const [pedido, setPedido] = useState<PedidoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const cartCleared = useRef(false);

  // Clear cart on mount
  useEffect(() => {
    if (!cartCleared.current) {
      cartCleared.current = true;
      try {
        localStorage.removeItem("cart");
        localStorage.removeItem("estacion27-cart");
        // Dispatch storage event so CartContext picks it up
        window.dispatchEvent(new Event("storage"));
      } catch {}
    }
  }, []);

  // Fetch initial data
  useEffect(() => {
    if (!pedidoId) return;
    const fetchPedido = async () => {
      const { data, error } = await supabase
        .from("pedidos")
        .select("estado, nombre_cliente, items, total, programado_para, metodo_pago")
        .eq("id", pedidoId)
        .single();
      if (error || !data) {
        setNotFound(true);
      } else {
        setPedido(data as PedidoData);
      }
      setLoading(false);
    };
    fetchPedido();
  }, [pedidoId]);

  // Realtime subscription
  useEffect(() => {
    if (!pedidoId) return;
    const channel = supabase
      .channel(`seguimiento-${pedidoId}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "pedidos", filter: `id=eq.${pedidoId}` },
        (payload) => {
          const row = payload.new as any;
          setPedido({
            estado: row.estado,
            nombre_cliente: row.nombre_cliente,
            items: row.items,
            total: row.total,
            programado_para: row.programado_para,
            metodo_pago: row.metodo_pago,
          });
          // Vibrate on 'listo'
          if (row.estado === "listo" && navigator.vibrate) {
            navigator.vibrate([200, 100, 200]);
          }
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [pedidoId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#C8860A] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (notFound || !pedido) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center px-4 text-center">
        <p className="text-[#999] text-sm mb-4">Pedido no encontrado.</p>
        <button onClick={() => navigate("/")} className="text-[#C8860A] underline text-sm">Volver a la carta</button>
      </div>
    );
  }

  const { estado } = pedido;
  const isRejected = estado === "rechazado" || estado === "cancelado";
  const items = parseItems(pedido.items);
  const active = stepIndex(estado);

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center px-4 py-8">
      {/* Logo */}
      <h1 className="font-['Playfair_Display'] text-[#C8860A] text-xl font-bold mb-8 tracking-wide">
        ESTACIÓN 27
      </h1>

      {/* Status icon & message */}
      <div className="text-center mb-8 max-w-sm">
        {(estado === "pagado" || estado === "pendiente_efectivo") && (
          <>
            <div className="text-5xl mb-4 animate-pulse">⏳</div>
            <h2 className="font-['Playfair_Display'] text-[#f0e8d0] text-xl font-semibold mb-2">
              Esperando confirmación
            </h2>
            <p className="text-[#999] text-sm">El local está revisando tu pedido.</p>
          </>
        )}
        {estado === "en_espera" && (
          <>
            <div className="text-5xl mb-4">⏸</div>
            <h2 className="font-['Playfair_Display'] text-[#f0e8d0] text-xl font-semibold mb-2">
              Tu pedido está siendo revisado
            </h2>
            <p className="text-[#999] text-sm">El equipo del local lo está viendo.</p>
          </>
        )}
        {estado === "en_preparacion" && (
          <>
            <div className="text-5xl mb-4">👨‍🍳</div>
            <h2 className="font-['Playfair_Display'] text-[#f0e8d0] text-xl font-semibold mb-2">
              ¡Confirmado! En preparación
            </h2>
            <p className="text-[#999] text-sm">
              {pedido.programado_para
                ? `Lo tendremos listo para el ${formatProgramado(pedido.programado_para)}.`
                : "Estamos preparando tu pedido."}
            </p>
          </>
        )}
        {estado === "listo" && (
          <>
            <div className="text-6xl mb-4 animate-bounce">✅</div>
            <h2 className="font-['Playfair_Display'] text-green-400 text-2xl font-semibold mb-2">
              ¡Tu pedido está listo!
            </h2>
            <p className="text-[#ccc] text-sm">Pasá a buscarlo. · Duarte Quirós 40, Córdoba</p>
          </>
        )}
        {isRejected && (
          <>
            <div className="text-5xl mb-4">❌</div>
            <h2 className="font-['Playfair_Display'] text-red-400 text-xl font-semibold mb-2">
              Pedido cancelado
            </h2>
            <p className="text-[#999] text-sm mb-2">
              {pedido.metodo_pago === "efectivo"
                ? "El pedido no pudo procesarse. No se realizó ningún cobro."
                : `El reembolso de $${pedido.total.toLocaleString("es-AR")} se procesará automáticamente.`}
            </p>
            <p className="text-[#666] text-xs">
              ¿Consultas?{" "}
              <a href="https://wa.me/5493515949202" className="text-[#C8860A] underline" target="_blank" rel="noopener noreferrer">
                wa.me/5493515949202
              </a>
            </p>
          </>
        )}
      </div>

      {/* Progress bar */}
      <div className="w-full max-w-xs mb-8">
        <div className="flex items-center justify-between relative">
          {/* Connecting line */}
          <div className="absolute top-3 left-0 right-0 h-0.5 bg-[#333]" />
          {isRejected && <div className="absolute top-3 left-0 right-0 h-0.5 bg-red-500/50" />}
          {!isRejected && active > 0 && (
            <div
              className="absolute top-3 left-0 h-0.5 bg-[#C8860A] transition-all duration-700"
              style={{ width: `${(active / (STEPS.length - 1)) * 100}%` }}
            />
          )}

          {STEPS.map((step, i) => (
            <div key={step} className="flex flex-col items-center z-10">
              <div
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-[10px] font-bold transition-all duration-500 ${
                  isRejected
                    ? "border-red-500 bg-red-500/20 text-red-400"
                    : i <= active
                    ? "border-[#C8860A] bg-[#C8860A] text-white"
                    : "border-[#444] bg-[#1a1a1a] text-[#666]"
                }`}
              >
                {isRejected ? "✕" : i <= active ? "✓" : i + 1}
              </div>
              <span
                className={`text-[10px] mt-1.5 ${
                  isRejected
                    ? "text-red-400"
                    : i <= active
                    ? "text-[#C8860A]"
                    : "text-[#666]"
                }`}
              >
                {step}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Order summary */}
      <div className="w-full max-w-sm bg-[#1a1a1a] border border-[#222] rounded-lg p-4">
        <h3 className="text-xs text-[#888] uppercase tracking-wider mb-3">Resumen del pedido</h3>
        {items.map((item, i) => (
          <div key={i} className="flex justify-between py-1 text-sm">
            <span className="text-[#f0e8d0]">{item.cantidad}x {item.nombre}</span>
            <span className="text-[#999]">${(item.precio * item.cantidad).toLocaleString("es-AR")}</span>
          </div>
        ))}
        <div className="flex justify-between border-t border-[#222] pt-2 mt-2 font-semibold text-sm">
          <span className="text-[#888]">Total</span>
          <span className="text-[#f0e8d0]">${pedido.total.toLocaleString("es-AR")}</span>
        </div>
        <div className="flex justify-between mt-2 text-xs">
          <span className="text-[#666]">Método de pago</span>
          <span className="text-[#999]">
            {pedido.metodo_pago === "efectivo" ? "💵 Efectivo" : "💳 MercadoPago"}
          </span>
        </div>
      </div>

      {/* Back link for rejected */}
      {isRejected && (
        <button onClick={() => navigate("/")} className="mt-6 text-[#C8860A] underline text-sm">
          Volver a la carta
        </button>
      )}
    </div>
  );
};

export default Seguimiento;
