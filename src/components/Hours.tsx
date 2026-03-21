import { Clock, MapPin, Phone } from "lucide-react";

const Hours = () => {
  return (
    <section id="horarios" className="bg-carbon py-20 px-4 lg:px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-4 mb-4">
            <span className="w-12 h-px bg-ambar" />
            <span className="label-amber">DÓNDE ESTAMOS</span>
            <span className="w-12 h-px bg-ambar" />
          </div>
          <h2 className="font-display font-bold text-crema" style={{ fontSize: "clamp(1.8rem, 3vw, 2.8rem)" }}>
            En el centro de todo.
          </h2>
        </div>

        <div className="grid lg:grid-cols-2 gap-10">
          {/* Info cards */}
          <div className="space-y-6">
            <InfoCard icon={<Clock size={24} className="text-ambar" />} title="Horarios">
              <p>Lunes a Sábados: 08:00 a 02:00 hs</p>
              <p>Domingos: 20:00 a 02:00 hs</p>
            </InfoCard>
            <InfoCard icon={<MapPin size={24} className="text-ambar" />} title="Dirección">
              <p>27 de Abril 366, Centro</p>
              <p>Córdoba, Argentina</p>
              <p>A metros de la Torre Ángela</p>
            </InfoCard>
            <InfoCard icon={<Phone size={24} className="text-ambar" />} title="Contacto">
              <p>(0351) 425-1651</p>
              <a
                href="https://instagram.com/estacionveintisiete"
                target="_blank"
                rel="noopener noreferrer"
                className="text-ambar hover:underline"
              >
                @estacionveintisiete
              </a>
            </InfoCard>
          </div>

          {/* Map */}
          <div className="rounded overflow-hidden" style={{ border: "1px solid rgba(240,232,208,0.10)" }}>
            <iframe
              src="https://maps.google.com/maps?q=27+de+Abril+366+Córdoba+Argentina&output=embed"
              width="100%"
              height="320"
              style={{ border: 0, display: "block", minHeight: 320 }}
              loading="lazy"
              title="Ubicación de Estación 27"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

const InfoCard = ({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) => (
  <div className="flex gap-4">
    <div className="mt-1">{icon}</div>
    <div>
      <h3 className="font-body font-semibold text-crema mb-1">{title}</h3>
      <div className="font-body font-normal text-[0.90rem] text-crema2 space-y-0.5">{children}</div>
    </div>
  </div>
);

export default Hours;
