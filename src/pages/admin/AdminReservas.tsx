import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Reserva {
  id: string;
  nombre: string;
  telefono: string;
  email: string | null;
  fecha: string;
  hora: string;
  personas: number;
  comentarios: string | null;
  evento_id: string | null;
  estado: string;
  created_at: string;
}

interface Evento {
  id: string;
  nombre: string;
}

const ESTADOS = ["pendiente", "confirmada", "cancelada"] as const;
const ESTADO_ICONS: Record<string, string> = { pendiente: "⏳", confirmada: "✅", cancelada: "❌" };
const ESTADO_COLORS: Record<string, string> = {
  pendiente: "text-yellow-400",
  confirmada: "text-green-400",
  cancelada: "text-red-400",
};

const AdminReservas = () => {
  const { toast } = useToast();
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [filtro, setFiltro] = useState<string>("todas");

  const fetchData = async () => {
    const [{ data: r }, { data: e }] = await Promise.all([
      supabase.from("reservas").select("*").order("fecha", { ascending: false }).order("hora", { ascending: false }),
      supabase.from("eventos").select("id, nombre"),
    ]);
    if (r) setReservas(r);
    if (e) setEventos(e);
  };

  useEffect(() => {
    fetchData();
    const channel = supabase
      .channel("reservas-admin")
      .on("postgres_changes", { event: "*", schema: "public", table: "reservas" }, () => fetchData())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const getEventoNombre = (eventoId: string | null) => {
    if (!eventoId) return null;
    return eventos.find(e => e.id === eventoId)?.nombre || null;
  };

  const changeEstado = async (reserva: Reserva, nuevoEstado: string) => {
    await supabase.from("reservas").update({ estado: nuevoEstado }).eq("id", reserva.id);

    // Open WhatsApp to notify client
    const tel = reserva.telefono.replace(/\D/g, "");
    let msg = "";

    if (nuevoEstado === "confirmada") {
      msg = `Hola ${reserva.nombre}! Tu reserva en Estación 27 para ${reserva.personas} personas el ${reserva.fecha} a las ${reserva.hora} está *confirmada*. ¡Te esperamos! 🍽️`;
    } else if (nuevoEstado === "cancelada") {
      msg = `Hola ${reserva.nombre}, lamentablemente debemos cancelar tu reserva del ${reserva.fecha} a las ${reserva.hora}. Disculpá los inconvenientes. Llamanos al (0351) 425-1651 para reprogramar. Estación 27`;
    }

    if (msg) {
      window.open(`https://wa.me/${tel}?text=${encodeURIComponent(msg)}`, "_blank");
    }

    toast({ title: `Reserva ${nuevoEstado}` });
    fetchData();
  };

  const filtered = filtro === "todas" ? reservas : reservas.filter(r => r.estado === filtro);

  return (
    <div>
      <h1 className="text-xl font-semibold text-[#f0e8d0] mb-6">Reservas</h1>

      {/* Filters */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {["todas", "pendiente", "confirmada", "cancelada"].map(f => (
          <button
            key={f}
            onClick={() => setFiltro(f)}
            className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
              filtro === f
                ? "bg-[#C8860A] text-white"
                : "bg-[#1a1a1a] text-[#999] border border-[#333] hover:text-[#f0e8d0]"
            }`}
          >
            {f === "todas" ? "Todas" : `${ESTADO_ICONS[f]} ${f.charAt(0).toUpperCase() + f.slice(1)}s`}
          </button>
        ))}
      </div>

      {/* Reservations list */}
      <div className="space-y-3">
        {filtered.length === 0 && (
          <p className="text-[#666] text-sm">No hay reservas {filtro !== "todas" ? filtro + "s" : ""}.</p>
        )}
        {filtered.map(r => (
          <div key={r.id} className="bg-[#1a1a1a] border border-[#222] rounded-lg p-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-[#f0e8d0] font-semibold">{r.nombre}</span>
                  <span className={`text-xs font-medium ${ESTADO_COLORS[r.estado]}`}>
                    {ESTADO_ICONS[r.estado]} {r.estado.toUpperCase()}
                  </span>
                </div>
                <div className="text-sm text-[#999] flex flex-wrap gap-x-4 gap-y-1">
                  <span>📅 {r.fecha}</span>
                  <span>🕐 {r.hora}</span>
                  <span>👥 {r.personas} personas</span>
                </div>
                <div className="text-sm text-[#999] flex flex-wrap gap-x-4 gap-y-1">
                  <a
                    href={`https://wa.me/${r.telefono.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-400 hover:underline"
                  >
                    📞 {r.telefono}
                  </a>
                  {r.email && <span>📧 {r.email}</span>}
                </div>
                {r.comentarios && (
                  <p className="text-sm text-[#777] italic">💬 {r.comentarios}</p>
                )}
                {r.evento_id && (
                  <p className="text-sm text-[#C8860A]">🎉 {getEventoNombre(r.evento_id)}</p>
                )}
              </div>

              {/* Status change */}
              <div className="flex gap-2 shrink-0">
                {ESTADOS.filter(e => e !== r.estado).map(estado => (
                  <button
                    key={estado}
                    onClick={() => changeEstado(r, estado)}
                    className={`text-xs px-3 py-1.5 rounded border transition-colors ${
                      estado === "confirmada"
                        ? "border-green-600 text-green-400 hover:bg-green-900/30"
                        : estado === "cancelada"
                        ? "border-red-600 text-red-400 hover:bg-red-900/30"
                        : "border-yellow-600 text-yellow-400 hover:bg-yellow-900/30"
                    }`}
                  >
                    {ESTADO_ICONS[estado]} {estado.charAt(0).toUpperCase() + estado.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminReservas;
