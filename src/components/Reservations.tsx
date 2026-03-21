import { useState, FormEvent } from "react";

const Reservations = () => {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <section id="reservas" className="bg-negro py-24 px-4 lg:px-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-4 mb-4">
            <span className="w-12 h-px bg-ambar" />
            <span className="label-amber">RESERVAS</span>
            <span className="w-12 h-px bg-ambar" />
          </div>
          <h2 className="font-display font-bold italic text-crema" style={{ fontSize: "clamp(1.8rem, 3vw, 2.8rem)" }}>
            Asegurá tu mesa.
          </h2>
          <p className="font-body font-light text-[0.95rem] text-crema2 mt-3">
            Escribinos por WhatsApp o llamanos directamente.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-10">
          {/* Form */}
          <div>
            {submitted ? (
              <p className="font-display font-semibold italic text-base text-crema">
                ¡Reserva recibida! Te contactamos para confirmar.
              </p>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <Field label="NOMBRE"><input type="text" required className="form-input" placeholder="Tu nombre" /></Field>
                <Field label="FECHA"><input type="date" required className="form-input" /></Field>
                <Field label="HORA"><input type="time" required className="form-input" /></Field>
                <Field label="PERSONAS">
                  <select required className="form-input">
                    <option value="">Elegir</option>
                    {[1,2,3,4,5,6,7,8].map(n => <option key={n} value={n}>{n}</option>)}
                    <option value="9+">Más de 8</option>
                  </select>
                </Field>
                <Field label="COMENTARIOS">
                  <textarea rows={3} className="form-input resize-none" placeholder="Cumpleaños, alergias, preferencias de mesa..." />
                </Field>
                <button type="submit" className="btn-primary w-full mt-2">
                  CONFIRMAR RESERVA
                </button>
              </form>
            )}
          </div>

          {/* Direct contact */}
          <div className="bg-carbon rounded p-8 self-start" style={{ border: "1px solid rgba(240,232,208,0.08)" }}>
            <img src="/images/logo.png" alt="" className="h-16 mx-auto mb-6" style={{ filter: "invert(1)", opacity: 0.80 }} />
            <h3 className="font-display font-semibold text-crema text-center text-lg mb-6">
              ¿Preferís llamarnos?
            </h3>
            <a
              href="https://wa.me/543514251651?text=Hola%20Estación%2027!%20Quiero%20hacer%20una%20reserva."
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full text-center font-body font-semibold text-[0.82rem] py-3 rounded-sm mb-3 transition-colors"
              style={{ background: "#25D366", color: "#fff" }}
            >
              ESCRIBIR POR WHATSAPP →
            </a>
            <a
              href="tel:+543514251651"
              className="block w-full text-center font-body font-semibold text-[0.82rem] text-crema py-3 rounded-sm transition-colors"
              style={{ border: "1px solid rgba(240,232,208,0.20)" }}
            >
              LLAMAR: (0351) 425-1651
            </a>
            <p className="font-body font-light text-[0.80rem] text-gris text-center mt-5">
              Respondemos a la brevedad. Confirmación en menos de 2 horas.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div>
    <label className="block font-body font-medium text-[0.78rem] uppercase tracking-[0.12em] text-crema2 mb-1.5">
      {label}
    </label>
    {children}
  </div>
);

export default Reservations;
