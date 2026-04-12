import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { X, Check, Clock } from "lucide-react";
import type { Json } from "@/integrations/supabase/types";

interface PedidoItem {
  nombre: string;
  precio: number;
  cantidad: number;
}

export interface PedidoNuevo {
  id: string;
  nombre_cliente: string;
  items: Json;
  total: number;
  metodo_pago: string;
  programado_para: string | null;
  telefono: string | null;
  notas: string | null;
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
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Web Audio beep
function createBeep(ctx: AudioContext) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.frequency.value = 880;
  gain.gain.value = 0.15;
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.12);
  const osc2 = ctx.createOscillator();
  const gain2 = ctx.createGain();
  osc2.connect(gain2);
  gain2.connect(ctx.destination);
  osc2.frequency.value = 880;
  gain2.gain.value = 0.15;
  osc2.start(ctx.currentTime + 0.2);
  osc2.stop(ctx.currentTime + 0.32);
}

interface Props {
  queue: PedidoNuevo[];
  onAction: (id: string) => void;
}

const NuevoPedidoModal = ({ queue, onAction }: Props) => {
  const { toast } = useToast();
  const [confirmingReject, setConfirmingReject] = useState(false);
  const [acting, setActing] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const current = queue[0];

  const stopSound = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    intervalRef.current = null;
    timeoutRef.current = null;
  }, []);

  // Start/stop beep based on queue
  useEffect(() => {
    if (queue.length === 0) {
      stopSound();
      return;
    }

    if (intervalRef.current) return; // already beeping

    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioContext();
    }
    const ctx = audioCtxRef.current;

    createBeep(ctx);
    intervalRef.current = setInterval(() => createBeep(ctx), 2500);
    timeoutRef.current = setTimeout(stopSound, 60000);

    return () => stopSound();
  }, [queue.length, stopSound]);

  const act = async (action: "aceptar" | "esperar" | "rechazar") => {
    if (!current) return;
    setActing(true);
    const id = current.id;
    let error: any = null;
    if (action === "aceptar") {
      ({ error } = await supabase.from("pedidos").update({ estado: "en_preparacion" }).eq("id", id));
    } else if (action === "esperar") {
      ({ error } = await supabase.from("pedidos").update({ estado: "en_espera", espera_desde: new Date().toISOString() }).eq("id", id));
    } else {
      ({ error } = await supabase.from("pedidos").update({ estado: "rechazado" }).eq("id", id));
    }
    if (error) {
      toast({ title: "Error al actualizar pedido", variant: "destructive" });
    }
    setActing(false);
    setConfirmingReject(false);
    stopSound();
    onAction(current.id);
  };

  if (!current) return null;

  const items = parseItems(current.items);

  return (
    <div className="fixed inset-0 z-[100] bg-black/70 flex items-center justify-center p-4">
      <div className="bg-[#1a1a1a] border border-[#333] rounded-lg w-full max-w-md max-h-[85vh] overflow-auto" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="p-4 border-b border-[#222]">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-[#f0e8d0]">
              🔔 Nuevo pedido
              {queue.length > 1 && (
                <span className="ml-2 inline-flex items-center justify-center w-5 h-5 rounded-full bg-red-600 text-white text-[10px] font-bold">
                  {queue.length}
                </span>
              )}
            </h2>
          </div>
          <p className="text-sm text-[#ccc] mt-1">{current.nombre_cliente}</p>

          {/* Payment badge */}
          {current.metodo_pago === "efectivo" ? (
            <div className="mt-3 px-3 py-2 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300 text-sm font-semibold text-center">
              💵 EN EFECTIVO — pendiente de cobro
            </div>
          ) : (
            <div className="mt-3 px-3 py-2 rounded-lg bg-green-500/20 border border-green-500/40 text-green-300 text-sm font-semibold text-center">
              ✅ YA PAGADO — MercadoPago
            </div>
          )}
        </div>

        {/* Body */}
        <div className="p-4 space-y-3 text-sm">
          {items.map((item, i) => (
            <div key={i} className="flex justify-between py-0.5">
              <span className="text-[#f0e8d0]">{item.cantidad}x {item.nombre}</span>
              <span className="text-[#999]">${(item.precio * item.cantidad).toLocaleString("es-AR")}</span>
            </div>
          ))}
          <div className="flex justify-between border-t border-[#222] pt-2 font-semibold">
            <span className="text-[#888]">Total</span>
            <span className="text-[#f0e8d0]">${current.total.toLocaleString("es-AR")}</span>
          </div>
          {current.programado_para && (
            <p className="text-amber-400 text-xs">📅 Programado para: {formatProgramado(current.programado_para)}</p>
          )}
          {current.notas && (
            <p className="text-[#888] text-xs">📝 {current.notas}</p>
          )}
        </div>

        {/* Actions */}
        <div className="p-4 border-t border-[#222]">
          {confirmingReject ? (
            <div className="space-y-3">
              <p className="text-sm text-[#ccc] text-center">¿Confirmar rechazo? El monto se devolverá automáticamente al cliente.</p>
              <div className="flex gap-2">
                <button
                  disabled={acting}
                  onClick={() => act("rechazar")}
                  className="flex-1 py-2 rounded bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition-colors disabled:opacity-50"
                >
                  Sí, rechazar
                </button>
                <button
                  onClick={() => setConfirmingReject(false)}
                  className="flex-1 py-2 rounded bg-[#333] hover:bg-[#444] text-[#ccc] text-sm font-medium transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <div className="flex gap-2">
              <button
                disabled={acting}
                onClick={() => act("aceptar")}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded bg-green-600 hover:bg-green-700 text-white text-sm font-medium transition-colors disabled:opacity-50"
              >
                <Check size={16} /> Aceptar
              </button>
              <button
                disabled={acting}
                onClick={() => act("esperar")}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium transition-colors disabled:opacity-50"
              >
                <Clock size={16} /> Esperar
              </button>
              <button
                disabled={acting}
                onClick={() => setConfirmingReject(true)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition-colors disabled:opacity-50"
              >
                <X size={16} /> Rechazar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NuevoPedidoModal;
