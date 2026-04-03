import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useLang } from "@/contexts/LangContext";
import SmartPhoneInput from "@/components/SmartPhoneInput";

const normalizePhone = (v: string) => {
  let cleaned = v.replace(/[\s\-\(\)]/g, "").replace(/[^+\d]/g, "");
  if (!cleaned.startsWith("+")) cleaned = "+" + cleaned;
  return cleaned;
};

const Baja = () => {
  const { lang } = useLang();
  const [mode, setMode] = useState<"email" | "phone">("email");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<"success" | "not_found" | null>(null);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setError("");
    setResult(null);

    if (mode === "email") {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) {
        setError(lang === "en" ? "Invalid email" : "Email inválido");
        return;
      }
    } else {
      const normalized = normalizePhone(phone);
      const digits = normalized.slice(1);
      if (!/^\d+$/.test(digits) || digits.length < 6 || digits.length > 15) {
        setError(lang === "en" ? "Invalid number" : "Número inválido");
        return;
      }
    }

    setLoading(true);

    const valor = mode === "email" ? email.trim().toLowerCase() : normalizePhone(phone);

    const { data, error: fnError } = await supabase.functions.invoke("cancelar-alertas", {
      body: { tipo: mode === "email" ? "email" : "whatsapp", valor },
    });

    setLoading(false);

    if (fnError) {
      setError(lang === "en" ? "Something went wrong" : "Ocurrió un error");
      return;
    }

    if (data?.deleted > 0) {
      setResult("success");
    } else {
      setResult("not_found");
    }
  };

  return (
    <div className="min-h-screen bg-negro flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <h1 className="font-display font-bold italic text-2xl text-crema text-center mb-2">
          {lang === "en" ? "Cancel Alerts" : "Cancelar alertas"}
        </h1>
        <p className="font-body text-sm text-crema2 text-center mb-8">
          {lang === "en"
            ? "Enter the email or phone you used to subscribe and we'll remove you from all alerts."
            : "Ingresá el email o teléfono con el que te suscribiste y te damos de baja de todas las alertas."}
        </p>

        {result === "success" ? (
          <div className="text-center p-6 rounded-lg border border-crema/10 bg-carbon">
            <p className="font-body text-crema text-lg mb-2">✅</p>
            <p className="font-body text-crema">
              {lang === "en" ? "Done. You won't receive any more alerts." : "Listo. Ya no recibirás más alertas."}
            </p>
            <a href="/" className="inline-block mt-4 text-sm text-ambar hover:text-ambar/80 font-body transition-colors">
              {lang === "en" ? "Back to home" : "Volver al inicio"}
            </a>
          </div>
        ) : result === "not_found" ? (
          <div className="text-center p-6 rounded-lg border border-crema/10 bg-carbon">
            <p className="font-body text-crema2">
              {lang === "en" ? "We didn't find that contact in our list." : "No encontramos ese contacto en nuestra lista."}
            </p>
            <button
              onClick={() => { setResult(null); setError(""); }}
              className="mt-4 text-sm text-ambar hover:text-ambar/80 font-body transition-colors"
            >
              {lang === "en" ? "Try again" : "Intentar de nuevo"}
            </button>
          </div>
        ) : (
          <div className="p-6 rounded-lg border border-crema/10 bg-carbon">
            {/* Tabs */}
            <div className="flex gap-2 mb-6">
              <button
                onClick={() => { setMode("email"); setError(""); }}
                className={`flex-1 py-2 rounded font-body text-sm uppercase tracking-wider transition-colors ${
                  mode === "email"
                    ? "bg-ambar text-negro font-bold"
                    : "bg-negro border border-crema/10 text-crema2 hover:border-ambar/30"
                }`}
              >
                Email
              </button>
              <button
                onClick={() => { setMode("phone"); setError(""); }}
                className={`flex-1 py-2 rounded font-body text-sm uppercase tracking-wider transition-colors ${
                  mode === "phone"
                    ? "bg-ambar text-negro font-bold"
                    : "bg-negro border border-crema/10 text-crema2 hover:border-ambar/30"
                }`}
              >
                {lang === "en" ? "Phone" : "Teléfono"}
              </button>
            </div>

            {mode === "email" ? (
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(""); }}
                placeholder="tu@email.com"
                className="w-full px-3 py-2.5 rounded bg-negro border border-crema/10 text-crema font-body text-sm placeholder:text-gris focus:outline-none focus:border-ambar/50 transition-colors"
              />
            ) : (
              <SmartPhoneInput
                onChange={(fullNumber) => { setPhone(fullNumber); setError(""); }}
                error={error && mode === "phone" ? error : undefined}
              />
            )}

            {error && mode === "email" && (
              <p className="text-red-400 text-xs mt-2 font-body">{error}</p>
            )}

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full mt-5 py-3 rounded bg-ambar text-negro font-body font-bold text-sm uppercase tracking-wider hover:bg-ambar/90 disabled:opacity-40 transition-colors"
            >
              {loading ? "..." : lang === "en" ? "Unsubscribe" : "Darme de baja"}
            </button>
          </div>
        )}

        <div className="text-center mt-6">
          <a href="/" className="text-xs text-gris hover:text-crema2 font-body transition-colors">
            ← {lang === "en" ? "Back to home" : "Volver al inicio"}
          </a>
        </div>
      </div>
    </div>
  );
};

export default Baja;
