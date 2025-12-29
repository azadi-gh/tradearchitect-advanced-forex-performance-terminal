import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription } from '@/components/ui/sheet';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/financial-math';
import { TradeForm } from '@/components/trade-form';
import type { Trade } from '@shared/types';
import { format } from 'date-fns';
import { Plus, MoreVertical, Edit, Trash2, ArrowUpRight, ArrowDownRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
export function JournalPage() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editingTrade, setEditingTrade] = useState<Trade | null>(null);
  const { data: trades, isLoading } = useQuery<Trade[]>({
    queryKey: ['trades'],
    queryFn: () => api<Trade[]>('/api/journal/trades'),
  });
  const createTrade = useMutation({
    mutationFn: (data: any) => api<Trade>('/api/journal/trades', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trades'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      setOpen(false);
      toast.success("Trade synchronized successfully");
    },
  });
  const updateTrade = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => api<Trade>(`/api/journal/trades/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trades'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      setEditingTrade(null);
      toast.success("Terminal entry updated");
    },
  });
  const deleteTrade = useMutation({
    mutationFn: (id: string) => api(`/api/journal/trades/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trades'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast.error("Execution record purged");
    },
  });
  return (
    <AppLayout container>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-4xl font-black tracking-tighter uppercase text-foreground">Execution Ledger</h1>
            <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em]">Source of Truth for Multi-Strategy Performance</p>
          </div>
          <Sheet open={open || !!editingTrade} onOpenChange={(v) => { if (!v) { setOpen(false); setEditingTrade(null); } }}>
            <SheetTrigger asChild>
              <Button onClick={() => setOpen(true)} className="h-12 gap-3 px-6 font-black uppercase tracking-tighter shadow-xl shadow-primary/20 bg-primary group">
                <Plus className="h-5 w-5 group-hover:rotate-90 transition-transform duration-300" />
                Commit Execution
              </Button>
            </SheetTrigger>
            <SheetContent className="sm:max-w-[480px] overflow-y-auto backdrop-blur-xl bg-background/80">
              <SheetHeader className="mb-8">
                <SheetTitle className="text-2xl font-black uppercase tracking-tighter flex items-center gap-2">
                  <div className="h-8 w-2 bg-primary rounded-full" />
                  {editingTrade ? "Modify Terminal Record" : "New Terminal Record"}
                </SheetTitle>
                <SheetDescription>
                  Enter the specific parameters for this execution to sync with the terminal state.
                </SheetDescription>
              </SheetHeader>
              <TradeForm
                initialData={editingTrade || {}}
                isPending={createTrade.isPending || updateTrade.isPending}
                onSubmit={(data) => {
                  if (editingTrade) {
                    updateTrade.mutate({ id: editingTrade.id, data });
                  } else {
                    createTrade.mutate(data);
                  }
                }}
              />
            </SheetContent>
          </Sheet>
        </div>
        <div className="rounded-3xl border-2 border-border/50 bg-card/40 backdrop-blur-xl shadow-soft overflow-hidden">
          <div className="hidden lg:block">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow className="hover:bg-transparent border-b-2">
                  <TableHead className="w-[120px] font-black uppercase text-[10px] tracking-widest px-6">Timestamp</TableHead>
                  <TableHead className="font-black uppercase text-[10px] tracking-widest">Symbol</TableHead>
                  <TableHead className="font-black uppercase text-[10px] tracking-widest">Protocol</TableHead>
                  <TableHead className="font-black uppercase text-[10px] tracking-widest text-center">Discipline</TableHead>
                  <TableHead className="font-black uppercase text-[10px] tracking-widest text-center">Status</TableHead>
                  <TableHead className="text-right font-black uppercase text-[10px] tracking-widest px-6">PnL Outcome</TableHead>
                  <TableHead className="w-[60px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow><TableCell colSpan={7} className="text-center py-24 animate-pulse font-black text-muted-foreground uppercase tracking-widest">Synchronizing Ledger...</TableCell></TableRow>
                ) : trades?.length === 0 ? (
                  <TableRow><TableCell colSpan={7} className="text-center py-32 text-muted-foreground uppercase text-xs font-black tracking-widest">System Empty. No Executions Found.</TableCell></TableRow>
                ) : trades?.map((trade) => (
                  <TableRow key={trade.id} className="group hover:bg-primary/5 transition-colors border-b last:border-0">
                    <TableCell className="font-mono text-[10px] text-muted-foreground font-bold uppercase px-6">
                      {format(trade.entryTime, 'MMM dd | HH:mm')}
                    </TableCell>
                    <TableCell>
                       <div className="flex items-center gap-3">
                         <div className={cn(
                            "p-1.5 rounded-lg border",
                            trade.type === 'LONG' ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600" : "bg-rose-500/10 border-rose-500/20 text-rose-600"
                         )}>
                            {trade.type === 'LONG' ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                         </div>
                         <span className="font-black tracking-tighter text-sm uppercase">{trade.symbol}</span>
                       </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-[10px] font-bold uppercase text-muted-foreground border bg-secondary/30 px-2 py-0.5 rounded">
                        {trade.strategyId ? "Strategy Locked" : "Manual Entry"}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center">
                        {trade.checklistComplete?.every(c => c === true) && trade.checklistComplete.length > 0 ? (
                          <div className="flex items-center gap-1.5 text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                            <CheckCircle2 className="h-3 w-3" />
                            <span className="text-[9px] font-black uppercase">Perfect</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                            <AlertCircle className="h-3 w-3" />
                            <span className="text-[9px] font-black uppercase">Drifted</span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className={cn(
                        "text-[9px] font-black uppercase border tracking-widest",
                        trade.status === 'OPEN' ? "text-blue-600 border-blue-500/20" : "text-muted-foreground border-border"
                      )}>
                        {trade.status}
                      </Badge>
                    </TableCell>
                    <TableCell className={cn("text-right font-black tabular-nums text-sm px-6", (trade.pnl || 0) >= 0 ? "text-emerald-500" : "text-rose-500")}>
                      {trade.pnl !== undefined ? formatCurrency(trade.pnl) : '---'}
                    </TableCell>
                    <TableCell className="px-6">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 bg-background/95 backdrop-blur-md">
                          <DropdownMenuItem onClick={() => setEditingTrade(trade)} className="font-black uppercase text-[10px] tracking-widest">
                            <Edit className="h-4 w-4 mr-2" />
                            Modify Record
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive font-black uppercase text-[10px] tracking-widest"
                            onClick={() => deleteTrade.mutate(trade.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Purge Entry
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="lg:hidden p-4 space-y-4">
            {isLoading ? (
               <div className="py-20 text-center animate-pulse font-black text-muted-foreground">SYNCING...</div>
            ) : trades?.map(trade => (
              <motion.div
                key={trade.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-muted/20 border border-border/50 rounded-2xl p-4 space-y-3"
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                        "p-2 rounded-lg border",
                        trade.type === 'LONG' ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600" : "bg-rose-500/10 border-rose-500/20 text-rose-600"
                    )}>
                        {trade.type === 'LONG' ? <ArrowUpRight className="h-5 w-5" /> : <ArrowDownRight className="h-5 w-5" />}
                    </div>
                    <div>
                      <h4 className="font-black text-lg uppercase tracking-tighter">{trade.symbol}</h4>
                      <p className="text-[10px] text-muted-foreground font-bold uppercase">{format(trade.entryTime, 'MMM dd, HH:mm')}</p>
                    </div>
                  </div>
                  <div className={cn("font-black text-lg tabular-nums", (trade.pnl || 0) >= 0 ? "text-emerald-500" : "text-rose-500")}>
                    {trade.pnl !== undefined ? formatCurrency(trade.pnl) : 'OPEN'}
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-border/50">
                   <div className="flex gap-2">
                     <span className="text-[9px] font-black uppercase bg-secondary px-2 py-0.5 rounded">{trade.status}</span>
                     {trade.checklistComplete?.every(c => c === true) && (
                        <span className="text-[9px] font-black uppercase bg-emerald-500/10 text-emerald-600 px-2 py-0.5 rounded flex items-center gap-1">
                          <CheckCircle2 className="h-2 w-2" /> Discipline
                        </span>
                     )}
                   </div>
                   <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => setEditingTrade(trade)} className="h-8 w-8"><Edit className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => deleteTrade.mutate(trade.id)} className="h-8 w-8 text-rose-500"><Trash2 className="h-4 w-4" /></Button>
                   </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}