import React, { useState, useMemo } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { calculatePositionSize, calculateKelly, calculateBreakevenWinrate, formatCurrency, getForexPipSize, calculatePips } from '@/lib/financial-math';
import { Calculator, Target, TrendingUp, AlertCircle } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
export function RiskLabPage() {
  // Position Sizing State
  const [psBalance, setPsBalance] = useState(10000);
  const [psRisk, setPsRisk] = useState(1);
  const [psSL, setPsSL] = useState(20);
  const [psSymbol, setPsSymbol] = useState('EURUSD');
  // Kelly State
  const [kWinRate, setKWinRate] = useState(50);
  const [kAvgWin, setKAvgWin] = useState(200);
  const [kAvgLoss, setKAvgLoss] = useState(100);
  // Return Calculator State
  const [retEntry, setRetEntry] = useState(1.08500);
  const [retSL, setRetSL] = useState(1.08300);
  const [retTP, setRetTP] = useState(1.08900);
  const [retLots, setRetLots] = useState(1.0);
  const recommendedLots = useMemo(() =>
    calculatePositionSize(psBalance, psRisk, psSL, psSymbol),
    [psBalance, psRisk, psSL, psSymbol]
  );
  const kellyResult = useMemo(() =>
    calculateKelly(kWinRate, kAvgWin, kAvgLoss),
    [kWinRate, kAvgWin, kAvgLoss]
  );
  const returnStats = useMemo(() => {
    const riskPrice = Math.abs(retEntry - retSL);
    const rewardPrice = Math.abs(retTP - retEntry);
    // Safety check for RR
    const rr = riskPrice > 1e-9 ? rewardPrice / riskPrice : 0;
    const pipVal = 10; // Standard lot pip value
    const riskPips = calculatePips(riskPrice, psSymbol);
    const rewardPips = calculatePips(rewardPrice, psSymbol);
    const riskCash = riskPips * pipVal * retLots;
    const rewardCash = rewardPips * pipVal * retLots;
    const beWin = calculateBreakevenWinrate(rr);
    return { rr, riskCash, rewardCash, beWin };
  }, [retEntry, retSL, retTP, retLots, psSymbol]);
  const scenarioData = [
    { name: 'Risk / Loss', value: -returnStats.riskCash },
    { name: 'Target / Profit', value: returnStats.rewardCash },
  ];
  return (
    <AppLayout container>
      <div className="space-y-10">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-black tracking-tighter uppercase">Risk Laboratory</h1>
          <p className="text-muted-foreground text-lg">Mathematical protocols for capital preservation and growth.</p>
        </div>
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Position Sizer */}
          <Card className="border-2 shadow-sm">
            <CardHeader className="bg-muted/30 border-b pb-4">
              <div className="flex items-center gap-2">
                <Calculator className="h-5 w-5 text-primary" />
                <CardTitle className="uppercase text-sm font-bold tracking-widest">Position Sizing Protocol</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs uppercase font-bold text-muted-foreground">Account Balance</Label>
                  <Input type="number" value={psBalance} onChange={e => setPsBalance(Number(e.target.value))} className="font-mono" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs uppercase font-bold text-muted-foreground">Asset Symbol</Label>
                  <Input value={psSymbol} onChange={e => setPsSymbol(e.target.value.toUpperCase())} className="font-mono" />
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label className="text-xs uppercase font-bold text-muted-foreground">Risk per Trade: {psRisk}%</Label>
                  <span className="text-xs font-mono">{formatCurrency((psBalance * psRisk) / 100)}</span>
                </div>
                <Slider value={[psRisk]} onValueChange={([v]) => setPsRisk(v)} max={10} step={0.1} />
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase font-bold text-muted-foreground">Stop Loss (Distance in Pips)</Label>
                <Input type="number" value={psSL} onChange={e => setPsSL(Number(e.target.value))} className="font-mono" />
              </div>
              <div className="bg-primary/5 border border-primary/10 rounded-xl p-6 text-center">
                <p className="text-[10px] text-muted-foreground uppercase font-black tracking-[0.2em] mb-1">Recommended Execution Size</p>
                <div className="text-5xl font-black text-primary tracking-tighter">
                  {recommendedLots.toFixed(2)}
                  <span className="text-lg ml-2">LOTS</span>
                </div>
              </div>
            </CardContent>
          </Card>
          {/* Kelly Criterion */}
          <Card className="border-2 shadow-sm">
            <CardHeader className="bg-muted/30 border-b pb-4">
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-emerald-500" />
                <CardTitle className="uppercase text-sm font-bold tracking-widest">Growth Fraction (Kelly)</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label className="text-xs uppercase font-bold text-muted-foreground">Current Win Rate: {kWinRate}%</Label>
                </div>
                <Slider value={[kWinRate]} onValueChange={([v]) => setKWinRate(v)} max={100} step={1} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs uppercase font-bold text-muted-foreground">Average Win ($)</Label>
                  <Input type="number" value={kAvgWin} onChange={e => setKAvgWin(Number(e.target.value))} className="font-mono" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs uppercase font-bold text-muted-foreground">Average Loss ($)</Label>
                  <Input type="number" value={kAvgLoss} onChange={e => setKAvgLoss(Number(e.target.value))} className="font-mono" />
                </div>
              </div>
              <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-6 text-center">
                <p className="text-[10px] text-muted-foreground uppercase font-black tracking-[0.2em] mb-1">Optimal Allocation</p>
                <div className="text-5xl font-black text-emerald-600 tracking-tighter">
                  {(kellyResult * 100).toFixed(1)}
                  <span className="text-lg ml-2">%</span>
                </div>
                <p className="text-[10px] text-muted-foreground mt-2 uppercase font-medium">Fraction of equity to risk per trade</p>
              </div>
            </CardContent>
          </Card>
          {/* Return Calculator */}
          <Card className="lg:col-span-2 border-2 shadow-sm overflow-hidden">
            <CardHeader className="bg-muted/30 border-b pb-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-500" />
                <CardTitle className="uppercase text-sm font-bold tracking-widest">Trade Return Simulator</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="grid md:grid-cols-2">
                <div className="p-6 space-y-4 border-r">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label className="text-[10px] uppercase font-bold text-muted-foreground">Entry Price</Label>
                      <Input type="number" value={retEntry} step="0.00001" onChange={e => setRetEntry(Number(e.target.value))} className="font-mono text-sm h-8" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] uppercase font-bold text-muted-foreground">Stop Loss</Label>
                      <Input type="number" value={retSL} step="0.00001" onChange={e => setRetSL(Number(e.target.value))} className="font-mono text-sm h-8" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label className="text-[10px] uppercase font-bold text-muted-foreground">Take Profit</Label>
                      <Input type="number" value={retTP} step="0.00001" onChange={e => setRetTP(Number(e.target.value))} className="font-mono text-sm h-8" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] uppercase font-bold text-muted-foreground">Lot Size</Label>
                      <Input type="number" value={retLots} step="0.01" onChange={e => setRetLots(Number(e.target.value))} className="font-mono text-sm h-8" />
                    </div>
                  </div>
                  <div className="pt-4 grid grid-cols-2 gap-4">
                    <div className="p-3 rounded-lg bg-muted/40 text-center">
                      <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">R:R Ratio</p>
                      <p className="text-xl font-black">1:{returnStats.rr.toFixed(2)}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/40 text-center">
                      <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">BE Winrate</p>
                      <p className="text-xl font-black">{returnStats.beWin.toFixed(1)}%</p>
                    </div>
                  </div>
                </div>
                <div className="p-6 bg-slate-50/50 dark:bg-slate-950/20 flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-[10px] uppercase font-bold text-rose-500">Risk Amount</p>
                        <p className="text-2xl font-black text-rose-600">-{formatCurrency(returnStats.riskCash)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] uppercase font-bold text-emerald-500">Target Profit</p>
                        <p className="text-2xl font-black text-emerald-600">+{formatCurrency(returnStats.rewardCash)}</p>
                      </div>
                    </div>
                    <div className="h-40 w-full mt-4">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={scenarioData} layout="vertical" margin={{ left: 0, right: 20 }}>
                          <XAxis type="number" hide />
                          <YAxis type="category" dataKey="name" hide />
                          <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))' }} />
                          <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                            {scenarioData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.value < 0 ? '#ef4444' : '#10b981'} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-blue-500/10 border border-blue-500/20 rounded text-[10px] font-bold text-blue-600 uppercase">
                    <AlertCircle className="h-3 w-3" />
                    Projection assumes standard lot valuation for {psSymbol}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}