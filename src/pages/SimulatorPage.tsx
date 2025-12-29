import React, { useState, useMemo } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { runMonteCarlo, type SimParams } from '@/lib/sim-engine';
import { formatCurrency } from '@/lib/financial-math';
import { motion } from 'framer-motion';
import { TrendingUp, AlertTriangle } from 'lucide-react';
export function SimulatorPage() {
  const [params, setParams] = useState<SimParams>({
    startBalance: 10000,
    winRate: 50,
    riskReward: 2,
    riskPerTrade: 1,
    tradeCount: 100,
    iterations: 1000
  });
  const results = useMemo(() => runMonteCarlo(params), [params]);
  const chartData = useMemo(() => {
    if (!results || !results.median) return [];
    return results.median.map((_, i) => ({
      trade: i,
      median: results.median[i],
      best: results.bestCase[i],
      worst: results.worstCase[i],
    }));
  }, [results]);
  return (
    <AppLayout container>
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-black tracking-tighter uppercase">Growth Simulator</h1>
          <p className="text-muted-foreground">Monte Carlo projections based on your edge.</p>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-1 border-2">
            <CardHeader>
              <CardTitle className="text-sm font-bold uppercase tracking-widest">Parameters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Starting Balance ($)</Label>
                <Input
                  type="number"
                  value={params.startBalance}
                  onChange={e => setParams(p => ({ ...p, startBalance: Number(e.target.value) }))}
                />
              </div>
              <div className="space-y-4">
                <div className="flex justify-between text-sm font-medium">
                  <Label>Win Rate (%)</Label>
                  <span>{params.winRate}%</span>
                </div>
                <Slider
                  value={[params.winRate]}
                  onValueChange={([v]) => setParams(p => ({ ...p, winRate: v }))}
                  max={100} step={1}
                />
              </div>
              <div className="space-y-2">
                <Label>Risk:Reward Ratio (1:X)</Label>
                <Input
                  type="number"
                  value={params.riskReward}
                  onChange={e => setParams(p => ({ ...p, riskReward: Number(e.target.value) }))}
                />
              </div>
              <div className="space-y-4">
                <div className="flex justify-between text-sm font-medium">
                  <Label>Risk Per Trade (%)</Label>
                  <span>{params.riskPerTrade}%</span>
                </div>
                <Slider
                  value={[params.riskPerTrade]}
                  onValueChange={([v]) => setParams(p => ({ ...p, riskPerTrade: v }))}
                  max={10} step={0.1}
                />
              </div>
              <div className="space-y-2">
                <Label>Trade Sample Size</Label>
                <Input
                  type="number"
                  value={params.tradeCount}
                  onChange={e => setParams(p => ({ ...p, tradeCount: Number(e.target.value) }))}
                />
              </div>
            </CardContent>
          </Card>
          <div className="lg:col-span-2 space-y-6">
            <Card className="min-h-[450px] flex flex-col">
              <CardHeader className="flex flex-row items-center justify-between shrink-0">
                <div>
                  <CardTitle>Equity Projections</CardTitle>
                  <CardDescription>Confidence intervals (5% - 95%)</CardDescription>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold uppercase text-muted-foreground">Expected Median</div>
                  <div className="text-xl font-black">
                    {results?.median ? formatCurrency(results.median[results.median.length - 1]) : "---"}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1 min-h-[300px] pb-12">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis dataKey="trade" hide />
                    <YAxis tickFormatter={(v) => `${v/1000}k`} />
                    <Tooltip
                      formatter={(v: number) => formatCurrency(v)}
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '8px', border: '1px solid hsl(var(--border))' }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="best" stroke="#10b981" strokeWidth={2} dot={false} name="Optimistic (95th)" />
                    <Line type="monotone" dataKey="median" stroke="#3b82f6" strokeWidth={3} dot={false} name="Median (50th)" />
                    <Line type="monotone" dataKey="worst" stroke="#ef4444" strokeWidth={2} dot={false} name="Pessimistic (5th)" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <div className="grid grid-cols-2 gap-4">
              <Card className="border-rose-200 bg-rose-50/50 dark:bg-rose-950/10">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2 text-rose-600">
                    <AlertTriangle className="h-4 w-4" />
                    <CardTitle className="text-xs font-bold uppercase">Risk of Ruin</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-black text-rose-600">{results?.riskOfRuin.toFixed(1)}%</div>
                  <p className="text-[10px] text-muted-foreground mt-1 uppercase font-medium">Prob. of 50% drawdown</p>
                </CardContent>
              </Card>
              <Card className="border-emerald-200 bg-emerald-50/50 dark:bg-emerald-950/10">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2 text-emerald-600">
                    <TrendingUp className="h-4 w-4" />
                    <CardTitle className="text-xs font-bold uppercase">Growth Expectancy</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-black text-emerald-600">
                    {results?.median ? (((results.median[results.median.length - 1] - params.startBalance) / params.startBalance) * 100).toFixed(1) : "0"}%
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1 uppercase font-medium">Average projected return</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </motion.div>
    </AppLayout>
  );
}