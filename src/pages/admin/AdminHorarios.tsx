import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Horario {
  id: string;
  dia: string;
  hora_apertura: string;
  hora_cierre: string;
  cerrado: boolean;
}

const diasOrden = ["lunes", "martes", "miércoles", "jueves", "viernes", "sábado", "domingo"];

const AdminHorarios = () => {
  const [horarios, setHorarios] = useState<Horario[]>([]);
  const [saving, setSaving] = useState(false);

  const fetchHorarios = async () => {
    const { data } = await supabase.from("horarios").select("*");
    if (data) {
      const sorted = data.sort((a, b) => diasOrden.indexOf(a.dia) - diasOrden.indexOf(b.dia));
      setHorarios(sorted);
    }
  };

  useEffect(() => { fetchHorarios(); }, []);

  const update = (id: string, field: string, value: string | boolean) => {
    setHorarios((prev) => prev.map((h) => (h.id === id ? { ...h, [field]: value } : h)));
  };

  const handleSave = async () => {
    setSaving(true);
    for (const h of horarios) {
      await supabase.from("horarios").update({
        hora_apertura: h.hora_apertura,
        hora_cierre: h.hora_cierre,
        cerrado: h.cerrado,
      }).eq("id", h.id);
    }
    toast.success("Horarios guardados");
    setSaving(false);
  };

  return (
    <div>
      <h2 className="text-[#f0e8d0] text-xl font-semibold mb-6">Horarios</h2>
      <div className="space-y-3 max-w-lg">
        {horarios.map((h) => (
          <div key={h.id} className="flex items-center gap-3 p-3 rounded bg-[#1a1a1a] border border-[#333]">
            <span className="text-sm text-[#f0e8d0] w-24 capitalize">{h.dia}</span>
            <input
              type="time"
              value={h.hora_apertura}
              onChange={(e) => update(h.id, "hora_apertura", e.target.value)}
              disabled={h.cerrado}
              className="admin-input w-28 disabled:opacity-30"
            />
            <span className="text-[#666] text-xs">a</span>
            <input
              type="time"
              value={h.hora_cierre}
              onChange={(e) => update(h.id, "hora_cierre", e.target.value)}
              disabled={h.cerrado}
              className="admin-input w-28 disabled:opacity-30"
            />
            <label className="flex items-center gap-1.5 text-xs text-[#888] cursor-pointer ml-auto">
              <input
                type="checkbox"
                checked={h.cerrado}
                onChange={(e) => update(h.id, "cerrado", e.target.checked)}
                className="accent-[#C8860A]"
              />
              Cerrado
            </label>
          </div>
        ))}
      </div>
      <button
        onClick={handleSave}
        disabled={saving}
        className="mt-6 px-6 py-2 rounded bg-[#C8860A] text-[#111] font-semibold text-sm hover:bg-[#d4950f] disabled:opacity-50"
      >
        {saving ? "Guardando..." : "Guardar horarios"}
      </button>
    </div>
  );
};

export default AdminHorarios;
