export type Province = "ON" | "BC" | "AB" | "QC" | "SK" | "MB" | "NS" | "NB" | "PE" | "NL";

export type GoalType =
  | "home_purchase"
  | "retirement"
  | "wealth_building"
  | "education"
  | "other";

export interface ClientIntake {
  // Personal Info
  firstName: string;
  lastName: string;
  age: number;
  province: Province;
  isUSPerson: boolean;
  hasSpouse: boolean;
  numberOfChildren: number;

  // Income & Tax
  annualIncome: number;
  spouseIncome: number;
  marginalTaxRate: number; // auto-calculated or overridden
  taxRateOverride: boolean;
  hasDBPension: boolean;
  pensionAdjustment: number; // PA reduces RRSP room

  // Account Rooms & Balances
  tfsaRoom: number;
  tfsaBalance: number;
  rrspRoom: number;
  rrspBalance: number;
  fhsaRoom: number; // 8000/yr up to 40k lifetime
  fhsaBalance: number;
  fhsaEligible: boolean; // first-time buyer + under 40
  respBalance: number;
  respEligible: boolean; // has children under 18
  spousalRrspBalance: number;
  nonRegBalance: number;

  // Goals & Planning
  primaryGoal: GoalType;
  timeHorizonYears: number;
  monthlyContributionBudget: number;
  riskTolerance: "conservative" | "moderate" | "aggressive";
  additionalNotes: string;
}

export const defaultClientIntake: ClientIntake = {
  firstName: "",
  lastName: "",
  age: 30,
  province: "ON",
  isUSPerson: false,
  hasSpouse: false,
  numberOfChildren: 0,
  annualIncome: 0,
  spouseIncome: 0,
  marginalTaxRate: 0,
  taxRateOverride: false,
  hasDBPension: false,
  pensionAdjustment: 0,
  tfsaRoom: 0,
  tfsaBalance: 0,
  rrspRoom: 0,
  rrspBalance: 0,
  fhsaRoom: 8000,
  fhsaBalance: 0,
  fhsaEligible: false,
  respBalance: 0,
  respEligible: false,
  spousalRrspBalance: 0,
  nonRegBalance: 0,
  primaryGoal: "wealth_building",
  timeHorizonYears: 10,
  monthlyContributionBudget: 500,
  riskTolerance: "moderate",
  additionalNotes: "",
};
