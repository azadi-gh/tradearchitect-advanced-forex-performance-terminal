import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, ExternalLink, Flame, TrendingUp, Plus, Check, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
const MARKET_DIRECTORY = [
  { symbol: "EURUSD", category: "Forex" }, { symbol: "GBPUSD", category: "Forex" }, { symbol: "USDJPY", category: "Forex" },
  { symbol: "AUDUSD", category: "Forex" }, { symbol: "USDCAD", category: "Forex" }, { symbol: "USDCHF", category: "Forex" },
  { symbol: "XAUUSD", category: "Commodities" }, { symbol: "XAGUSD", category: "Commodities" }, { symbol: "USOIL", category: "Commodities" },
  { symbol: "NAS100", category: "Indices" }, { symbol: "US30", category: "Indices" }, { symbol: "GER40", category: "Indices" },
  { symbol: "SPX500", category: "Indices" }, { symbol: "DXY", category: "Baskets" }
] as const;
export function WatchlistPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const { data: watchlist } = useQuery<any>({ 
    queryKey: ['watchlist'], 
    queryFn: () => api('/api/watchlist') 
  });
  const { data: stats } = useQuery<any>({ 
    queryKey: ['dashboard-stats'], 
    queryFn: () => api('/api/dashboard/stats') 
  });
  const toggleWatchlist = useMutation({
    mutationFn: (symbol: string) => {
      const pairs = watchlist?.pairs || [];
      const nextPairs = pairs.includes(symbol) ? pairs.filter((p: string) => p !== symbol) : [...pairs, symbol];
      return api('/api/watchlist', { method: 'PUT', body: JSON.stringify({ pairs: nextPairs }) });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['watchlist'] })
  });
  const filteredMarket = useMemo(() => {
    return MARKET_DIRECTORY.filter(m => m.symbol.toLowerCase().includes(search.toLowerCase()));
  }, [search]);
  return (
    <AppLayout container>
      <div className="space-y-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-4xl font-black uppercase tracking-tighter">Market Directory</h1>
            <p className="text-muted-foreground font-medium uppercase text-[10px] tracking-widest">Protocol Search & Opportunity Detection</p>
          </div>
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search symbols..." 
              className="pl-10 h-12 bg-secondary/50 font-bold" 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
            />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <Card className="border-2 border-primary/20 bg-card/40 backdrop-blur-xl">
              <CardHeader className="border-b pb-4"><CardTitle className="text-xs font-black uppercase">My Watchlist</CardTitle></CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[400px]">
                  {watchlist?.pairs?.length > 0 ? watchlist.pairs.map((p: string) => (
                    <div key={p} className="flex items-center justify-between p-4 border-b last:border-0 hover:bg-primary/5 transition-colors group">
                      <span className="font-black text-sm">{p}</span>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                          <a href={`https://www.tradingview.com/chart/?symbol=OANDA:${p}`} target="_blank" rel="noreferrer"><ExternalLink className="h-4 w-4" /></a>
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-rose-500 opacity-0 group-hover:opacity-100" 
                          onClick={() => toggleWatchlist.mutate(p)}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )) : (
                    <div className="p-8 text-center text-xs font-bold text-muted-foreground uppercase">Empty Watchlist</div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
          <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 auto-rows-fr">
            <AnimatePresence>
              {filteredMarket.map((item) => {
                const badge = stats?.opportunityBadges?.[item.symbol];
                const isWatchlisted = watchlist?.pairs?.includes(item.symbol);
                return (
                  <motion.div 
                    key={item.symbol} 
                    layout 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="h-full"
                  >
                    <Card className="group h-full border-2 hover:border-primary/40 transition-all duration-300 overflow-hidden flex flex-col">
                      <CardContent className="p-6 space-y-4 flex-1 flex flex-col">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="text-[10px] font-black uppercase text-muted-foreground mb-1">{item.category}</div>
                            <h3 className="text-2xl font-black tracking-tighter">{item.symbol}</h3>
                          </div>
                          <Button variant={isWatchlisted ? "secondary" : "outline"} size="icon" onClick={() => toggleWatchlist.mutate(item.symbol)}>
                            {isWatchlisted ? <Star className="h-4 w-4 fill-primary text-primary" /> : <Plus className="h-4 w-4" />}
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {badge === 'HOT' && <Badge className="bg-orange-500 text-white gap-1"><Flame className="h-3 w-3" /> HOT EDGE</Badge>}
                          {badge === 'STREAK' && <Badge className="bg-emerald-500 text-white gap-1"><TrendingUp className="h-3 w-3" /> STREAK</Badge>}
                        </div>
                        <div className="pt-4 mt-auto border-t flex justify-between items-center">
                          <Button variant="ghost" className="text-[10px] font-black uppercase tracking-widest h-8 px-2" asChild>
                            <Link to={`/journal?symbol=${item.symbol}`}>Log Execution</Link>
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                             <a href={`https://www.tradingview.com/chart/?symbol=OANDA:${item.symbol}`} target="_blank" rel="noreferrer"><ExternalLink className="h-4 w-4" /></a>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}