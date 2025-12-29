export function formatCurrency(value: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2
  }).format(value);
}
export function calculateKelly(winRate: number, avgWin: number, avgLoss: number): number {
  if (avgLoss === 0) return 0;
  const b = avgWin / avgLoss;
  const p = winRate / 100;
  const q = 1 - p;
  const kelly = p - (q / b);
  return Math.max(0, kelly);
}
export function calculateExpectancy(winRate: number, avgWin: number, avgLoss: number): number {
  const p = winRate / 100;
  return (p * avgWin) - ((1 - p) * avgLoss);
}
export function calculatePositionSize(balance: number, riskPercent: number, stopLossPips: number, pipValue: number): number {
  if (stopLossPips === 0) return 0;
  const riskAmount = balance * (riskPercent / 100);
  return riskAmount / (stopLossPips * pipValue);
}
export function calculatePipValue(symbol: string): number {
  // Simplified pip value for major FX pairs
  if (symbol.includes('JPY')) return 0.01;
  return 0.0001;
}