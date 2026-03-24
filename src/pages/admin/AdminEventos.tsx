import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from "@/components/ui/alert-dialog";

interface Evento {
  id: string; nombre: string; descripcion: string | null; fecha: string;
  hora_inicio: string; imagen_url: string | null; precio_entrada: number;
  requiere_reserva: boolean; activo: boolean; created_at: string;
}

const AdminEventos = () => {
  const { toast } = useToast();
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [fecha, setFecha] = useState<Date>();
  const [horaInicio, setHoraInicio] = useState("21:00");
  const [precioEntrada, setPrecioEntrada] = useState("0");
  const [requiereReserva, setRequiereReserva] = useState(false);
  const [imagenFile, setImagenFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchEventos = async () => {
    const { data } = await supabase.from("eventos").select("*").order("fecha", { ascending: true });
    if (data) setEventos(data);
  };

  useEffect(() => {
    fetchEventos();
    const ch = supabase.channel("admin-eventos")
      .on("postgres_changes", { event: "*", schema: "public", table: "eventos" }, () => fetchEventos())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  const publicar = async () => {
    if (!nombre || !fecha) {
      toast({ title: "Nombre y fecha son requeridos", variant: "destructive" }); return;
    }
    setLoading(true);
    let imagenUrl: string | null = null;
    if (imagenFile) {
      const ext = imagenFile.name.split(".").pop();
      const path = `eventos/${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from("imagenes").upload(path, imagenFile);
      if (!error) {
        const { data: urlData } = supabase.storage.from("imagenes").getPublicUrl(path);
        imagenUrl = urlData.publicUrl;
      }
    }
    const { data: newEvento } = await supabase.from("eventos").insert({
      nombre, descripcion: descripcion || null,
      fecha: format(fecha, "yyyy-MM-dd"), hora_inicio: horaInicio,
      imagen_url: imagenUrl, precio_entrada: Number(precioEntrada),
      requiere_reserva: requiereReserva,
    }).select("id").single();
    if (newEvento) {
      supabase.functions.invoke("auto-translate", { body: { table: "eventos", id: newEvento.id, fields: { nombre, descripcion: descripcion || null } } });
    }
    toast({ title: "Evento publicado" });
    setNombre(""); setDescripcion(""); setFecha(undefined); setPrecioEntrada("0");
    setRequiereReserva(false); setImagenFile(null);
    setLoading(false);
  };

  const eliminar = async () => {
    if (!deleteId) return;
    await supabase.from("eventos").delete().eq("id", deleteId);
    toast({ title: "Evento eliminado" });
    setDeleteId(null);
  };

  const hoy = new Date().toISOString().split("T")[0];
  const futuros = eventos.filter(e => e.fecha >= hoy && e.activo);
  const pasados = eventos.filter(e => e.fecha < hoy || !e.activo);

  return (
    <div>
      <h1 className="text-xl font-semibold text-[#f0e8d0] mb-6">Eventos y Noches Especiales</h1>

      <div className="bg-[#1a1a1a] border border-[#222] rounded-lg p-5 space-y-4 mb-8">
        <div>
          <label className="block text-sm text-[#999] mb-1">Nombre del evento *</label>
          <input type="text" value={nombre} onChange={e => setNombre(e.target.value)}
            className="w-full bg-[#111] border border-[#333] text-[#f0e8d0] rounded px-3 py-2 text-sm"
            placeholder="Ej: Noche de Jazz, After Office..." />
        </div>
        <div>
          <label className="block text-sm text-[#999] mb-1">Descripción (opcional)</label>
          <textarea value={descripcion} onChange={e => setDescripcion(e.target.value)} rows={2}
            className="w-full bg-[#111] border border-[#333] text-[#f0e8d0] rounded px-3 py-2 text-sm resize-none"
            placeholder="Breve descripción del evento..." />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-[#999] mb-1">Fecha *</label>
            <Popover>
              <PopoverTrigger asChild>
                <button className={cn(
                  "w-full flex items-center gap-2 bg-[#111] border border-[#333] text-sm rounded px-3 py-2",
                  fecha ? "text-[#f0e8d0]" : "text-[#666]"
                )}>
                  <CalendarIcon size={14} />
                  {fecha ? format(fecha, "PPP", { locale: es }) : "Elegir fecha"}
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-[#1a1a1a] border-[#333]" align="start">
                <Calendar mode="single" selected={fecha} onSelect={setFecha}
                  disabled={d => d < new Date()} className="p-3 pointer-events-auto" />
              </PopoverContent>
            </Popover>
          </div>
          <div>
            <label className="block text-sm text-[#999] mb-1">Hora de inicio</label>
            <input type="time" value={horaInicio} onChange={e => setHoraInicio(e.target.value)}
              className="w-full bg-[#111] border border-[#333] text-[#f0e8d0] rounded px-3 py-2 text-sm" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-[#999] mb-1">Precio entrada ($0 = gratis)</label>
            <input type="number" value={precioEntrada} onChange={e => setPrecioEntrada(e.target.value)}
              className="w-full bg-[#111] border border-[#333] text-[#f0e8d0] rounded px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm text-[#999] mb-1">Imagen (opcional)</label>
            <input type="file" accept="image/jpeg,image/png,image/webp"
              onChange={e => setImagenFile(e.target.files?.[0] || null)}
              className="w-full bg-[#111] border border-[#333] text-[#999] rounded px-3 py-1.5 text-sm file:bg-transparent file:border-0 file:text-[#999]" />
          </div>
        </div>
        <label className="flex items-center gap-3 cursor-pointer">
          <div className={`w-10 h-5 rounded-full transition-colors relative ${requiereReserva ? "bg-[#C8860A]" : "bg-[#333]"}`}
            onClick={() => setRequiereReserva(!requiereReserva)}>
            <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${requiereReserva ? "left-5" : "left-0.5"}`} />
          </div>
          <span className="text-sm text-[#999]">Requiere reserva</span>
        </label>

        <button onClick={publicar} disabled={loading}
          className="w-full bg-[#C8860A] hover:bg-[#a06d08] text-white font-semibold py-2.5 rounded transition-colors disabled:opacity-50">
          {loading ? "Publicando..." : "PUBLICAR EVENTO"}
        </button>
      </div>

      {/* Próximos eventos */}
      {futuros.length > 0 && (
        <div className="mb-8">
          <h2 className="text-sm font-medium text-[#C8860A] mb-3">Próximos eventos</h2>
          <div className="space-y-2">
            {futuros.map(e => (
              <div key={e.id} className="bg-[#1a1a1a] border border-[#222] rounded-lg p-4 flex justify-between items-start">
                <div>
                  <p className="text-[#f0e8d0] font-medium">{e.nombre}</p>
                  {e.descripcion && <p className="text-[#999] text-sm">{e.descripcion}</p>}
                  <p className="text-[#666] text-xs mt-1">
                    {new Date(e.fecha + "T12:00:00").toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" })} — {e.hora_inicio}hs
                    {e.precio_entrada > 0 && ` — $${e.precio_entrada}`}
                    {e.precio_entrada === 0 && ` — Gratis`}
                    {e.requiere_reserva && " — Reserva requerida"}
                  </p>
                </div>
                <button onClick={() => setDeleteId(e.id)} className="text-[#666] hover:text-red-400 p-1">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pasados */}
      {pasados.length > 0 && (
        <div>
          <h2 className="text-sm font-medium text-[#999] mb-3">Pasados</h2>
          <div className="space-y-2">
            {pasados.slice(0, 10).map(e => (
              <div key={e.id} className="bg-[#1a1a1a] border border-[#222] rounded p-3 flex justify-between text-sm opacity-60">
                <span className="text-[#999]">{e.nombre}</span>
                <span className="text-[#666]">{new Date(e.fecha + "T12:00:00").toLocaleDateString("es-AR")}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent className="bg-[#1a1a1a] border-[#333]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[#f0e8d0]">Eliminar evento</AlertDialogTitle>
            <AlertDialogDescription className="text-[#999]">¿Seguro? Esta acción no se puede deshacer.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-[#333] text-[#999]">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={eliminar} className="bg-red-600 hover:bg-red-700">Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminEventos;
