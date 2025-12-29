import React from 'react';
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
  entryPrice: z.preprocess((val) => Number(val), z.number().positive()),
  exitPrice: z.preprocess((val) => (val === "" || val === undefined ? undefined : Number(val)), z.number().optional()),
  lots: z.preprocess((val) => Number(val), z.number().positive().max(100, "Maximum 100 lots allowed")),
  riskPercent: z.preprocess((val) => Number(val), z.number().min(0).max(100)),
  pnl: z.preprocess((val) => (val === "" || val === undefined ? undefined : Number(val)), z.number().optional()),
  strategyId: z.string().optional(),
  notes: z.string().optional(),
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
      exitPrice: initialData?.exitPrice,
      lots: initialData?.lots || 0.1,
      riskPercent: initialData?.riskPercent || 1,
      pnl: initialData?.pnl,
      strategyId: initialData?.strategyId,
      notes: initialData?.notes || '',
    },
  });
  const status = watch('status');
  return (
    <form onSubmit={handleSubmit((data) => onSubmit(data))} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Symbol</Label>
          <Input {...register('symbol')} placeholder="EURUSD" />
          {errors.symbol && <p className="text-xs text-destructive">{errors.symbol.message}</p>}
        </div>
        <div className="space-y-2">
          <Label>Type</Label>
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
          <Label>Status</Label>
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
          <Label>Strategy</Label>
          <Select onValueChange={(v) => setValue('strategyId', v)} defaultValue={watch('strategyId')}>
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
          <Label>Lots</Label>
          <Input type="number" step="0.01" {...register('lots')} />
          {errors.lots && <p className="text-xs text-destructive">{errors.lots.message}</p>}
        </div>
        <div className="space-y-2">
          <Label>Risk %</Label>
          <Input type="number" step="0.1" {...register('riskPercent')} />
        </div>
        <div className="space-y-2">
          <Label>Entry Price</Label>
          <Input type="number" step="0.00001" {...register('entryPrice')} />
          {errors.entryPrice && <p className="text-xs text-destructive">{errors.entryPrice.message}</p>}
        </div>
        {status === 'CLOSED' && (
          <>
            <div className="space-y-2">
              <Label>Exit Price</Label>
              <Input type="number" step="0.00001" {...register('exitPrice')} />
            </div>
            <div className="space-y-2">
              <Label>Profit/Loss ($)</Label>
              <Input type="number" step="0.01" {...register('pnl')} />
            </div>
          </>
        )}
      </div>
      <div className="space-y-2">
        <Label>Notes</Label>
        <Textarea {...register('notes')} placeholder="Trade rationale..." />
      </div>
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Processing..." : initialData?.id ? "Update Trade" : "Log Trade"}
      </Button>
    </form>
  );
}