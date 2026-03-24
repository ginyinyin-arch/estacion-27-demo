import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Pencil, Trash2, X, Ban } from "lucide-react";
import { toast } from "sonner";

interface Plato {
  id: string;
  categoria: string;
  nombre: string;
  descripcion: string | null;
  precio: number;
  imagen_url: string | null;
  disponible: boolean;
  disponible_hasta: string | null;
  orden: number;
}

const categorias = ["Lomos", "Hamburguesas", "Tex Mex", "Ensaladas", "Picadas", "Bar"];

const AdminCarta = () => {
  const [platos, setPlatos] = useState<Plato[]>([]);
  const [editing, setEditing] = useState<Plato | null>(null);
  const [creating, setCreating] = useState<string | null>(null);
  const [disabling, setDisabling] = useState<Plato | null>(null);
  const [deleting, setDeleting] = useState<Plato | null>(null);

  const fetchPlatos = async () => {
    const { data } = await supabase
      .from("platos")
      .select("*")
      .order("orden", { ascending: true });
    if (data) setPlatos(data);
  };

  useEffect(() => {
    fetchPlatos();
    const channel = supabase
      .channel("platos-admin")
      .on("postgres_changes", { event: "*", schema: "public", table: "platos" }, () => fetchPlatos())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const platosPorCategoria = (cat: string) =>
    platos.filter((p) => p.categoria === cat).sort((a, b) => a.orden - b.orden);

  return (
    <div>
      <h2 className="text-[#f0e8d0] text-xl font-semibold mb-6">Carta</h2>

      {categorias.map((cat) => (
        <div key={cat} className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[#C8860A] font-semibold text-sm uppercase tracking-wider">{cat}</h3>
            <button
              onClick={() => setCreating(cat)}
              className="flex items-center gap-1 text-xs text-[#C8860A] hover:text-[#d4950f] transition-colors"
            >
              <Plus size={14} /> Agregar
            </button>
          </div>
          <div className="space-y-2">
            {platosPorCategoria(cat).map((p) => (
              <div
                key={p.id}
                className={`flex items-center justify-between p-3 rounded border transition-colors ${
                  p.disponible
                    ? "bg-[#1a1a1a] border-[#333]"
                    : "bg-[#1a1a1a]/50 border-[#333]/50"
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-medium ${p.disponible ? "text-[#f0e8d0]" : "text-[#666] line-through"}`}>
                      {p.nombre}
                    </span>
                    {!p.disponible && (
                      <span className="text-[0.6rem] px-1.5 py-0.5 bg-[#333] text-[#888] rounded">
                        No disponible
                        {p.disponible_hasta ? ` hasta ${p.disponible_hasta}` : ""}
                      </span>
                    )}
                  </div>
                  {p.descripcion && (
                    <p className="text-xs text-[#888] mt-0.5 truncate">{p.descripcion}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 ml-4 shrink-0">
                  <span className="text-sm text-[#C8860A] font-medium">
                    {p.precio > 0 ? `$${p.precio.toLocaleString()}` : "—"}
                  </span>
                  <button onClick={() => setDisabling(p)} title={p.disponible ? "Deshabilitar" : "Habilitar"} className="p-1.5 text-[#888] hover:text-[#C8860A] transition-colors">
                    <Ban size={14} />
                  </button>
                  <button onClick={() => setEditing(p)} className="p-1.5 text-[#888] hover:text-[#C8860A] transition-colors">
                    <Pencil size={14} />
                  </button>
                  <button onClick={() => setDeleting(p)} className="p-1.5 text-[#888] hover:text-red-400 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Edit/Create modal */}
      {(editing || creating) && (
        <PlatoForm
          plato={editing}
          categoria={creating || editing?.categoria || ""}
          maxOrden={creating ? platosPorCategoria(creating).length + 1 : undefined}
          onClose={() => { setEditing(null); setCreating(null); }}
          onSaved={() => { setEditing(null); setCreating(null); fetchPlatos(); }}
        />
      )}

      {/* Disable modal */}
      {disabling && (
        <DisableModal
          plato={disabling}
          onClose={() => setDisabling(null)}
          onSaved={() => { setDisabling(null); fetchPlatos(); }}
        />
      )}

      {/* Delete confirm */}
      {deleting && (
        <DeleteConfirm
          plato={deleting}
          onClose={() => setDeleting(null)}
          onDeleted={() => { setDeleting(null); fetchPlatos(); }}
        />
      )}
    </div>
  );
};

// ---- PlatoForm ----
function PlatoForm({ plato, categoria, maxOrden, onClose, onSaved }: {
  plato: Plato | null;
  categoria: string;
  maxOrden?: number;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [nombre, setNombre] = useState(plato?.nombre || "");
  const [descripcion, setDescripcion] = useState(plato?.descripcion || "");
  const [precio, setPrecio] = useState(plato?.precio?.toString() || "");
  const [imagenFile, setImagenFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    let imagen_url = plato?.imagen_url || null;
    if (imagenFile) {
      const ext = imagenFile.name.split(".").pop();
      const path = `platos/${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from("imagenes").upload(path, imagenFile);
      if (!error) {
        const { data: urlData } = supabase.storage.from("imagenes").getPublicUrl(path);
        imagen_url = urlData.publicUrl;
      }
    }

    if (plato) {
      const newPrecio = Number(precio);
      await supabase.from("platos").update({ nombre, descripcion: descripcion || null, precio: newPrecio, imagen_url }).eq("id", plato.id);
      // Trigger auto-translate
      supabase.functions.invoke("auto-translate", { body: { table: "platos", id: plato.id, fields: { nombre, descripcion: descripcion || null } } });
      // Notify price drop subscribers if price decreased
      if (newPrecio < plato.precio) {
        supabase.functions.invoke("notify-price-drop", { body: { plato_id: plato.id, precio_anterior: plato.precio, precio_nuevo: newPrecio } });
      }
      toast.success("Plato actualizado");
    } else {
      const { data: newPlato } = await supabase.from("platos").insert({ categoria, nombre, descripcion: descripcion || null, precio: Number(precio), imagen_url, orden: maxOrden || 1 }).select("id").single();
      if (newPlato) {
        supabase.functions.invoke("auto-translate", { body: { table: "platos", id: newPlato.id, fields: { nombre, descripcion: descripcion || null } } });
      }
      toast.success("Plato agregado");
    }
    setSaving(false);
    onSaved();
  };

  return (
    <Modal onClose={onClose} title={plato ? "Editar plato" : "Nuevo plato"}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormInput label="Nombre" value={nombre} onChange={setNombre} required />
        <div>
          <label className="block text-xs text-[#888] mb-1">Descripción</label>
          <textarea value={descripcion} onChange={(e) => setDescripcion(e.target.value)} className="admin-input h-20 resize-none" />
        </div>
        <FormInput label="Precio" type="number" value={precio} onChange={setPrecio} required />
        <div>
          <label className="block text-xs text-[#888] mb-1">Imagen</label>
          <input type="file" accept="image/*" onChange={(e) => setImagenFile(e.target.files?.[0] || null)} className="text-xs text-[#888]" />
        </div>
        <div className="flex gap-2 pt-2">
          <button type="submit" disabled={saving} className="flex-1 py-2 rounded bg-[#C8860A] text-[#111] font-semibold text-sm hover:bg-[#d4950f] disabled:opacity-50">
            {saving ? "Guardando..." : "Guardar cambios"}
          </button>
          <button type="button" onClick={onClose} className="px-4 py-2 rounded border border-[#333] text-[#888] text-sm hover:text-[#f0e8d0]">
            Cancelar
          </button>
        </div>
      </form>
    </Modal>
  );
}

// ---- DisableModal ----
function DisableModal({ plato, onClose, onSaved }: { plato: Plato; onClose: () => void; onSaved: () => void }) {
  const [mode, setMode] = useState<"indefinido" | "fecha">("indefinido");
  const [fecha, setFecha] = useState("");
  const [saving, setSaving] = useState(false);

  const handleToggle = async () => {
    setSaving(true);
    if (!plato.disponible) {
      await supabase.from("platos").update({ disponible: true, disponible_hasta: null }).eq("id", plato.id);
      toast.success("Plato reactivado");
    } else {
      await supabase.from("platos").update({
        disponible: false,
        disponible_hasta: mode === "fecha" ? fecha : null,
      }).eq("id", plato.id);
      toast.success("Plato deshabilitado");
    }
    setSaving(false);
    onSaved();
  };

  if (!plato.disponible) {
    return (
      <Modal onClose={onClose} title="Reactivar plato">
        <p className="text-sm text-[#ccc] mb-4">¿Reactivar "{plato.nombre}"?</p>
        <button onClick={handleToggle} disabled={saving} className="w-full py-2 rounded bg-green-700 text-white text-sm font-semibold hover:bg-green-600 disabled:opacity-50">
          {saving ? "..." : "Reactivar"}
        </button>
      </Modal>
    );
  }

  return (
    <Modal onClose={onClose} title="Deshabilitar plato">
      <p className="text-sm text-[#ccc] mb-4">"{plato.nombre}" no aparecerá como disponible.</p>
      <div className="space-y-3 mb-4">
        <label className="flex items-center gap-2 text-sm text-[#ccc] cursor-pointer">
          <input type="radio" name="mode" checked={mode === "indefinido"} onChange={() => setMode("indefinido")} className="accent-[#C8860A]" />
          Sin fecha (hasta nuevo aviso)
        </label>
        <label className="flex items-center gap-2 text-sm text-[#ccc] cursor-pointer">
          <input type="radio" name="mode" checked={mode === "fecha"} onChange={() => setMode("fecha")} className="accent-[#C8860A]" />
          Disponible de nuevo el:
        </label>
        {mode === "fecha" && (
          <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} className="admin-input" />
        )}
      </div>
      <button onClick={handleToggle} disabled={saving || (mode === "fecha" && !fecha)} className="w-full py-2 rounded bg-[#C8860A] text-[#111] text-sm font-semibold hover:bg-[#d4950f] disabled:opacity-50">
        {saving ? "..." : "Deshabilitar"}
      </button>
    </Modal>
  );
}

// ---- DeleteConfirm ----
function DeleteConfirm({ plato, onClose, onDeleted }: { plato: Plato; onClose: () => void; onDeleted: () => void }) {
  const [deleting, setDeleting] = useState(false);
  const handleDelete = async () => {
    setDeleting(true);
    await supabase.from("platos").delete().eq("id", plato.id);
    toast.success("Plato eliminado");
    setDeleting(false);
    onDeleted();
  };

  return (
    <Modal onClose={onClose} title="Eliminar plato">
      <p className="text-sm text-[#ccc] mb-4">
        ¿Seguro que querés eliminar "{plato.nombre}"? Esta acción no se puede deshacer.
      </p>
      <div className="flex gap-2">
        <button onClick={handleDelete} disabled={deleting} className="flex-1 py-2 rounded bg-red-600 text-white text-sm font-semibold hover:bg-red-500 disabled:opacity-50">
          {deleting ? "..." : "Eliminar"}
        </button>
        <button onClick={onClose} className="flex-1 py-2 rounded border border-[#333] text-[#888] text-sm hover:text-[#f0e8d0]">
          Cancelar
        </button>
      </div>
    </Modal>
  );
}

// ---- Shared components ----
function Modal({ children, onClose, title }: { children: React.ReactNode; onClose: () => void; title: string }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4" onClick={onClose}>
      <div className="bg-[#1a1a1a] border border-[#333] rounded-lg w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-[#f0e8d0] font-semibold">{title}</h3>
          <button onClick={onClose} className="text-[#666] hover:text-[#f0e8d0]"><X size={18} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

function FormInput({ label, value, onChange, type = "text", required = false }: {
  label: string; value: string; onChange: (v: string) => void; type?: string; required?: boolean;
}) {
  return (
    <div>
      <label className="block text-xs text-[#888] mb-1">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} required={required} className="admin-input" />
    </div>
  );
}

export default AdminCarta;
