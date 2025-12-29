import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { TrendingUp, Award, Zap, Activity, AlertTriangle, ShieldCheck } from 'lucide-react';
import { formatCurrency } from '@/lib/financial-math';
import type { FinancialSnapshot } from '@shared/types';
import { cn } from "@/lib/utils";
import { format } from 'date-fns';
import { toast } from 'sonner';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar
} from 'recharts';
export function HomePage() {
  const { data: stats, isLoading } = useQuery<any>({
    queryKey: ['dashboard-stats'],
    queryFn: () => api('/api/dashboard/stats'),
  });
  useEffect(() => {
    if (stats?.alerts?.length > 0) {
      stats.alerts.forEach((alert: string) => {
        toast.error(alert, { duration: 5000 });
      });
    }
  }, [stats?.alerts]);
  if (isLoading) return <div className="p-8 text-center animate-pulse font-bold">WAKING UP TERMINAL...</div>;
  const metrics = [
    { title: "Equity", value: formatCurrency(stats?.equity || 10000), icon: TrendingUp, color: "text-blue-500" },
    { title: "Win Rate", value: `${(stats?.winRate || 0).toFixed(1)}%`, icon: Award, color: "text-emerald-500" },
    { title: "PF", value: (stats?.profitFactor || 0).toFixed(2), icon: Zap, color: "text-amber-500" },
    { title: "Drawdown", value: `${(stats?.maxDrawdown || 0).toFixed(2)}%`, icon: Activity, color: "text-rose-500" },
  ];
  const chartData = stats?.recentTrades?.length > 0
    ? [...stats.recentTrades].reverse().map((t, i) => ({ name: i, pnl: t.pnl || 0 }))
    : [{ name: 0, pnl: 0 }];
  return (
    <AppLayout container>
      <div className="space-y-8">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Alerts Terminal */}
          <Card className="lg:col-span-2 border-2 border-rose-500/20 bg-rose-500/5 overflow-hidden">
            <CardHeader className="pb-2 flex flex-row items-center justify-between border-b border-rose-500/10">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-rose-600" />
                <CardTitle className="text-sm font-black uppercase tracking-tighter text-rose-600">Risk Terminal & Smart Alerts</CardTitle>
              </div>
              <span className="text-[10px] font-bold text-rose-600 uppercase animate-pulse">Live Scan Active</span>
            </CardHeader>
            <CardContent className="py-4">
              <div className="space-y-3">
                {stats?.alerts && stats.alerts.length > 0 ? (
                  stats.alerts.map((alert: string, i: number) => (
                    <div key={i} className="flex items-start gap-3 p-2 rounded bg-white dark:bg-black/20 border border-rose-200">
                      <ShieldCheck className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
                      <p className="text-xs font-bold text-rose-700 uppercase leading-tight">{alert}</p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6">
                    <p className="text-xs font-black text-emerald-600 uppercase tracking-widest">Behavioral Compliance: 100%</p>
                    <p className="text-[10px] text-muted-foreground mt-1 uppercase">No active rule violations detected in last 50 executions.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          {/* Risk Meter */}
          <Card className="border-2 border-primary/20 bg-primary/5">
            <CardHeader className="pb-2 border-b border-primary/10">
              <CardTitle className="text-xs font-black uppercase tracking-tighter">Daily Exposure Meter</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center gap-4">
                <div className="text-5xl font-black text-primary">{(stats?.psychologyScore || 100)}</div>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: `${stats?.psychologyScore || 100}%` }} />
                </div>
                <p className="text-[10px] text-muted-foreground font-bold uppercase text-center">Psychology Integrity Rating</p>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          {metrics.map((m) => (
            <Card key={m.title} className="border-2 shadow-none hover:border-primary/40 transition-colors">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-bold uppercase text-muted-foreground tracking-widest">{m.title}</p>
                  <m.icon className={cn("h-4 w-4", m.color)} />
                </div>
                <p className="text-2xl font-black tabular-nums">{m.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="text-lg font-black uppercase">Equity Distribution Curve</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="pnlGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                <XAxis dataKey="name" hide />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: '900' }}
                />
                <Area type="stepAfter" dataKey="pnl" stroke="#3b82f6" strokeWidth={4} fill="url(#pnlGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}