import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
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
    mutationFn: (data: Partial<Trade>) => api<Trade>('/api/journal/trades', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trades'] });
      setOpen(false);
      toast.success("Trade logged successfully");
    },
  });
  const updateTrade = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Trade> }) => api<Trade>(`/api/journal/trades/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trades'] });
      setEditingTrade(null);
      toast.success("Trade updated");
    },
  });
  const deleteTrade = useMutation({
    mutationFn: (id: string) => api(`/api/journal/trades/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trades'] });
      toast.error("Trade deleted");
    },
  });
  return (
    <AppLayout container>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Trade Ledger</h1>
            <p className="text-muted-foreground">Comprehensive history of all your executions.</p>
          </div>
          <Sheet open={open || !!editingTrade} onOpenChange={(v) => { if (!v) { setOpen(false); setEditingTrade(null); } }}>
            <SheetTrigger asChild>
              <Button onClick={() => setOpen(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Add Trade
              </Button>
            </SheetTrigger>
            <SheetContent className="sm:max-w-md overflow-y-auto">
              <SheetHeader className="mb-6">
                <SheetTitle>{editingTrade ? "Edit Position" : "Log New Position"}</SheetTitle>
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
        <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="w-[120px]">Date</TableHead>
                <TableHead>Symbol</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Lots</TableHead>
                <TableHead>Entry</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">PnL</TableHead>
                <TableHead className="w-[60px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={8} className="text-center py-10">Syncing ledger...</TableCell></TableRow>
              ) : trades?.length === 0 ? (
                <TableRow><TableCell colSpan={8} className="text-center py-20 text-muted-foreground">No trades recorded yet.</TableCell></TableRow>
              ) : trades?.map((trade) => (
                <TableRow key={trade.id} className="group">
                  <TableCell className="font-mono text-[10px] text-muted-foreground">
                    {format(trade.entryTime, 'MMM dd HH:mm')}
                  </TableCell>
                  <TableCell className="font-bold">{trade.symbol}</TableCell>
                  <TableCell>
                    <div className={cn(
                      "flex items-center gap-1.5 font-bold text-xs px-2 py-0.5 rounded-md w-fit",
                      trade.type === 'LONG' ? "bg-emerald-500/10 text-emerald-600" : "bg-rose-500/10 text-rose-600"
                    )}>
                      {trade.type === 'LONG' ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                      {trade.type}
                    </div>
                  </TableCell>
                  <TableCell className="font-mono">{trade.lots.toFixed(2)}</TableCell>
                  <TableCell className="font-mono">{trade.entryPrice.toFixed(5)}</TableCell>
                  <TableCell>
                    <span className={cn(
                      "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border",
                      trade.status === 'OPEN' ? "bg-blue-50 border-blue-200 text-blue-600" : "bg-slate-50 border-slate-200 text-slate-500"
                    )}>
                      {trade.status}
                    </span>
                  </TableCell>
                  <TableCell className={cn("text-right font-bold tabular-nums", (trade.pnl || 0) >= 0 ? "text-emerald-500" : "text-rose-500")}>
                    {trade.pnl !== undefined ? formatCurrency(trade.pnl) : '-'}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setEditingTrade(trade)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={() => deleteTrade.mutate(trade.id)}>
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
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