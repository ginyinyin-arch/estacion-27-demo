import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ChevronLeft, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface AlertCount {
  plato_id: string;
  plato_nombre: string;
  count: number;
}

interface AlertDetail {
  id: string;
  canal: string;
  contacto: string;
  created_at: string;
}

const AdminIntereses = () => {
  const [counts, setCounts] = useState<AlertCount[]>([]);
  const [selectedPlato, setSelectedPlato] = useState<AlertCount | null>(null);
  const [details, setDetails] = useState<AlertDetail[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCounts();
  }, []);

  const fetchCounts = async () => {
    setLoading(true);
    const { data: alertas } = await supabase
      .from("alertas_precio")
      .select("plato_id")
      .eq("activa", true);

    const { data: platos } = await supabase
      .from("platos")
      .select("id, nombre");

    if (alertas && platos) {
      const countMap: Record<string, number> = {};
      alertas.forEach((a: any) => {
        countMap[a.plato_id] = (countMap[a.plato_id] || 0) + 1;
      });

      const result: AlertCount[] = platos
        .map((p: any) => ({
          plato_id: p.id,
          plato_nombre: p.nombre,
          count: countMap[p.id] || 0,
        }))
        .filter((x: AlertCount) => x.count > 0)
        .sort((a: AlertCount, b: AlertCount) => b.count - a.count);

      setCounts(result);
    }
    setLoading(false);
  };

  const fetchDetails = async (platoId: string) => {
    const { data } = await supabase
      .from("alertas_precio")
      .select("id, canal, contacto, created_at")
      .eq("plato_id", platoId)
      .eq("activa", true)
      .order("created_at", { ascending: false });
    if (data) setDetails(data);
  };

  const handleClick = async (item: AlertCount) => {
    setSelectedPlato(item);
    await fetchDetails(item.plato_id);
  };

  const handleDelete = async (alertId: string) => {
    if (!confirm("¿Eliminar este interés?")) return;
    const { error } = await supabase
      .from("alertas_precio")
      .delete()
      .eq("id", alertId);
    if (error) {
      toast.error("Error al eliminar");
      return;
    }
    toast.success("Eliminado");
    const newDetails = details.filter((d) => d.id !== alertId);
    setDetails(newDetails);
    // Update counts
    if (selectedPlato) {
      const newCount = newDetails.length;
      setSelectedPlato({ ...selectedPlato, count: newCount });
      setCounts((prev) =>
        prev
          .map((c) => c.plato_id === selectedPlato.plato_id ? { ...c, count: newCount } : c)
          .filter((c) => c.count > 0)
      );
      if (newCount === 0) {
        setSelectedPlato(null);
        setDetails([]);
      }
    }
  };

  if (selectedPlato) {
    return (
      <div>
        <button
          onClick={() => { setSelectedPlato(null); setDetails([]); }}
          className="flex items-center gap-1 text-sm text-[#C8860A] hover:text-[#d4950f] mb-4 transition-colors"
        >
          <ChevronLeft size={16} /> Volver
        </button>
        <h2 className="text-[#f0e8d0] text-xl font-semibold mb-1">{selectedPlato.plato_nombre}</h2>
        <p className="text-[#888] text-sm mb-6">{selectedPlato.count} persona{selectedPlato.count !== 1 ? "s" : ""} interesada{selectedPlato.count !== 1 ? "s" : ""}</p>

        <div className="space-y-2">
          {details.map((d) => (
            <div key={d.id} className="flex items-center justify-between p-3 rounded border border-[#333] bg-[#1a1a1a]">
              <div>
                <span className="text-sm text-[#f0e8d0]">{d.contacto}</span>
                <span className="ml-2 text-[0.65rem] uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#333] text-[#888]">
                  {d.canal}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-[#666]">
                  {new Date(d.created_at).toLocaleDateString()}
                </span>
                <button
                  onClick={() => handleDelete(d.id)}
                  className="text-[#666] hover:text-red-400 transition-colors"
                  title="Eliminar"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
          {details.length === 0 && (
            <p className="text-sm text-[#666]">No hay alertas activas.</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-[#f0e8d0] text-xl font-semibold mb-6">Intereses</h2>
      {loading ? (
        <p className="text-sm text-[#666]">Cargando...</p>
      ) : counts.length === 0 ? (
        <p className="text-sm text-[#666]">Ningún plato tiene alertas de precio activas todavía.</p>
      ) : (
        <div className="space-y-2">
          {counts.map((item) => (
            <button
              key={item.plato_id}
              onClick={() => handleClick(item)}
              className="w-full flex items-center justify-between p-4 rounded border border-[#333] bg-[#1a1a1a] hover:border-[#C8860A]/30 transition-colors text-left"
            >
              <span className="text-sm font-medium text-[#f0e8d0]">{item.plato_nombre}</span>
              <span className="text-sm text-[#C8860A] font-semibold">
                {item.count} persona{item.count !== 1 ? "s" : ""}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminIntereses;
