import React from "react";
import { Globe } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTimezone, useSetTimezone } from "@/lib/store";
const TIMEZONES = [
  { label: "UTC (GMT+0)", value: "UTC" },
  { label: "London (GMT/BST)", value: "Europe/London" },
  { label: "New York (EST/EDT)", value: "America/New_York" },
  { label: "Tokyo (JST)", value: "Asia/Tokyo" },
  { label: "Sydney (AEST/AEDT)", value: "Australia/Sydney" },
];
export function TimezoneSelector() {
  const timezone = useTimezone();
  const setTimezone = useSetTimezone();
  return (
    <div className="flex items-center gap-2">
      <Globe className="h-4 w-4 text-muted-foreground" />
      <Select value={timezone} onValueChange={setTimezone}>
        <SelectTrigger className="h-8 w-[180px] text-[10px] font-black uppercase tracking-widest bg-secondary/50 border-none shadow-none focus:ring-0">
          <SelectValue placeholder="Select Zone" />
        </SelectTrigger>
        <SelectContent className="bg-background/95 backdrop-blur-xl border-border">
          {TIMEZONES.map((tz) => (
            <SelectItem key={tz.value} value={tz.value} className="text-[10px] font-bold uppercase tracking-wider">
              {tz.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}