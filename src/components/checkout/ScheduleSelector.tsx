import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useLang } from "@/contexts/LangContext";

interface Horario {
  dia: string;
  hora_apertura: string;
  hora_cierre: string;
  cerrado: boolean;
}

interface ScheduleSelectorProps {
  hasPromos: boolean;
  onScheduleChange: (programadoPara: string | null) => void;
}

const diasMap: Record<string, number> = {
  domingo: 0, lunes: 1, martes: 2, miércoles: 3, jueves: 4, viernes: 5, sábado: 6,
};
const diasNombres = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];

const formatDayLabel = (date: Date, idx: number): string => {
  const day = date.getDate();
  const monthNames = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
  const dayNames = ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"];
  const prefix = idx === 0 ? "Hoy" : idx === 1 ? "Mañana" : dayNames[date.getDay()];
  return `${prefix}, ${dayNames[date.getDay()]} ${day} de ${monthNames[date.getMonth()]}`;
};

const ScheduleSelector = ({ hasPromos, onScheduleChange }: ScheduleSelectorProps) => {
  const { lang } = useLang();
  const [mode, setMode] = useState<"asap" | "scheduled">("asap");
  const [horarios, setHorarios] = useState<Horario[]>([]);
  const [selectedDayIdx, setSelectedDayIdx] = useState(0);
  const [selectedTime, setSelectedTime] = useState("");
  const [showSchedule, setShowSchedule] = useState(false);

  useEffect(() => {
    supabase.from("horarios").select("*").then(({ data }) => {
      if (data) setHorarios(data);
    });
  }, []);

  // Build next 7 days excluding closed days
  const availableDays = useMemo(() => {
    const days: { date: Date; label: string; idx: number }[] = [];
    const now = new Date();
    for (let i = 0; i < 7; i++) {
      const d = new Date(now);
      d.setDate(d.getDate() + i);
      const diaName = diasNombres[d.getDay()];
      const h = horarios.find((h) => h.dia === diaName);
      if (h && h.cerrado) continue;
      days.push({ date: d, label: formatDayLabel(d, i), idx: i });
    }
    return days;
  }, [horarios]);

  // Build time slots for selected day
  const timeSlots = useMemo(() => {
    if (availableDays.length === 0) return [];
    const dayEntry = availableDays.find((d) => d.idx === selectedDayIdx) || availableDays[0];
    if (!dayEntry) return [];

    const diaName = diasNombres[dayEntry.date.getDay()];
    const h = horarios.find((h) => h.dia === diaName);
    if (!h) return [];

    const [ah, am] = h.hora_apertura.split(":").map(Number);
    const [ch, cm] = h.hora_cierre.split(":").map(Number);

    let startMin = ah * 60 + am;
    let endMin = ch * 60 + cm - 15;
    // Handle overnight (e.g. 08:00 to 02:00)
    if (endMin < startMin) endMin = 23 * 60 + 45;

    const now = new Date();
    const isToday = dayEntry.idx === 0;
    const nowMin = now.getHours() * 60 + now.getMinutes();
    const minAllowed = isToday ? nowMin + 30 : 0;
    // Round up to next 15
    const roundedMin = Math.ceil(minAllowed / 15) * 15;

    const slots: string[] = [];
    for (let m = startMin; m <= endMin; m += 15) {
      if (isToday && m < roundedMin) continue;
      const hh = String(Math.floor(m / 60)).padStart(2, "0");
      const mm = String(m % 60).padStart(2, "0");
      slots.push(`${hh}:${mm}`);
    }
    return slots;
  }, [horarios, availableDays, selectedDayIdx]);

  // Auto-select first available time
  useEffect(() => {
    if (mode === "scheduled" && timeSlots.length > 0 && !timeSlots.includes(selectedTime)) {
      setSelectedTime(timeSlots[0]);
    }
  }, [timeSlots, mode]);

  // If today has no slots, auto-select next day
  useEffect(() => {
    if (mode === "scheduled" && timeSlots.length === 0 && availableDays.length > 1) {
      const nextDay = availableDays.find((d) => d.idx !== selectedDayIdx);
      if (nextDay) setSelectedDayIdx(nextDay.idx);
    }
  }, [mode, timeSlots, availableDays, selectedDayIdx]);

  // Emit changes
  useEffect(() => {
    if (mode === "asap") {
      onScheduleChange(null);
    } else if (selectedTime && availableDays.length > 0) {
      const dayEntry = availableDays.find((d) => d.idx === selectedDayIdx) || availableDays[0];
      if (dayEntry) {
        const d = new Date(dayEntry.date);
        const [hh, mm] = selectedTime.split(":").map(Number);
        d.setHours(hh, mm, 0, 0);
        onScheduleChange(d.toISOString());
      }
    }
  }, [mode, selectedDayIdx, selectedTime]);

  // Check if local is currently closed
  const isLocalClosed = useMemo(() => {
    const now = new Date();
    const diaName = diasNombres[now.getDay()];
    const h = horarios.find((h) => h.dia === diaName);
    if (!h || h.cerrado) return true;
    const [ah, am] = h.hora_apertura.split(":").map(Number);
    const [ch, cm] = h.hora_cierre.split(":").map(Number);
    const nowMin = now.getHours() * 60 + now.getMinutes();
    const openMin = ah * 60 + am;
    const closeMin = ch * 60 + cm;
    if (closeMin > openMin) return nowMin < openMin || nowMin >= closeMin;
    // Overnight
    return nowMin >= closeMin && nowMin < openMin;
  }, [horarios]);

  const handleModeChange = (newMode: "asap" | "scheduled") => {
    if (hasPromos && newMode === "scheduled") return;
    setMode(newMode);
    if (newMode === "scheduled") {
      setTimeout(() => setShowSchedule(true), 10);
    } else {
      setShowSchedule(false);
    }
  };

  const selectClass =
    "w-full bg-negro border border-crema/10 text-crema font-body text-sm focus:outline-none focus:border-ambar/50 transition-colors rounded px-3 py-2.5 appearance-none";

  return (
    <div className="mb-8">
      <h2 className="font-display text-lg text-ambar mb-3">
        {lang === "en" ? "When do you want it?" : "¿Cuándo lo querés?"}
      </h2>

      {/* Promo warning */}
      {hasPromos && (
        <div className="flex items-start gap-2 bg-ambar/10 border border-ambar/30 rounded p-3 mb-4">
          <span className="text-lg leading-none mt-0.5">⚠️</span>
          <p className="font-body text-sm text-ambar">
            {lang === "en"
              ? "Promotional items can only be ordered for right now."
              : "Los artículos en promoción solo pueden pedirse para ahora mismo."}
          </p>
        </div>
      )}

      {/* Radio options */}
      <div className="space-y-3">
        <label
          className="flex items-center gap-3 p-3 rounded border border-crema/10 cursor-pointer hover:border-ambar/30 transition-colors"
          onClick={() => handleModeChange("asap")}
        >
          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${mode === "asap" ? "border-ambar" : "border-crema/30"}`}>
            {mode === "asap" && <div className="w-2 h-2 rounded-full bg-ambar" />}
          </div>
          <span className="font-body text-sm text-crema">
            {lang === "en" ? "As soon as possible" : "Lo antes posible"}
          </span>
        </label>

        <label
          className={`flex items-center gap-3 p-3 rounded border border-crema/10 transition-colors ${
            hasPromos ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:border-ambar/30"
          }`}
          onClick={() => handleModeChange("scheduled")}
        >
          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${mode === "scheduled" ? "border-ambar" : "border-crema/30"}`}>
            {mode === "scheduled" && <div className="w-2 h-2 rounded-full bg-ambar" />}
          </div>
          <span className="font-body text-sm text-crema">
            {lang === "en" ? "Choose day and time" : "Elegir día y hora"}
          </span>
        </label>
      </div>

      {/* Closed warning for ASAP */}
      {mode === "asap" && isLocalClosed && !hasPromos && (
        <div className="flex items-start gap-2 bg-crema/5 border border-crema/10 rounded p-3 mt-3">
          <span className="text-lg leading-none mt-0.5">🕐</span>
          <p className="font-body text-sm text-crema/70">
            {lang === "en"
              ? "The restaurant is currently closed. Your order will be processed when it opens."
              : "El local está cerrado. Tu pedido se procesará al abrir."}
          </p>
        </div>
      )}

      {/* Day/Time selectors */}
      {mode === "scheduled" && (
        <div
          className={`mt-4 space-y-3 transition-all duration-300 ${
            showSchedule ? "opacity-100 max-h-96" : "opacity-0 max-h-0 overflow-hidden"
          }`}
        >
          <div>
            <label className="font-body text-sm text-gris block mb-1">
              {lang === "en" ? "Day" : "Día"}
            </label>
            <select
              value={selectedDayIdx}
              onChange={(e) => setSelectedDayIdx(Number(e.target.value))}
              className={selectClass}
            >
              {availableDays.map((d) => (
                <option key={d.idx} value={d.idx}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-body text-sm text-gris block mb-1">
              {lang === "en" ? "Time" : "Hora"}
            </label>
            <select
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              className={selectClass}
            >
              {timeSlots.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
              {timeSlots.length === 0 && (
                <option disabled value="">
                  {lang === "en" ? "No available slots" : "Sin horarios disponibles"}
                </option>
              )}
            </select>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScheduleSelector;
