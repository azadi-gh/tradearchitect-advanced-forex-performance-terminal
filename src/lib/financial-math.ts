export function formatCurrency(value: number, currency: string = 'USD'): string {
  if (!Number.isFinite(value)) return '$0.00';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2
  }).format(value);
}
export function getForexPipSize(symbol: string): number {
  if (!symbol) return 0.0001;
  const s = symbol.toUpperCase();
  if (s.includes('JPY') || s.includes('XAU') || s.includes('XAG') || s.includes('OIL') || s.includes('GOLD')) return 0.01;
  if (s.includes('30') || s.includes('100') || s.includes('500') || s.includes('GER') || s.includes('SPX')) return 0.1;
  return 0.0001;
}
export function calculatePips(priceDiff: number, symbol: string): number {
  if (!Number.isFinite(priceDiff)) return 0;
  const pipSize = getForexPipSize(symbol);
  if (pipSize === 0) return 0;
  return priceDiff / pipSize;
}
export function calculatePositionSize(balance: number, riskPercent: number, stopLossPips: number, symbol: string): number {
  if (!Number.isFinite(stopLossPips) || stopLossPips <= 0 || !Number.isFinite(balance) || balance <= 0) return 0;
  const riskAmount = balance * (riskPercent / 100);
  const pipValuePerLot = 10;
  const size = riskAmount / (stopLossPips * pipValuePerLot);
  return Number.isFinite(size) ? size : 0;
}
export function calculateKellyPercentage(winRatePercent: number, riskReward: number): number {
  if (!Number.isFinite(riskReward) || riskReward <= 0) return 0;
  const p = (Number.isFinite(winRatePercent) ? winRatePercent : 0) / 100;
  const q = 1 - p;
  const kelly = p - (q / riskReward);
  return Math.max(0, kelly) * 100;
}
export function simulateGrowth(startBalance: number, riskModel: 'FIXED' | 'KELLY' | 'LOT', params: any) {
  const data = [];
  let balance = Number.isFinite(startBalance) ? startBalance : 10000;
  const wr = (Number.isFinite(params.winRate) ? params.winRate : 50) / 100;
  const rr = Number.isFinite(params.rr) ? params.rr : 2;
  const riskPct = (Number.isFinite(params.risk) ? params.risk : 1) / 100;
  const kellyPct = (Number.isFinite(params.kelly) ? params.kelly : 0) / 100;
  const fixedLot = Number.isFinite(params.fixedLot) ? params.fixedLot : 0.1;
  for (let i = 0; i <= 50; i++) {
    data.push({ trade: i, balance });
    const isWin = Math.random() < wr;
    let riskAmt = 0;
    if (riskModel === 'FIXED') riskAmt = balance * riskPct;
    else if (riskModel === 'KELLY') riskAmt = balance * kellyPct;
    else riskAmt = fixedLot * 100;
    if (isWin) balance += riskAmt * rr;
    else balance -= riskAmt;
    if (balance < 0 || !Number.isFinite(balance)) balance = 0;
  }
  return data;
}
export function calculateRecoveryStats(currentDD: number, tradesToRecover: number) {
  if (!Number.isFinite(currentDD) || currentDD <= 0 || currentDD >= 100) return { targetGain: 0, requiredWinRate: 0 };
  const targetGain = (1 / (1 - (currentDD / 100)) - 1) * 100;
  const rr = 2;
  const ttr = Math.max(1, tradesToRecover);
  const requiredWinRate = ((targetGain / ttr / 1) + 1) / (rr + 1) * 100;
  return { targetGain, requiredWinRate: Math.min(100, Math.max(0, requiredWinRate)) };
}