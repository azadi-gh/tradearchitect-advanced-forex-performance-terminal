import React, { useEffect } from "react";
import { Globe } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTimezone, useSetTimezone, useLanguage, getTimezoneLabel } from "@/lib/store";
const TIMEZONES = [
  { value: "UTC" },
  { value: "Europe/London" },
  { value: "America/New_York" },
  { value: "Asia/Tehran" },
  { value: "Asia/Tokyo" },
  { value: "Australia/Sydney" },
];
export function TimezoneSelector() {
  const timezone = useTimezone();
  const setTimezone = useSetTimezone();
  const language = useLanguage();
  return (
    <div className="flex items-center gap-2">
      <Globe className="h-4 w-4 text-primary animate-pulse" />
      <Select value={timezone} onValueChange={setTimezone}>
        <SelectTrigger className="h-9 w-[200px] text-[10px] font-black uppercase tracking-widest bg-secondary/40 border-border/50 backdrop-blur-md shadow-none hover:bg-secondary/60 transition-all">
          <SelectValue placeholder="Select Zone" />
        </SelectTrigger>
        <SelectContent className="bg-background/95 backdrop-blur-xl border-border/50 shadow-glow">
          {TIMEZONES.map((tz) => (
            <SelectItem 
              key={tz.value} 
              value={tz.value} 
              className="text-[10px] font-bold uppercase tracking-wider focus:bg-primary/10"
            >
              {getTimezoneLabel(tz.value, language)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}