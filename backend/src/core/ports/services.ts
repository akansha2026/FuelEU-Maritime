import type {
  Route,
  ComparisonResult,
  ComplianceBalance,
  AdjustedCB,
  BankEntry,
  Pool,
  PoolMember,
  PoolMemberInput,
} from "../domain/entities";

export interface IRouteService {
  getAll(): Promise<Route[]>;
  setBaseline(routeId: string): Promise<Route>;
  getComparison(): Promise<ComparisonResult[]>;
}

export interface IComplianceService {
  getComplianceBalance(shipId: string, year: number): Promise<ComplianceBalance>;
  getAdjustedCB(shipId: string, year: number): Promise<AdjustedCB>;
}

export interface IBankingService {
  getRecords(shipId: string, year: number): Promise<BankEntry[]>;
  bankSurplus(shipId: string, year: number): Promise<BankEntry>;
  applyBanked(shipId: string, year: number, amount: number): Promise<{ applied: number; remaining: number }>;
}

export interface IPoolingService {
  createPool(
    year: number,
    members: PoolMemberInput[],
  ): Promise<Pool & { members: PoolMember[] }>;
}
