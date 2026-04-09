import { useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { useLang } from "@/contexts/LangContext";

const PedidoConfirmado = () => {
  const { clearCart } = useCart();
  const { lang } = useLang();
  const [params] = useSearchParams();
  const paymentId = params.get("payment_id");

  useEffect(() => {
    clearCart();
  }, []);

  return (
    <div className="min-h-screen bg-negro flex items-center justify-center px-4">
      <div className="text-center max-w-md space-y-5">
        <p className="text-5xl">🎉</p>
        <h1 className="font-display text-2xl md:text-3xl text-crema">
          {lang === "en" ? "Order confirmed!" : "¡Pedido confirmado!"}
        </h1>
        <p className="text-gris font-body">
          {lang === "en"
            ? "Your order is being prepared."
            : "Tu pedido está siendo preparado."}
        </p>
        {paymentId && (
          <p className="text-gris/60 font-body text-xs">
            ID: {paymentId}
          </p>
        )}
        <Link
          to="/"
          className="inline-block mt-4 font-body text-sm text-ambar hover:opacity-75 transition-opacity"
        >
          ← {lang === "en" ? "Back to home" : "Volver al inicio"}
        </Link>
      </div>
    </div>
  );
};

export default PedidoConfirmado;
