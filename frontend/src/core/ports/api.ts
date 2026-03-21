import type {
  Route,
  ComparisonResult,
  ComplianceBalance,
  AdjustedCB,
  BankEntry,
  Pool,
  PoolMemberInput,
} from "../domain/types";

export interface IApiClient {
  getRoutes(): Promise<Route[]>;
  setBaseline(routeId: string): Promise<Route>;
  getComparison(): Promise<ComparisonResult[]>;

  getComplianceBalance(shipId: string, year: number): Promise<ComplianceBalance>;
  getAdjustedCB(shipId: string, year: number): Promise<AdjustedCB>;

  getBankingRecords(shipId: string, year: number): Promise<BankEntry[]>;
  bankSurplus(shipId: string, year: number): Promise<BankEntry>;
  applyBanked(
    shipId: string,
    year: number,
    amount: number,
  ): Promise<{ applied: number; remaining: number }>;

  createPool(year: number, members: PoolMemberInput[]): Promise<Pool>;
}
