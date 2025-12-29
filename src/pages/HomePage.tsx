import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, Award, Zap, Activity, AlertTriangle, ShieldCheck, Info, UserCheck } from 'lucide-react';
import { formatCurrency } from '@/lib/financial-math';
import { cn } from "@/lib/utils";
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
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
        const isDiscipline = alert.includes('Discipline');
        toast[isDiscipline ? 'warning' : 'error'](alert, { 
          duration: 6000, 
          position: 'bottom-right',
          className: isDiscipline ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/20' : 'border-rose-500'
        });
      });
    }
  }, [stats?.alerts]);
  if (isLoading) {
    return (
      <AppLayout container>
        <div className="space-y-8 animate-pulse">
          <div className="grid gap-6 lg:grid-cols-3">
            <Skeleton className="h-48 lg:col-span-2 rounded-2xl" />
            <Skeleton className="h-48 rounded-2xl" />
          </div>
          <div className="grid gap-4 md:grid-cols-4">
            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 rounded-2xl" />)}
          </div>
          <Skeleton className="h-[400px] rounded-2xl" />
        </div>
      </AppLayout>
    );
  }
  const metrics = [
    { title: "Net Equity", value: formatCurrency(stats?.equity || 10000), icon: TrendingUp, color: "text-blue-500", glow: "shadow-blue-500/10" },
    { title: "Edge Win Rate", value: `${(stats?.winRate || 0).toFixed(1)}%`, icon: Award, color: "text-emerald-500", glow: "shadow-emerald-500/10" },
    { title: "Profit Factor", value: (stats?.profitFactor || 0).toFixed(2), icon: Zap, color: "text-amber-500", glow: "shadow-amber-500/10" },
    { title: "Max Drawdown", value: `${(stats?.maxDrawdown || 0).toFixed(2)}%`, icon: Activity, color: "text-rose-500", glow: "shadow-rose-500/10" },
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
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="space-y-8"
      >
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2 border-2 border-rose-500/20 bg-card/40 backdrop-blur-xl overflow-hidden shadow-soft">
            <CardHeader className="pb-3 flex flex-row items-center justify-between border-b border-border/50 bg-rose-500/5">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-rose-500/10 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-rose-600" />
                </div>
                <CardTitle className="text-sm font-black uppercase tracking-widest text-foreground">Behavioral Risk Engine</CardTitle>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-rose-500 animate-ping" />
                <span className="text-[10px] font-black text-rose-600 uppercase tracking-tighter">Scanning Session...</span>
              </div>
            </CardHeader>
            <CardContent className="py-6 h-[160px] overflow-y-auto">
              <div className="space-y-3">
                <AnimatePresence mode="popLayout">
                  {stats?.alerts && stats.alerts.length > 0 ? (
                    stats.alerts.map((alert: string, i: number) => (
                      <motion.div 
                        key={alert}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className={cn(
                          "flex items-center gap-4 p-3 rounded-xl border transition-all",
                          alert.includes('Discipline') 
                            ? "bg-amber-500/10 border-amber-500/20 text-amber-700" 
                            : "bg-rose-500/10 border-rose-500/20 text-rose-700"
                        )}
                      >
                        <ShieldCheck className="h-4 w-4 shrink-0" />
                        <p className="text-[11px] font-black uppercase leading-tight tracking-tight">{alert}</p>
                      </motion.div>
                    ))
                  ) : (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center py-8"
                    >
                      <UserCheck className="h-8 w-8 text-emerald-500 mx-auto mb-2 opacity-50" />
                      <p className="text-xs font-black text-emerald-600 uppercase tracking-widest">Psychology Integrity Verified</p>
                      <p className="text-[10px] text-muted-foreground mt-1 uppercase font-bold">No active violations detected.</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </CardContent>
          </Card>
          <Card className="border-2 border-primary/20 bg-card/40 backdrop-blur-xl shadow-soft group hover:border-primary/40 transition-all duration-500">
            <CardHeader className="pb-3 border-b border-border/50">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs font-black uppercase tracking-widest">Protocol Discipline</CardTitle>
                <Info className="h-4 w-4 text-muted-foreground cursor-help hover:text-primary transition-colors" />
              </div>
            </CardHeader>
            <CardContent className="pt-8">
              <div className="flex flex-col items-center gap-6">
                <div className="relative">
                  <div className="text-6xl font-black text-foreground tabular-nums tracking-tighter">{(stats?.psychologyScore || 100)}</div>
                  <div className="absolute -top-1 -right-4 h-3 w-3 rounded-full bg-primary animate-pulse" />
                </div>
                <div className="w-full h-4 bg-secondary/50 rounded-full overflow-hidden p-1 border border-border/50">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${stats?.psychologyScore || 100}%` }}
                    transition={{ duration: 1.5, ease: "circOut" }}
                    className={cn(
                      "h-full rounded-full transition-all duration-1000 shadow-sm",
                      (stats?.psychologyScore || 100) > 70 ? "bg-emerald-500" : (stats?.psychologyScore || 100) > 40 ? "bg-amber-500" : "bg-rose-500"
                    )}
                  />
                </div>
                <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em] text-center">Execution Standard Rating</p>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="grid gap-6 md:grid-cols-4">
          {metrics.map((m, idx) => (
            <motion.div
              key={m.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card className={cn(
                "border-2 shadow-none hover:shadow-lg transition-all duration-300 group relative overflow-hidden",
                m.glow
              )}>
                <CardContent className="p-6 relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.15em] group-hover:text-primary transition-colors">{m.title}</p>
                    <div className={cn("p-2 rounded-lg bg-secondary/50 group-hover:scale-110 transition-transform", m.color)}>
                      <m.icon className="h-4 w-4" />
                    </div>
                  </div>
                  <p className="text-3xl font-black tabular-nums tracking-tighter text-foreground">{m.value}</p>
                </CardContent>
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-700" />
              </Card>
            </motion.div>
          ))}
        </div>
        <Card className="border-2 border-border/50 bg-card/40 backdrop-blur-xl overflow-hidden shadow-soft">
          <CardHeader className="bg-muted/10 border-b p-6">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-black uppercase tracking-tight text-foreground">Equity Performance Matrix</CardTitle>
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded bg-blue-500" />
                  <span className="text-[10px] font-black uppercase text-muted-foreground">Cumulative PnL</span>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="h-[450px] p-6">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="pnlGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.05} />
                <XAxis dataKey="name" hide />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={10}
                  tickFormatter={(v) => `${v}`}
                  width={60}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-slate-950/90 backdrop-blur-md p-4 rounded-2xl border border-slate-800 shadow-2xl">
                          <p className="text-[10px] text-slate-500 uppercase font-black mb-2 tracking-widest border-b border-white/5 pb-1">Execution #{payload[0].payload.name}</p>
                          <div className="flex items-center gap-3">
                             <div className={cn("p-1.5 rounded bg-white/5", (payload[0].value as number) >= 0 ? "text-emerald-400" : "text-rose-400")}>
                                <TrendingUp className="h-3 w-3" />
                             </div>
                             <div>
                                <p className="text-[10px] text-slate-400 font-bold uppercase">Balance Delta</p>
                                <p className={cn("text-lg font-black", (payload[0].value as number) >= 0 ? "text-emerald-400" : "text-rose-400")}>
                                  {formatCurrency(payload[0].value as number)}
                                </p>
                             </div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <ReferenceLine y={0} stroke="#475569" strokeDasharray="5 5" strokeOpacity={0.5} />
                <Area
                  type="monotone"
                  dataKey="pnl"
                  stroke="#3b82f6"
                  strokeWidth={4}
                  fill="url(#pnlGradient)"
                  animationDuration={2000}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>
    </AppLayout>
  );
}