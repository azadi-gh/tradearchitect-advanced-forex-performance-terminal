export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
export type TradeType = 'LONG' | 'SHORT';
export type TradeStatus = 'OPEN' | 'CLOSED' | 'CANCELLED';
export interface Strategy {
  id: string;
  name: string;
  description: string;
  checklist: string[];
  createdAt: number;
}
export interface Trade {
  id: string;
  symbol: string;
  type: TradeType;
  status: TradeStatus;
  entryPrice: number;
  exitPrice?: number;
  lots: number;
  riskPercent: number;
  stopLoss?: number;
  takeProfit?: number;
  pnl?: number;
  strategyId?: string;
  checklistComplete?: boolean[];
  tags: string[];
  notes?: string;
  entryTime: number;
  exitTime?: number;
}
export interface FinancialSnapshot {
  equity: number;
  balance: number;
  winRate: number;
  profitFactor: number;
  expectancy: number;
  totalTrades: number;
  maxDrawdown: number;
  recentTrades: Trade[];
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
  disciplineScore: number;
}
export interface User {
  id: string;
  name: string;
}