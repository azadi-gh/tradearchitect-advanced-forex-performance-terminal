import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import type { Trade, Strategy } from '@shared/types';
const tradeSchema = z.object({
  symbol: z.string().min(1, "Symbol is required").toUpperCase(),
  type: z.enum(['LONG', 'SHORT']),
  status: z.enum(['OPEN', 'CLOSED', 'CANCELLED']),
  entryPrice: z.coerce.number().positive("Entry price must be positive"),
  exitPrice: z.coerce.number().optional().nullable(),
  lots: z.coerce.number().positive().max(100, "Maximum 100 lots allowed"),
  riskPercent: z.coerce.number().min(0).max(100),
  pnl: z.coerce.number().optional().nullable(),
  strategyId: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});
type TradeFormData = z.infer<typeof tradeSchema>;
interface TradeFormProps {
  initialData?: Partial<Trade>;
  onSubmit: (data: TradeFormData) => void;
  isPending?: boolean;
}
export function TradeForm({ initialData, onSubmit, isPending }: TradeFormProps) {
  const { data: strategies } = useQuery<Strategy[]>({
    queryKey: ['strategies'],
    queryFn: () => api<Strategy[]>('/api/strategies'),
  });
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<TradeFormData>({
    resolver: zodResolver(tradeSchema),
    defaultValues: {
      symbol: initialData?.symbol || '',
      type: initialData?.type || 'LONG',
      status: initialData?.status || 'OPEN',
      entryPrice: initialData?.entryPrice || 0,
      exitPrice: initialData?.exitPrice ?? null,
      lots: initialData?.lots || 0.1,
      riskPercent: initialData?.riskPercent || 1,
      pnl: initialData?.pnl ?? null,
      strategyId: initialData?.strategyId ?? '',
      notes: initialData?.notes || '',
    },
  });
  const status = watch('status');
  const entryPrice = watch('entryPrice');
  const exitPrice = watch('exitPrice');
  const lots = watch('lots');
  const type = watch('type');
  // Auto-calculate PnL when conditions are met
  useEffect(() => {
    if (status === 'CLOSED' && entryPrice && exitPrice && lots) {
      const diff = type === 'LONG' ? exitPrice - entryPrice : entryPrice - exitPrice;
      const pips = diff / 0.0001; // Approximate major pair pip scale
      const calculatedPnl = pips * 10 * lots;
      setValue('pnl', Number(calculatedPnl.toFixed(2)));
    }
  }, [status, entryPrice, exitPrice, lots, type, setValue]);
  return (
    <form onSubmit={handleSubmit((data) => onSubmit(data))} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-xs font-bold uppercase">Symbol</Label>
          <Input {...register('symbol')} placeholder="EURUSD" className="font-mono" />
          {errors.symbol && <p className="text-xs text-destructive">{errors.symbol.message}</p>}
        </div>
        <div className="space-y-2">
          <Label className="text-xs font-bold uppercase">Type</Label>
          <Select onValueChange={(v) => setValue('type', v as any)} defaultValue={watch('type')}>
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
          <Label className="text-xs font-bold uppercase">Status</Label>
          <Select onValueChange={(v) => setValue('status', v as any)} defaultValue={watch('status')}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="OPEN">Open</SelectItem>
              <SelectItem value="CLOSED">Closed</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label className="text-xs font-bold uppercase">Strategy</Label>
          <Select onValueChange={(v) => setValue('strategyId', v)} defaultValue={watch('strategyId') || undefined}>
            <SelectTrigger>
              <SelectValue placeholder="Select Strategy" />
            </SelectTrigger>
            <SelectContent>
              {strategies?.map(s => (
                <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label className="text-xs font-bold uppercase">Lots</Label>
          <Input type="number" step="0.01" {...register('lots')} className="font-mono" />
          {errors.lots && <p className="text-xs text-destructive">{errors.lots.message}</p>}
        </div>
        <div className="space-y-2">
          <Label className="text-xs font-bold uppercase">Risk %</Label>
          <Input type="number" step="0.1" {...register('riskPercent')} className="font-mono" />
        </div>
        <div className="space-y-2">
          <Label className="text-xs font-bold uppercase">Entry Price</Label>
          <Input type="number" step="0.00001" {...register('entryPrice')} className="font-mono" />
        </div>
        {status === 'CLOSED' && (
          <>
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase">Exit Price</Label>
              <Input type="number" step="0.00001" {...register('exitPrice')} className="font-mono" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase text-emerald-500">Auto PnL ($)</Label>
              <Input type="number" step="0.01" {...register('pnl')} className="font-mono bg-emerald-50/10 border-emerald-500/20" />
            </div>
          </>
        )}
      </div>
      <div className="space-y-2">
        <Label className="text-xs font-bold uppercase">Notes</Label>
        <Textarea {...register('notes')} placeholder="Trade rationale..." className="resize-none" />
      </div>
      <Button type="submit" className="w-full font-bold uppercase tracking-widest h-12" disabled={isPending}>
        {isPending ? "Syncing..." : initialData?.id ? "Update Terminal" : "Commit Trade"}
      </Button>
    </form>
  );
}