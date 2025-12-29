export function formatCurrency(value: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2
  }).format(value);
}
export function getForexPipSize(symbol: string): number {
  const s = symbol.toUpperCase();
  if (
    s.includes('JPY') || s.includes('XAU') || s.includes('XAG') ||
    s.includes('OIL') || s.includes('BRENT') || s.includes('WTI') ||
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
  const pipValuePerLot = 10;
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
export function calculateRecoveryStats(currentDD: number, tradesToRecover: number) {
  if (currentDD <= 0) return { winRate: 0, rr: 0 };
  // Target: recover the balance. To recover 10% drawdown, you need 11.11% gain.
  const targetGain = (1 / (1 - (currentDD / 100)) - 1) * 100;
  const gainPerTrade = targetGain / Math.max(1, tradesToRecover);
  return {
    targetGain,
    gainPerTrade,
    suggestedRR: 2, // Default standard
    requiredWinRate: (gainPerTrade / 2) + 50 // Simplified heuristic
  };
}
export function aggregateRiskByDay(trades: any[]) {
  const map: Record<string, number> = {};
  trades.forEach(t => {
    const day = new Date(t.entryTime).toISOString().split('T')[0];
    map[day] = (map[day] || 0) + t.riskPercent;
  });
  return map;
}