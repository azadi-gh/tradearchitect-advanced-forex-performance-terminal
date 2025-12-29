export function formatCurrency(value: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2
  }).format(value);
}
export function calculateKelly(winRatePercent: number, avgWin: number, avgLoss: number): number {
  if (avgLoss <= 0 || winRatePercent <= 0) return 0;
  const b = avgWin / avgLoss;
  const p = winRatePercent / 100;
  const q = 1 - p;
  const kelly = p - (q / b);
  return Math.max(0, kelly);
}
export function calculateExpectancy(winRatePercent: number, avgWin: number, avgLoss: number): number {
  const p = winRatePercent / 100;
  return (p * avgWin) - ((1 - p) * avgLoss);
}
export function getForexPipSize(symbol: string): number {
  const s = symbol.toUpperCase();
  if (s.includes('JPY') || s.includes('XAU') || s.includes('XAG')) return 0.01;
  return 0.0001;
}
export function calculatePositionSize(balance: number, riskPercent: number, stopLossPips: number, symbol: string): number {
  if (stopLossPips <= 0 || balance <= 0) return 0;
  const riskAmount = balance * (riskPercent / 100);
  const pipValuePerLot = 10; // Standard approximation for most major pairs at 1.0 lot
  // Adjust for JPY/Gold volatility scaling
  const multiplier = getForexPipSize(symbol) === 0.01 ? 100 : 1;
  return (riskAmount / (stopLossPips * pipValuePerLot)) * multiplier;
}
export function calculateBreakevenWinrate(rewardRiskRatio: number): number {
  if (rewardRiskRatio <= 0) return 100;
  return (1 / (1 + rewardRiskRatio)) * 100;
}
export function calculateRiskReward(entry: number, sl: number, tp: number, type: 'LONG' | 'SHORT'): number {
  const risk = Math.abs(entry - sl);
  const reward = Math.abs(tp - entry);
  if (risk === 0) return 0;
  return reward / risk;
}