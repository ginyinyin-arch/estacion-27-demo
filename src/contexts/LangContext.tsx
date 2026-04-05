import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type Lang = "es" | "en";

interface LangContextType {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string) => string;
}

const translations: Record<string, Record<Lang, string>> = {
  // Navbar
  "nav.carta": { es: "CARTA", en: "MENU" },
  "nav.nosotros": { es: "NOSOTROS", en: "ABOUT" },
  "nav.horarios": { es: "HORARIOS", en: "HOURS" },
  "nav.reservas": { es: "RESERVAS", en: "RESERVATIONS" },
  "nav.reservar": { es: "RESERVAR MESA", en: "BOOK A TABLE" },

  // Hero
  "hero.label": { es: "DESDE 1991", en: "SINCE 1991" },
  "hero.h1a": { es: "Cocina de Autor.", en: "Chef's Cuisine." },
  "hero.h1b": { es: "Córdoba, desde siempre.", en: "Córdoba, since always." },
  "hero.sub1": { es: "Lomitos, parrilla, cocina de autor y buen bar.", en: "Lomitos, grill, chef's cuisine and great bar." },
  "hero.sub2": { es: "En el corazón del Centro de Córdoba.", en: "In the heart of Córdoba's city center." },
  "hero.cta1": { es: "VER LA CARTA", en: "SEE THE MENU" },
  "hero.cta2": { es: "HACER UNA RESERVA", en: "MAKE A RESERVATION" },
  "hero.hours": { es: "Lun–Sáb 8 a 2hs", en: "Mon–Sat 8am to 2am" },

  // Menu
  "menu.label": { es: "LA CARTA", en: "THE MENU" },
  "menu.title": { es: "Treinta años perfeccionando cada plato.", en: "Thirty years perfecting every dish." },
  "menu.subtitle": { es: "Cocina de autor, ingredientes frescos, recetas propias.", en: "Chef's cuisine, fresh ingredients, original recipes." },
  "menu.tab.Lomos": { es: "LOMOS", en: "LOMOS" },
  "menu.tab.Hamburguesas": { es: "HAMBURGUESAS", en: "BURGERS" },
  "menu.tab.Tex Mex": { es: "TEX MEX", en: "TEX MEX" },
  "menu.tab.Ensaladas": { es: "ENSALADAS", en: "SALADS" },
  "menu.tab.Picadas": { es: "PICADAS", en: "SHARING" },
  "menu.tab.Bar": { es: "BAR", en: "BAR" },
  "menu.badge.especialidad": { es: "ESPECIALIDAD", en: "HOUSE SPECIAL" },
  "menu.badge.oferta": { es: "OFERTA", en: "SPECIAL OFFER" },
  "menu.badge.nodisponible": { es: "No disponible", en: "Not available" },
  "menu.badge.agotado": { es: "Agotado por hoy", en: "Sold out today" },
  "menu.bar.title": { es: "Gin, Vermouth & Coctelería", en: "Gin, Vermouth & Cocktails" },
  "menu.bar.desc": { es: "Carta de tragos, gin tonic de autor, vermouths clásicos y cocteles de la casa. Preguntanos en el salón.", en: "Drinks menu, craft gin & tonic, classic vermouths and house cocktails. Ask us at the bar." },
  "menu.lomo.subtitle": { es: "EL LOMO ESTACIÓN — Nuestra especialidad.", en: "EL LOMO ESTACIÓN — Our specialty." },

  // About
  "about.label": { es: "NUESTRA HISTORIA", en: "OUR STORY" },
  "about.title": { es: "Desde 1991, en el corazón de Córdoba.", en: "Since 1991, in the heart of Córdoba." },
  "about.p1": { es: "Estación 27 abrió sus puertas en 1991 en pleno Centro de Córdoba. Más de treinta años después, seguimos siendo el mismo lugar de siempre: una cocina honesta, ingredientes frescos y atención de verdad.", en: "Estación 27 opened its doors in 1991 in downtown Córdoba. Over thirty years later, we remain the same place we've always been: honest cooking, fresh ingredients and genuine hospitality." },
  "about.p2": { es: "El nombre Estación habla de encuentro, de paso, de gente que viene y vuelve. Generaciones de cordobeses pasaron por estas mesas. Estudiantes, familias, enamorados, amigos de toda la vida.", en: "The name Estación speaks of meeting, of passage, of people who come and return. Generations of Cordobeses have sat at these tables. Students, families, lovers, lifelong friends." },
  "about.p3": { es: "Hoy somos cocina de autor sin pretensiones. Nuestros lomitos son legendarios en la ciudad. Pero también hacemos parrilla, pizzas, Tex Mex, ensaladas de autor y un bar que sabe lo que hace.", en: "Today we are unpretentious chef's cuisine. Our lomitos are legendary in the city. But we also do grill, pizzas, Tex Mex, signature salads and a bar that knows what it's doing." },
  "about.stat.years": { es: "AÑOS", en: "YEARS" },
  "about.stat.years.sub": { es: "EN CÓRDOBA", en: "IN CÓRDOBA" },
  "about.stat.reviews": { es: "RESEÑAS", en: "REVIEWS" },
  "about.stat.rating": { es: "VALORACIÓN", en: "RATING" },
  "about.quote": { es: "Un clásico que no pasa de moda.", en: "A classic that never goes out of style." },

  // Hours
  "hours.label": { es: "DÓNDE ESTAMOS", en: "FIND US" },
  "hours.title": { es: "En el centro de todo.", en: "Right in the center." },
  "hours.horarios": { es: "Horarios", en: "Hours" },
  "hours.direccion": { es: "Dirección", en: "Address" },
  "hours.contacto": { es: "Contacto", en: "Contact" },
  "hours.lunsab": { es: "Lunes a Sábados", en: "Monday to Saturday" },
  "hours.dom": { es: "Domingos", en: "Sundays" },
  "hours.cerrado": { es: "Cerrado", en: "Closed" },

  // Reservations
  "res.label": { es: "RESERVAS", en: "RESERVATIONS" },
  "res.title": { es: "Asegurá tu mesa.", en: "Book your table." },
  "res.subtitle": { es: "Completá el formulario y te contactamos para confirmar.", en: "Fill the form and we'll contact you to confirm." },
  "res.nombre": { es: "NOMBRE", en: "NAME" },
  "res.telefono": { es: "TELÉFONO", en: "PHONE" },
  "res.telefonoPlaceholder": { es: "+54 351 ...", en: "+54 351 ..." },
  "res.email": { es: "EMAIL (OPCIONAL)", en: "EMAIL (OPTIONAL)" },
  "res.emailPlaceholder": { es: "tu@email.com", en: "your@email.com" },
  "res.fecha": { es: "FECHA", en: "DATE" },
  "res.hora": { es: "HORA", en: "TIME" },
  "res.personas": { es: "PERSONAS", en: "GUESTS" },
  "res.evento": { es: "EVENTO", en: "EVENT" },
  "res.sinEvento": { es: "Sin evento especial", en: "No special event" },
  "res.comentarios": { es: "COMENTARIOS", en: "COMMENTS" },
  "res.placeholder": { es: "Cumpleaños, alergias, preferencias de mesa...", en: "Birthday, allergies, preferences..." },
  "res.elegir": { es: "Elegir", en: "Choose" },
  "res.masde8": { es: "Más de 8", en: "More than 8" },
  "res.confirmar": { es: "CONFIRMAR RESERVA", en: "CONFIRM RESERVATION" },
  "res.exito": { es: "¡Reserva recibida! Te contactamos para confirmar.", en: "Reservation received! We'll contact you to confirm." },
  "res.llamar": { es: "¿Preferís llamarnos?", en: "Prefer to call us?" },
  "res.whatsapp": { es: "ESCRIBIR POR WHATSAPP →", en: "MESSAGE ON WHATSAPP →" },
  "res.llamarbtn": { es: "LLAMAR: (0351) 425-1651", en: "CALL: (0351) 425-1651" },
  "res.respuesta": { es: "Respondemos a la brevedad. Confirmación en menos de 2 horas.", en: "We respond promptly. Confirmation within 2 hours." },

  // WhatsApp button
  "wa.reservar": { es: "Reservar", en: "Book" },

  // Footer
  "footer.tagline": { es: "Cocina de Autor · Desde 1991", en: "Chef's Cuisine · Since 1991" },
  "footer.nav": { es: "NAVEGACIÓN", en: "NAVIGATION" },
  "footer.contacto": { es: "CONTACTO", en: "CONTACT" },
   "footer.webpor": { es: "Web por", en: "Web by" },
   "footer.cancelar_alertas": { es: "Cancelar alertas de precio", en: "Cancel price alerts" },
  "footer.carta": { es: "Carta", en: "Menu" },
  "footer.nosotros": { es: "Nosotros", en: "About" },
  "footer.horarios": { es: "Horarios", en: "Hours" },
  "footer.reservas": { es: "Reservas", en: "Reservations" },

  // Closed banner
  "closed.cerrados": { es: "Estamos cerrados", en: "We are closed" },
  "closed.por": { es: "por", en: "due to" },
  "closed.volvemos": { es: "Volvemos el", en: "Back on" },
  "closed.pronto": { es: "Volvemos próximamente", en: "Back soon" },

  // Daily menu
  "daily.label": { es: "MENÚ DEL DÍA", en: "DAILY MENU" },
  "daily.entrada": { es: "Entrada", en: "Starter" },
  "daily.principal": { es: "Plato principal", en: "Main course" },
  "daily.postre": { es: "Postre", en: "Dessert" },
  "daily.bebida": { es: "Bebida incluida", en: "Drink included" },
  "daily.hasta": { es: "Disponible hasta las", en: "Available until" },

  // Events
  "events.label": { es: "PRÓXIMOS EVENTOS", en: "UPCOMING EVENTS" },
  "events.title": { es: "No te los pierdas.", en: "Don't miss out." },
  "events.gratis": { es: "Entrada libre", en: "Free entry" },
  "events.reservar": { es: "Reservar", en: "Reserve" },

  // Price alerts
  "alert.btn": { es: "Avisame si baja", en: "Alert me if cheaper" },
  "alert.title": { es: "Te avisamos cuando baje de precio", en: "We'll notify you when the price drops" },
  "alert.subtitle": { es: "¿Para qué productos querés recibir alertas?", en: "Which items do you want alerts for?" },
  "alert.selectall": { es: "Seleccionar todos", en: "Select all" },
  "alert.how": { es: "¿Cómo preferís que te avisemos?", en: "How should we notify you?" },
  "alert.activate": { es: "ACTIVAR ALERTAS", en: "ACTIVATE ALERTS" },
  "alert.success.title": { es: "¡Listo!", en: "Done!" },
  "alert.success.desc": { es: "Te avisamos cuando bajen los precios.", en: "We'll notify you when prices drop." },
  "alert.success.close": { es: "Cerrar", en: "Close" },
};

const LangContext = createContext<LangContextType>({
  lang: "es",
  setLang: () => {},
  t: (key: string) => key,
});

export const useLang = () => useContext(LangContext);

export const LangProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLangState] = useState<Lang>(() => {
    const stored = localStorage.getItem("lang");
    return (stored === "en" ? "en" : "es") as Lang;
  });

  const setLang = (l: Lang) => {
    setLangState(l);
    localStorage.setItem("lang", l);
  };

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const t = (key: string): string => {
    return translations[key]?.[lang] || key;
  };

  return (
    <LangContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LangContext.Provider>
  );
};
