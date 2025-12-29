import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Target, Zap, ShieldCheck, AlertCircle } from 'lucide-react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
export function StrategiesPage() {
  const { data: stats, isLoading } = useQuery<any[]>({
    queryKey: ['strategy-stats'],
    queryFn: () => api('/api/journal/stats/strategies'),
  });
  const radarData = stats?.map(s => ({
    subject: s.name,
    WinRate: s.winRate,
    PF: s.profitFactor * 10,
    Expectancy: Math.max(0, s.expectancy * 5),
    Survivability: s.survivabilityScore,
    fullMark: 100,
  })) || [];
  return (
    <AppLayout container>
      <div className="space-y-8">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-black tracking-tighter uppercase">Strategy Intelligence</h1>
          <p className="text-muted-foreground">High-fidelity ranking and comparative analysis of active systems.</p>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2 border-2">
            <CardHeader>
              <CardTitle className="text-lg font-bold">Strategy Leaderboard</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>System Name</TableHead>
                    <TableHead className="text-right">Win Rate</TableHead>
                    <TableHead className="text-right">PF</TableHead>
                    <TableHead className="text-right">Expectancy</TableHead>
                    <TableHead className="text-right">Survivability</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow><TableCell colSpan={5} className="text-center py-10">Computing metrics...</TableCell></TableRow>
                  ) : stats?.map((s) => (
                    <TableRow key={s.strategyId}>
                      <TableCell className="font-bold">{s.name}</TableCell>
                      <TableCell className="text-right font-mono">{s.winRate.toFixed(1)}%</TableCell>
                      <TableCell className="text-right font-mono">{s.profitFactor.toFixed(2)}</TableCell>
                      <TableCell className="text-right font-mono">${s.expectancy.toFixed(0)}</TableCell>
                      <TableCell className="text-right">
                        <Badge variant={s.survivabilityScore > 70 ? "default" : s.survivabilityScore > 40 ? "secondary" : "destructive"}>
                          {s.survivabilityScore.toFixed(0)}%
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          <Card className="border-2 bg-slate-900 text-white">
            <CardHeader>
              <CardTitle className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                <Target className="h-4 w-4 text-emerald-500" />
                Edge Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                  <PolarGrid stroke="#334155" />
                  <PolarAngleAxis dataKey="subject" stroke="#94a3b8" fontSize={10} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} hide />
                  <Radar name="Strategy" dataKey="Survivability" stroke="#10b981" fill="#10b981" fillOpacity={0.4} />
                </RadarChart>
              </ResponsiveContainer>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase">
                  <ShieldCheck className="h-3 w-3 text-emerald-500" /> Stable Edge
                </div>
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase">
                  <AlertCircle className="h-3 w-3 text-rose-500" /> High Decay
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}