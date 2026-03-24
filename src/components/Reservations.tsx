import { useState, useEffect, FormEvent } from "react";
import { useLang } from "@/contexts/LangContext";
import { supabase } from "@/integrations/supabase/client";
import { useWhatsappNumber } from "@/hooks/use-whatsapp-number";

interface Evento {
  id: string;
  nombre: string;
  nombre_en: string | null;
  fecha: string;
}

const Reservations = () => {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [eventos, setEventos] = useState<Evento[]>([]);
  const { t, lang } = useLang();
  const waNumber = useWhatsappNumber();

  const countries = [
    { code: "AR", flag: "🇦🇷", name: "Argentina", prefix: "+54" },
    { code: "BR", flag: "🇧🇷", name: "Brasil", prefix: "+55" },
    { code: "CL", flag: "🇨🇱", name: "Chile", prefix: "+56" },
    { code: "UY", flag: "🇺🇾", name: "Uruguay", prefix: "+598" },
    { code: "PY", flag: "🇵🇾", name: "Paraguay", prefix: "+595" },
    { code: "ES", flag: "🇪🇸", name: "España", prefix: "+34" },
    { code: "US", flag: "🇺🇸", name: "Estados Unidos", prefix: "+1" },
    { code: "MX", flag: "🇲🇽", name: "México", prefix: "+52" },
    { code: "CO", flag: "🇨🇴", name: "Colombia", prefix: "+57" },
    { code: "PE", flag: "🇵🇪", name: "Perú", prefix: "+51" },
  ];

  const [nombre, setNombre] = useState("");
  const [countryCode, setCountryCode] = useState("AR");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [fecha, setFecha] = useState("");
  const [hora, setHora] = useState("");
  const [personas, setPersonas] = useState("");
  const [comentarios, setComentarios] = useState("");
  const [eventoId, setEventoId] = useState("");

  useEffect(() => {
    const fetchEventos = async () => {
      const today = new Date().toISOString().split("T")[0];
      const { data } = await supabase
        .from("eventos")
        .select("id, nombre, nombre_en, fecha")
        .eq("activo", true)
        .gte("fecha", today)
        .order("fecha");
      if (data) setEventos(data);
    };
    fetchEventos();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const personasNum = personas === "9+" ? 9 : parseInt(personas);
    const eventoSeleccionado = eventoId ? eventos.find(ev => ev.id === eventoId) : null;

    const { error } = await supabase.from("reservas").insert({
      nombre,
      telefono,
      email: email || null,
      fecha,
      hora,
      personas: personasNum,
      comentarios: comentarios || null,
      evento_id: eventoId || null,
      estado: "pendiente",
    });

    if (!error) {
      // Build WhatsApp message for the restaurant
      let msg = `🍽️ *NUEVA RESERVA — Estación 27*\n\n`;
      msg += `👤 Nombre: ${nombre}\n`;
      msg += `📅 Fecha: ${fecha}\n`;
      msg += `🕐 Hora: ${hora}\n`;
      msg += `👥 Personas: ${personas}\n`;
      msg += `📞 Teléfono: ${telefono}\n`;
      if (email) msg += `📧 Email: ${email}\n`;
      if (comentarios) msg += `💬 Comentarios: ${comentarios}\n`;
      if (eventoSeleccionado) {
        const evName = lang === "en" && eventoSeleccionado.nombre_en ? eventoSeleccionado.nombre_en : eventoSeleccionado.nombre;
        msg += `🎉 Evento: ${evName}\n`;
      }
      msg += `\nEstado: ⏳ Pendiente de confirmación`;

      const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(msg)}`;
      window.open(waUrl, "_blank");

      setSubmitted(true);
    }
    setLoading(false);
  };

  return (
    <section id="reservas" className="bg-negro py-24 px-4 lg:px-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-4 mb-4">
            <span className="w-12 h-px bg-ambar" />
            <span className="label-amber">{t("res.label")}</span>
            <span className="w-12 h-px bg-ambar" />
          </div>
          <h2 className="font-display font-bold italic text-crema" style={{ fontSize: "clamp(1.8rem, 3vw, 2.8rem)" }}>
            {t("res.title")}
          </h2>
          <p className="font-body font-light text-[0.95rem] text-crema2 mt-3">{t("res.subtitle")}</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-10">
          <div>
            {submitted ? (
              <p className="font-display font-semibold italic text-base text-crema">{t("res.exito")}</p>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <Field label={t("res.nombre")}>
                  <input type="text" required className="form-input" placeholder={t("res.nombre")} value={nombre} onChange={e => setNombre(e.target.value)} />
                </Field>
                <Field label={t("res.telefono")}>
                  <input type="tel" required className="form-input" placeholder={t("res.telefonoPlaceholder")} value={telefono} onChange={e => setTelefono(e.target.value)} />
                </Field>
                <Field label={t("res.email")}>
                  <input type="email" className="form-input" placeholder={t("res.emailPlaceholder")} value={email} onChange={e => setEmail(e.target.value)} />
                </Field>
                <Field label={t("res.fecha")}>
                  <input type="date" required className="form-input relative" value={fecha} onChange={e => setFecha(e.target.value)} />
                </Field>
                <Field label={t("res.hora")}>
                  <input type="time" required className="form-input relative" value={hora} onChange={e => setHora(e.target.value)} />
                </Field>
                <Field label={t("res.personas")}>
                  <select required className="form-input" value={personas} onChange={e => setPersonas(e.target.value)}>
                    <option value="">{t("res.elegir")}</option>
                    {[1,2,3,4,5,6,7,8].map(n => <option key={n} value={n}>{n}</option>)}
                    <option value="9+">{t("res.masde8")}</option>
                  </select>
                </Field>
                {eventos.length > 0 && (
                  <Field label={t("res.evento")}>
                    <select className="form-input" value={eventoId} onChange={e => setEventoId(e.target.value)}>
                      <option value="">{t("res.sinEvento")}</option>
                      {eventos.map(ev => (
                        <option key={ev.id} value={ev.id}>
                          {lang === "en" && ev.nombre_en ? ev.nombre_en : ev.nombre} — {ev.fecha}
                        </option>
                      ))}
                    </select>
                  </Field>
                )}
                <Field label={t("res.comentarios")}>
                  <textarea rows={3} className="form-input resize-none" placeholder={t("res.placeholder")} value={comentarios} onChange={e => setComentarios(e.target.value)} />
                </Field>
                <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
                  {loading ? "..." : t("res.confirmar")}
                </button>
              </form>
            )}
          </div>

          <div className="bg-carbon rounded p-8 self-start" style={{ border: "1px solid rgba(240,232,208,0.08)" }}>
            <img src="/images/logo.png" alt="" className="h-16 mx-auto mb-6" style={{ filter: "invert(1)", opacity: 0.80 }} />
            <h3 className="font-display font-semibold text-crema text-center text-lg mb-6">{t("res.llamar")}</h3>
            <a href={`https://wa.me/${waNumber}?text=${encodeURIComponent("Hola Estación 27! Quiero hacer una reserva.")}`} target="_blank" rel="noopener noreferrer"
              className="block w-full text-center font-body font-semibold text-[0.82rem] py-3 rounded-sm mb-3 transition-colors"
              style={{ background: "#25D366", color: "#fff" }}>
              {t("res.whatsapp")}
            </a>
            <a href="tel:+543514251651"
              className="block w-full text-center font-body font-semibold text-[0.82rem] text-crema py-3 rounded-sm transition-colors"
              style={{ border: "1px solid rgba(240,232,208,0.20)" }}>
              {t("res.llamarbtn")}
            </a>
            <p className="font-body font-light text-[0.80rem] text-gris text-center mt-5">{t("res.respuesta")}</p>
          </div>
        </div>
      </div>
    </section>
  );
};

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div>
    <label className="block font-body font-medium text-[0.78rem] uppercase tracking-[0.12em] text-crema2 mb-1.5">{label}</label>
    {children}
  </div>
);

export default Reservations;
