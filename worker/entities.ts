import { IndexedEntity, Entity, Env } from "./core-utils";
import type { Trade, Strategy, FinancialSnapshot, StrategyPerformance, Watchlist, PerformanceInsight } from "@shared/types";
export class WatchlistEntity extends Entity<Watchlist> {
  static readonly entityName = "watchlist";
  static readonly initialState: Watchlist = {
    id: "default-watchlist",
    userId: "default-user",
    pairs: ["EURUSD", "GBPUSD", "XAUUSD", "NAS100"]
  };
}
export class StrategyEntity extends IndexedEntity<Strategy> {
  static readonly entityName = "strategy";
  static readonly indexName = "strategies";
  static readonly initialState: Strategy = {
    id: "",
    name: "",
    description: "",
    checklist: [],
    createdAt: 0
  };
  static seedData = [
    {
      id: "s1",
      name: "Trend Follower",
      description: "Standard trend following strategy",
      checklist: ["Trend Alignment", "HTF S/R Level", "Volume Confirmation", "2% Risk Check"],
      createdAt: Date.now()
    },
    {
      id: "s2",
      name: "Mean Reversion",
      description: "Standard mean reversion strategy",
      checklist: ["RSI Overbought/Sold", "Bollinger Band Touch", "Candlestick Pattern", "Risk/Reward > 2"],
      createdAt: Date.now()
    }
  ];
}
export interface JournalState {
  trades: Trade[];
  balance: number;
}
export class JournalEntity extends Entity<JournalState> {
  static readonly entityName = "journal";
  static readonly initialState: JournalState = {
    trades: [],
    balance: 10000
  };
  async addTrade(trade: Trade): Promise<Trade> {
    return this.mutate(s => ({
      ...s,
      trades: [...s.trades, trade]
    })).then(() => trade);
  }
  async updateTrade(id: string, updates: Partial<Trade>): Promise<Trade | null> {
    let updated: Trade | null = null;
    await this.mutate(s => {
      const idx = s.trades.findIndex(t => t.id === id);
      if (idx === -1) return s;
      const newTrades = [...s.trades];
      newTrades[idx] = { ...newTrades[idx], ...updates };
      updated = newTrades[idx];
      return { ...s, trades: newTrades };
    });
    return updated;
  }
  async deleteTrade(id: string): Promise<boolean> {
    let existed = false;
    await this.mutate(s => {
      const filtered = s.trades.filter(t => t.id !== id);
      existed = filtered.length !== s.trades.length;
      return { ...s, trades: filtered };
    });
    return existed;
  }
  async getInsights(): Promise<PerformanceInsight[]> {
    const state = await this.getState();
    const closed = state.trades.filter(t => t.status === 'CLOSED');
    const insights: PerformanceInsight[] = [];
    if (closed.length < 5) return [{ type: 'NEUTRAL', title: 'Data Collection', message: 'Execute 5+ trades to unlock behavioral insights.', score: 0 }];
    // Friday Fatigue
    const fridays = closed.filter(t => new Date(t.entryTime).getDay() === 5);
    const fridayWins = fridays.filter(t => (t.pnl || 0) > 0);
    if (fridays.length >= 3 && (fridayWins.length / fridays.length) < 0.3) {
      insights.push({ type: 'NEGATIVE', title: 'Friday Fatigue', message: `Warning: Your Friday win-rate is only ${(fridayWins.length/fridays.length*100).toFixed(0)}%. Consider closing early.`, score: 80 });
    }
    // Over-exposure
    const symbols = closed.reduce((acc, t) => {
      acc[t.symbol] = (acc[t.symbol] || 0) + (t.pnl || 0);
      return acc;
    }, {} as Record<string, number>);
    const worstSymbol = Object.entries(symbols).sort((a, b) => a[1] - b[1])[0];
    if (worstSymbol && worstSymbol[1] < 0) {
      insights.push({ type: 'NEGATIVE', title: 'Asset Friction', message: `Critical leak detected in ${worstSymbol[0]}. Total loss: $${Math.abs(worstSymbol[1]).toFixed(0)}.`, score: 90 });
    }
    // Discipline Alpha
    const disciplined = closed.filter(t => t.checklistComplete?.every(Boolean));
    if (disciplined.length / closed.length > 0.8) {
      insights.push({ type: 'POSITIVE', title: 'Protocol Integrity', message: 'Elite discipline levels detected. 80%+ checklist adherence.', score: 100 });
    }
    return insights;
  }
  async getStats(): Promise<FinancialSnapshot> {
    const state = await this.getState();
    const trades = state.trades || [];
    const balance = state.balance || 10000;
    const closedTrades = trades.filter(t => t.status === 'CLOSED');
    let currentEquity = balance;
    let peakEquity = balance;
    let maxDrawdown = 0;
    const sortedTrades = [...closedTrades].sort((a, b) => (a.exitTime || 0) - (b.exitTime || 0));
    const opportunityBadges: Record<string, 'HOT' | 'STREAK' | 'STABLE'> = {};
    const symbolPerformance: Record<string, { wins: number, total: number, lastResult: boolean }> = {};
    for (const t of sortedTrades) {
      currentEquity += (t.pnl || 0);
      if (currentEquity > peakEquity) peakEquity = currentEquity;
      const dd = ((peakEquity - currentEquity) / Math.max(1, peakEquity)) * 100;
      if (dd > maxDrawdown) maxDrawdown = dd;
      if (!symbolPerformance[t.symbol]) symbolPerformance[t.symbol] = { wins: 0, total: 0, lastResult: false };
      symbolPerformance[t.symbol].total++;
      if ((t.pnl || 0) > 0) {
        symbolPerformance[t.symbol].wins++;
        symbolPerformance[t.symbol].lastResult = true;
      } else {
        symbolPerformance[t.symbol].lastResult = false;
      }
    }
    Object.entries(symbolPerformance).forEach(([sym, p]) => {
      if (p.wins / p.total > 0.7 && p.total >= 5) opportunityBadges[sym] = 'HOT';
      else if (p.lastResult && p.total >= 3) opportunityBadges[sym] = 'STREAK';
      else if (p.total >= 10 && p.wins / p.total > 0.5) opportunityBadges[sym] = 'STABLE';
    });
    const winningTrades = closedTrades.filter(t => (t.pnl || 0) > 0);
    const winRate = closedTrades.length > 0 ? (winningTrades.length / closedTrades.length) * 100 : 0;
    const grossProfit = winningTrades.reduce((acc, t) => acc + (t.pnl || 0), 0);
    const grossLoss = Math.abs(closedTrades.filter(t => (t.pnl || 0) < 0).reduce((acc, t) => acc + (t.pnl || 0), 0));
    const profitFactor = grossLoss === 0 ? (grossProfit > 0 ? 99.9 : 0) : grossProfit / grossLoss;
    const alerts = this.detectBehavioralViolations(trades, balance, currentEquity);
    return {
      equity: currentEquity,
      balance,
      winRate,
      profitFactor,
      expectancy: closedTrades.length > 0 ? (currentEquity - balance) / closedTrades.length : 0,
      totalTrades: trades.length,
      maxDrawdown,
      recentTrades: trades.slice(-10).reverse(),
      psychologyScore: Math.max(0, 100 - (alerts.length * 15)),
      alerts,
      dailyRisk: this.aggregateRiskByDay(trades),
      opportunityBadges
    };
  }
  private aggregateRiskByDay(trades: Trade[]) {
    const map: Record<string, number> = {};
    trades.forEach(t => {
      const day = new Date(t.entryTime).toISOString().split('T')[0];
      map[day] = (map[day] || 0) + (t.riskPercent || 0);
    });
    return map;
  }
  private detectBehavioralViolations(trades: Trade[], balance: number, currentEquity: number): string[] {
    const alerts: string[] = [];
    const sorted = [...trades].sort((a, b) => b.entryTime - a.entryTime);
    const now = Date.now();
    if (sorted.length > 0) {
      const last = sorted[0];
      if (last.strategyId && last.checklistComplete) {
        const completedCount = last.checklistComplete.filter(Boolean).length;
        if (completedCount < last.checklistComplete.length) {
          alerts.push("Discipline Warning: Last execution missed checklist criteria.");
        }
      }
    }
    const last24h = sorted.filter(t => t.entryTime > now - 86400000);
    if (last24h.length > 8) alerts.push("High Frequency Alert: Over 8 trades in 24 hours.");
    const ddPercent = ((balance - currentEquity) / Math.max(1, balance)) * 100;
    if (ddPercent > 15) alerts.push(`Critical Account Drawdown: ${ddPercent.toFixed(1)}% limit exceeded.`);
    return Array.from(new Set(alerts));
  }
  async getStrategyPerformance(env: Env): Promise<StrategyPerformance[]> {
    const { trades, balance } = await this.getState();
    const strategies = await StrategyEntity.list(env);
    return strategies.items.map(strat => {
      const sTrades = trades.filter(t => t.strategyId === strat.id && t.status === 'CLOSED');
      const wins = sTrades.filter(t => (t.pnl || 0) > 0);
      const totalProfit = wins.reduce((acc, t) => acc + (t.pnl || 0), 0);
      const totalLoss = Math.abs(sTrades.filter(t => (t.pnl || 0) < 0).reduce((acc, t) => acc + (t.pnl || 0), 0));
      const winRate = sTrades.length > 0 ? (wins.length / sTrades.length) * 100 : 0;
      const pf = totalLoss === 0 ? (totalProfit > 0 ? 99.9 : 0) : totalProfit / totalLoss;
      const disciplineScore = sTrades.filter(t => t.checklistComplete?.every(Boolean)).length / Math.max(1, sTrades.length) * 100;
      return {
        strategyId: strat.id,
        name: strat.name,
        winRate,
        profitFactor: pf,
        expectancy: sTrades.length > 0 ? (totalProfit - totalLoss) / sTrades.length : 0,
        maxDrawdown: 0, // Simplified
        totalTrades: sTrades.length,
        disciplineScore,
        survivabilityScore: (winRate * 0.4 + (Math.min(pf, 3) / 3) * 60)
      };
    });
  }
}