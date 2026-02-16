// Risk Engine: Risk Score = (Total Supply / Demand) × Weather Multiplier
// Green: score < 0.7 | Yellow: 0.7 <= score < 1.0 | Red: score >= 1.0

export type RiskLevel = 'green' | 'yellow' | 'red';

export interface RiskResult {
  score: number;
  level: RiskLevel;
  supplyKg: number;
  demandKg: number;
  weatherMultiplier: number;
  advisory: string;
}

export function calculateRisk(
  totalSupplyKg: number,
  dailyDemandKg: number,
  weatherMultiplier: number = 1.0
): RiskResult {
  if (dailyDemandKg <= 0) {
    return {
      score: 0,
      level: 'green',
      supplyKg: totalSupplyKg,
      demandKg: dailyDemandKg,
      weatherMultiplier,
      advisory: 'No demand configured.',
    };
  }

  const score = (totalSupplyKg / dailyDemandKg) * weatherMultiplier;
  let level: RiskLevel;
  let advisory: string;

  if (score < 0.7) {
    level = 'green';
    advisory = 'Supply is within safe limits. Good time to harvest and sell.';
  } else if (score < 1.0) {
    level = 'yellow';
    advisory = 'Supply approaching demand threshold. Consider delaying harvest or diverting to other markets.';
  } else {
    level = 'red';
    advisory = 'Oversupply detected! High risk of price crash. Delay harvest, explore cold storage, or divert to processing units.';
  }

  return { score: Math.round(score * 100) / 100, level, supplyKg: totalSupplyKg, demandKg: dailyDemandKg, weatherMultiplier, advisory };
}

export function getWeatherMultiplier(condition: string, humidity: number): number {
  const lc = condition.toLowerCase();
  let multiplier = 1.0;

  if (lc.includes('rain') || lc.includes('storm') || lc.includes('thunder')) {
    multiplier = 1.3; // rain reduces shelf life, increases urgency
  } else if (lc.includes('cloud') || lc.includes('mist') || lc.includes('fog')) {
    multiplier = 1.1;
  } else if (lc.includes('clear') || lc.includes('sun')) {
    multiplier = 0.9;
  }

  if (humidity > 80) multiplier *= 1.15;
  if (humidity > 90) multiplier *= 1.1;

  return Math.round(multiplier * 100) / 100;
}

export function getRiskColor(level: RiskLevel): string {
  switch (level) {
    case 'green': return 'hsl(145, 60%, 40%)';
    case 'yellow': return 'hsl(45, 90%, 50%)';
    case 'red': return 'hsl(0, 72%, 51%)';
  }
}

export function getRiskLabel(level: RiskLevel): string {
  switch (level) {
    case 'green': return '🟢 Safe';
    case 'yellow': return '🟡 Caution';
    case 'red': return '🔴 Oversupply';
  }
}
