import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { formatCurrency } from '@/lib/financial-math';
import { TradeForm } from '@/components/trade-form';
import type { Trade } from '@shared/types';
import { format } from 'date-fns';
import { Plus, MoreVertical, Edit, Trash2, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
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
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-black tracking-tighter uppercase">Execution Ledger</h1>
            <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Source of Truth for Trading Performance</p>
          </div>
          <Sheet open={open || !!editingTrade} onOpenChange={(v) => { if (!v) { setOpen(false); setEditingTrade(null); } }}>
            <SheetTrigger asChild>
              <Button onClick={() => setOpen(true)} className="gap-2 font-bold uppercase tracking-widest shadow-lg">
                <Plus className="h-4 w-4" />
                Log Position
              </Button>
            </SheetTrigger>
            <SheetContent className="sm:max-w-md overflow-y-auto">
              <SheetHeader className="mb-6">
                <SheetTitle className="text-xl font-black uppercase tracking-tighter">
                  {editingTrade ? "Modify Terminal Entry" : "New Terminal Entry"}
                </SheetTitle>
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
        <div className="rounded-2xl border-2 bg-card shadow-sm overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/50 border-b-2">
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[140px] font-black uppercase text-[10px] tracking-widest">Timestamp</TableHead>
                <TableHead className="font-black uppercase text-[10px] tracking-widest">Symbol</TableHead>
                <TableHead className="font-black uppercase text-[10px] tracking-widest">Type</TableHead>
                <TableHead className="hidden md:table-cell font-black uppercase text-[10px] tracking-widest">Volume</TableHead>
                <TableHead className="hidden sm:table-cell font-black uppercase text-[10px] tracking-widest">Entry</TableHead>
                <TableHead className="font-black uppercase text-[10px] tracking-widest text-center">Status</TableHead>
                <TableHead className="text-right font-black uppercase text-[10px] tracking-widest">Realized PnL</TableHead>
                <TableHead className="w-[60px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={8} className="text-center py-20 animate-pulse font-bold text-muted-foreground">SYNCING LEDGER DATA...</TableCell></TableRow>
              ) : trades?.length === 0 ? (
                <TableRow><TableCell colSpan={8} className="text-center py-32 text-muted-foreground uppercase text-xs font-black tracking-widest">No Executions Recorded.</TableCell></TableRow>
              ) : trades?.map((trade) => (
                <TableRow key={trade.id} className="group hover:bg-muted/30 transition-colors border-b last:border-0">
                  <TableCell className="font-mono text-[10px] text-muted-foreground font-bold uppercase">
                    {format(trade.entryTime, 'MMM dd | HH:mm')}
                  </TableCell>
                  <TableCell className="font-black tracking-tight">{trade.symbol}</TableCell>
                  <TableCell>
                    <div className={cn(
                      "flex items-center gap-1.5 font-black text-[10px] px-2 py-1 rounded border uppercase tracking-tighter w-fit",
                      trade.type === 'LONG' ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600" : "bg-rose-500/10 border-rose-500/20 text-rose-600"
                    )}>
                      {trade.type === 'LONG' ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                      {trade.type}
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell font-mono font-bold">{trade.lots.toFixed(2)}</TableCell>
                  <TableCell className="hidden sm:table-cell font-mono text-muted-foreground">{trade.entryPrice.toFixed(5)}</TableCell>
                  <TableCell className="text-center">
                    <span className={cn(
                      "px-2 py-1 rounded-md text-[9px] font-black uppercase border tracking-widest",
                      trade.status === 'OPEN' ? "bg-blue-500/10 border-blue-500/20 text-blue-600" : "bg-slate-500/10 border-slate-500/20 text-slate-500"
                    )}>
                      {trade.status}
                    </span>
                  </TableCell>
                  <TableCell className={cn("text-right font-black tabular-nums text-sm", (trade.pnl || 0) >= 0 ? "text-emerald-500" : "text-rose-500")}>
                    {trade.pnl !== undefined ? formatCurrency(trade.pnl) : '---'}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem onClick={() => setEditingTrade(trade)} className="font-bold uppercase text-[10px]">
                          <Edit className="h-4 w-4 mr-2" />
                          Update
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="text-destructive font-bold uppercase text-[10px]" 
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
      </div>
    </AppLayout>
  );
}