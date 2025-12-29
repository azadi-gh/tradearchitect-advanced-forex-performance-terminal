import React, { useState, useMemo } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { calculatePositionSize, formatCurrency, calculateKellyPercentage, simulateGrowth } from '@/lib/financial-math';
import { Calculator, Zap, LineChart as ChartIcon, Info, RefreshCw } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
export function RiskLabPage() {
  const [psBalance, setPsBalance] = useState(10000);
  const [winRate, setWinRate] = useState(50);
  const [rr, setRR] = useState(2);
  const [risk, setRisk] = useState(1);
  const [psSL, setPsSL] = useState(20);
  const kelly = useMemo(() => calculateKellyPercentage(winRate, rr), [winRate, rr]);
  const simData = useMemo(() => {
    const fixed = simulateGrowth(psBalance, 'FIXED', { winRate, rr, risk });
    const kData = simulateGrowth(psBalance, 'KELLY', { winRate, rr, kelly });
    return fixed.map((d, i) => ({
      trade: d.trade,
      Fixed: d.balance,
      Kelly: kData[i].balance
    }));
  }, [psBalance, winRate, rr, risk, kelly]);
  return (
    <AppLayout container>
      <div className="space-y-10">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-black tracking-tighter uppercase">Risk Laboratory</h1>
          <p className="text-muted-foreground text-lg">Mathematical frameworks for terminal growth and capital preservation.</p>
        </div>
        <div className="grid gap-8 lg:grid-cols-2">
          <Card className="border-2">
            <CardHeader className="bg-muted/30 border-b">
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-amber-500" />
                <CardTitle className="uppercase text-sm font-black">Kelly Criterion Optimizer</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label className="text-xs font-bold uppercase">Estimated Win Rate (%)</Label>
                  <Input type="number" value={winRate} onChange={e => setWinRate(Number(e.target.value))} />
                </div>
                <div className="space-y-2"><Label className="text-xs font-bold uppercase">Avg Risk/Reward (1:X)</Label>
                  <Input type="number" value={rr} onChange={e => setRR(Number(e.target.value))} />
                </div>
              </div>
              <div className="bg-amber-500/5 rounded-2xl p-8 text-center border-2 border-dashed border-amber-500/20">
                <p className="text-[10px] text-muted-foreground font-black uppercase mb-2 tracking-widest">Optimal Kelly Fractional</p>
                <div className="text-5xl font-black text-amber-600 tabular-nums">{kelly.toFixed(1)}% <span className="text-sm font-bold text-muted-foreground">EXPOSURE</span></div>
                <p className="text-[10px] text-amber-700/60 mt-2 font-bold uppercase">Scientific limit for maximal growth efficiency.</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-2">
            <CardHeader className="bg-muted/30 border-b">
              <div className="flex items-center gap-2">
                <ChartIcon className="h-5 w-5 text-primary" />
                <CardTitle className="uppercase text-sm font-black">Growth Strategy Comparison</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="h-[300px] p-6">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={simData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis dataKey="trade" hide />
                  <YAxis tickFormatter={(v) => `$${v/1000}k`} />
                  <Tooltip formatter={(v: any) => formatCurrency(v)} />
                  <Legend />
                  <Line type="monotone" dataKey="Fixed" stroke="#3b82f6" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="Kelly" stroke="#f59e0b" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card className="lg:col-span-2 border-2">
             <CardHeader className="border-b"><CardTitle className="text-sm font-black uppercase">Capital Allocation Logic</CardTitle></CardHeader>
             <CardContent className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-4 bg-secondary/30 rounded-xl border space-y-2">
                   <h4 className="font-black text-xs uppercase">Fixed Fractional</h4>
                   <p className="text-[10px] text-muted-foreground font-medium uppercase">Stable, linear growth. Safest for beginners. Recommended: 1-2% risk.</p>
                </div>
                <div className="p-4 bg-amber-500/5 rounded-xl border border-amber-500/20 space-y-2">
                   <h4 className="font-black text-xs uppercase text-amber-600">Kelly Criterion</h4>
                   <p className="text-[10px] text-amber-700 font-medium uppercase">Aggressive, exponential growth. High volatility. Avoid if ruin-averse.</p>
                </div>
                <div className="p-4 bg-primary/5 rounded-xl border space-y-2">
                   <h4 className="font-black text-xs uppercase">Fixed Lot</h4>
                   <p className="text-[10px] text-muted-foreground font-medium uppercase">Not recommended for dynamic balances. Risks over-leverage on drawdown.</p>
                </div>
             </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}