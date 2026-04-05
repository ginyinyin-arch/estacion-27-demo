import { useState, useEffect, useRef, useCallback } from "react";
import { X, Bell } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useLang } from "@/contexts/LangContext";
import SmartPhoneInput from "@/components/SmartPhoneInput";

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

const CategoryCheckbox = ({
  checked,
  indeterminate,
  onChange,
}: {
  checked: boolean;
  indeterminate: boolean;
  onChange: () => void;
}) => {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (ref.current) ref.current.indeterminate = indeterminate;
  }, [indeterminate]);
  return (
    <input
      ref={ref}
      type="checkbox"
      checked={checked}
      onChange={onChange}
      className="accent-[#C8860A] w-4 h-4"
    />
  );
};

const PriceAlertModal = ({ platos, initialPlatoId, onClose }: PriceAlertModalProps) => {
  const { lang, t } = useLang();
  const [selected, setSelected] = useState<Set<string>>(new Set([initialPlatoId]));
  const [emailChecked, setEmailChecked] = useState(false);
  const [whatsappChecked, setWhatsappChecked] = useState(false);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; phone?: string }>({});

  const normalizePhone = (v: string) => {
    let cleaned = v.replace(/[\s\-\(\)]/g, "").replace(/[^+\d]/g, "");
    if (!cleaned.startsWith("+")) cleaned = "+" + cleaned;
    return cleaned;
  };
  const isValidEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());
  const isValidPhone = (v: string) => {
    const n = normalizePhone(v);
    const digits = n.slice(1);
    return /^\d+$/.test(digits) && digits.length >= 6 && digits.length <= 15;
  };

  const canSubmit = selected.size > 0 && (emailChecked || whatsappChecked) &&
    (!emailChecked || (email.trim() && isValidEmail(email))) &&
    (!whatsappChecked || (phone.trim() && isValidPhone(phone)));

  const availablePlatos = platos.filter((p) => p.disponible && p.precio > 0);

  // Group by category
  const categories = Array.from(new Set(availablePlatos.map((p) => p.categoria)));
  const platosByCategory = (cat: string) => availablePlatos.filter((p) => p.categoria === cat);

  const allSelected = availablePlatos.length > 0 && availablePlatos.every((p) => selected.has(p.id));

  const toggleAll = () => {
    if (allSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(availablePlatos.map((p) => p.id)));
    }
  };

  const toggleCategory = (cat: string) => {
    const ids = platosByCategory(cat).map((p) => p.id);
    const allChecked = ids.every((id) => selected.has(id));
    const next = new Set(selected);
    if (allChecked) {
      ids.forEach((id) => next.delete(id));
    } else {
      ids.forEach((id) => next.add(id));
    }
    setSelected(next);
  };

  const toggle = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  };

  const getName = (p: Plato) => (lang === "en" && p.nombre_en) ? p.nombre_en : p.nombre;

  const getCategoryState = (cat: string) => {
    const ids = platosByCategory(cat).map((p) => p.id);
    const checkedCount = ids.filter((id) => selected.has(id)).length;
    if (checkedCount === 0) return "none";
    if (checkedCount === ids.length) return "all";
    return "some";
  };

  const handleSubmit = async () => {
    const newErrors: { email?: string; phone?: string } = {};
    if (emailChecked && !isValidEmail(email)) newErrors.email = lang === "en" ? "Invalid email" : "Email inválido";
    if (whatsappChecked && !isValidPhone(phone)) newErrors.phone = lang === "en" ? "Invalid number" : "Número inválido";
    if (Object.keys(newErrors).length) { setErrors(newErrors); return; }
    if (!canSubmit) return;

    setSaving(true);
    const platoIds = Array.from(selected);
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPhone = normalizePhone(phone);

    // Deduplication check
    for (const plato_id of platoIds) {
      if (emailChecked) {
        const { data: existing } = await supabase
          .from("alertas_precio")
          .select("id")
          .eq("plato_id", plato_id)
          .eq("canal", "email")
          .eq("contacto", normalizedEmail)
          .eq("activa", true)
          .limit(1);
        if (existing && existing.length > 0) {
          setErrors({ email: lang === "en" ? "You're already on this dish's list" : "Ya estás en la lista de este plato" });
          setSaving(false);
          return;
        }
      }
      if (whatsappChecked) {
        const { data: existing } = await supabase
          .from("alertas_precio")
          .select("id")
          .eq("plato_id", plato_id)
          .eq("canal", "whatsapp")
          .eq("contacto", normalizedPhone)
          .eq("activa", true)
          .limit(1);
        if (existing && existing.length > 0) {
          setErrors({ phone: lang === "en" ? "You're already on this dish's list" : "Ya estás en la lista de este plato" });
          setSaving(false);
          return;
        }
      }
    }

    const rows: { plato_id: string; canal: string; contacto: string; email?: string; whatsapp?: string }[] = [];
    if (emailChecked) {
      platoIds.forEach((plato_id) => rows.push({ plato_id, canal: "email", contacto: normalizedEmail, email: normalizedEmail }));
    }
    if (whatsappChecked) {
      platoIds.forEach((plato_id) => rows.push({ plato_id, canal: "whatsapp", contacto: normalizedPhone, whatsapp: normalizedPhone }));
    }
    const { error } = await supabase.from("alertas_precio").insert(rows as any);
    setSaving(false);
    if (error) {
      console.error("Error inserting alertas_precio:", error);
      setErrors({ email: lang === "en" ? "There was a problem saving. Try again." : "Hubo un problema al guardar. Intentá de nuevo." });
      return;
    }
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
        <label className="flex items-center gap-2 mb-4 cursor-pointer group">
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

        {/* Platos grouped by category */}
        <div className="space-y-4 max-h-[240px] overflow-y-auto mb-5 pr-1">
          {categories.map((cat) => {
            const state = getCategoryState(cat);
            return (
              <div key={cat}>
                {/* Category header */}
                <label className="flex items-center gap-2 cursor-pointer group mb-1.5">
                  <CategoryCheckbox
                    checked={state === "all"}
                    indeterminate={state === "some"}
                    onChange={() => toggleCategory(cat)}
                  />
                  <span className="font-body text-xs font-semibold text-ambar uppercase tracking-wider group-hover:text-ambar/80 transition-colors">
                    {cat}
                  </span>
                </label>
                {/* Platos in category */}
                <div className="space-y-0.5 ml-6">
                  {platosByCategory(cat).map((p) => (
                    <label
                      key={p.id}
                      className="flex items-center justify-between gap-2 p-1.5 rounded cursor-pointer hover:bg-crema/5 transition-colors"
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
              </div>
            );
          })}
        </div>

        {/* Contact method */}
        <p className="font-body text-xs text-crema2 uppercase tracking-wider mb-3">
          {t("alert.how")}
        </p>
        <div className="space-y-3 mb-5">
          {/* Email option */}
          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={emailChecked}
                onChange={() => { setEmailChecked(!emailChecked); setErrors((e) => ({ ...e, email: undefined })); }}
                className="accent-[#C8860A] w-4 h-4"
              />
              <span className="font-body text-sm text-crema">
                {lang === "en" ? "Notify me by Email" : "Avisarme por Email"}
              </span>
            </label>
            <div
              className="overflow-hidden transition-all duration-300 ease-in-out"
              style={{ maxHeight: emailChecked ? "80px" : "0", opacity: emailChecked ? 1 : 0 }}
            >
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setErrors((er) => ({ ...er, email: undefined })); }}
                placeholder="tu@email.com"
                className="w-full mt-2 px-3 py-2.5 rounded bg-negro border border-crema/10 text-crema font-body text-sm placeholder:text-gris focus:outline-none focus:border-ambar/50 transition-colors"
              />
              {errors.email && <p className="text-red-400 text-xs mt-1 font-body">{errors.email}</p>}
            </div>
          </div>

          {/* WhatsApp option */}
          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={whatsappChecked}
                onChange={() => { setWhatsappChecked(!whatsappChecked); setErrors((e) => ({ ...e, phone: undefined })); }}
                className="accent-[#C8860A] w-4 h-4"
              />
              <span className="font-body text-sm text-crema">
                {lang === "en" ? "Notify me by WhatsApp" : "Avisarme por WhatsApp"}
              </span>
            </label>
            <div
              className="overflow-hidden transition-all duration-300 ease-in-out"
              style={{ maxHeight: whatsappChecked ? "120px" : "0", opacity: whatsappChecked ? 1 : 0 }}
            >
              <SmartPhoneInput
                onChange={(fullNumber) => { setPhone(fullNumber); setErrors((er) => ({ ...er, phone: undefined })); }}
                error={errors.phone}
              />
            </div>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={saving || !canSubmit}
          className="w-full py-3 rounded bg-ambar text-negro font-body font-bold text-sm uppercase tracking-wider hover:bg-ambar/90 disabled:opacity-40 transition-colors"
        >
          {saving ? "..." : t("alert.activate")}
        </button>
        <p className="text-center mt-3">
          <a href="/baja" className="font-body text-[0.72rem] text-gris hover:text-crema2 transition-colors">
            {lang === "en" ? "Already getting alerts? " : "¿Ya recibís alertas? "}
            <span className="underline underline-offset-2">{lang === "en" ? "Cancel" : "Cancelar"}</span>
          </a>
        </p>
      </div>
    </div>
  );
};

export default PriceAlertModal;
