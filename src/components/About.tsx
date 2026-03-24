import { useLang } from "@/contexts/LangContext";

const About = () => {
  const { t } = useLang();

  return (
    <section id="nosotros" className="bg-negro py-24 px-4 lg:px-6">
      <div className="max-w-6xl mx-auto grid lg:grid-cols-[55%_45%] gap-16 items-center">
        <div>
          <div className="flex items-center gap-4 mb-4">
            <span className="w-12 h-px bg-ambar" />
            <span className="label-amber">{t("about.label")}</span>
            <span className="w-12 h-px bg-ambar" />
          </div>
          <h2 className="font-display font-extrabold text-crema leading-tight mb-8" style={{ fontSize: "clamp(1.8rem, 3vw, 2.8rem)" }}>
            {t("about.title")}
          </h2>

          <div className="space-y-5 font-body font-light text-base text-crema2 leading-[1.82]">
            <p>{t("about.p1")}</p>
            <p>{t("about.p2")}</p>
            <p>{t("about.p3")}</p>
          </div>

          <div className="flex flex-wrap gap-8 mt-10 items-end">
            {[
              { num: "+30", label: t("about.stat.years"), sub: t("about.stat.years.sub") },
              { num: "3.500+", label: t("about.stat.reviews"), sub: "" },
              { num: "4.4★", label: t("about.stat.rating"), sub: "" },
            ].map((s, i) => (
              <div key={i}>
                <div className="font-display font-extrabold text-[2.8rem] text-ambar leading-none">{s.num}</div>
                <div className="font-body font-normal text-[0.75rem] uppercase tracking-[0.15em] text-crema2 mt-1">
                  {s.sub || s.label}
                </div>
              </div>
            ))}

            <a href="https://google.com/maps/place/estacion+27+cordoba/data=!4m2!3m1!1s0x9432a2818788c5bd:0xe90868ad3279c90b?sa=X&ved=1t:242&ictx=111"
              target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 ml-2 mb-1 opacity-70 hover:opacity-100 transition-opacity">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 92.3 132.3">
                <path fill="#1a73e8" d="M60.2 2.2C55.8.8 51 0 46.1 0 32 0 19.3 6.4 10.8 16.5l21.8 18.3L60.2 2.2z"/>
                <path fill="#ea4335" d="M10.8 16.5C4.1 24.5 0 34.9 0 46.1c0 8.7 1.7 15.7 4.6 22l28-33.8-21.8-18.3z"/>
                <path fill="#4285f4" d="M46.1 28.5c9.8 0 17.7 7.9 17.7 17.7 0 4.3-1.6 8.3-4.2 11.4 0 0 13.9-16.6 27.5-34.3-5.6-10.8-15.3-19-27-21.1L32.6 34.8c3.3-3.8 8.1-6.3 13.5-6.3z"/>
                <path fill="#fbbc04" d="M46.1 63.5c-9.8 0-17.7-7.9-17.7-17.7 0-4.3 1.6-8.3 4.2-11.4L4.6 68.1C11 83.8 25.3 108.5 46.1 132.3c16.8-23.1 28.4-42.7 36.9-60.1L59.6 57.6c-3.3 3.7-8.1 5.9-13.5 5.9z"/>
                <path fill="#34a853" d="M59.6 57.6c7.7-6.1 12.7-15.3 12.7-25.5 0-3-0.4-5.8-1.2-8.5L32.6 34.8c-2.6 3.1-4.2 7.1-4.2 11.4 0 9.8 7.9 17.7 17.7 17.7 5.4 0 10.2-2.2 13.5-6.3z"/>
              </svg>
              <span className="font-body text-[0.65rem] text-crema2/50">by Google</span>
            </a>
          </div>
        </div>

        <div className="flex flex-col items-center">
          <img src="/images/logo2.png" alt="Estación 27" className="max-w-[320px] w-full" style={{ filter: "invert(1)", opacity: 0.88 }} />
          <p className="font-display italic text-[1.1rem] text-crema2 mt-6 text-center">{t("about.quote")}</p>
        </div>
      </div>
    </section>
  );
};

export default About;
