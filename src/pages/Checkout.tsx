import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { useLang } from "@/contexts/LangContext";
import { supabase } from "@/integrations/supabase/client";
import SmartPhoneInput from "@/components/SmartPhoneInput";
import { useToast } from "@/hooks/use-toast";

const Checkout = () => {
  const { items, total, takeawayActivo, takeawayLoading, clearCart } = useCart();
  const { lang } = useLang();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [notas, setNotas] = useState("");
  const [loading, setLoading] = useState(false);

  // Redirect if takeaway is off or cart is empty (only after loading completes)
  useEffect(() => {
    if (takeawayLoading) return;
    if (!takeawayActivo || items.length === 0) {
      navigate("/", { replace: true });
    }
  }, [takeawayActivo, takeawayLoading, items.length, navigate]);

  if (takeawayLoading) {
    return (
      <div className="min-h-screen bg-negro flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-ambar border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!takeawayActivo || items.length === 0) return null;

  const handlePay = async () => {
    if (!nombre.trim()) {
      toast({
        title: lang === "en" ? "Name required" : "Nombre requerido",
        description: lang === "en" ? "Please enter your name" : "Por favor ingresá tu nombre",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const pedidoItems = items.map((i) => ({
        plato_id: i.plato_id,
        nombre: i.nombre,
        precio: i.precio,
        cantidad: i.cantidad,
      }));

      const { data: mpData, error: mpErr } = await supabase.functions.invoke(
        "crear-preferencia-mp",
        {
          body: {
            items: pedidoItems,
            nombre: nombre.trim(),
            email: email.trim() || null,
            telefono: telefono.trim() || null,
            notas: notas.trim() || null,
          },
        }
      );

      if (mpErr || !mpData?.init_point) {
        throw new Error(mpData?.error || mpErr?.message || "Error al conectar con MercadoPago");
      }

      // Redirect to MercadoPago
      clearCart();
      window.location.href = mpData.init_point;
    } catch (err: any) {
      toast({
        title: lang === "en" ? "Error" : "Error",
        description: err.message || "Ocurrió un error",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full bg-negro border border-crema/10 text-crema font-body text-sm placeholder:text-gris focus:outline-none focus:border-ambar/50 transition-colors rounded px-3 py-2.5";

  return (
    <div className="min-h-screen bg-negro text-crema">
      <div className="max-w-lg mx-auto px-4 py-10">
        {/* Header */}
        <button
          onClick={() => navigate(-1)}
          className="text-ambar font-body text-sm mb-6 hover:opacity-75 transition-opacity"
        >
          ← {lang === "en" ? "Back" : "Volver"}
        </button>

        <h1 className="font-display text-2xl md:text-3xl text-crema mb-8">
          {lang === "en" ? "Checkout" : "Finalizar pedido"}
        </h1>

        {/* Order summary */}
        <div className="mb-8 space-y-3">
          <h2 className="font-display text-lg text-ambar mb-3">
            {lang === "en" ? "Your order" : "Tu pedido"}
          </h2>
          {items.map((item) => (
            <div
              key={item.plato_id}
              className="flex justify-between items-center font-body text-sm border-b border-crema/5 pb-2"
            >
              <span>
                {item.nombre} × {item.cantidad}
              </span>
              <span className="text-ambar">
                ${(item.precio * item.cantidad).toLocaleString("es-AR")}
              </span>
            </div>
          ))}
          <div className="flex justify-between items-center font-display text-lg pt-2 border-t border-crema/20">
            <span>Total</span>
            <span className="text-ambar">${total.toLocaleString("es-AR")}</span>
          </div>
        </div>

        {/* Form */}
        <div className="space-y-4 mb-8">
          <div>
            <label className="font-body text-sm text-gris block mb-1">
              {lang === "en" ? "Full name *" : "Nombre completo *"}
            </label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className={inputClass}
              placeholder={lang === "en" ? "Your name" : "Tu nombre"}
              maxLength={100}
            />
          </div>

          <div>
            <label className="font-body text-sm text-gris block mb-1">
              Email {lang === "en" ? "(optional)" : "(opcional)"}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
              placeholder="email@ejemplo.com"
              maxLength={255}
            />
          </div>

          <div>
            <label className="font-body text-sm text-gris block mb-1">
              {lang === "en" ? "Phone (optional)" : "Teléfono (opcional)"}
            </label>
            <SmartPhoneInput onChange={setTelefono} />
          </div>

          <div>
            <label className="font-body text-sm text-gris block mb-1">
              {lang === "en" ? "Notes (optional)" : "Notas (opcional)"}
            </label>
            <textarea
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              className={`${inputClass} resize-none h-20`}
              placeholder={
                lang === "en"
                  ? "No onions, no mayo..."
                  : "Sin cebolla, sin mayonesa..."
              }
              maxLength={500}
            />
          </div>
        </div>

        {/* Pay button */}
        <button
          onClick={handlePay}
          disabled={loading}
          className="w-full bg-ambar text-negro font-display text-lg py-3 rounded hover:bg-ambar/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading
            ? lang === "en"
              ? "Processing..."
              : "Procesando..."
            : lang === "en"
            ? "Pay with MercadoPago →"
            : "Pagar con MercadoPago →"}
        </button>
      </div>
    </div>
  );
};

export default Checkout;
