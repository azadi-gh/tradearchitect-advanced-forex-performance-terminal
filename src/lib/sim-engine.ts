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
  const { startBalance, winRate, riskReward, riskPerTrade, tradeCount, iterations } = params;
  const paths: number[][] = [];
  let ruinCount = 0;
  for (let i = 0; i < iterations; i++) {
    const path: number[] = [startBalance];
    let currentBalance = startBalance;
    let ruined = false;
    for (let j = 0; j < tradeCount; j++) {
      const isWin = Math.random() * 100 < winRate;
      const riskAmount = currentBalance * (riskPerTrade / 100);
      if (isWin) {
        currentBalance += riskAmount * riskReward;
      } else {
        currentBalance -= riskAmount;
      }
      if (currentBalance <= startBalance * 0.5) {
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
  for (let t = 0; t <= tradeCount; t++) {
    const valuesAtT = paths.map(p => p[t]).sort((a, b) => a - b);
    worstCase.push(valuesAtT[Math.floor(iterations * 0.05)]);
    median.push(valuesAtT[Math.floor(iterations * 0.5)]);
    bestCase.push(valuesAtT[Math.floor(iterations * 0.95)]);
  }
  return {
    paths: paths.slice(0, 10), // Return sample paths for visualization
    bestCase,
    worstCase,
    median,
    riskOfRuin: (ruinCount / iterations) * 100
  };
}