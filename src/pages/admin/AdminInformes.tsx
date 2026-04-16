import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  ResponsiveContainer, Tooltip, Legend, XAxis, YAxis, CartesianGrid,
} from "recharts";
import { DollarSign, Package, Receipt, XCircle, BarChart2 } from "lucide-react";
import type { Json } from "@/integrations/supabase/types";

type Periodo = "hoy" | "semana" | "mes" | "todo";

const PERIODOS: { key: Periodo; label: string }[] = [
  { key: "hoy", label: "Hoy" },
  { key: "semana", label: "Esta semana" },
  { key: "mes", label: "Este mes" },
  { key: "todo", label: "Todo" },
];

const ESTADO_COLORS: Record<string, string> = {
  pagado: "#22c55e",
  listo: "#10b981",
  en_preparacion: "#3b82f6",
  pendiente_efectivo: "#6b7280",
  en_espera: "#f97316",
  rechazado: "#ef4444",
  cancelado: "#991b1b",
  pendiente: "#eab308",
};

const METODO_COLORS: Record<string, string> = {
  mercadopago: "#f59e0b",
  efectivo: "#9ca3af",
};

const DORADO = "#C8860A";

interface PedidoRow {
  id: string;
  created_at: string;
  estado: string;
  total: number;
  items: Json;
  metodo_pago: string;
  programado_para: string | null;
}

interface ReservaRow {
  id: string;
  created_at: string;
  estado: string;
}

interface AlertaRow {
  id: string;
  canal: string;
  plato_id: string;
}

interface ParsedItem {
  nombre: string;
  cantidad: number;
  precio: number;
}

function getDateRange(periodo: Periodo): Date | null {
  const now = new Date();
  if (periodo === "todo") return null;
  if (periodo === "hoy") return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (periodo === "semana") {
    const d = new Date(now);
    d.setDate(d.getDate() - 7);
    return d;
  }
  // mes
  const d = new Date(now);
  d.setDate(d.getDate() - 30);
  return d;
}

function parseItems(items: Json): ParsedItem[] {
  if (!items) return [];
  if (!Array.isArray(items)) return [];
  return items.filter((i: any) => i && typeof i === "object" && i.nombre).map((i: any) => ({
    nombre: i.nombre || "?",
    cantidad: Number(i.cantidad) || 0,
    precio: Number(i.precio) || 0,
  }));
}

function formatCurrency(n: number) {
  return "$" + Math.round(n).toLocaleString("es-AR");
}

const DIAS_SEMANA = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

