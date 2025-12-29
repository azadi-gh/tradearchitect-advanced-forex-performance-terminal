import React, { useState, useMemo } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
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
  // Calendar Heatmap logic
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
          <p className="text-muted-foreground text-lg">Mathematical protocols for capital preservation and growth.</p>
        </div>
        <div className="grid gap-8 lg:grid-cols-2">
          <Card className="border-2">
            <CardHeader className="bg-muted/30 border-b">
              <div className="flex items-center gap-2">
                <Calculator className="h-5 w-5 text-primary" />
                <CardTitle className="uppercase text-sm font-bold tracking-widest">Position Sizer</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase">Balance</Label>
                  <Input type="number" value={psBalance} onChange={e => setPsBalance(Number(e.target.value))} />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase">Symbol</Label>
                  <Input value={psSymbol} onChange={e => setPsSymbol(e.target.value.toUpperCase())} />
                </div>
              </div>
              <div className="space-y-4 pt-2">
                <Label className="text-xs font-bold uppercase">Risk: {psRisk}%</Label>
                <Slider value={[psRisk]} onValueChange={([v]) => setPsRisk(v)} max={5} step={0.1} />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase">Stop Loss (Pips)</Label>
                <Input type="number" value={psSL} onChange={e => setPsSL(Number(e.target.value))} />
              </div>
              <div className="bg-primary/5 rounded-xl p-6 text-center border-2 border-dashed border-primary/20">
                <p className="text-[10px] text-muted-foreground font-black uppercase mb-1">Execution Size</p>
                <div className="text-4xl font-black">{recommendedLots.toFixed(2)} LOTS</div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-2">
            <CardHeader className="bg-muted/30 border-b">
              <div className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5 text-rose-500" />
                <CardTitle className="uppercase text-sm font-bold tracking-widest">Drawdown Recovery Planner</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase text-rose-500">Current DD %</Label>
                  <Input type="number" value={ddPercent} onChange={e => setDdPercent(Number(e.target.value))} />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase text-emerald-500">Recovery Window (Trades)</Label>
                  <Input type="number" value={ddTrades} onChange={e => setDdTrades(Number(e.target.value))} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-rose-50 dark:bg-rose-950/20 text-center border border-rose-100 dark:border-rose-900">
                  <p className="text-2xs font-bold uppercase text-rose-600 mb-1">Required Gain</p>
                  <p className="text-xl font-black">{recovery.targetGain.toFixed(1)}%</p>
                </div>
                <div className="p-4 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 text-center border border-emerald-100 dark:border-emerald-900">
                  <p className="text-2xs font-bold uppercase text-emerald-600 mb-1">Req. Win Rate</p>
                  <p className="text-xl font-black">{recovery.requiredWinRate.toFixed(1)}%</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-950/20 rounded border border-blue-100 dark:border-blue-900">
                <Activity className="h-4 w-4 text-blue-500" />
                <p className="text-[10px] font-medium text-blue-600">Planner assumes 1:2 R:R during recovery phase.</p>
              </div>
            </CardContent>
          </Card>
          <Card className="lg:col-span-2 border-2">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-amber-500" />
                <CardTitle className="uppercase text-sm font-bold tracking-widest">Exposure Heatmap</CardTitle>
              </div>
              <CardDescription>Daily risk utilization over the last 35 days.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-2">
                {['S','M','T','W','T','F','S'].map((day, i) => (
                  <div key={i} className="text-center text-[10px] font-black text-muted-foreground mb-1">{day}</div>
                ))}
                {days.map((d, i) => (
                  <div
                    key={i}
                    className={cn(
                      "aspect-square rounded-sm border transition-colors cursor-help",
                      d.risk === 0 ? "bg-muted/20" : 
                      d.risk < 1 ? "bg-emerald-500/20 border-emerald-500/30" :
                      d.risk < 3 ? "bg-amber-500/40 border-amber-500/50" :
                      "bg-rose-500/60 border-rose-500/70"
                    )}
                    title={`${d.date}: ${d.risk.toFixed(1)}% risk`}
                  />
                ))}
              </div>
              <div className="mt-4 flex items-center justify-end gap-4">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 bg-muted/20 rounded-sm" />
                  <span className="text-[10px] uppercase font-bold text-muted-foreground">Empty</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 bg-emerald-500/20 rounded-sm" />
                  <span className="text-[10px] uppercase font-bold text-muted-foreground">&lt;1%</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 bg-rose-500/60 rounded-sm" />
                  <span className="text-[10px] uppercase font-bold text-muted-foreground">&gt;3%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}