import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { TrendingUp, Award, Zap, Activity, ArrowUpRight, ArrowDownRight, Clock } from 'lucide-react';
import { formatCurrency } from '@/lib/financial-math';
import type { FinancialSnapshot } from '@shared/types';
import { cn } from "@/lib/utils";
import { format } from 'date-fns';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
export function HomePage() {
  const { data: stats, isLoading } = useQuery<FinancialSnapshot>({
    queryKey: ['dashboard-stats'],
    queryFn: () => api<FinancialSnapshot>('/api/dashboard/stats'),
  });
  if (isLoading) return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading Terminal...</div>;
  const cards = [
    { title: "Account Equity", value: formatCurrency(stats?.equity || 0), icon: TrendingUp, color: "text-blue-500", desc: "Total floating value" },
    { title: "Win Rate", value: `${(stats?.winRate || 0).toFixed(1)}%`, icon: Award, color: "text-emerald-500", desc: "Closed trade success" },
    { title: "Profit Factor", value: (stats?.profitFactor || 0).toFixed(2), icon: Zap, color: "text-amber-500", desc: "Risk adjusted return" },
    { title: "Max Drawdown", value: `${(stats?.maxDrawdown || 0).toFixed(2)}%`, icon: Activity, color: "text-rose-500", desc: "Peak-to-trough decline" },
  ];
  // Generate data points for chart
  const chartData = stats?.recentTrades ? [...stats.recentTrades].reverse().map((t, i) => ({
    name: i,
    pnl: t.pnl || 0,
    time: format(t.entryTime, 'MMM dd'),
    symbol: t.symbol
  })) : [];
  return (
    <AppLayout container>
      <div className="space-y-8">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-black tracking-tighter uppercase">Command Center</h1>
          <p className="text-muted-foreground">Strategic overview of account performance and risk exposure.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {cards.map((card) => (
            <Card key={card.title} className="relative overflow-hidden border-2 shadow-sm">
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
              <CardDescription>Recent trade performance distribution</CardDescription>
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
                  <Area
                    type="monotone"
                    dataKey="pnl"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorPnL)"
                    animationDuration={1500}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-bold">Recent Tape</CardTitle>
              <CardDescription>Last active executions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats?.recentTrades?.slice(0, 5).map((trade) => (
                  <div key={trade.id} className="flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "h-8 w-8 rounded flex items-center justify-center",
                        trade.type === 'LONG' ? "bg-emerald-500/10 text-emerald-600" : "bg-rose-500/10 text-rose-600"
                      )}>
                        {trade.type === 'LONG' ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                      </div>
                      <div>
                        <p className="text-sm font-bold leading-none">{trade.symbol}</p>
                        <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
                          <Clock className="h-2.5 w-2.5" />
                          {format(trade.entryTime, 'MMM dd, HH:mm')}
                        </p>
                      </div>
                    </div>
                    <div className={cn("text-sm font-black", (trade.pnl || 0) >= 0 ? "text-emerald-500" : "text-rose-500")}>
                      {(trade.pnl || 0) > 0 ? '+' : ''}{formatCurrency(trade.pnl || 0)}
                    </div>
                  </div>
                ))}
                {!stats?.recentTrades?.length && (
                  <div className="py-10 text-center text-xs text-muted-foreground">No tape activity found.</div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}