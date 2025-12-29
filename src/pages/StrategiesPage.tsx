import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Target, Plus, Zap, TrendingUp } from 'lucide-react';
import type { Strategy } from '@shared/types';
export function StrategiesPage() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const { data: strategies, isLoading } = useQuery<Strategy[]>({
    queryKey: ['strategies'],
    queryFn: () => api<Strategy[]>('/api/strategies'),
  });
  const createStrategy = useMutation({
    mutationFn: (data: Partial<Strategy>) => api<Strategy>('/api/strategies', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['strategies'] });
      setOpen(false);
    },
  });
  return (
    <AppLayout container>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Strategy Vault</h1>
            <p className="text-muted-foreground">Manage and compare your trading systems.</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                New Strategy
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Strategy</DialogTitle>
              </DialogHeader>
              <form className="space-y-4 pt-4" onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                createStrategy.mutate({
                  name: formData.get('name') as string,
                  description: formData.get('description') as string,
                });
              }}>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Strategy Name</label>
                  <Input name="name" placeholder="e.g. Trend Rider H4" required />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Description</label>
                  <Textarea name="description" placeholder="Logic and rules..." />
                </div>
                <Button type="submit" className="w-full" disabled={createStrategy.isPending}>
                  {createStrategy.isPending ? "Creating..." : "Save Strategy"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map(i => <Card key={i} className="h-48 animate-pulse bg-muted" />)}
          </div>
        ) : strategies?.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Target className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold">No Strategies Yet</h3>
            <p className="text-muted-foreground">Define your first trading system to start tracking performance.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {strategies?.map((strategy) => (
              <Card key={strategy.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl">{strategy.name}</CardTitle>
                    <Target className="h-4 w-4 text-primary" />
                  </div>
                  <CardDescription className="line-clamp-2 mt-1">
                    {strategy.description || "No description provided."}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 pt-4">
                    <div className="space-y-1">
                      <p className="text-2xs uppercase text-muted-foreground font-bold">Win Rate</p>
                      <div className="flex items-center gap-1">
                        <Zap className="h-3 w-3 text-amber-500" />
                        <span className="text-sm font-semibold">--%</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-2xs uppercase text-muted-foreground font-bold">Profit Factor</p>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="h-3 w-3 text-emerald-500" />
                        <span className="text-sm font-semibold">0.00</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}