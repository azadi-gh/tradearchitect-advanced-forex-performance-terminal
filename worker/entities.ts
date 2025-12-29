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
export interface StrategyPerformance {
  strategyId: string;
  name: string;
  winRate: number;
  profitFactor: number;
  expectancy: number;
  maxDrawdown: number;
  totalTrades: number;
  survivabilityScore: number;
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
  private detectBehavioralViolations(trades: Trade[], currentDrawdown: number): string[] {
    const alerts: string[] = [];
    const sorted = [...trades].sort((a, b) => b.entryTime - a.entryTime);
    // 1. Revenge Trading Check
    for (let i = 0; i < sorted.length - 1; i++) {
      const t1 = sorted[i];
      const t2 = sorted[i+1];
      if ((t2.pnl || 0) < 0 && (t1.entryTime - (t2.exitTime || t2.entryTime)) < 3600000) {
        alerts.push("Potential Revenge Trade: Entry within 1hr of a loss.");
        break;
      }
    }
    // 2. Overtrading Check
    const last24h = sorted.filter(t => t.entryTime > Date.now() - 86400000);
    if (last24h.length > 5) alerts.push("High Frequency Alert: Over 5 trades in 24 hours.");
    // 3. Loss Streak Check
    let losses = 0;
    for (const t of sorted) {
      if (t.status !== 'CLOSED') continue;
      if ((t.pnl || 0) < 0) losses++;
      else break;
      if (losses >= 3) {
        alerts.push("Loss Streak Alert: 3 or more consecutive losses.");
        break;
      }
    }
    // 4. Drawdown Threshold
    if (currentDrawdown > 10) {
      alerts.push(`Critical Drawdown: ${currentDrawdown.toFixed(1)}% exceeds safety limit.`);
    }
    return Array.from(new Set(alerts));
  }
  async getStrategyPerformance(env: any): Promise<StrategyPerformance[]> {
    const { trades } = await this.getState();
    const strategies = await StrategyEntity.list(env);
    return strategies.items.map(strat => {
      const sTrades = trades.filter(t => t.strategyId === strat.id && t.status === 'CLOSED');
      const wins = sTrades.filter(t => (t.pnl || 0) > 0);
      const losses = sTrades.filter(t => (t.pnl || 0) < 0);
      const winRate = sTrades.length > 0 ? (wins.length / sTrades.length) * 100 : 0;
      const totalProfit = wins.reduce((acc, t) => acc + (t.pnl || 0), 0);
      const totalLoss = Math.abs(losses.reduce((acc, t) => acc + (t.pnl || 0), 0));
      const pf = totalLoss === 0 ? (totalProfit > 0 ? 10 : 0) : totalProfit / totalLoss;
      // Survivability calculation (consistency + expectancy)
      const expectancy = sTrades.length > 0 ? (totalProfit - totalLoss) / sTrades.length : 0;
      const survivability = Math.min(100, Math.max(0, (winRate * 0.4) + (pf * 20) + (expectancy > 0 ? 20 : 0)));
      return {
        strategyId: strat.id,
        name: strat.name,
        winRate,
        profitFactor: pf,
        expectancy,
        maxDrawdown: 0, // Simplified for this view
        totalTrades: sTrades.length,
        survivabilityScore: survivability
      };
    });
  }
  async getStats(): Promise<FinancialSnapshot & { psychologyScore: number; alerts: string[]; dailyRisk: Record<string, number> }> {
    const { trades, balance } = await this.getState();
    const closedTrades = trades.filter(t => t.status === 'CLOSED');
    let currentEquity = balance;
    let peakEquity = balance;
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
    const profitFactor = grossLoss === 0 ? (grossProfit > 0 ? 99.9 : 0) : grossProfit / grossLoss;
    // Aggregating daily risk
    const dailyRisk: Record<string, number> = {};
    trades.forEach(t => {
      const day = new Date(t.entryTime).toISOString().split('T')[0];
      dailyRisk[day] = (dailyRisk[day] || 0) + t.riskPercent;
    });
    const alerts = this.detectBehavioralViolations(trades, maxDrawdown);
    const psychologyScore = Math.max(0, 100 - (alerts.length * 15));
    return {
      equity: currentEquity,
      balance,
      winRate,
      profitFactor,
      expectancy: closedTrades.length > 0 ? (currentEquity - balance) / closedTrades.length : 0,
      totalTrades: trades.length,
      maxDrawdown,
      recentTrades: trades.slice(-10).reverse(),
      psychologyScore,
      alerts,
      dailyRisk
    };
  }
}