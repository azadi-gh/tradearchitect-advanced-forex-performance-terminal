export function formatCurrency(value: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2
  }).format(value);
}
export function getForexPipSize(symbol: string): number {
  const s = symbol.toUpperCase();
  // JPY pairs, Gold (XAU), Silver (XAG), Oil (WTI/BRENT) typically use 2 decimal places for pips
  if (
    s.includes('JPY') || 
    s.includes('XAU') || 
    s.includes('XAG') || 
    s.includes('OIL') || 
    s.includes('BRENT') || 
    s.includes('WTI') ||
    s.includes('GOLD')
  ) {
    return 0.01;
  }
  return 0.0001;
}
export function calculatePips(priceDiff: number, symbol: string): number {
  const pipSize = getForexPipSize(symbol);
  if (pipSize === 0) return 0;
  return priceDiff / pipSize;
}
export function calculatePositionSize(balance: number, riskPercent: number, stopLossPips: number, symbol: string): number {
  if (stopLossPips <= 0 || balance <= 0) return 0;
  const riskAmount = balance * (riskPercent / 100);
  // Standard approximation: 1.0 lot of a major pair (0.0001 pip size) is roughly $10 per pip.
  // For 0.01 pip size pairs (like JPY), the move is 100x larger in raw price terms,
  // but the 'pip' value calculation remains scaled to the lot size.
  const pipValuePerLot = 10; 
  // If the pip size is 0.01 (JPY/Gold), 1 pip move is 0.01.
  // In a standard lot (100,000 units), 0.01 move in USD/JPY is roughly $10 if USD is the counter.
  // We use the multiplier to ensure the user's "Stop Loss Pips" input is treated correctly.
  return riskAmount / (stopLossPips * pipValuePerLot);
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