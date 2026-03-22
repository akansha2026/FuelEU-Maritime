import { describe, it, expect, vi, beforeEach } from "vitest";
import axios from "axios";
import { apiClient } from "./apiClient";

vi.mock("axios", () => {
  const mockAxios = {
    create: vi.fn(() => mockAxios),
    get: vi.fn(),
    post: vi.fn(),
  };
  return { default: mockAxios };
});

const mockedAxios = axios as unknown as {
  create: ReturnType<typeof vi.fn>;
  get: ReturnType<typeof vi.fn>;
  post: ReturnType<typeof vi.fn>;
};

describe("apiClient", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getRoutes", () => {
    it("should fetch all routes", async () => {
      const routes = [{ routeId: "R001" }, { routeId: "R002" }];
      mockedAxios.get.mockResolvedValue({ data: routes });

      const result = await apiClient.getRoutes();
      expect(result).toEqual(routes);
      expect(mockedAxios.get).toHaveBeenCalledWith("/routes");
    });
  });

  describe("setBaseline", () => {
    it("should set baseline for route", async () => {
      const route = { routeId: "R001", isBaseline: true };
      mockedAxios.post.mockResolvedValue({ data: route });

      const result = await apiClient.setBaseline("R001");
      expect(result).toEqual(route);
      expect(mockedAxios.post).toHaveBeenCalledWith("/routes/R001/baseline");
    });
  });

  describe("getComparison", () => {
    it("should fetch comparison data", async () => {
      const comparison = [{ routeId: "R002", percentDiff: -5 }];
      mockedAxios.get.mockResolvedValue({ data: comparison });

      const result = await apiClient.getComparison();
      expect(result).toEqual(comparison);
      expect(mockedAxios.get).toHaveBeenCalledWith("/routes/comparison");
    });
  });

  describe("getComplianceBalance", () => {
    it("should fetch compliance balance", async () => {
      const cb = { shipId: "R001", cbGco2eq: 1000000 };
      mockedAxios.get.mockResolvedValue({ data: cb });

      const result = await apiClient.getComplianceBalance("R001", 2025);
      expect(result).toEqual(cb);
      expect(mockedAxios.get).toHaveBeenCalledWith("/compliance/cb", {
        params: { shipId: "R001", year: 2025 },
      });
    });
  });

  describe("getAdjustedCB", () => {
    it("should fetch adjusted CB", async () => {
      const adjustedCB = { shipId: "R001", adjustedCB: 500000 };
      mockedAxios.get.mockResolvedValue({ data: adjustedCB });

      const result = await apiClient.getAdjustedCB("R001", 2025);
      expect(result).toEqual(adjustedCB);
      expect(mockedAxios.get).toHaveBeenCalledWith("/compliance/adjusted-cb", {
        params: { shipId: "R001", year: 2025 },
      });
    });
  });

  describe("getBankingRecords", () => {
    it("should fetch banking records", async () => {
      const records = [{ id: 1, amountGco2eq: 1000 }];
      mockedAxios.get.mockResolvedValue({ data: records });

      const result = await apiClient.getBankingRecords("R001", 2025);
      expect(result).toEqual(records);
      expect(mockedAxios.get).toHaveBeenCalledWith("/banking/records", {
        params: { shipId: "R001", year: 2025 },
      });
    });
  });

  describe("bankSurplus", () => {
    it("should bank surplus", async () => {
      const entry = { id: 1, amountGco2eq: 500000 };
      mockedAxios.post.mockResolvedValue({ data: entry });

      const result = await apiClient.bankSurplus("R001", 2025);
      expect(result).toEqual(entry);
      expect(mockedAxios.post).toHaveBeenCalledWith("/banking/bank", {
        shipId: "R001",
        year: 2025,
      });
    });
  });

  describe("applyBanked", () => {
    it("should apply banked amount", async () => {
      const result = { applied: 300000, remaining: 200000 };
      mockedAxios.post.mockResolvedValue({ data: result });

      const response = await apiClient.applyBanked("R001", 2025, 300000);
      expect(response).toEqual(result);
      expect(mockedAxios.post).toHaveBeenCalledWith("/banking/apply", {
        shipId: "R001",
        year: 2025,
        amount: 300000,
      });
    });
  });

  describe("createPool", () => {
    it("should create pool", async () => {
      const pool = { id: 1, year: 2025, members: [] };
      mockedAxios.post.mockResolvedValue({ data: pool });

      const members = [
        { shipId: "A", adjustedCB: 1000 },
        { shipId: "B", adjustedCB: -500 },
      ];
      const result = await apiClient.createPool(2025, members);
      expect(result).toEqual(pool);
      expect(mockedAxios.post).toHaveBeenCalledWith("/pools", {
        year: 2025,
        members,
      });
    });
  });
});
