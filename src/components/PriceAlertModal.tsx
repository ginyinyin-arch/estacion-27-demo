import { useState, useEffect } from "react";
import { X, Bell } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useLang } from "@/contexts/LangContext";

interface Plato {
  id: string;
  nombre: string;
  nombre_en: string | null;
  categoria: string;
  precio: number;
  disponible: boolean;
}

interface PriceAlertModalProps {
  platos: Plato[];
  initialPlatoId: string;
  onClose: () => void;
}

const PriceAlertModal = ({ platos, initialPlatoId, onClose }: PriceAlertModalProps) => {
  const { lang, t } = useLang();
  const [selected, setSelected] = useState<Set<string>>(new Set([initialPlatoId]));
  const [canal, setCanal] = useState<"email" | "whatsapp">("email");
  const [contacto, setContacto] = useState("");
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  const availablePlatos = platos.filter((p) => p.disponible && p.precio > 0);
  const allSelected = availablePlatos.length > 0 && availablePlatos.every((p) => selected.has(p.id));

  const toggleAll = () => {
    if (allSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(availablePlatos.map((p) => p.id)));
    }
  };

  const toggle = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  };

  const getName = (p: Plato) => (lang === "en" && p.nombre_en) ? p.nombre_en : p.nombre;

  const handleSubmit = async () => {
    if (selected.size === 0 || !contacto.trim()) return;
    setSaving(true);
    const rows = Array.from(selected).map((plato_id) => ({
      plato_id,
      canal,
      contacto: contacto.trim(),
    }));
    await supabase.from("alertas_precio").insert(rows);
    setSaving(false);
    setDone(true);
  };

  if (done) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4" onClick={onClose}>
        <div className="bg-carbon border border-crema/10 rounded-lg w-full max-w-md p-8 text-center" onClick={(e) => e.stopPropagation()}>
          <Bell size={40} className="text-ambar mx-auto mb-4" />
          <h3 className="font-display font-bold italic text-xl text-crema mb-2">
            {t("alert.success.title")}
          </h3>
          <p className="font-body text-sm text-crema2">
            {t("alert.success.desc")}
          </p>
          <button onClick={onClose} className="mt-6 px-6 py-2 rounded bg-ambar text-negro font-body font-semibold text-sm hover:bg-ambar/90 transition-colors">
            {t("alert.success.close")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4" onClick={onClose}>
      <div className="bg-carbon border border-crema/10 rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-start mb-5">
          <div>
            <h3 className="font-display font-bold italic text-lg text-crema">
              {t("alert.title")}
            </h3>
            <p className="font-body text-xs text-crema2 mt-1">
              {t("alert.subtitle")}
            </p>
          </div>
          <button onClick={onClose} className="text-gris hover:text-crema transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Select all */}
        <label className="flex items-center gap-2 mb-3 cursor-pointer group">
          <input
            type="checkbox"
            checked={allSelected}
            onChange={toggleAll}
            className="accent-[#C8860A] w-4 h-4"
          />
          <span className="font-body text-xs text-crema2 uppercase tracking-wider group-hover:text-crema transition-colors">
            {t("alert.selectall")}
          </span>
        </label>

        {/* Platos list */}
        <div className="space-y-1 max-h-[240px] overflow-y-auto mb-5 pr-1">
          {availablePlatos.map((p) => (
            <label
              key={p.id}
              className="flex items-center justify-between gap-2 p-2 rounded cursor-pointer hover:bg-crema/5 transition-colors"
            >
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selected.has(p.id)}
                  onChange={() => toggle(p.id)}
                  className="accent-[#C8860A] w-4 h-4"
                />
                <span className="font-body text-sm text-crema">{getName(p)}</span>
              </div>
              <span className="font-body text-xs text-ambar">${p.precio.toLocaleString()}</span>
            </label>
          ))}
        </div>

        {/* Contact method */}
        <p className="font-body text-xs text-crema2 uppercase tracking-wider mb-3">
          {t("alert.how")}
        </p>
        <div className="flex gap-3 mb-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="canal"
              checked={canal === "email"}
              onChange={() => setCanal("email")}
              className="accent-[#C8860A]"
            />
            <span className="font-body text-sm text-crema">Email</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="canal"
              checked={canal === "whatsapp"}
              onChange={() => setCanal("whatsapp")}
              className="accent-[#C8860A]"
            />
            <span className="font-body text-sm text-crema">WhatsApp</span>
          </label>
        </div>
        <input
          type={canal === "email" ? "email" : "tel"}
          value={contacto}
          onChange={(e) => setContacto(e.target.value)}
          placeholder={canal === "email" ? "tu@email.com" : "+54 9 351 ..."}
          className="w-full px-3 py-2.5 rounded bg-negro border border-crema/10 text-crema font-body text-sm placeholder:text-gris focus:outline-none focus:border-ambar/50 transition-colors mb-5"
        />

        <button
          onClick={handleSubmit}
          disabled={saving || selected.size === 0 || !contacto.trim()}
          className="w-full py-3 rounded bg-ambar text-negro font-body font-bold text-sm uppercase tracking-wider hover:bg-ambar/90 disabled:opacity-40 transition-colors"
        >
          {saving ? "..." : t("alert.activate")}
        </button>
      </div>
    </div>
  );
};

export default PriceAlertModal;
