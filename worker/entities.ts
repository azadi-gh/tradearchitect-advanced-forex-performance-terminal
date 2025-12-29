import { IndexedEntity, Entity } from "./core-utils";
import type { Trade, Strategy, FinancialSnapshot } from "@shared/types";
export class StrategyEntity extends IndexedEntity<Strategy> {
  static readonly entityName = "strategy";
  static readonly indexName = "strategies";
  static readonly initialState: Strategy = {
    id: "",
    name: "",
    description: "",
    createdAt: 0
  };
  static seedData = [
    { id: "s1", name: "Trend Follower", description: "Standard trend following strategy", createdAt: Date.now() },
    { id: "s2", name: "Mean Reversion", description: "Standard mean reversion strategy", createdAt: Date.now() }
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
  async getStats(): Promise<FinancialSnapshot> {
    const { trades, balance } = await this.getState();
    const closedTrades = trades.filter(t => t.status === 'CLOSED');
    let peakEquity = balance;
    let currentEquity = balance;
    let maxDrawdown = 0;
    const sortedTrades = [...closedTrades].sort((a, b) => a.exitTime! - b.exitTime!);
    for (const t of sortedTrades) {
      currentEquity += (t.pnl || 0);
      if (currentEquity > peakEquity) peakEquity = currentEquity;
      const dd = ((peakEquity - currentEquity) / peakEquity) * 100;
      if (dd > maxDrawdown) maxDrawdown = dd;
    }
    const winningTrades = closedTrades.filter(t => (t.pnl || 0) > 0);
    const winRate = closedTrades.length > 0 ? (winningTrades.length / closedTrades.length) * 100 : 0;
    const grossProfit = winningTrades.reduce((acc, t) => acc + (t.pnl || 0), 0);
    const grossLoss = Math.abs(closedTrades.filter(t => (t.pnl || 0) < 0).reduce((acc, t) => acc + (t.pnl || 0), 0));
    const profitFactor = grossLoss === 0 ? (grossProfit > 0 ? 999 : 0) : grossProfit / grossLoss;
    return {
      equity: currentEquity,
      balance,
      winRate,
      profitFactor,
      expectancy: closedTrades.length > 0 ? (currentEquity - balance) / closedTrades.length : 0,
      totalTrades: trades.length,
      maxDrawdown,
      recentTrades: trades.slice(-10).reverse()
    };
  }
}