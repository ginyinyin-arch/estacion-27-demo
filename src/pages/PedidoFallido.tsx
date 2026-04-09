import { Link } from "react-router-dom";
import { useLang } from "@/contexts/LangContext";

const PedidoFallido = () => {
  const { lang } = useLang();

  return (
    <div className="min-h-screen bg-negro flex items-center justify-center px-4">
      <div className="text-center max-w-md space-y-5">
        <p className="text-5xl">✗</p>
        <h1 className="font-display text-2xl md:text-3xl text-crema">
          {lang === "en"
            ? "We couldn't process the payment"
            : "No pudimos procesar el pago"}
        </h1>
        <p className="text-gris font-body">
          {lang === "en"
            ? "Please try again or choose another payment method."
            : "Por favor intentá de nuevo o elegí otro medio de pago."}
        </p>
        <div className="flex flex-col gap-3 pt-2">
          <Link
            to="/checkout"
            className="block bg-ambar text-negro font-display text-base py-3 rounded hover:bg-ambar/90 transition-colors text-center"
          >
            {lang === "en" ? "Try again" : "Intentar de nuevo"}
          </Link>
          <Link
            to="/#carta"
            className="block font-body text-sm text-ambar hover:opacity-75 transition-opacity text-center"
          >
            {lang === "en" ? "Back to menu" : "Volver a la carta"}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PedidoFallido;
