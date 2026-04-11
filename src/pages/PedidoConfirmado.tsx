import { useEffect, useState, useRef, useCallback } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { useLang } from "@/contexts/LangContext";
import { supabase } from "@/integrations/supabase/client";

type PedidoEstado = "pendiente" | "pagado" | "listo" | "cancelado" | null;

const PedidoConfirmado = () => {
  const { clearCart } = useCart();
  const { lang } = useLang();
  const [params] = useSearchParams();
  const paymentId = params.get("payment_id");
  const pedidoId = params.get("external_reference");
  const [estado, setEstado] = useState<PedidoEstado>(null);
  const [transitionOut, setTransitionOut] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const clearedRef = useRef(false);

  useEffect(() => {
    if (!clearedRef.current) {
      clearCart();
      clearedRef.current = true;
    }
  }, []);

  const fetchEstado = useCallback(async () => {
    if (!pedidoId) return;
    try {
      const { data, error } = await supabase.functions.invoke("estado-pedido", {
        body: { pedido_id: pedidoId },
      });
      if (!error && data?.estado) {
        setEstado(data.estado as PedidoEstado);
      }
    } catch {}
  }, [pedidoId]);

  useEffect(() => {
    if (!pedidoId) {
      setEstado("pagado");
      return;
    }
    fetchEstado();
    intervalRef.current = setInterval(fetchEstado, 15000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [pedidoId, fetchEstado]);

  // Stop polling when terminal state
  useEffect(() => {
    if (estado === "listo" || estado === "cancelado") {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    if (estado === "listo") {
      setTransitionOut(true);
      if (navigator.vibrate) {
        navigator.vibrate([200, 100, 200]);
      }
    }
  }, [estado]);

  return (
    <div className="min-h-screen bg-negro flex items-center justify-center px-4">
      <div className={`text-center max-w-md space-y-5 transition-all duration-700 ${transitionOut ? "animate-fade-in" : ""}`}>
        {/* LISTO */}
        {estado === "listo" && (
          <>
            <div className="mx-auto w-20 h-20 rounded-full bg-green-600/20 flex items-center justify-center animate-scale-in">
              <span className="text-5xl">✅</span>
            </div>
            <h1 className="font-display text-2xl md:text-3xl text-crema">
              {lang === "en" ? "Your order is ready!" : "¡Tu pedido está listo!"}
            </h1>
            <p className="text-crema/80 font-body text-lg">
              {lang === "en" ? "You can come pick it up." : "Podés venir a retirarlo."}
            </p>
            <span className="inline-block mt-2 px-4 py-1.5 rounded-full bg-green-600/30 text-green-400 font-body text-sm font-semibold tracking-wide border border-green-500/30">
              {lang === "en" ? "READY" : "LISTO"}
            </span>
            {paymentId && <p className="text-gris/40 font-body text-xs">ID: {paymentId}</p>}
            <Link
              to="/"
              className="inline-block mt-4 font-body text-sm text-ambar hover:opacity-75 transition-opacity"
            >
              ← {lang === "en" ? "Back to home" : "Volver al inicio"}
            </Link>
          </>
        )}

        {/* CANCELADO */}
        {estado === "cancelado" && (
          <>
            <p className="text-5xl">❌</p>
            <h1 className="font-display text-2xl md:text-3xl text-crema">
              {lang === "en" ? "Your order was cancelled." : "Tu pedido fue cancelado."}
            </h1>
            {paymentId && <p className="text-gris/40 font-body text-xs">ID: {paymentId}</p>}
            <Link
              to="/#carta"
              className="inline-block mt-4 font-body text-sm text-ambar hover:opacity-75 transition-opacity"
            >
              ← {lang === "en" ? "Back to the menu" : "Volver a la carta"}
            </Link>
          </>
        )}

        {/* PAGADO / PENDIENTE / loading */}
        {(estado === "pagado" || estado === "pendiente" || estado === null) && (
          <>
            <p className="text-5xl">🍳</p>
            <h1 className="font-display text-2xl md:text-3xl text-crema">
              {lang === "en" ? "Order confirmed!" : "¡Pedido confirmado!"}
            </h1>
            <p className="text-gris font-body flex items-center justify-center gap-1">
              {lang === "en"
                ? "Your order is being prepared"
                : "Tu pedido está siendo preparado"}
              <span className="inline-flex gap-0.5">
                <span className="animate-bounce [animation-delay:0ms] inline-block">.</span>
                <span className="animate-bounce [animation-delay:200ms] inline-block">.</span>
                <span className="animate-bounce [animation-delay:400ms] inline-block">.</span>
              </span>
            </p>
            <div className="mx-auto w-48">
              <div className="h-1 w-full rounded-full bg-carbon overflow-hidden">
                <div className="h-full bg-ambar rounded-full animate-[ticker-scroll_2s_ease-in-out_infinite] w-1/3" />
              </div>
            </div>
            {paymentId && (
              <p className="text-gris/60 font-body text-xs">ID: {paymentId}</p>
            )}
            <Link
              to="/"
              className="inline-block mt-4 font-body text-sm text-ambar hover:opacity-75 transition-opacity"
            >
              ← {lang === "en" ? "Back to home" : "Volver al inicio"}
            </Link>
          </>
        )}
      </div>
    </div>
  );
};

export default PedidoConfirmado;
