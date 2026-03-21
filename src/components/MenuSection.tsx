import { useState } from "react";
import { Wine } from "lucide-react";

const categories = [
  { id: "lomos", label: "LOMOS" },
  { id: "hamburguesas", label: "HAMBURGUESAS" },
  { id: "texmex", label: "TEX MEX" },
  { id: "ensaladas", label: "ENSALADAS" },
  { id: "picadas", label: "PICADAS" },
  { id: "bar", label: "BAR" },
];

interface Dish {
  name: string;
  desc?: string;
  price: string;
  badge?: string;
}

const menuData: Record<string, { image?: string; dishes: Dish[] }> = {
  lomos: {
    image: "/images/lomo.jpg",
    dishes: [
      { name: "Lomo Estación ★", desc: "Queso, panceta, tomate, huevo, cebolla caramelizada, salsa golf y papas fritas.", price: "$24.000", badge: "ESPECIALIDAD" },
      { name: "Lomo Insurrecto", desc: "Rúcula, tomates asados, huevo, parmesano, olivas negras, mayonesa y papas fritas.", price: "$24.000" },
      { name: "Lomo al Roquefort", desc: "Rúcula, tomate, olivas negras, roquefort, jamón, queso, huevo y papas fritas.", price: "$24.000" },
      { name: "Lomo Completo", desc: "Jamón, queso, lechuga, tomate, huevo, mayonesa y papas fritas.", price: "$20.000" },
      { name: "Lomo Simple", desc: "Queso, tomate, lechuga, mayonesa y papas fritas.", price: "$18.000" },
    ],
  },
  hamburguesas: {
    dishes: [
      { name: "Cheddar Doble Burguer", desc: "Doble bife, aderezo americano, cheddar, tomate, pepinillos, lechuga, huevo y papas fritas.", price: "$13.300" },
      { name: "Completa Doble Burguer", desc: "Doble bife, queso, tomate, lechuga, huevo, aderezo americano y papas fritas.", price: "$12.000" },
      { name: "Insurrecta Triple Burguer", desc: "Triple bife, aderezo americano, rúcula, tomates asados, huevo, parmesano, olivas negras y papas fritas.", price: "$15.500" },
      { name: "Cheddar Triple Burguer", desc: "Triple bife, aderezo americano, cheddar, tomate, pepinillos, lechuga, huevo y papas fritas.", price: "$15.500" },
    ],
  },
  texmex: {
    image: "/images/tacos.jpg",
    dishes: [
      { name: "Tacos", desc: "De carne, pollo o mixtos, cebolla y pimientos salteados, guacamole, mayonesa casera y salsa de ají poblano.", price: "$18.000" },
      { name: "Quesadilla Insurrecta", desc: "Carne, pollo o mixtos, queso, champignones, rúcula, guacamole, mayonesa casera y salsa de ají poblano.", price: "$19.500" },
      { name: "Quesadilla Vegetariana", desc: "Champignones, muzzarella, rúcula, cebollas y pimientos, guacamole y mayonesa casera.", price: "$17.000" },
      { name: "Nachos con Cheddar y Guacamole", price: "$9.000" },
    ],
  },
  ensaladas: {
    image: "/images/wrap.jpg",
    dishes: [
      { name: "Insurrecta", desc: "Rúcula, tomates asados, parmesano, nueces, olivas negras y pollo grillado.", price: "$15.000" },
      { name: "Ibérica", desc: "Lechuga, rúcula, jamón crudo, tomate, muzzarella fresca, aceitunas negras y pan de pizza.", price: "$15.000" },
      { name: "Ensalada César", desc: "Lechuga, parmesano, huevo duro, pollo, croutones y aderezo césar.", price: "$15.000" },
      { name: "Ensalada de Rogelio", desc: "Rúcula, tomates asados, nueces, olivas negras y parmesano.", price: "$14.000" },
    ],
  },
  picadas: {
    dishes: [
      { name: "Provoleta a la chapa", price: "$9.000" },
      { name: "Papas Fritas con Cheddar", desc: "Con cheddar, cebolla dorada y panceta.", price: "$13.000" },
      { name: "Milanesa Picada", desc: "Con mayonesa y mostaza.", price: "$17.000" },
      { name: "Pan de Pizza", desc: "A la parrilla con crema de roquefort o guacamole.", price: "$9.000" },
      { name: "Dados de queso", price: "$4.000" },
    ],
  },
  bar: { dishes: [] },
};

