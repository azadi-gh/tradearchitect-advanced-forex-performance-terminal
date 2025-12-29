import React, { useEffect, useMemo } from 'react';
import { useForm, useWatch, type Resolver } from 'react-hook-form';
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
import { useSearchParams } from 'react-router-dom';
const tradeSchema = z.object({
  symbol: z.string().min(1, "Symbol is required").toUpperCase(),
  type: z.enum(['LONG', 'SHORT']),
  status: z.enum(['OPEN', 'CLOSED', 'CANCELLED']),
  entryPrice: z.coerce.number().positive(),
  exitPrice: z.coerce.number().optional(),
  lots: z.coerce.number().positive().max(100),
  riskPercent: z.coerce.number().min(0).max(100),
  pnl: z.coerce.number().optional(),
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
  const [searchParams] = useSearchParams();
  const { data: strategies } = useQuery<Strategy[]>({
    queryKey: ['strategies'],
    queryFn: () => api<Strategy[]>('/api/strategies'),
  });
  const { register, handleSubmit, setValue, control } = useForm<TradeFormData>({
    resolver: zodResolver(tradeSchema) as unknown as Resolver<TradeFormData>,
    defaultValues: {
      symbol: initialData?.symbol || searchParams.get('symbol') || '',
      type: (initialData?.type as TradeFormData['type']) || 'LONG',
      status: (initialData?.status as TradeFormData['status']) || 'OPEN',
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
  // Sync checklist items when strategy changes to avoid render mismatches
  useEffect(() => {
    if (selectedStrategy) {
      const expectedLength = selectedStrategy.checklist.length;
      if (checklistComplete.length !== expectedLength) {
        setValue('checklistComplete', new Array(expectedLength).fill(false));
      }
    } else if (checklistComplete.length > 0) {
      setValue('checklistComplete', []);
    }
  }, [selectedStrategy, setValue, checklistComplete.length]);
  useEffect(() => {
    if (status === 'CLOSED' && entryPrice && exitPrice && lots && symbol) {
      const diff = type === 'LONG' ? (exitPrice - entryPrice) : (entryPrice - exitPrice);
      const pips = calculatePips(diff, symbol);
      setValue('pnl', Number((pips * 10 * lots).toFixed(2)));
    }
  }, [status, entryPrice, exitPrice, lots, type, symbol, setValue]);
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2 col-span-2">
          <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Symbol Instrument</Label>
          <Input {...register('symbol')} placeholder="EURUSD" className="font-mono bg-secondary/50 font-black h-12 uppercase" />
        </div>
        <div className="space-y-2 col-span-2">
          <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Strategy Protocol</Label>
          <Select onValueChange={(v) => setValue('strategyId', v)} value={strategyId}>
            <SelectTrigger className="bg-secondary/50 font-bold h-10"><SelectValue placeholder="Manual Execution" /></SelectTrigger>
            <SelectContent className="bg-background/95 backdrop-blur-xl">
              <SelectItem value="manual">Manual Execution</SelectItem>
              {strategies?.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <AnimatePresence>
          {selectedStrategy && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="col-span-2 space-y-3 bg-primary/5 p-4 rounded-xl border border-dashed border-primary/20">
              <div className="flex items-center gap-2 mb-2"><ShieldCheck className="h-4 w-4 text-primary" /><Label className="text-[10px] font-black uppercase tracking-widest">Protocol Checklist</Label></div>
              {selectedStrategy.checklist.map((item, idx) => (
                <div key={idx} className="flex items-center space-x-3">
                  <Checkbox checked={!!checklistComplete[idx]} onCheckedChange={(c) => {
                    const n = [...checklistComplete];
                    n[idx] = !!c;
                    setValue('checklistComplete', n);
                  }} />
                  <span className="text-xs font-bold text-foreground/80">{item}</span>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
        <div className="space-y-2">
          <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Type</Label>
          <Select onValueChange={(v: any) => setValue('type', v)} value={type}>
            <SelectTrigger className="h-10 font-bold"><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="LONG">Long</SelectItem><SelectItem value="SHORT">Short</SelectItem></SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Status</Label>
          <Select onValueChange={(v: any) => setValue('status', v)} value={status}>
            <SelectTrigger className="h-10 font-bold"><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="OPEN">Open</SelectItem><SelectItem value="CLOSED">Closed</SelectItem></SelectContent>
          </Select>
        </div>
        <div className="space-y-2"><Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Lots</Label><Input type="number" step="0.01" {...register('lots')} className="h-10 font-bold" /></div>
        <div className="space-y-2"><Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Risk %</Label><Input type="number" step="0.1" {...register('riskPercent')} className="h-10 font-bold" /></div>
        <div className="space-y-2"><Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Entry Price</Label><Input type="number" step="0.00001" {...register('entryPrice')} className="h-10 font-bold" /></div>
        {status === 'CLOSED' && <div className="space-y-2"><Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Exit Price</Label><Input type="number" step="0.00001" {...register('exitPrice')} className="h-10 font-bold" /></div>}
      </div>
      <div className="space-y-2">
         <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Psychological Notes</Label>
         <Textarea {...register('notes')} placeholder="Mental state, mistakes, confluence points..." className="bg-secondary/50 h-24 font-medium" />
      </div>
      <Button type="submit" className="w-full font-black uppercase h-14 shadow-xl shadow-primary/20" disabled={isPending}>
        {isPending ? "Syncing Terminal..." : "Commit Execution Record"}
      </Button>
    </form>
  );
}