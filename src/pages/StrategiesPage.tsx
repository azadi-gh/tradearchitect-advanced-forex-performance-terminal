import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Target, Zap, ShieldCheck, AlertCircle, Plus, Trash2, GripVertical, Settings2, MoreHorizontal } from 'lucide-react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
export function StrategiesPage() {
  const queryClient = useQueryClient();
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingStrat, setEditingStrat] = useState<any>(null);
  const [newChecklist, setNewChecklist] = useState<string[]>([]);
  const [stratName, setStratName] = useState('');
  const [stratDesc, setStratDesc] = useState('');
  const { data: stats, isLoading } = useQuery<any[]>({
    queryKey: ['strategy-stats'],
    queryFn: () => api('/api/journal/stats/strategies'),
  });
  const { data: strategies } = useQuery<any[]>({
    queryKey: ['strategies'],
    queryFn: () => api('/api/strategies'),
  });
  const saveStrat = useMutation({
    mutationFn: (data: any) => {
      if (editingStrat) return api(`/api/strategies/${editingStrat.id}`, { method: 'PUT', body: JSON.stringify(data) });
      return api('/api/strategies', { method: 'POST', body: JSON.stringify(data) });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['strategies'] });
      queryClient.invalidateQueries({ queryKey: ['strategy-stats'] });
      setIsEditorOpen(false);
      setEditingStrat(null);
      toast.success("Strategy architecture saved.");
    }
  });
  const deleteStrat = useMutation({
    mutationFn: (id: string) => api(`/api/strategies/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['strategies'] });
      queryClient.invalidateQueries({ queryKey: ['strategy-stats'] });
      toast.error("Strategy purged from system.");
    }
  });
  const handleEdit = (strat: any) => {
    setEditingStrat(strat);
    setStratName(strat.name);
    setStratDesc(strat.description || '');
    setNewChecklist(strat.checklist || []);
    setIsEditorOpen(true);
  };
  const handleAddCheckItem = () => setNewChecklist([...newChecklist, '']);
  const handleRemoveCheckItem = (idx: number) => setNewChecklist(newChecklist.filter((_, i) => i !== idx));
  const updateCheckItem = (idx: number, val: string) => {
    const next = [...newChecklist];
    next[idx] = val;
    setNewChecklist(next);
  };
  const radarData = stats?.map(s => ({
    subject: s.name,
    WinRate: s.winRate,
    Discipline: s.disciplineScore,
    PF: s.profitFactor * 10,
    Expectancy: Math.max(0, s.expectancy * 2),
    Survivability: s.survivabilityScore,
    fullMark: 100,
  })) || [];
  return (
    <AppLayout container>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-4xl font-black tracking-tighter uppercase text-foreground">Strategy Architecture</h1>
            <p className="text-sm text-muted-foreground font-bold uppercase tracking-widest">Protocol Intelligence & Execution Standards</p>
          </div>
          <Dialog open={isEditorOpen} onOpenChange={(o) => { if(!o) { setIsEditorOpen(false); setEditingStrat(null); } }}>
            <DialogTrigger asChild>
              <Button onClick={() => {
                setStratName('');
                setStratDesc('');
                setNewChecklist(['Trend Alignment', 'Risk Defined']);
                setIsEditorOpen(true);
              }} className="gap-2 font-black uppercase tracking-tighter shadow-xl shadow-primary/20">
                <Plus className="h-4 w-4" />
                Forge Protocol
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle className="text-2xl font-black uppercase tracking-tighter">
                  {editingStrat ? 'Modify Protocol' : 'Forge New Protocol'}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-6 py-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest">System Identity</Label>
                  <Input value={stratName} onChange={e => setStratName(e.target.value)} placeholder="System Name" className="font-bold" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest">Execution Checklist</Label>
                  <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                    {newChecklist.map((item, idx) => (
                      <div key={idx} className="flex gap-2">
                        <div className="bg-muted px-2 flex items-center rounded"><GripVertical className="h-3 w-3 text-muted-foreground" /></div>
                        <Input value={item} onChange={e => updateCheckItem(idx, e.target.value)} className="text-xs font-bold" />
                        <Button variant="ghost" size="icon" onClick={() => handleRemoveCheckItem(idx)} className="text-rose-500 hover:bg-rose-500/10">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button variant="outline" className="w-full border-dashed gap-2 font-bold text-xs uppercase" onClick={handleAddCheckItem}>
                      <Plus className="h-3 w-3" /> Add Requirement
                    </Button>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button className="w-full font-black uppercase h-12" onClick={() => saveStrat.mutate({
                  name: stratName,
                  description: stratDesc,
                  checklist: newChecklist
                })}>
                  Confirm Architecture
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2 border-2 bg-card/40 backdrop-blur-xl border-border/50 shadow-soft">
            <CardHeader className="border-b bg-muted/20">
              <CardTitle className="text-lg font-black uppercase tracking-tighter flex items-center gap-2">
                <Settings2 className="h-5 w-5 text-primary" />
                Terminal Leaderboard
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-muted/10">
                  <TableRow>
                    <TableHead className="text-[10px] font-black uppercase px-6">System Protocol</TableHead>
                    <TableHead className="text-right text-[10px] font-black uppercase">Edge</TableHead>
                    <TableHead className="text-right text-[10px] font-black uppercase">Discipline</TableHead>
                    <TableHead className="text-right text-[10px] font-black uppercase px-6">Survival</TableHead>
                    <TableHead className="w-[100px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence>
                    {isLoading ? (
                      <TableRow><TableCell colSpan={5} className="text-center py-20 animate-pulse font-black text-muted-foreground tracking-widest">CALCULATING ALPHA...</TableCell></TableRow>
                    ) : stats?.map((s, idx) => (
                      <motion.tr 
                        key={s.strategyId}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="group hover:bg-primary/5 transition-colors border-b last:border-0"
                      >
                        <TableCell className="px-6">
                          <div className="flex flex-col">
                            <span className="font-black text-sm uppercase tracking-tight text-foreground">{s.name}</span>
                            <span className="text-[9px] text-muted-foreground font-bold uppercase">{s.totalTrades} Executions</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-mono font-bold">
                          <span className={cn(s.winRate > 50 ? "text-emerald-500" : "text-rose-500")}>{s.winRate.toFixed(1)}%</span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="inline-flex items-center gap-2 bg-secondary/50 px-2 py-1 rounded border border-border/50">
                            <div className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
                            <span className="font-mono font-bold text-xs">{s.disciplineScore.toFixed(0)}%</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right px-6">
                          <Badge className={cn(
                            "font-black uppercase tracking-tighter text-[10px]",
                            s.survivabilityScore > 75 ? "bg-emerald-500/20 text-emerald-600 border-emerald-500/20" : 
                            s.survivabilityScore > 45 ? "bg-amber-500/20 text-amber-600 border-amber-500/20" : 
                            "bg-rose-500/20 text-rose-600 border-rose-500/20"
                          )}>
                            {s.survivabilityScore.toFixed(0)}% Rating
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right px-6">
                          <div className="flex gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="ghost" size="icon" onClick={() => handleEdit(strategies?.find(st => st.id === s.strategyId))} className="h-7 w-7">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => deleteStrat.mutate(s.strategyId)} className="h-7 w-7 text-rose-500 hover:text-rose-600">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          <Card className="border-2 bg-slate-900 border-slate-800 text-white shadow-glow overflow-hidden">
            <CardHeader className="border-b border-white/5 bg-white/5">
              <CardTitle className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                <Zap className="h-4 w-4 text-amber-400" />
                Aggregated Alpha Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="h-[350px] p-6">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                  <PolarGrid stroke="#1e293b" />
                  <PolarAngleAxis dataKey="subject" stroke="#64748b" fontSize={9} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} hide />
                  <Radar name="Strategy" dataKey="Survivability" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.4} />
                  <Radar name="Discipline" dataKey="Discipline" stroke="#10b981" fill="#10b981" fillOpacity={0.2} />
                </RadarChart>
              </ResponsiveContainer>
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-[9px] font-black uppercase text-slate-400">
                    <ShieldCheck className="h-3 w-3 text-emerald-500" /> System Stability
                  </div>
                  <div className="text-xs font-bold text-white">Edge Integrity Confirmed</div>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-[9px] font-black uppercase text-slate-400">
                    <AlertCircle className="h-3 w-3 text-amber-500" /> Deviation Check
                  </div>
                  <div className="text-xs font-bold text-white">Low Drift Detected</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </AppLayout>
  );
}