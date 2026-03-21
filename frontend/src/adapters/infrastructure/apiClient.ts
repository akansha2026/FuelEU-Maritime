import axios from "axios";
import type { IApiClient } from "../../core/ports/api";
import type {
  Route,
  ComparisonResult,
  ComplianceBalance,
  AdjustedCB,
  BankEntry,
  Pool,
  PoolMemberInput,
} from "../../core/domain/types";
import { API_BASE_URL } from "../../shared/constants";

const http = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

export const apiClient: IApiClient = {
  async getRoutes(): Promise<Route[]> {
    const { data } = await http.get<Route[]>("/routes");
    return data;
  },

  async setBaseline(routeId: string): Promise<Route> {
    const { data } = await http.post<Route>(`/routes/${routeId}/baseline`);
    return data;
  },

  async getComparison(): Promise<ComparisonResult[]> {
    const { data } = await http.get<ComparisonResult[]>("/routes/comparison");
    return data;
  },

  async getComplianceBalance(
    shipId: string,
    year: number,
  ): Promise<ComplianceBalance> {
    const { data } = await http.get<ComplianceBalance>("/compliance/cb", {
      params: { shipId, year },
    });
    return data;
  },

  async getAdjustedCB(shipId: string, year: number): Promise<AdjustedCB> {
    const { data } = await http.get<AdjustedCB>("/compliance/adjusted-cb", {
      params: { shipId, year },
    });
    return data;
  },

  async getBankingRecords(shipId: string, year: number): Promise<BankEntry[]> {
    const { data } = await http.get<BankEntry[]>("/banking/records", {
      params: { shipId, year },
    });
    return data;
  },

  async bankSurplus(shipId: string, year: number): Promise<BankEntry> {
    const { data } = await http.post<BankEntry>("/banking/bank", {
      shipId,
      year,
    });
    return data;
  },

  async applyBanked(
    shipId: string,
    year: number,
    amount: number,
  ): Promise<{ applied: number; remaining: number }> {
    const { data } = await http.post<{ applied: number; remaining: number }>(
      "/banking/apply",
      { shipId, year, amount },
    );
    return data;
  },

  async createPool(year: number, members: PoolMemberInput[]): Promise<Pool> {
    const { data } = await http.post<Pool>("/pools", { year, members });
    return data;
  },
};
