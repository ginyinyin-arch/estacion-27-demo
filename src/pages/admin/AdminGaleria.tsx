import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Trash2, RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface GaleriaItem {
  id: string;
  imagen_url: string;
  orden: number;
}

const AdminGaleria = () => {
  const [items, setItems] = useState<GaleriaItem[]>([]);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchItems = async () => {
    const { data } = await supabase.from("galeria").select("*").order("orden", { ascending: true });
    if (data) setItems(data);
  };

  useEffect(() => {
    fetchItems();
    const channel = supabase
      .channel("galeria-admin")
      .on("postgres_changes", { event: "*", schema: "public", table: "galeria" }, () => fetchItems())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const handleUpload = async (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Máximo 5MB por foto");
      return;
    }
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (!["jpg", "jpeg", "png", "webp"].includes(ext || "")) {
      toast.error("Solo JPG, PNG o WEBP");
      return;
    }
    const path = `galeria/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("imagenes").upload(path, file);
    if (error) { toast.error("Error al subir"); return; }
    const { data: urlData } = supabase.storage.from("imagenes").getPublicUrl(path);
    await supabase.from("galeria").insert({ imagen_url: urlData.publicUrl, orden: items.length + 1 });
    toast.success("Foto agregada");
  };

  const handleReplace = async (id: string, file: File) => {
    if (file.size > 5 * 1024 * 1024) { toast.error("Máximo 5MB"); return; }
    const ext = file.name.split(".").pop()?.toLowerCase();
    const path = `galeria/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("imagenes").upload(path, file);
    if (error) { toast.error("Error al subir"); return; }
    const { data: urlData } = supabase.storage.from("imagenes").getPublicUrl(path);
    await supabase.from("galeria").update({ imagen_url: urlData.publicUrl }).eq("id", id);
    toast.success("Foto reemplazada");
  };

  const handleDelete = async (id: string) => {
    await supabase.from("galeria").delete().eq("id", id);
    toast.success("Foto eliminada");
    setDeleting(null);
  };

  return (
    <div>
      <h2 className="text-[#f0e8d0] text-xl font-semibold mb-6">Galería</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {items.map((item) => (
          <div key={item.id} className="relative group rounded overflow-hidden border border-[#333] aspect-square bg-[#1a1a1a]">
            <img src={item.imagen_url} alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <label className="p-2 bg-[#C8860A] rounded cursor-pointer hover:bg-[#d4950f]" title="Reemplazar">
                <RefreshCw size={16} className="text-[#111]" />
                <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => e.target.files?.[0] && handleReplace(item.id, e.target.files[0])} />
              </label>
              {deleting === item.id ? (
                <div className="flex gap-1">
                  <button onClick={() => handleDelete(item.id)} className="p-2 bg-red-600 rounded text-white text-xs">Sí</button>
                  <button onClick={() => setDeleting(null)} className="p-2 bg-[#333] rounded text-white text-xs">No</button>
                </div>
              ) : (
                <button onClick={() => setDeleting(item.id)} className="p-2 bg-red-600/80 rounded hover:bg-red-600" title="Eliminar">
                  <Trash2 size={16} className="text-white" />
                </button>
              )}
            </div>
          </div>
        ))}

        {/* Add button */}
        <label className="aspect-square rounded border-2 border-dashed border-[#333] flex flex-col items-center justify-center cursor-pointer hover:border-[#C8860A] transition-colors bg-[#1a1a1a]">
          <Plus size={24} className="text-[#666]" />
          <span className="text-xs text-[#666] mt-1">Agregar foto</span>
          <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])} />
        </label>
      </div>
    </div>
  );
};

export default AdminGaleria;
