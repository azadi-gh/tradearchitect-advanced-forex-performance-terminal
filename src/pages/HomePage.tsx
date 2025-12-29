import React, { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, downloadJson } from '@/lib/api-client';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SessionTimeline } from '@/components/session-timeline';
import { TrendingUp, Award, Zap, Activity, AlertTriangle, ShieldCheck, BrainCircuit, Download, Database, RefreshCw, Clock } from 'lucide-react';
import { formatCurrency } from '@/lib/financial-math';
import { cn } from "@/lib/utils";
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { format } from 'date-fns';
export function HomePage() {
  const queryClient = useQueryClient();
  const { data: stats, isLoading } = useQuery<any>({
    queryKey: ['dashboard-stats'],
    queryFn: () => api('/api/dashboard/stats')
  });
  const { data: insights } = useQuery<any>({
    queryKey: ['insights'],
    queryFn: () => api('/api/insights')
  });
  const { data: sysStatus } = useQuery<any>({
    queryKey: ['system-status'],
    queryFn: () => api('/api/system/status')
  });
  const createSnapshot = useMutation({
    mutationFn: () => api('/api/system/snapshot', { method: 'POST' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system-status'] });
      toast.success("Terminal Snapshot Created Successfully");
    }
  });
  const handleExport = async () => {
    try {
      const data = await api<any>('/api/system/export');
      downloadJson(data, `trade-architect-backup-${format(new Date(), 'yyyy-MM-dd')}.json`);
      toast.success("Export Complete");
    } catch (e) {
      toast.error("Export Failed");
    }
  };
  useEffect(() => {
    if (stats?.alerts?.length > 0) {
      stats.alerts.forEach((alert: string) => {
        toast.error(alert, { duration: 6000, position: 'bottom-right' });
      });
    }
  }, [stats?.alerts]);
  if (isLoading) {
    return (
      <AppLayout container>
        <div className="space-y-8 animate-pulse">
          <Skeleton className="h-48 rounded-2xl w-full" />
          <div className="grid gap-6 md:grid-cols-4">
            <Skeleton className="h-32 rounded-2xl" />
            <Skeleton className="h-32 rounded-2xl" />
            <Skeleton className="h-32 rounded-2xl" />
            <Skeleton className="h-32 rounded-2xl" />
          </div>
        </div>
      </AppLayout>
    );
  }
  const metrics = [
    { title: "Net Equity", value: formatCurrency(stats?.equity ?? 10000), icon: TrendingUp, color: "text-blue-500" },
    { title: "Edge Win Rate", value: `${(stats?.winRate ?? 0).toFixed(1)}%`, icon: Award, color: "text-emerald-500" },
    { title: "Profit Factor", value: (stats?.profitFactor ?? 0).toFixed(2), icon: Zap, color: "text-amber-500" },
    { title: "Max Drawdown", value: `${(stats?.maxDrawdown ?? 0).toFixed(2)}%`, icon: Activity, color: "text-rose-500" },
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
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2 border-2 bg-slate-900 border-slate-800 text-white shadow-glow">
            <CardHeader className="border-b border-white/5 bg-white/5 flex flex-row items-center justify-between">
              <div className="flex items-center gap-3">
                <BrainCircuit className="h-5 w-5 text-blue-400" />
                <CardTitle className="text-sm font-black uppercase tracking-widest text-white">Market Intel: Behavioral & Session Audit</CardTitle>
              </div>
              <Badge variant="outline" className="border-blue-400/30 text-blue-400 text-[9px] uppercase font-black">Active Monitoring</Badge>
            </CardHeader>
            <CardContent className="py-6 space-y-8">
              <SessionTimeline />
              <div className="grid gap-4 pt-4 border-t border-white/5">
                <AnimatePresence mode="popLayout">
                  {insights?.length > 0 ? insights.map((insight: any, i: number) => (
                    <motion.div key={i} initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className={cn(
                      "flex items-center gap-4 p-4 rounded-xl border transition-all",
                      insight.type === 'POSITIVE' ? "bg-emerald-500/10 border-emerald-500/20" : insight.type === 'NEGATIVE' ? "bg-rose-500/10 border-rose-500/20" : "bg-white/5 border-white/10"
                    )}>
                      {insight.type === 'NEGATIVE' ? <AlertTriangle className="h-5 w-5 text-rose-500" /> : <ShieldCheck className="h-5 w-5 text-emerald-500" />}
                      <div>
                        <h4 className="text-xs font-black uppercase tracking-tight">{insight.title}</h4>
                        <p className="text-[11px] text-slate-400 font-medium">{insight.message}</p>
                      </div>
                    </motion.div>
                  )) : (
                    <div className="text-center py-6 text-slate-500 font-bold uppercase text-[10px]">
                      Establishing behavioral baseline...
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </CardContent>
          </Card>
          <div className="space-y-6 flex flex-col">
            <Card className="border-2 border-primary/20 bg-card/40 backdrop-blur-xl group transition-all duration-500 flex flex-col">
              <CardHeader className="pb-3 border-b"><CardTitle className="text-xs font-black uppercase">Protocol Discipline</CardTitle></CardHeader>
              <CardContent className="pt-8 flex flex-col items-center justify-center gap-6">
                <div className="text-6xl font-black text-foreground tabular-nums tracking-tighter">{(stats?.psychologyScore ?? 100)}</div>
                <div className="w-full h-4 bg-secondary/50 rounded-full overflow-hidden p-1 border border-border/50">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${stats?.psychologyScore ?? 100}%` }} className={cn(
                    "h-full rounded-full transition-all duration-1000",
                    (stats?.psychologyScore ?? 100) > 70 ? "bg-emerald-500" : (stats?.psychologyScore ?? 100) > 40 ? "bg-amber-500" : "bg-rose-500"
                  )} />
                </div>
                <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em]">Execution Rating</p>
              </CardContent>
            </Card>
            <Card className="flex-1 border-2 bg-slate-900 border-slate-800 text-white shadow-soft p-0 overflow-hidden">
               <CardHeader className="p-4 border-b border-white/5 bg-white/5 flex flex-row items-center justify-between">
                 <CardTitle className="text-[10px] font-black uppercase tracking-widest text-slate-400">System Integrity</CardTitle>
                 <Badge className="bg-emerald-500/20 text-emerald-500 border-emerald-500/30 text-[9px] animate-pulse">Synced</Badge>
               </CardHeader>
               <CardContent className="p-4 space-y-4">
                 <div className="flex items-center justify-between">
                   <div className="flex flex-col">
                     <span className="text-[9px] font-black uppercase text-slate-500">Last Snapshot</span>
                     <span className="text-xs font-bold text-white tabular-nums">
                       {sysStatus?.lastSnapshot ? format(sysStatus.lastSnapshot, 'MMM dd, HH:mm') : 'None Detected'}
                     </span>
                   </div>
                   <Button size="sm" variant="ghost" className="h-8 w-8 text-slate-400 hover:text-white" onClick={() => queryClient.invalidateQueries({ queryKey: ['system-status'] })}>
                     <RefreshCw className="h-4 w-4" />
                   </Button>
                 </div>
                 <div className="grid grid-cols-2 gap-2 pt-2">
                    <Button onClick={() => createSnapshot.mutate()} disabled={createSnapshot.isPending} className="bg-white/5 hover:bg-white/10 text-white border-white/10 text-[9px] font-black uppercase h-9 gap-2">
                      <Database className="h-3 w-3 text-blue-400" /> Snapshot
                    </Button>
                    <Button onClick={handleExport} className="bg-white/5 hover:bg-white/10 text-white border-white/10 text-[9px] font-black uppercase h-9 gap-2">
                      <Download className="h-3 w-3 text-emerald-400" /> Export
                    </Button>
                 </div>
                 <div className="pt-4 border-t border-white/5 flex items-center gap-2">
                    <Clock className="h-3 w-3 text-slate-500" />
                    <span className="text-[8px] font-black uppercase text-slate-500 tracking-tighter">
                      Health Check: OK • {sysStatus?.counts?.trades ?? 0} Records Active
                    </span>
                 </div>
               </CardContent>
            </Card>
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-4">
          {metrics.map((m, idx) => (
            <Card key={idx} className="border-2 shadow-none hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4"><p className="text-[10px] font-black uppercase text-muted-foreground">{m.title}</p><m.icon className={cn("h-4 w-4", m.color)} /></div>
                <p className="text-3xl font-black tabular-nums tracking-tighter text-foreground">{m.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        <Card className="border-2 border-border/50 bg-card/40 backdrop-blur-xl overflow-hidden shadow-soft">
          <CardHeader className="bg-muted/10 border-b p-6"><CardTitle className="text-xl font-black uppercase text-foreground">Equity Growth Path</CardTitle></CardHeader>
          <CardContent className="h-[450px] p-6">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs><linearGradient id="pnlG" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/><stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.05} />
                <XAxis dataKey="name" hide /><YAxis stroke="#94a3b8" fontSize={10} axisLine={false} tickLine={false} width={60} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px', color: '#fff' }} formatter={(v: any) => formatCurrency(v)} />
                <ReferenceLine y={0} stroke="#475569" strokeDasharray="5 5" />
                <Area type="monotone" dataKey="pnl" stroke="#3b82f6" strokeWidth={4} fill="url(#pnlG)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>
    </AppLayout>
  );
}