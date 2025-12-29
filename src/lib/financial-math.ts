export function formatCurrency(value: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2
  }).format(value);
}
export function getForexPipSize(symbol: string): number {
  const s = symbol.toUpperCase();
  // JPY pairs, Gold, Silver, Commodities usually have 2 decimal pips
  if (
    s.includes('JPY') || s.includes('XAU') || s.includes('XAG') ||
    s.includes('OIL') || s.includes('BRENT') || s.includes('WTI') ||
    s.includes('GOLD') || s.includes('USOIL') || s.includes('UKOIL') ||
    s.includes('XPT')
  ) {
    return 0.01;
  }
  // Indices often move in 1.0 or 0.1 increments, default to 0.1 for safety
  if (s.includes('30') || s.includes('100') || s.includes('500') || s.includes('GER') || s.includes('SPX')) {
    return 0.1;
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
  // standard $10 per pip per lot for 0.0001 symbols, varies for others
  const pipSize = getForexPipSize(symbol);
  const pipValuePerLot = pipSize === 0.01 ? 10 : 10; // Simple standard for UI estimation
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
export function calculateRecoveryStats(currentDD: number, tradesToRecover: number) {
  if (currentDD <= 0) return { targetGain: 0, requiredWinRate: 0, gainPerTrade: 0 };
  // To recover X% drawdown, target gain G = (1 / (1 - X/100)) - 1
  const targetGain = (1 / (1 - (currentDD / 100)) - 1) * 100;
  const gainPerTradeNeeded = targetGain / Math.max(1, tradesToRecover);
  // With 1:2 R:R, Winrate = (GainPerTrade + RiskPerTrade) / (RiskPerTrade * (RR + 1))
  // Heuristic: Assuming 1% risk per trade for recovery calculation
  const riskPerTrade = 1; 
  const rr = 2;
  const requiredWinRate = ((gainPerTradeNeeded / riskPerTrade) + 1) / (rr + 1) * 100;
  return {
    targetGain,
    gainPerTrade: gainPerTradeNeeded,
    requiredWinRate: Math.min(100, Math.max(0, requiredWinRate))
  };
}
export function calculateMaxDrawdown(equityCurve: number[]): number {
  if (equityCurve.length === 0) return 0;
  let maxDD = 0;
  let peak = equityCurve[0];
  for (const value of equityCurve) {
    if (value > peak) peak = value;
    const dd = ((peak - value) / peak) * 100;
    if (dd > maxDD) maxDD = dd;
  }
  return maxDD;
}
export function aggregateRiskByDay(trades: any[]) {
  const map: Record<string, number> = {};
  trades.forEach(t => {
    const day = new Date(t.entryTime).toISOString().split('T')[0];
    map[day] = (map[day] || 0) + t.riskPercent;
  });
  return map;
}