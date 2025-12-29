import React, { useState, useMemo } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { calculatePositionSize, formatCurrency, calculateRecoveryStats } from '@/lib/financial-math';
import { Calculator, Target, Calendar, Activity, RefreshCw } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { cn } from '@/lib/utils';
export function RiskLabPage() {
  const [psBalance, setPsBalance] = useState(10000);
  const [psRisk, setPsRisk] = useState(1);
  const [psSL, setPsSL] = useState(20);
  const [psSymbol, setPsSymbol] = useState('EURUSD');
  const [ddPercent, setDdPercent] = useState(5);
  const [ddTrades, setDdTrades] = useState(20);
  const { data: stats } = useQuery<any>({
    queryKey: ['dashboard-stats'],
    queryFn: () => api('/api/dashboard/stats'),
  });
  const recommendedLots = useMemo(() =>
    calculatePositionSize(psBalance, psRisk, psSL, psSymbol),
    [psBalance, psRisk, psSL, psSymbol]
  );
  const recovery = useMemo(() => calculateRecoveryStats(ddPercent, ddTrades), [ddPercent, ddTrades]);
  const days = Array.from({ length: 35 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (34 - i));
    const key = d.toISOString().split('T')[0];
    const risk = stats?.dailyRisk?.[key] || 0;
    return { date: key, risk };
  });
  return (
    <AppLayout container>
      <div className="space-y-10">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-black tracking-tighter uppercase">Risk Laboratory</h1>
          <p className="text-muted-foreground text-lg">Capital preservation protocols and mathematical recovery frameworks.</p>
        </div>
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Position Sizer */}
          <Card className="border-2 shadow-sm">
            <CardHeader className="bg-muted/30 border-b">
              <div className="flex items-center gap-2">
                <Calculator className="h-5 w-5 text-primary" />
                <CardTitle className="uppercase text-sm font-bold tracking-widest">Terminal Position Sizer</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-tight">Account Balance ($)</Label>
                  <Input 
                    type="number" 
                    value={psBalance} 
                    step="100"
                    onChange={e => setPsBalance(Number(e.target.value))} 
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-tight">Instrument Symbol</Label>
                  <Input 
                    value={psSymbol} 
                    onChange={e => setPsSymbol(e.target.value.toUpperCase())} 
                  />
                </div>
              </div>
              <div className="space-y-4 pt-2">
                <div className="flex justify-between items-center">
                  <Label className="text-xs font-bold uppercase">Exposure: {psRisk}%</Label>
                  <span className="text-[10px] font-bold text-primary">MAX SAFETY: 2%</span>
                </div>
                <Slider value={[psRisk]} onValueChange={([v]) => setPsRisk(v)} max={5} step={0.1} />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase">Stop Loss Distance (Pips)</Label>
                <Input 
                  type="number" 
                  value={psSL} 
                  step="0.1"
                  onChange={e => setPsSL(Number(e.target.value))} 
                />
              </div>
              <div className="bg-primary/5 rounded-2xl p-8 text-center border-2 border-dashed border-primary/20">
                <p className="text-[10px] text-muted-foreground font-black uppercase mb-2 tracking-widest">Recommended Exposure</p>
                <div className="text-5xl font-black text-primary tabular-nums">{recommendedLots.toFixed(2)} <span className="text-sm font-bold text-muted-foreground">LOTS</span></div>
              </div>
            </CardContent>
          </Card>
          {/* Recovery Planner */}
          <Card className="border-2 shadow-sm">
            <CardHeader className="bg-muted/30 border-b">
              <div className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5 text-rose-500" />
                <CardTitle className="uppercase text-sm font-bold tracking-widest">Drawdown Recovery Matrix</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-8">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase text-rose-600">Current DD %</Label>
                  <Input 
                    type="number" 
                    value={ddPercent} 
                    step="0.5"
                    onChange={e => setDdPercent(Number(e.target.value))} 
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase text-emerald-600">Recovery Window</Label>
                  <Input 
                    type="number" 
                    value={ddTrades} 
                    step="1"
                    onChange={e => setDdTrades(Number(e.target.value))} 
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-6 rounded-xl bg-rose-50 dark:bg-rose-950/20 text-center border-2 border-rose-100 dark:border-rose-900">
                  <p className="text-[10px] font-black uppercase text-rose-600 mb-2">Required Gain</p>
                  <p className="text-3xl font-black tabular-nums">{recovery.targetGain.toFixed(1)}%</p>
                </div>
                <div className="p-6 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 text-center border-2 border-emerald-100 dark:border-emerald-900">
                  <p className="text-[10px] font-black uppercase text-emerald-600 mb-2">Target Win Rate</p>
                  <p className="text-3xl font-black tabular-nums">{recovery.requiredWinRate.toFixed(1)}%</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-xl border-2 border-blue-100 dark:border-blue-900">
                <Activity className="h-5 w-5 text-blue-500 shrink-0" />
                <p className="text-[10px] font-bold text-blue-700 leading-tight uppercase">
                  Protocol: Assumes standardized 1:2 R:R during recovery phase. Adjust execution focus accordingly.
                </p>
              </div>
            </CardContent>
          </Card>
          {/* Exposure Heatmap */}
          <Card className="lg:col-span-2 border-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-amber-500" />
                  <CardTitle className="uppercase text-sm font-bold tracking-widest">Risk Exposure Heatmap</CardTitle>
                </div>
                <CardDescription className="text-xs uppercase font-bold mt-1">Daily capital utilization (%)</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="w-full">
                <div className="min-w-[600px] pb-4">
                  <div className="grid grid-cols-7 gap-3">
                    {['SUN','MON','TUE','WED','THU','FRI','SAT'].map((day, i) => (
                      <div key={i} className="text-center text-[10px] font-black text-muted-foreground tracking-widest">{day}</div>
                    ))}
                    <TooltipProvider delayDuration={0}>
                      {days.map((d, i) => (
                        <Tooltip key={i}>
                          <TooltipTrigger asChild>
                            <div
                              className={cn(
                                "aspect-square rounded-md border-2 transition-all cursor-pointer hover:scale-105",
                                d.risk === 0 ? "bg-muted/20 border-transparent" :
                                d.risk < 1 ? "bg-emerald-500/20 border-emerald-500/30" :
                                d.risk < 3 ? "bg-amber-500/40 border-amber-500/50" :
                                "bg-rose-500/60 border-rose-500/70"
                              )}
                            />
                          </TooltipTrigger>
                          <TooltipContent side="top">
                            <p className="text-[10px] font-black uppercase">{d.date}</p>
                            <p className="text-xs font-bold">{d.risk.toFixed(2)}% RISK</p>
                          </TooltipContent>
                        </Tooltip>
                      ))}
                    </TooltipProvider>
                  </div>
                </div>
              </ScrollArea>
              <div className="mt-6 flex items-center justify-center gap-6">
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 bg-muted/20 rounded border border-muted" />
                  <span className="text-[10px] uppercase font-black text-muted-foreground">No Exposure</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 bg-emerald-500/20 rounded border border-emerald-500/30" />
                  <span className="text-[10px] uppercase font-black text-muted-foreground">Safe (&lt;1%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 bg-rose-500/60 rounded border border-rose-500/70" />
                  <span className="text-[10px] uppercase font-black text-muted-foreground">High (&gt;3%)</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}