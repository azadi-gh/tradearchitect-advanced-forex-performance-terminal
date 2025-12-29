import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { TrendingUp, Award, Zap, Activity, ArrowUpRight, ArrowDownRight, Clock, AlertCircle } from 'lucide-react';
import { formatCurrency } from '@/lib/financial-math';
import type { FinancialSnapshot } from '@shared/types';
import { cn } from "@/lib/utils";
import { format } from 'date-fns';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
export function HomePage() {
  const { data: stats, isLoading } = useQuery<FinancialSnapshot & { psychologyScore: number; alerts: string[] }>({
    queryKey: ['dashboard-stats'],
    queryFn: () => api<any>('/api/dashboard/stats'),
  });
  if (isLoading) return <div className="p-8 text-center text-muted-foreground animate-pulse">Initializing Terminal...</div>;
  const cards = [
    { title: "Account Equity", value: formatCurrency(stats?.equity || 0), icon: TrendingUp, color: "text-blue-500", desc: "Current value" },
    { title: "Win Rate", value: `${(stats?.winRate || 0).toFixed(1)}%`, icon: Award, color: "text-emerald-500", desc: "Trade edge" },
    { title: "Profit Factor", value: (stats?.profitFactor || 0).toFixed(2), icon: Zap, color: "text-amber-500", desc: "Risk efficiency" },
    { title: "Max Drawdown", value: `${(stats?.maxDrawdown || 0).toFixed(2)}%`, icon: Activity, color: "text-rose-500", desc: "Capital safety" },
  ];
  const chartData = stats?.recentTrades ? [...stats.recentTrades].reverse().map((t, i) => ({
    name: i,
    pnl: t.pnl || 0,
    time: format(t.entryTime, 'MMM dd'),
    symbol: t.symbol
  })) : [];
  const psychData = [
    { name: 'Discipline', value: stats?.psychologyScore || 0 },
    { name: 'Remaining', value: 100 - (stats?.psychologyScore || 0) }
  ];
  return (
    <AppLayout container>
      <div className="space-y-8">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-black tracking-tighter uppercase">Command Center</h1>
          <p className="text-muted-foreground">Strategic overview of account performance and risk exposure.</p>
        </div>
        {stats?.alerts && stats.alerts.length > 0 && (
          <div className="bg-rose-500/10 border border-rose-500/20 p-3 rounded-lg flex items-center gap-3 animate-pulse">
            <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />
            <div className="flex-1 overflow-hidden">
              <div className="whitespace-nowrap text-sm font-bold text-rose-600 uppercase tracking-tight">
                Smart Alert: {stats.alerts[0]}
              </div>
            </div>
          </div>
        )}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {cards.map((card) => (
            <Card key={card.title} className="relative overflow-hidden border-2 shadow-sm bg-card hover:border-primary/20 transition-colors">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{card.title}</CardTitle>
                <card.icon className={cn("h-4 w-4", card.color)} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-black">{card.value}</div>
                <p className="text-[10px] text-muted-foreground mt-1 uppercase font-medium">{card.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg font-bold">Equity Trajectory</CardTitle>
              <CardDescription>Visual distribution of pnl contributions</CardDescription>
            </CardHeader>
            <CardContent className="h-[350px] pl-0">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorPnL" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                  <XAxis dataKey="time" hide />
                  <YAxis hide />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '8px', border: '1px solid hsl(var(--border))' }}
                    labelStyle={{ display: 'none' }}
                  />
                  <Area type="monotone" dataKey="pnl" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorPnL)" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <div className="space-y-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold uppercase">Psychology Score</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center pt-4">
                <div className="relative h-32 w-32">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={psychData}
                        innerRadius={40}
                        outerRadius={60}
                        paddingAngle={5}
                        dataKey="value"
                        startAngle={180}
                        endAngle={0}
                      >
                        <Cell fill="#10b981" />
                        <Cell fill="hsl(var(--muted))" />
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pt-6">
                    <span className="text-2xl font-black">{stats?.psychologyScore}</span>
                    <span className="text-[10px] uppercase font-bold text-muted-foreground">PTS</span>
                  </div>
                </div>
                <p className="text-center text-[10px] text-muted-foreground uppercase font-bold mt-2">
                  Behavioral Discipline Rating
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold uppercase">Execution Tape</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stats?.recentTrades?.slice(0, 4).map((trade) => (
                    <div key={trade.id} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className={cn("font-black", trade.type === 'LONG' ? "text-emerald-500" : "text-rose-500")}>
                          {trade.symbol}
                        </span>
                        <span className="text-muted-foreground">{format(trade.entryTime, 'HH:mm')}</span>
                      </div>
                      <span className={cn("font-bold", (trade.pnl || 0) >= 0 ? "text-emerald-500" : "text-rose-500")}>
                        {formatCurrency(trade.pnl || 0)}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}