// ─── COMPONENT ─────────────────────────────────────────────────
const AdminInformes = () => {
  const [periodo, setPeriodo] = useState<Periodo>("mes");
  const [pedidos, setPedidos] = useState<PedidoRow[] | null>(null);
  const [reservas, setReservas] = useState<ReservaRow[] | null>(null);
  const [alertas, setAlertas] = useState<AlertaRow[] | null>(null);
  const [errorPedidos, setErrorPedidos] = useState(false);
  const [errorReservas, setErrorReservas] = useState(false);
  const [errorAlertas, setErrorAlertas] = useState(false);

  useEffect(() => {
    const from = getDateRange(periodo);

    const fetchPedidos = async () => {
      setErrorPedidos(false);
      let q = supabase.from("pedidos").select("id,created_at,estado,total,items,metodo_pago,programado_para");
      if (from) q = q.gte("created_at", from.toISOString());
      const { data, error } = await q;
      if (error) { setErrorPedidos(true); setPedidos([]); } else setPedidos(data as PedidoRow[]);
    };

    const fetchReservas = async () => {
      setErrorReservas(false);
      let q = supabase.from("reservas").select("id,created_at,estado");
      if (from) q = q.gte("created_at", from.toISOString());
      const { data, error } = await q;
      if (error) { setErrorReservas(true); setReservas([]); } else setReservas(data as ReservaRow[]);
    };

    const fetchAlertas = async () => {
      setErrorAlertas(false);
      const { data, error } = await supabase.from("alertas_precio").select("id,canal,plato_id").eq("activa", true);
      if (error) { setErrorAlertas(true); setAlertas([]); } else setAlertas(data as AlertaRow[]);
    };

    fetchPedidos();
    fetchReservas();
    fetchAlertas();
  }, [periodo]);

  // ─── DERIVED DATA ────────────────────────────────────────────
  const confirmados = useMemo(() => pedidos?.filter(p => ["pagado", "listo"].includes(p.estado)) ?? [], [pedidos]);
  const activos = useMemo(() => pedidos?.filter(p => ["pagado", "listo", "en_preparacion", "pendiente_efectivo"].includes(p.estado)) ?? [], [pedidos]);

  const ingresos = useMemo(() => confirmados.reduce((s, p) => s + Number(p.total), 0), [confirmados]);
  const totalPedidos = pedidos?.length ?? 0;
  const ticketPromedio = confirmados.length > 0 ? ingresos / confirmados.length : 0;
  const rechazadosCancelados = useMemo(() => pedidos?.filter(p => ["rechazado", "cancelado"].includes(p.estado)).length ?? 0, [pedidos]);
  const tasaRechazo = totalPedidos > 0 ? (rechazadosCancelados / totalPedidos) * 100 : 0;

  // ─── CHART: evolution ─────────────────────────────────
  const evolutionData = useMemo(() => {
    if (!pedidos || pedidos.length === 0) return [];
    const isToday = periodo === "hoy";
    const map = new Map<string, { ingresos: number; cantidad: number }>();

    pedidos.forEach(p => {
      const d = new Date(p.created_at);
      const key = isToday
        ? `${d.getHours().toString().padStart(2, "0")}:00`
        : `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1).toString().padStart(2, "0")}`;
      const cur = map.get(key) || { ingresos: 0, cantidad: 0 };
      cur.cantidad += 1;
      if (["pagado", "listo"].includes(p.estado)) cur.ingresos += Number(p.total);
      map.set(key, cur);
    });

    return Array.from(map.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([label, v]) => ({ label, ...v }));
  }, [pedidos, periodo]);

  // ─── CHART: estado donut ──────────────────────────────
  const estadoDonut = useMemo(() => {
    if (!pedidos || pedidos.length === 0) return [];
    const map = new Map<string, number>();
    pedidos.forEach(p => map.set(p.estado, (map.get(p.estado) || 0) + 1));
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  }, [pedidos]);

  // ─── CHART: metodo donut ──────────────────────────────
  const metodoDonut = useMemo(() => {
    if (!pedidos) return [];
    const valid = pedidos.filter(p => !["pendiente", "rechazado", "cancelado"].includes(p.estado));
    const map = new Map<string, number>();
    valid.forEach(p => map.set(p.metodo_pago, (map.get(p.metodo_pago) || 0) + 1));
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  }, [pedidos]);

  // ─── CHART: hora ──────────────────────────────────────
  const horaData = useMemo(() => {
    if (!pedidos) return [];
    const counts = new Array(24).fill(0);
    pedidos.forEach(p => { counts[new Date(p.created_at).getHours()]++; });
    return counts.map((v, i) => ({ hora: `${i}`, cantidad: v })).filter(d => d.cantidad > 0);
  }, [pedidos]);

  // ─── CHART: dia semana ────────────────────────────────
  const diaData = useMemo(() => {
    if (!pedidos) return [];
    const counts = new Array(7).fill(0);
    pedidos.forEach(p => { counts[new Date(p.created_at).getDay()]++; });
    // Reorder Mon-Sun
    const ordered = [1, 2, 3, 4, 5, 6, 0];
    return ordered.map(i => ({ dia: DIAS_SEMANA[i], cantidad: counts[i] }));
  }, [pedidos]);

  // ─── TOP PRODUCTS ─────────────────────────────────────
  const topProducts = useMemo(() => {
    if (!activos.length) return [];
    const map = new Map<string, { unidades: number; ingresos: number }>();
    activos.forEach(p => {
      parseItems(p.items).forEach(item => {
        const cur = map.get(item.nombre) || { unidades: 0, ingresos: 0 };
        cur.unidades += item.cantidad;
        cur.ingresos += item.cantidad * item.precio;
        map.set(item.nombre, cur);
      });
    });
    return Array.from(map.entries())
      .map(([nombre, v]) => ({ nombre, ...v }))
      .sort((a, b) => b.unidades - a.unidades)
      .slice(0, 10);
  }, [activos]);

  // ─── RESERVAS stats ───────────────────────────────────
  const resStats = useMemo(() => {
    if (!reservas) return { total: 0, confirmadas: 0, pendientes: 0, canceladas: 0 };
    return {
      total: reservas.length,
      confirmadas: reservas.filter(r => r.estado === "confirmada").length,
      pendientes: reservas.filter(r => r.estado === "pendiente").length,
      canceladas: reservas.filter(r => r.estado === "cancelada").length,
    };
  }, [reservas]);

  // ─── ALERTAS stats ────────────────────────────────────
  const alertaStats = useMemo(() => {
    if (!alertas) return { total: 0, byCanal: [] as { canal: string; count: number }[] };
    const map = new Map<string, number>();
    alertas.forEach(a => map.set(a.canal, (map.get(a.canal) || 0) + 1));
    return {
      total: alertas.length,
      byCanal: Array.from(map.entries()).map(([canal, count]) => ({ canal, count })),
    };
  }, [alertas]);

  const loading = pedidos === null;

  const ErrorMsg = () => <p className="text-[#666] text-sm py-4">No se pudieron cargar los datos</p>;
  const EmptyMsg = ({ msg }: { msg: string }) => (
    <div className="flex flex-col items-center py-8 text-[#555]">
      <BarChart2 size={32} className="mb-2 opacity-40" />
      <p className="text-sm">{msg}</p>
    </div>
  );

  return (
    <div className="space-y-6 max-w-6xl">
      <h1 className="font-display text-xl text-[#f0e8d0]">Informes y Datos</h1>

      {/* Period filter */}
      <div className="flex gap-2 flex-wrap sticky top-0 z-10 bg-[#0a0a0a] py-3 -mt-3">
        {PERIODOS.map(p => (
          <button
            key={p.key}
            onClick={() => setPeriodo(p.key)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              periodo === p.key
                ? "bg-[#C8860A] text-[#0a0a0a]"
                : "bg-[#1a1a1a] text-[#999] hover:text-[#f0e8d0] border border-[#2a2a2a]"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* BLOQUE 1 — KPIs */}
      {errorPedidos ? <ErrorMsg /> : loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-24 bg-[#1a1a1a]" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <KpiCard icon={<DollarSign size={16} />} value={formatCurrency(ingresos)} label="Ingresos confirmados" sub="en el período" />
          <KpiCard icon={<Package size={16} />} value={totalPedidos.toString()} label="Pedidos totales" sub="en el período" />
          <KpiCard icon={<Receipt size={16} />} value={formatCurrency(ticketPromedio)} label="Ticket promedio" sub="por pedido" />
          <KpiCard icon={<XCircle size={16} />} value={`${tasaRechazo.toFixed(1)}%`} label="Tasa de rechazo" sub="% del período" />
        </div>
      )}

      {/* BLOQUE 2 — Evolución */}
      <Section title="Evolución de pedidos e ingresos">
        {errorPedidos ? <ErrorMsg /> : loading ? <Skeleton className="h-[220px] bg-[#1a1a1a]" /> : evolutionData.length === 0 ? <EmptyMsg msg="Sin pedidos en este período" /> : (
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={evolutionData}>
              <CartesianGrid stroke="#2a2a2a" strokeDasharray="3 3" />
              <XAxis dataKey="label" tick={{ fill: "#666", fontSize: 11 }} />
              <YAxis yAxisId="left" tick={{ fill: "#666", fontSize: 11 }} tickFormatter={v => `$${v}`} />
              <YAxis yAxisId="right" orientation="right" tick={{ fill: "#666", fontSize: 11 }} />
              <Tooltip contentStyle={{ background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 8, fontSize: 12 }} />
              <Line yAxisId="left" type="monotone" dataKey="ingresos" stroke={DORADO} strokeWidth={2} dot={false} name="Ingresos" />
              <Line yAxisId="right" type="monotone" dataKey="cantidad" stroke="#999" strokeWidth={2} dot={false} name="Pedidos" />
            </LineChart>
          </ResponsiveContainer>
        )}
      </Section>

      {/* BLOQUE 3 — Donuts */}
      <Section title="Distribución de pedidos">
        {errorPedidos ? <ErrorMsg /> : loading ? <Skeleton className="h-[260px] bg-[#1a1a1a]" /> : totalPedidos === 0 ? <EmptyMsg msg="Sin pedidos en este período" /> : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <DonutBlock title="Por estado" data={estadoDonut} colorMap={ESTADO_COLORS} />
            <DonutBlock title="Por método de pago" data={metodoDonut} colorMap={METODO_COLORS} />
          </div>
        )}
      </Section>

      {/* BLOQUE 4 — Patrones temporales */}
      <Section title="Patrones temporales">
        {errorPedidos ? <ErrorMsg /> : loading ? <Skeleton className="h-[180px] bg-[#1a1a1a]" /> : totalPedidos === 0 ? <EmptyMsg msg="Sin pedidos en este período" /> : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-xs text-[#888] mb-2">Pedidos por hora del día</p>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={horaData}>
                  <CartesianGrid stroke="#2a2a2a" strokeDasharray="3 3" />
                  <XAxis dataKey="hora" tick={{ fill: "#666", fontSize: 10 }} />
                  <YAxis tick={{ fill: "#666", fontSize: 10 }} allowDecimals={false} />
                  <Tooltip contentStyle={{ background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="cantidad" fill={DORADO} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div>
              <p className="text-xs text-[#888] mb-2">Pedidos por día de la semana</p>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={diaData}>
                  <CartesianGrid stroke="#2a2a2a" strokeDasharray="3 3" />
                  <XAxis dataKey="dia" tick={{ fill: "#666", fontSize: 10 }} />
                  <YAxis tick={{ fill: "#666", fontSize: 10 }} allowDecimals={false} />
                  <Tooltip contentStyle={{ background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="cantidad" fill={DORADO} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </Section>

      {/* BLOQUE 5 — Top productos */}
      <Section title="Productos más pedidos">
        {errorPedidos ? <ErrorMsg /> : loading ? <Skeleton className="h-[200px] bg-[#1a1a1a]" /> : topProducts.length === 0 ? <EmptyMsg msg="Sin pedidos en este período" /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[#888] text-left text-xs">
                  <th className="py-2 pr-3 w-8">#</th>
                  <th className="py-2 pr-3">Producto</th>
                  <th className="py-2 pr-3 text-right">Unidades</th>
                  <th className="py-2 text-right">Ingresos</th>
                </tr>
              </thead>
              <tbody>
                {topProducts.map((p, i) => (
                  <tr key={p.nombre} className={i % 2 === 0 ? "bg-[#111]" : "bg-[#1a1a1a]"}>
                    <td className="py-2 pr-3 font-semibold" style={{ color: DORADO }}>{i + 1}</td>
                    <td className="py-2 pr-3 text-[#e0e0e0]">{p.nombre}</td>
                    <td className="py-2 pr-3 text-right text-[#ccc]">{p.unidades}</td>
                    <td className="py-2 text-right text-[#ccc]">{formatCurrency(p.ingresos)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Section>

      {/* BLOQUE 6 — Reservas y Alertas */}
      <Section title="Reservas y Alertas">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Reservas */}
          <div>
            <p className="text-xs text-[#888] mb-3">Reservas</p>
            {errorReservas ? <ErrorMsg /> : reservas === null ? (
              <div className="space-y-2">{[1,2,3,4].map(i => <Skeleton key={i} className="h-10 bg-[#1a1a1a]" />)}</div>
            ) : resStats.total === 0 ? <EmptyMsg msg="Sin reservas en este período" /> : (
              <>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <MiniCard label="Total" value={resStats.total} />
                  <MiniCard label="Confirmadas" value={resStats.confirmadas} icon="✅" color="#22c55e" />
                  <MiniCard label="Pendientes" value={resStats.pendientes} icon="⏳" color="#f97316" />
                  <MiniCard label="Canceladas" value={resStats.canceladas} icon="❌" color="#ef4444" />
                </div>
                {resStats.total > 0 && (
                  <div className="h-2.5 rounded-full overflow-hidden flex bg-[#222]">
                    {resStats.confirmadas > 0 && <div className="h-full" style={{ width: `${(resStats.confirmadas / resStats.total) * 100}%`, background: "#22c55e" }} />}
                    {resStats.pendientes > 0 && <div className="h-full" style={{ width: `${(resStats.pendientes / resStats.total) * 100}%`, background: "#f97316" }} />}
                    {resStats.canceladas > 0 && <div className="h-full" style={{ width: `${(resStats.canceladas / resStats.total) * 100}%`, background: "#ef4444" }} />}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Alertas */}
          <div>
            <p className="text-xs text-[#888] mb-3">Avisame (Intereses)</p>
            {errorAlertas ? <ErrorMsg /> : alertas === null ? (
              <Skeleton className="h-20 bg-[#1a1a1a]" />
            ) : alertaStats.total === 0 ? <EmptyMsg msg="Sin suscriptores activos" /> : (
              <div className="space-y-2">
                <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-3">
                  <p className="text-2xl font-bold text-[#f0e8d0]">{alertaStats.total}</p>
                  <p className="text-xs text-[#888]">suscriptores activos</p>
                </div>
                {alertaStats.byCanal.length > 0 && (
                  <div className="flex gap-2">
                    {alertaStats.byCanal.map(c => (
                      <div key={c.canal} className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-2 flex-1 text-center">
                        <p className="text-lg font-semibold text-[#f0e8d0]">{c.count}</p>
                        <p className="text-xs text-[#888] capitalize">{c.canal}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </Section>
    </div>
  );
};

// ─── Sub-components ─────────────────────────────────────────
function KpiCard({ icon, value, label, sub }: { icon: React.ReactNode; value: string; label: string; sub: string }) {
  return (
    <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-4">
      <div className="text-[#C8860A] mb-2">{icon}</div>
      <p className="text-2xl font-bold text-[#f0f0f0]">{value}</p>
      <p className="text-xs text-[#888] mt-0.5">{label}</p>
      <p className="text-[10px] text-[#555]">{sub}</p>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-[#111] border border-[#1f1f1f] rounded-lg p-4 md:p-5">
      <h2 className="font-display text-sm text-[#f0e8d0] mb-4 pb-2 border-b border-[#1f1f1f]">{title}</h2>
      {children}
    </div>
  );
}

function MiniCard({ label, value, icon, color }: { label: string; value: number; icon?: string; color?: string }) {
  return (
    <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-2.5 flex items-center gap-2">
      {icon && <span className="text-base">{icon}</span>}
      <div>
        <p className="text-lg font-semibold" style={{ color: color || "#f0e8d0" }}>{value}</p>
        <p className="text-[10px] text-[#888]">{label}</p>
      </div>
    </div>
  );
}

function DonutBlock({ title, data, colorMap }: { title: string; data: { name: string; value: number }[]; colorMap: Record<string, string> }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  if (total === 0) return <EmptyInline msg="Sin datos" />;
  return (
    <div>
      <p className="text-xs text-[#888] mb-2">{title}</p>
      <div className="flex justify-center">
        <ResponsiveContainer width={180} height={180}>
          <PieChart>
            <Pie data={data} dataKey="value" innerRadius={50} outerRadius={75} paddingAngle={2} strokeWidth={0}>
              {data.map((d, i) => <Cell key={i} fill={colorMap[d.name] || "#555"} />)}
            </Pie>
            <Tooltip contentStyle={{ background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 8, fontSize: 12 }} />
            <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" fill="#f0e8d0" fontSize={18} fontWeight="bold">
              {total}
            </text>
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 justify-center">
        {data.map(d => (
          <span key={d.name} className="text-[11px] text-[#aaa] flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: colorMap[d.name] || "#555" }} />
            {d.name} · {d.value} ({((d.value / total) * 100).toFixed(0)}%)
          </span>
        ))}
      </div>
    </div>
  );
}

function EmptyInline({ msg }: { msg: string }) {
  return <p className="text-sm text-[#555] text-center py-4">{msg}</p>;
}

export default AdminInformes;
