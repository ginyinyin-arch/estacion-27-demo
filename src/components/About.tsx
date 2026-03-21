const About = () => {
  return (
    <section id="nosotros" className="bg-negro py-24 px-4 lg:px-6">
      <div className="max-w-6xl mx-auto grid lg:grid-cols-[55%_45%] gap-16 items-center">
        {/* Text */}
        <div>
          <div className="flex items-center gap-4 mb-4">
            <span className="w-12 h-px bg-ambar" />
            <span className="label-amber">NUESTRA HISTORIA</span>
            <span className="w-12 h-px bg-ambar" />
          </div>
          <h2 className="font-display font-extrabold text-crema leading-tight mb-8" style={{ fontSize: "clamp(1.8rem, 3vw, 2.8rem)" }}>
            Desde 1991, en el corazón de Córdoba.
          </h2>

          <div className="space-y-5 font-body font-light text-base text-crema2 leading-[1.82]">
            <p>
              Estación 27 abrió sus puertas en 1991 en pleno Centro de Córdoba.
              Más de treinta años después, seguimos siendo el mismo lugar de siempre:
              una cocina honesta, ingredientes frescos y atención de verdad.
            </p>
            <p>
              El nombre Estación habla de encuentro, de paso, de gente que viene
              y vuelve. Generaciones de cordobeses pasaron por estas mesas.
              Estudiantes, familias, enamorados, amigos de toda la vida.
            </p>
            <p>
              Hoy somos cocina de autor sin pretensiones. Nuestros lomitos son
              legendarios en la ciudad. Pero también hacemos parrilla, pizzas,
              Tex Mex, ensaladas de autor y un bar que sabe lo que hace.
            </p>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap gap-8 mt-10">
            {[
              { num: "+30", label: "AÑOS", sub: "EN CÓRDOBA" },
              { num: "3.500+", label: "RESEÑAS", sub: "" },
              { num: "4.4★", label: "VALORACIÓN", sub: "" },
            ].map((s, i) => (
              <div key={i}>
                <div className="font-display font-extrabold text-[2.8rem] text-ambar leading-none">{s.num}</div>
                <div className="font-body font-normal text-[0.75rem] uppercase tracking-[0.15em] text-crema2 mt-1">
                  {s.sub || s.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Visual */}
        <div className="flex flex-col items-center">
          <img
            src="/images/logo2.png"
            alt="Estación 27"
            className="max-w-[320px] w-full"
            style={{ filter: "invert(1)", opacity: 0.88 }}
          />
          <p className="font-display italic text-[1.1rem] text-crema2 mt-6 text-center">
            Un clásico que no pasa de moda.
          </p>
        </div>
      </div>
    </section>
  );
};

export default About;
