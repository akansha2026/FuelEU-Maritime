import type {
  Route,
  BankEntry,
  Pool,
  PoolMember,
} from "../domain/entities";

export interface IRouteRepository {
  findAll(): Promise<Route[]>;
  findById(id: number): Promise<Route | null>;
  findByRouteId(routeId: string): Promise<Route | null>;
  findBaseline(): Promise<Route | null>;
  setBaseline(routeId: string): Promise<Route>;
}

export interface IComplianceRepository {
  upsert(shipId: string, year: number, cbGco2eq: number): Promise<void>;
  findByShipAndYear(
    shipId: string,
    year: number,
  ): Promise<{ cbGco2eq: number } | null>;
}

export interface IBankRepository {
  findByShipAndYear(shipId: string, year: number): Promise<BankEntry[]>;
  getTotalBanked(shipId: string, year: number): Promise<number>;
  create(shipId: string, year: number, amount: number): Promise<BankEntry>;
}

export interface IPoolRepository {
  create(
    year: number,
    members: { shipId: string; cbBefore: number; cbAfter: number }[],
  ): Promise<Pool & { members: PoolMember[] }>;
}
