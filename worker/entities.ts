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
}
export interface JournalState {
  trades: Trade[];
  balance: number;
}
export class JournalEntity extends Entity<JournalState> {
  static readonly entityName = "journal";
  static readonly initialState: JournalState = {
    trades: [],
    balance: 10000 // Default starting balance
  };
  async addTrade(trade: Trade): Promise<Trade> {
    return this.mutate(s => {
      const trades = [...s.trades, trade];
      return { ...s, trades };
    }).then(() => trade);
  }
  async getStats(): Promise<FinancialSnapshot> {
    const { trades, balance } = await this.getState();
    const closedTrades = trades.filter(t => t.status === 'CLOSED');
    const winningTrades = closedTrades.filter(t => (t.pnl || 0) > 0);
    const totalPnL = closedTrades.reduce((acc, t) => acc + (t.pnl || 0), 0);
    const winRate = closedTrades.length > 0 ? (winningTrades.length / closedTrades.length) * 100 : 0;
    const grossProfit = winningTrades.reduce((acc, t) => acc + (t.pnl || 0), 0);
    const grossLoss = Math.abs(closedTrades.filter(t => (t.pnl || 0) < 0).reduce((acc, t) => acc + (t.pnl || 0), 0));
    const profitFactor = grossLoss === 0 ? grossProfit : grossProfit / grossLoss;
    return {
      equity: balance + totalPnL,
      balance,
      winRate,
      profitFactor,
      expectancy: closedTrades.length > 0 ? totalPnL / closedTrades.length : 0,
      totalTrades: trades.length,
      maxDrawdown: 0, // Simplified for Phase 1
      recentTrades: trades.slice(-5).reverse()
    };
  }
}