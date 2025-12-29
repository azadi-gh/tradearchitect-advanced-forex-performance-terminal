import React, { useEffect, useMemo } from 'react';
import { useForm, type SubmitHandler, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { calculatePips } from '@/lib/financial-math';
import type { Trade, Strategy } from '@shared/types';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck } from 'lucide-react';
const tradeSchema = z.object({
  symbol: z.string().min(1, "Symbol is required").toUpperCase(),
  type: z.enum(['LONG', 'SHORT']),
  status: z.enum(['OPEN', 'CLOSED', 'CANCELLED']),
  entryPrice: z.preprocess((val) => Number(val), z.number().positive()),
  exitPrice: z.preprocess((val) => (val === "" || val === undefined ? undefined : Number(val)), z.number().optional()),
  lots: z.preprocess((val) => Number(val), z.number().positive().max(100)),
  riskPercent: z.preprocess((val) => Number(val), z.number().min(0).max(100)),
  pnl: z.preprocess((val) => (val === "" || val === undefined ? undefined : Number(val)), z.number().optional()),
  strategyId: z.string().optional(),
  checklistComplete: z.array(z.boolean()).optional(),
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
  const { register, handleSubmit, setValue, control, formState: { errors } } = useForm<TradeFormData>({
    resolver: zodResolver(tradeSchema),
    defaultValues: {
      symbol: initialData?.symbol || '',
      type: (initialData?.type as 'LONG' | 'SHORT') || 'LONG',
      status: (initialData?.status as 'OPEN' | 'CLOSED' | 'CANCELLED') || 'OPEN',
      entryPrice: initialData?.entryPrice || 0,
      exitPrice: initialData?.exitPrice,
      lots: initialData?.lots || 0.1,
      riskPercent: initialData?.riskPercent || 1,
      pnl: initialData?.pnl,
      strategyId: initialData?.strategyId || '',
      checklistComplete: initialData?.checklistComplete || [],
      notes: initialData?.notes || '',
    },
  });
  const status = useWatch({ control, name: 'status' });
  const symbol = useWatch({ control, name: 'symbol' });
  const entryPrice = useWatch({ control, name: 'entryPrice' });
  const exitPrice = useWatch({ control, name: 'exitPrice' });
  const lots = useWatch({ control, name: 'lots' });
  const type = useWatch({ control, name: 'type' });
  const strategyId = useWatch({ control, name: 'strategyId' });
  const checklistComplete = useWatch({ control, name: 'checklistComplete' }) || [];
  const selectedStrategy = useMemo(() =>
    strategies?.find(s => s.id === strategyId),
    [strategies, strategyId]
  );
  useEffect(() => {
    if (selectedStrategy && (!checklistComplete || checklistComplete.length !== selectedStrategy.checklist.length)) {
      setValue('checklistComplete', new Array(selectedStrategy.checklist.length).fill(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedStrategy, setValue]);
  useEffect(() => {
    if (status === 'CLOSED' && entryPrice && exitPrice && lots && symbol) {
      const diff = type === 'LONG' ? (exitPrice as number) - (entryPrice as number) : (entryPrice as number) - (exitPrice as number);
      const pips = calculatePips(diff, symbol);
      const calculatedPnl = pips * 10 * lots;
      setValue('pnl', Number(calculatedPnl.toFixed(2)));
    }
  }, [status, entryPrice, exitPrice, lots, type, symbol, setValue]);
  const onFormSubmit: SubmitHandler<TradeFormData> = (data) => {
    onSubmit(data);
  };
  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2 col-span-2 sm:col-span-1">
          <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Symbol</Label>
          <Input {...register('symbol')} placeholder="EURUSD" className="font-mono bg-secondary/50 border-input/50" />
          {errors.symbol && <p className="text-[10px] text-destructive font-bold uppercase">{errors.symbol.message}</p>}
        </div>
        <div className="space-y-2 col-span-2 sm:col-span-1">
          <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Strategy</Label>
          <Select onValueChange={(v) => setValue('strategyId', v)} value={strategyId}>
            <SelectTrigger className="bg-secondary/50 border-input/50"><SelectValue placeholder="Protocol" /></SelectTrigger>
            <SelectContent>
              {strategies?.map(s => (
                <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <AnimatePresence>
          {selectedStrategy && selectedStrategy.checklist.length > 0 && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="col-span-2 space-y-4 bg-primary/5 p-4 rounded-xl border-2 border-dashed border-primary/20 overflow-hidden"
            >
              <div className="flex items-center gap-2 mb-2">
                <ShieldCheck className="h-4 w-4 text-primary" />
                <Label className="text-[10px] font-black uppercase tracking-widest">Pre-Execution Checklist</Label>
              </div>
              <div className="grid gap-3">
                {selectedStrategy.checklist.map((item, idx) => (
                  <div key={idx} className="flex items-center space-x-3">
                    <Checkbox
                      id={`check-${idx}`}
                      checked={checklistComplete[idx] || false}
                      onCheckedChange={(checked) => {
                        const next = [...checklistComplete];
                        next[idx] = !!checked;
                        setValue('checklistComplete', next);
                      }}
                    />
                    <label
                      htmlFor={`check-${idx}`}
                      className="text-xs font-bold leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {item}
                    </label>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div className="space-y-2">
          <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Type</Label>
          <Select onValueChange={(v) => setValue('type', v as any)} value={type}>
            <SelectTrigger className="bg-secondary/50 border-input/50"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="LONG">Long</SelectItem>
              <SelectItem value="SHORT">Short</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Status</Label>
          <Select onValueChange={(v) => setValue('status', v as any)} value={status}>
            <SelectTrigger className="bg-secondary/50 border-input/50"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="OPEN">Open</SelectItem>
              <SelectItem value="CLOSED">Closed</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Lots</Label>
          <Input type="number" step="0.01" {...register('lots')} className="font-mono bg-secondary/50 border-input/50" />
        </div>
        <div className="space-y-2">
          <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Risk %</Label>
          <Input type="number" step="0.1" {...register('riskPercent')} className="font-mono bg-secondary/50 border-input/50" />
        </div>
        <div className="space-y-2">
          <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Entry Price</Label>
          <Input type="number" step="0.00001" {...register('entryPrice')} className="font-mono bg-secondary/50 border-input/50" />
        </div>
        {status === 'CLOSED' && (
          <>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Exit Price</Label>
              <Input type="number" step="0.00001" {...register('exitPrice')} className="font-mono bg-secondary/50 border-input/50" />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Auto PnL ($)</Label>
              <Input type="number" step="0.01" {...register('pnl')} className="font-mono bg-secondary/50 border-emerald-500/20" />
            </div>
          </>
        )}
      </div>
      <div className="space-y-2">
        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Rationale & Context</Label>
        <Textarea {...register('notes')} placeholder="Psychological state, news events, etc..." className="resize-none bg-secondary/50 border-input/50 h-24" />
      </div>
      <Button type="submit" className="w-full font-black uppercase tracking-widest h-14 bg-primary hover:scale-[1.01] active:scale-[0.99] transition-all shadow-xl shadow-primary/20" disabled={isPending}>
        {isPending ? "Syncing Execution..." : initialData?.id ? "Update Terminal Record" : "Commit Execution"}
      </Button>
    </form>
  );
}