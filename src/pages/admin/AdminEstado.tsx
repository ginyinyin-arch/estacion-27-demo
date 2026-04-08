import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface EstadoLocal {
  id: string;
  abierto: boolean;
  motivo_cierre: string | null;
  fecha_vuelta: string | null;
}

const AdminEstado = () => {
  const [estado, setEstado] = useState<EstadoLocal | null>(null);
  const [motivo, setMotivo] = useState("");
  const [fecha, setFecha] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchEstado = async () => {
    const { data } = await supabase.from("estado_local").select("*").limit(1).single();
    if (data) {
      setEstado(data);
      setMotivo(data.motivo_cierre || "");
      setFecha(data.fecha_vuelta || "");
    }
  };

  useEffect(() => { fetchEstado(); }, []);

  const handleToggle = async () => {
    if (!estado) return;
    setSaving(true);
    const newAbierto = !estado.abierto;
    const updates = {
      abierto: newAbierto,
      updated_at: new Date().toISOString(),
      motivo_cierre: newAbierto ? null : (motivo || null),
      fecha_vuelta: newAbierto ? null : (fecha || null),
    };
    await supabase.from("estado_local").update(updates).eq("id", estado.id);
    toast.success(newAbierto ? "Local marcado como abierto" : "Local marcado como cerrado");
    await fetchEstado();
    setSaving(false);
  };

  if (!estado) return null;

  return (
    <div>
      <h2 className="text-[#f0e8d0] text-xl font-semibold mb-8">Estado del Local</h2>
      <div className="max-w-md mx-auto text-center">
        <button
          onClick={estado.abierto ? undefined : handleToggle}
          disabled={saving}
          className={`w-48 h-48 rounded-full text-2xl font-bold transition-all ${
            estado.abierto
              ? "bg-green-700/20 border-4 border-green-500 text-green-400"
              : "bg-red-700/20 border-4 border-red-500 text-red-400"
          }`}
          style={{ cursor: !estado.abierto ? "pointer" : "default" }}
        >
          {estado.abierto ? "ABIERTO" : "CERRADO"}
        </button>

        {estado.abierto ? (
          <div className="mt-8 space-y-4">
            <p className="text-sm text-[#888]">Para cerrar, completá los datos opcionales:</p>
            <input
              type="text"
              placeholder="Motivo: Vacaciones, Refacción, Feriado..."
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              className="admin-input w-full"
            />
            <input
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              className="admin-input w-full"
            />
            <button
              onClick={handleToggle}
              disabled={saving}
              className="w-full py-3 rounded bg-red-600 text-white font-semibold text-sm hover:bg-red-500 disabled:opacity-50"
            >
              {saving ? "..." : "Marcar como CERRADO"}
            </button>
          </div>
        ) : (
          <div className="mt-8">
            {estado.motivo_cierre && <p className="text-sm text-[#ccc]">Motivo: {estado.motivo_cierre}</p>}
            {estado.fecha_vuelta && <p className="text-sm text-[#888] mt-1">Volvemos el: {estado.fecha_vuelta}</p>}
            <button
              onClick={handleToggle}
              disabled={saving}
              className="mt-4 w-full py-3 rounded bg-green-700 text-white font-semibold text-sm hover:bg-green-600 disabled:opacity-50"
            >
              {saving ? "..." : "Reabrir local"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminEstado;
