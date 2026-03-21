export interface Route {
  id: number;
  routeId: string;
  vesselType: string;
  fuelType: string;
  year: number;
  ghgIntensity: number;
  fuelConsumption: number;
  distance: number;
  totalEmissions: number;
  isBaseline: boolean;
}

export interface ComparisonResult {
  routeId: string;
  vesselType: string;
  fuelType: string;
  year: number;
  ghgIntensity: number;
  baselineGhgIntensity: number;
  percentDiff: number;
  compliant: boolean;
}

export interface ComplianceBalance {
  shipId: string;
  year: number;
  ghgIntensityTarget: number;
  ghgIntensityActual: number;
  energyInScope: number;
  cbGco2eq: number;
  penaltyEur: number;
}

export interface AdjustedCB {
  shipId: string;
  year: number;
  initialCB: number;
  bankedSurplus: number;
  appliedFromBank: number;
  adjustedCB: number;
}

export interface BankEntry {
  id: number;
  shipId: string;
  year: number;
  amountGco2eq: number;
  createdAt: string;
}

export interface Pool {
  id: number;
  year: number;
  createdAt: string;
  members: PoolMember[];
}

export interface PoolMember {
  shipId: string;
  cbBefore: number;
  cbAfter: number;
}

export interface PoolMemberInput {
  shipId: string;
  adjustedCB: number;
}
