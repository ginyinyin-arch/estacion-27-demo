import { Link } from "react-router-dom";
import { useLang } from "@/contexts/LangContext";

const PedidoPendiente = () => {
  const { lang } = useLang();

  return (
    <div className="min-h-screen bg-negro flex items-center justify-center px-4">
      <div className="text-center max-w-md space-y-5">
        <p className="text-5xl">⏳</p>
        <h1 className="font-display text-2xl md:text-3xl text-crema">
          {lang === "en" ? "Payment pending" : "Pago en proceso"}
        </h1>
        <p className="text-gris font-body">
          {lang === "en"
            ? "We'll let you know when it's confirmed."
            : "Te avisamos cuando se acredite."}
        </p>
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

export default PedidoPendiente;
