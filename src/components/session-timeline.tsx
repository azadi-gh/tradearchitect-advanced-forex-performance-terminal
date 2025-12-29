import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTimezone, useLanguage } from "@/lib/store";
import { cn } from "@/lib/utils";
const SESSIONS = [
  { 
    name: { en: "Asian Killzone", fa: "کیل‌زون آسیا" }, 
    start: 0, 
    end: 4, 
    color: "bg-blue-500", 
    glow: "shadow-[0_0_20px_rgba(59,130,246,0.6)]" 
  },
  { 
    name: { en: "London Killzone", fa: "کیل‌زون لندن" }, 
    start: 7, 
    end: 10, 
    color: "bg-amber-500", 
    glow: "shadow-[0_0_20px_rgba(245,158,11,0.6)]" 
  },
  { 
    name: { en: "NY AM Killzone", fa: "کیل‌زون صبح نیویورک" }, 
    start: 12, 
    end: 15, 
    color: "bg-emerald-500", 
    glow: "shadow-[0_0_20px_rgba(16,185,129,0.6)]" 
  },
  { 
    name: { en: "NY PM Killzone", fa: "کیل‌زون عصر نیویورک" }, 
    start: 18, 
    end: 21, 
    color: "bg-purple-500", 
    glow: "shadow-[0_0_20px_rgba(168,85,247,0.6)]" 
  },
];
export function SessionTimeline() {
  const timezone = useTimezone();
  const language = useLanguage();
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);
  const currentHourUTC = now.getUTCHours();
  const currentMinuteUTC = now.getUTCMinutes();
  const progressPercent = ((currentHourUTC * 60 + currentMinuteUTC) / 1440) * 100;
  const localTimeStr = new Intl.DateTimeFormat(language === 'fa' ? 'fa-IR' : 'en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: timezone === 'UTC' ? 'UTC' : timezone,
    hour12: false
  }).format(now);
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
          {language === 'fa' ? 'زمان‌بندی نشست‌های معاملاتی ICT' : 'ICT SESSION INTELLIGENCE'}
        </span>
        <div className="flex items-center gap-2 bg-primary/5 px-3 py-1 rounded-full border border-primary/10">
           <div className="h-2 w-2 rounded-full bg-emerald-500 animate-glow shadow-[0_0_8px_#10b981]" />
           <span className="text-xs font-black tabular-nums tracking-tighter">{localTimeStr}</span>
        </div>
      </div>
      <div className="relative h-14 bg-secondary/20 rounded-2xl border border-white/5 overflow-hidden backdrop-blur-xl group">
        {/* Decorative Grid Mesh */}
        <div className="absolute inset-0 bg-mesh opacity-10 pointer-events-none" />
        {/* Hour Markers */}
        <div className="absolute inset-0 flex justify-between px-2 pointer-events-none opacity-30">
          {[0, 4, 8, 12, 16, 20].map((h) => (
            <div key={h} className="h-full w-px bg-foreground/20 flex flex-col justify-end pb-1.5">
              <span className="text-[8px] font-black opacity-50">{h}h</span>
            </div>
          ))}
        </div>
        {/* Sessions / Killzones */}
        {SESSIONS.map((session) => {
          const startPct = (session.start / 24) * 100;
          const endPct = (session.end / 24) * 100;
          const width = endPct - startPct;
          const isActive = currentHourUTC >= session.start && currentHourUTC < session.end;
          return (
            <motion.div
              key={session.name.en}
              initial={false}
              animate={{ 
                opacity: isActive ? 1 : 0.35,
                scaleY: isActive ? 1.1 : 0.9,
                y: isActive ? 0 : 2
              }}
              whileHover={{ scaleY: 1.15, opacity: 0.8 }}
              className={cn(
                "absolute top-3 h-6 rounded-lg flex items-center justify-center transition-all cursor-help",
                session.color,
                isActive && session.glow,
                isActive && "z-10"
              )}
              style={{ left: `${startPct}%`, width: `${width}%` }}
            >
              <div className="absolute inset-0 bg-white/10 animate-shimmer" />
              <span className="relative text-[8px] font-black text-white uppercase whitespace-nowrap overflow-hidden px-1 drop-shadow-md">
                {language === 'fa' ? session.name.fa : session.name.en}
              </span>
            </motion.div>
          );
        })}
        {/* Current Time Laser Indicator */}
        <motion.div
          className="absolute top-0 bottom-0 w-[3px] bg-primary z-20 shadow-[0_0_15px_white]"
          style={{ left: `${progressPercent}%` }}
          transition={{ type: "spring", stiffness: 40, damping: 15 }}
        >
          <div className="absolute -top-1 -translate-x-1/2 left-1/2 w-3 h-3 rounded-full bg-primary border-2 border-background ring-4 ring-primary/20" />
          <div className="absolute -bottom-1 -translate-x-1/2 left-1/2 w-3 h-3 rounded-full bg-primary border-2 border-background" />
        </motion.div>
      </div>
      <div className="grid grid-cols-4 gap-3">
        {SESSIONS.map((s) => (
          <div key={s.name.en} className="flex flex-col gap-1.5">
            <div className={cn("h-1.5 rounded-full w-full opacity-60", s.color)} />
            <span className="text-[8px] font-black uppercase text-muted-foreground truncate leading-none">
              {language === 'fa' ? s.name.fa : s.name.en}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}