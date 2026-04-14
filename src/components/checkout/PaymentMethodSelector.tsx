import { useLang } from "@/contexts/LangContext";

interface PaymentMethodSelectorProps {
  value: "mercadopago" | "efectivo";
  onChange: (v: "mercadopago" | "efectivo") => void;
}

const PaymentMethodSelector = ({ value, onChange }: PaymentMethodSelectorProps) => {
  const { lang } = useLang();

  const options = [
    {
      id: "mercadopago" as const,
      icon: "💳",
      label: "MercadoPago",
      sub: lang === "en" ? "Secure online payment" : "Pago online seguro",
    },
    {
      id: "efectivo" as const,
      icon: "💵",
      label: lang === "en" ? "Cash on pickup" : "Efectivo al retirar",
      sub: lang === "en" ? "Pay when you pick up your order" : "Pagás cuando retirás tu pedido",
    },
  ];

  return (
    <div className="mb-8">
      <h2 className="font-display text-lg text-ambar mb-3">
        {lang === "en" ? "How will you pay?" : "¿Cómo vas a pagar?"}
      </h2>
      <div className="grid grid-cols-2 gap-3">
        {options.map((opt) => {
          const selected = value === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onChange(opt.id)}
              className={`flex flex-col items-center gap-1.5 p-4 rounded border-2 transition-all cursor-pointer ${
                selected
                  ? "border-ambar bg-ambar/10"
                  : "border-crema/10 bg-negro hover:border-crema/25"
              }`}
            >
              <span className="text-2xl">{opt.icon}</span>
              <span className="font-display text-sm text-crema">{opt.label}</span>
              <span className="font-body text-xs text-gris text-center leading-tight">
                {opt.sub}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default PaymentMethodSelector;
