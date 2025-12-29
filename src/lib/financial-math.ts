export function formatCurrency(value: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2
  }).format(value);
}
export function getForexPipSize(symbol: string): number {
  const s = symbol.toUpperCase();
  if (s.includes('JPY') || s.includes('XAU') || s.includes('XAG') || s.includes('OIL') || s.includes('GOLD')) return 0.01;
  if (s.includes('30') || s.includes('100') || s.includes('500') || s.includes('GER') || s.includes('SPX')) return 0.1;
  return 0.0001;
}
export function calculatePips(priceDiff: number, symbol: string): number {
  const pipSize = getForexPipSize(symbol);
  return pipSize === 0 ? 0 : priceDiff / pipSize;
}
export function calculatePositionSize(balance: number, riskPercent: number, stopLossPips: number, symbol: string): number {
  if (stopLossPips <= 0 || balance <= 0) return 0;
  const riskAmount = balance * (riskPercent / 100);
  const pipValuePerLot = 10; 
  return riskAmount / (stopLossPips * pipValuePerLot);
}
export function calculateKellyPercentage(winRatePercent: number, riskReward: number): number {
  const p = winRatePercent / 100;
  const q = 1 - p;
  const kelly = p - (q / riskReward);
  return Math.max(0, kelly) * 100;
}
export function simulateGrowth(startBalance: number, riskModel: 'FIXED' | 'KELLY' | 'LOT', params: any) {
  const data = [];
  let balance = startBalance;
  for (let i = 0; i <= 50; i++) {
    data.push({ trade: i, balance });
    const isWin = Math.random() < (params.winRate / 100);
    let riskAmt = 0;
    if (riskModel === 'FIXED') riskAmt = balance * (params.risk / 100);
    else if (riskModel === 'KELLY') riskAmt = balance * (params.kelly / 100);
    else riskAmt = params.fixedLot * 100;
    if (isWin) balance += riskAmt * params.rr;
    else balance -= riskAmt;
    if (balance < 0) balance = 0;
  }
  return data;
}
export function calculateRecoveryStats(currentDD: number, tradesToRecover: number) {
  if (currentDD <= 0) return { targetGain: 0, requiredWinRate: 0 };
  const targetGain = (1 / (1 - (currentDD / 100)) - 1) * 100;
  const rr = 2;
  const requiredWinRate = ((targetGain / tradesToRecover / 1) + 1) / (rr + 1) * 100;
  return { targetGain, requiredWinRate: Math.min(100, Math.max(0, requiredWinRate)) };
}