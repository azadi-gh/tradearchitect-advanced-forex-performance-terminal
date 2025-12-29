export interface SimParams {
  startBalance: number;
  winRate: number; // Percentage 0-100
  riskReward: number; // e.g. 2 for 1:2
  riskPerTrade: number; // Percentage 0-100
  tradeCount: number;
  iterations: number;
}
export interface SimResult {
  paths: number[][];
  bestCase: number[];
  worstCase: number[];
  median: number[];
  riskOfRuin: number;
}
export function runMonteCarlo(params: SimParams): SimResult {
  const sb = Math.max(1000, Number.isFinite(params.startBalance) ? params.startBalance : 10000);
  const wr = Math.max(0, Math.min(100, Number.isFinite(params.winRate) ? params.winRate : 50));
  const rr = Math.max(0.1, Number.isFinite(params.riskReward) ? params.riskReward : 2);
  const rpt = Math.max(0.1, Math.min(10, Number.isFinite(params.riskPerTrade) ? params.riskPerTrade : 1));
  const tc = Math.max(10, Math.min(10000, Number.isFinite(params.tradeCount) ? params.tradeCount : 100));
  const it = Math.max(100, Math.min(5000, Number.isFinite(params.iterations) ? params.iterations : 1000));
  const paths: number[][] = [];
  let ruinCount = 0;
  for (let i = 0; i < it; i++) {
    const path: number[] = [sb];
    let currentBalance = sb;
    let ruined = false;
    for (let j = 0; j < tc; j++) {
      const isWin = Math.random() * 100 < wr;
      const riskAmount = currentBalance * (rpt / 100);
      if (isWin) {
        currentBalance += riskAmount * rr;
      } else {
        currentBalance -= riskAmount;
      }
      currentBalance = Math.max(0, currentBalance);
      if (currentBalance <= sb * 0.5) {
        ruined = true;
      }
      path.push(currentBalance);
    }
    if (ruined) ruinCount++;
    paths.push(path);
  }
  // Calculate bands
  const bestCase: number[] = [];
  const worstCase: number[] = [];
  const median: number[] = [];
  for (let t = 0; t <= tc; t++) {
    const valuesAtT = paths.map(p => p[t]).filter(Number.isFinite).sort((a, b) => a - b);
    if (valuesAtT.length === 0) {
      worstCase.push(sb);
      median.push(sb);
      bestCase.push(sb);
    } else {
      const idx5 = Math.floor(valuesAtT.length * 0.05);
      const idx50 = Math.floor(valuesAtT.length * 0.5);
      const idx95 = Math.floor(valuesAtT.length * 0.95);
      worstCase.push(valuesAtT[idx5]);
      median.push(valuesAtT[idx50]);
      bestCase.push(valuesAtT[idx95]);
    }
  }
  return {
    paths: paths.slice(0, 10), // Return sample paths for visualization
    bestCase,
    worstCase,
    median,
    riskOfRuin: (ruinCount / it) * 100
  };
}