const MenuSection = () => {
  const [active, setActive] = useState("lomos");
  const data = menuData[active];

  return (
    <section id="carta" className="bg-negro py-24 px-4 lg:px-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-4 mb-4">
            <span className="w-12 h-px bg-ambar" />
            <span className="label-amber">LA CARTA</span>
            <span className="w-12 h-px bg-ambar" />
          </div>
          <h2 className="font-display font-bold italic text-crema" style={{ fontSize: "clamp(1.8rem, 3vw, 2.8rem)" }}>
            Treinta años perfeccionando cada plato.
          </h2>
          <p className="font-body font-light text-[0.95rem] text-crema2 mt-3">
            Cocina de autor, ingredientes frescos, recetas propias.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex overflow-x-auto gap-1 mb-10 pb-2" style={{ scrollbarWidth: "none" }}>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setActive(c.id)}
              className={`font-body font-medium text-[0.73rem] uppercase tracking-[0.18em] px-[18px] py-2.5 whitespace-nowrap transition-colors duration-200 border-b-2 ${
                active === c.id
                  ? "text-ambar border-ambar"
                  : "text-gris border-transparent hover:text-crema"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div key={active} className="animate-fade-in-up">
          {active === "bar" ? (
            <div className="bg-madera rounded p-8 md:p-12 text-center">
              <Wine size={40} className="text-ambar mx-auto mb-4" />
              <h3 className="font-display font-bold italic text-2xl text-crema mb-3">
                Gin, Vermouth & Coctelería
              </h3>
              <p className="font-body font-light text-crema2 max-w-md mx-auto">
                Carta de tragos, gin tonic de autor, vermouths clásicos y cocteles de la casa. Preguntanos en el salón.
              </p>
            </div>
          ) : (
            <>
              {data?.image && (
                <div className="relative rounded overflow-hidden mb-8 h-[280px]">
                  <img src={data.image} alt="" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-negro/20" />
                  {active === "lomos" && (
                    <span className="absolute bottom-4 left-4 font-display font-semibold italic text-crema bg-negro/55 px-4 py-2 text-sm">
                      EL LOMO ESTACIÓN — Nuestra especialidad.
                    </span>
                  )}
                </div>
              )}
              <div className="grid md:grid-cols-2 gap-4">
                {data?.dishes.map((d, i) => (
                  <div
                    key={i}
                    className="bg-carbon border rounded p-5 flex justify-between items-start gap-4 transition-all duration-200 hover:-translate-y-0.5"
                    style={{
                      borderColor: "rgba(240,232,208,0.06)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = "rgba(200,134,10,0.22)";
                      e.currentTarget.style.boxShadow = "0 4px 24px rgba(0,0,0,0.35)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "rgba(240,232,208,0.06)";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-display font-semibold text-[1.05rem] text-crema">{d.name}</span>
                        {d.badge && (
                          <span className="text-[0.6rem] font-body font-bold uppercase tracking-wider text-ambar border border-ambar px-1.5 py-0.5 rounded-sm">
                            {d.badge}
                          </span>
                        )}
                      </div>
                      {d.desc && (
                        <p className="font-body font-light text-[0.84rem] text-crema2 leading-[1.65] mt-1 max-w-[85%]">
                          {d.desc}
                        </p>
                      )}
                    </div>
                    <span className="font-body font-medium text-[0.92rem] text-ambar whitespace-nowrap">{d.price}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
};

export default MenuSection;
