import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, Award, Zap, Activity, AlertTriangle, ShieldCheck, Info } from 'lucide-react';
import { formatCurrency } from '@/lib/financial-math';
import { cn } from "@/lib/utils";
import { toast } from 'sonner';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts';
export function HomePage() {
  const { data: stats, isLoading } = useQuery<any>({
    queryKey: ['dashboard-stats'],
    queryFn: () => api('/api/dashboard/stats'),
  });
  useEffect(() => {
    if (stats?.alerts?.length > 0) {
      stats.alerts.forEach((alert: string) => {
        toast.error(alert, { duration: 5000, position: 'bottom-right' });
      });
    }
  }, [stats?.alerts]);
  if (isLoading) {
    return (
      <AppLayout container>
        <div className="space-y-8">
          <div className="grid gap-6 lg:grid-cols-3">
            <Skeleton className="h-48 lg:col-span-2" />
            <Skeleton className="h-48" />
          </div>
          <div className="grid gap-4 md:grid-cols-4">
            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32" />)}
          </div>
          <Skeleton className="h-96" />
        </div>
      </AppLayout>
    );
  }
  const metrics = [
    { title: "Net Equity", value: formatCurrency(stats?.equity || 10000), icon: TrendingUp, color: "text-blue-500" },
    { title: "Edge Win Rate", value: `${(stats?.winRate || 0).toFixed(1)}%`, icon: Award, color: "text-emerald-500" },
    { title: "Profit Factor", value: (stats?.profitFactor || 0).toFixed(2), icon: Zap, color: "text-amber-500" },
    { title: "Max Drawdown", value: `${(stats?.maxDrawdown || 0).toFixed(2)}%`, icon: Activity, color: "text-rose-500" },
  ];
  const chartData = stats?.recentTrades?.length > 0
    ? [...stats.recentTrades].reverse().reduce((acc: any[], t: any) => {
        const lastPnl = acc.length > 0 ? acc[acc.length - 1].pnl : 0;
        acc.push({ name: acc.length, pnl: lastPnl + (t.pnl || 0) });
        return acc;
      }, [{ name: 0, pnl: 0 }])
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
                <CardTitle className="text-sm font-black uppercase tracking-tighter text-rose-600">Behavioral Risk Engine</CardTitle>
              </div>
              <span className="text-[10px] font-bold text-rose-600 uppercase animate-pulse">Scanning Ledger...</span>
            </CardHeader>
            <CardContent className="py-4 h-[140px] overflow-y-auto">
              <div className="space-y-2">
                {stats?.alerts && stats.alerts.length > 0 ? (
                  stats.alerts.map((alert: string, i: number) => (
                    <div key={i} className="flex items-center gap-3 p-2 rounded bg-white dark:bg-black/20 border border-rose-200">
                      <ShieldCheck className="h-4 w-4 text-rose-500 shrink-0" />
                      <p className="text-[10px] font-black text-rose-700 uppercase leading-tight">{alert}</p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6">
                    <p className="text-xs font-black text-emerald-600 uppercase tracking-widest">Psychology Integrity Verified</p>
                    <p className="text-[10px] text-muted-foreground mt-1 uppercase">No active violations detected in current session.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          {/* Psychology Meter */}
          <Card className="border-2 border-primary/20 bg-primary/5">
            <CardHeader className="pb-2 border-b border-primary/10">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs font-black uppercase tracking-tighter">Psychology Score</CardTitle>
                <Info className="h-3 w-3 text-muted-foreground cursor-help" />
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center gap-4">
                <div className="text-5xl font-black text-primary">{(stats?.psychologyScore || 100)}</div>
                <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                  <div 
                    className={cn(
                      "h-full transition-all duration-1000",
                      (stats?.psychologyScore || 100) > 70 ? "bg-emerald-500" : (stats?.psychologyScore || 100) > 40 ? "bg-amber-500" : "bg-rose-500"
                    )}
                    style={{ width: `${stats?.psychologyScore || 100}%` }} 
                  />
                </div>
                <p className="text-[10px] text-muted-foreground font-black uppercase text-center tracking-widest">Discipline Rating</p>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          {metrics.map((m) => (
            <Card key={m.title} className="border-2 shadow-none hover:border-primary/40 transition-colors group">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-bold uppercase text-muted-foreground tracking-widest group-hover:text-primary transition-colors">{m.title}</p>
                  <m.icon className={cn("h-4 w-4", m.color)} />
                </div>
                <p className="text-2xl font-black tabular-nums">{m.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        <Card className="border-2 overflow-hidden">
          <CardHeader className="bg-muted/30 border-b">
            <CardTitle className="text-lg font-black uppercase tracking-tight">Cumulative PnL Growth</CardTitle>
          </CardHeader>
          <CardContent className="h-[400px] pt-8">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="pnlGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                <XAxis dataKey="name" hide />
                <YAxis 
                  stroke="#94a3b8" 
                  fontSize={10} 
                  tickFormatter={(v) => `$${v}`}
                  width={60}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 shadow-xl">
                          <p className="text-[10px] text-slate-400 uppercase font-black mb-1">Execution Index: {payload[0].payload.name}</p>
                          <p className="text-sm font-black text-white">
                            Profit: <span className={cn(payload[0].value as number >= 0 ? "text-emerald-400" : "text-rose-400")}>
                              {formatCurrency(payload[0].value as number)}
                            </span>
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <ReferenceLine y={0} stroke="#475569" strokeDasharray="3 3" />
                <Area 
                  type="monotone" 
                  dataKey="pnl" 
                  stroke="#3b82f6" 
                  strokeWidth={3} 
                  fill="url(#pnlGradient)" 
                  animationDuration={1500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}