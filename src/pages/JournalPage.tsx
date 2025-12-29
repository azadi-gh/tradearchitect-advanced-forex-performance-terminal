import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatCurrency } from '@/lib/financial-math';
import type { Trade } from '@shared/types';
import { format } from 'date-fns';
import { Plus } from 'lucide-react';
export function JournalPage() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const { data: trades, isLoading } = useQuery<Trade[]>({
    queryKey: ['trades'],
    queryFn: () => api<Trade[]>('/api/journal/trades'),
  });
  const createTrade = useMutation({
    mutationFn: (newTrade: Partial<Trade>) => api<Trade>('/api/journal/trades', {
      method: 'POST',
      body: JSON.stringify({ ...newTrade, status: 'OPEN', tags: [] }),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trades'] });
      setOpen(false);
    },
  });
  return (
    <AppLayout container>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Trade Ledger</h1>
            <p className="text-muted-foreground">Comprehensive history of all executed trades.</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button gap-2>
                <Plus className="h-4 w-4" />
                Add Trade
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Log New Position</DialogTitle>
              </DialogHeader>
              <form className="space-y-4 py-4" onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                createTrade.mutate({
                  symbol: formData.get('symbol') as string,
                  type: formData.get('type') as any,
                  entryPrice: Number(formData.get('entryPrice')),
                  lots: Number(formData.get('lots')),
                });
              }}>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Symbol</label>
                    <Input name="symbol" placeholder="EURUSD" required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Type</label>
                    <Select name="type" defaultValue="LONG">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="LONG">Long</SelectItem>
                        <SelectItem value="SHORT">Short</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Entry Price</label>
                    <Input name="entryPrice" type="number" step="0.00001" required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Lots</label>
                    <Input name="lots" type="number" step="0.01" defaultValue="0.1" required />
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={createTrade.isPending}>
                  {createTrade.isPending ? "Logging..." : "Commit Trade"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
        <div className="rounded-md border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Symbol</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Entry</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">PnL</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={6} className="text-center">Loading Ledger...</TableCell></TableRow>
              ) : trades?.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No trades logged yet.</TableCell></TableRow>
              ) : trades?.map((trade) => (
                <TableRow key={trade.id}>
                  <TableCell className="font-mono text-xs">{format(trade.entryTime, 'MMM dd HH:mm')}</TableCell>
                  <TableCell className="font-bold">{trade.symbol}</TableCell>
                  <TableCell>
                    <span className={trade.type === 'LONG' ? "text-emerald-500" : "text-rose-500"}>
                      {trade.type}
                    </span>
                  </TableCell>
                  <TableCell className="font-mono">{trade.entryPrice.toFixed(5)}</TableCell>
                  <TableCell>
                    <span className="px-2 py-1 rounded-full bg-secondary text-[10px] font-bold uppercase">
                      {trade.status}
                    </span>
                  </TableCell>
                  <TableCell className={cn("text-right font-bold", (trade.pnl || 0) >= 0 ? "text-emerald-500" : "text-rose-500")}>
                    {trade.pnl !== undefined ? formatCurrency(trade.pnl) : '-'}
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
import { cn } from "@/lib/utils";