import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useTimezone } from "@/lib/store";
import { cn } from "@/lib/utils";
import { formatInTimeZone } from "date-fns-tz";
const SESSIONS = [
  { name: "Asian", start: 19, end: 22, color: "bg-blue-500", glow: "shadow-[0_0_15px_rgba(59,130,246,0.5)]" },
  { name: "London", start: 7, end: 10, color: "bg-amber-500", glow: "shadow-[0_0_15px_rgba(245,158,11,0.5)]" },
  { name: "NY AM", start: 13, end: 16, color: "bg-emerald-500", glow: "shadow-[0_0_15px_rgba(16,185,129,0.5)]" },
  { name: "NY PM", start: 20, end: 22, color: "bg-purple-500", glow: "shadow-[0_0_15px_rgba(168,85,247,0.5)]" },
];
export function SessionTimeline() {
  const timezone = useTimezone();
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);
  const currentHourUTC = now.getUTCHours();
  const currentMinuteUTC = now.getUTCMinutes();
  const progressPercent = ((currentHourUTC * 60 + currentMinuteUTC) / 1440) * 100;
  const localTimeStr = formatInTimeZone(now, timezone, "HH:mm");
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Global Session Timeline (UTC)</span>
        <div className="flex items-center gap-2">
           <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
           <span className="text-[11px] font-black tabular-nums">{localTimeStr}</span>
        </div>
      </div>
      <div className="relative h-12 bg-secondary/30 rounded-xl border border-border/50 overflow-hidden backdrop-blur-sm">
        {/* Hour Markers */}
        <div className="absolute inset-0 flex justify-between px-1 pointer-events-none opacity-20">
          {[0, 4, 8, 12, 16, 20].map((h) => (
            <div key={h} className="h-full w-px bg-foreground flex flex-col justify-end pb-1">
              <span className="text-[7px] font-bold">{h}h</span>
            </div>
          ))}
        </div>
        {/* Sessions */}
        {SESSIONS.map((session) => {
          const startPct = (session.start / 24) * 100;
          const endPct = (session.end / 24) * 100;
          const width = endPct - startPct;
          const isActive = currentHourUTC >= session.start && currentHourUTC < session.end;
          return (
            <motion.div
              key={session.name}
              initial={false}
              animate={{ opacity: isActive ? 1 : 0.4, scaleY: isActive ? 1 : 0.8 }}
              className={cn(
                "absolute top-2 h-4 rounded-full flex items-center justify-center transition-all",
                session.color,
                isActive && session.glow
              )}
              style={{ left: `${startPct}%`, width: `${width}%` }}
            >
              <span className="text-[7px] font-black text-white uppercase whitespace-nowrap overflow-hidden">
                {session.name}
              </span>
            </motion.div>
          );
        })}
        {/* Current Time Marker */}
        <motion.div
          className="absolute top-0 bottom-0 w-0.5 bg-primary z-10 shadow-[0_0_10px_white]"
          style={{ left: `${progressPercent}%` }}
          transition={{ type: "spring", stiffness: 50 }}
        >
          <div className="absolute top-0 -translate-x-1/2 w-2 h-2 rounded-full bg-primary" />
        </motion.div>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {SESSIONS.map((s) => (
          <div key={s.name} className="flex flex-col gap-1">
            <div className={cn("h-1 rounded-full w-full", s.color)} />
            <span className="text-[8px] font-black uppercase text-muted-foreground truncate">{s.name} Killzone</span>
          </div>
        ))}
      </div>
    </div>
  );
}