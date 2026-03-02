import type { Province } from "@/types/client";

interface TaxBracket {
  min: number;
  max: number;
  rate: number;
}

// 2024 Federal tax brackets
const federalBrackets: TaxBracket[] = [
  { min: 0, max: 55867, rate: 0.15 },
  { min: 55867, max: 111733, rate: 0.205 },
  { min: 111733, max: 154906, rate: 0.26 },
  { min: 154906, max: 220000, rate: 0.29 },
  { min: 220000, max: Infinity, rate: 0.33 },
];

// 2024 Provincial tax brackets
const provincialBrackets: Record<Province, TaxBracket[]> = {
  ON: [
    { min: 0, max: 51446, rate: 0.0505 },
    { min: 51446, max: 102894, rate: 0.0915 },
    { min: 102894, max: 150000, rate: 0.1116 },
    { min: 150000, max: 220000, rate: 0.1216 },
    { min: 220000, max: Infinity, rate: 0.1316 },
  ],
  BC: [
    { min: 0, max: 45654, rate: 0.0506 },
    { min: 45654, max: 91310, rate: 0.077 },
    { min: 91310, max: 104835, rate: 0.105 },
    { min: 104835, max: 127299, rate: 0.1229 },
    { min: 127299, max: 172602, rate: 0.147 },
    { min: 172602, max: 240716, rate: 0.168 },
    { min: 240716, max: Infinity, rate: 0.205 },
  ],
  AB: [
    { min: 0, max: 148269, rate: 0.10 },
    { min: 148269, max: 177922, rate: 0.12 },
    { min: 177922, max: 237230, rate: 0.13 },
    { min: 237230, max: 355845, rate: 0.14 },
    { min: 355845, max: Infinity, rate: 0.15 },
  ],
  QC: [
    { min: 0, max: 51780, rate: 0.14 },
    { min: 51780, max: 103545, rate: 0.19 },
    { min: 103545, max: 126000, rate: 0.24 },
    { min: 126000, max: Infinity, rate: 0.2575 },
  ],
  SK: [
    { min: 0, max: 49720, rate: 0.105 },
    { min: 49720, max: 142058, rate: 0.125 },
    { min: 142058, max: Infinity, rate: 0.145 },
  ],
  MB: [
    { min: 0, max: 36842, rate: 0.108 },
    { min: 36842, max: 79625, rate: 0.1275 },
    { min: 79625, max: Infinity, rate: 0.174 },
  ],
  NS: [
    { min: 0, max: 29590, rate: 0.0879 },
    { min: 29590, max: 59180, rate: 0.1495 },
    { min: 59180, max: 93000, rate: 0.1667 },
    { min: 93000, max: 150000, rate: 0.175 },
    { min: 150000, max: Infinity, rate: 0.21 },
  ],
  NB: [
    { min: 0, max: 47715, rate: 0.094 },
    { min: 47715, max: 95431, rate: 0.14 },
    { min: 95431, max: 176756, rate: 0.16 },
    { min: 176756, max: Infinity, rate: 0.195 },
  ],
  PE: [
    { min: 0, max: 32656, rate: 0.096 },
    { min: 32656, max: 64313, rate: 0.1337 },
    { min: 64313, max: 105000, rate: 0.1667 },
    { min: 105000, max: 140000, rate: 0.18 },
    { min: 140000, max: Infinity, rate: 0.1875 },
  ],
  NL: [
    { min: 0, max: 43198, rate: 0.087 },
    { min: 43198, max: 86395, rate: 0.145 },
    { min: 86395, max: 154244, rate: 0.158 },
    { min: 154244, max: 215943, rate: 0.178 },
    { min: 215943, max: 275870, rate: 0.198 },
    { min: 275870, max: Infinity, rate: 0.208 },
  ],
};

function getMarginalRate(income: number, brackets: TaxBracket[]): number {
  for (const bracket of [...brackets].reverse()) {
    if (income > bracket.min) {
      return bracket.rate;
    }
  }
  return brackets[0].rate;
}

export function calculateMarginalTaxRate(income: number, province: Province): number {
  if (income <= 0) return 0;

  const federalRate = getMarginalRate(income, federalBrackets);
  const provincialRate = getMarginalRate(income, provincialBrackets[province] || provincialBrackets.ON);

  return Math.round((federalRate + provincialRate) * 100) / 100;
}

export function formatTaxRate(rate: number): string {
  return `${(rate * 100).toFixed(1)}%`;
}

export function calculateRrspTaxSavings(contribution: number, marginalRate: number): number {
  return Math.round(contribution * marginalRate);
}
