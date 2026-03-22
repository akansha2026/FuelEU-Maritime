import { describe, it, expect, vi, beforeEach } from "vitest";
import { RouteService } from "./RouteService";
import { ComplianceService } from "./ComplianceService";
import { BankingService } from "./BankingService";
import { PoolingService } from "./PoolingService";
import { NotFoundError, ValidationError } from "../../shared/errors";

// Mock repositories
const mockRouteRepo = {
  findAll: vi.fn(),
  findById: vi.fn(),
  findByRouteId: vi.fn(),
  findBaseline: vi.fn(),
  setBaseline: vi.fn(),
};

const mockComplianceRepo = {
  upsert: vi.fn(),
  findByShipAndYear: vi.fn(),
};

const mockBankRepo = {
  findByShipAndYear: vi.fn(),
  getTotalBanked: vi.fn(),
  create: vi.fn(),
};

const mockPoolRepo = {
  create: vi.fn(),
};

describe("RouteService", () => {
  let service: RouteService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new RouteService(mockRouteRepo);
  });

  describe("getAll", () => {
    it("should return all routes", async () => {
      const routes = [{ routeId: "R001" }, { routeId: "R002" }];
      mockRouteRepo.findAll.mockResolvedValue(routes);

      const result = await service.getAll();
      expect(result).toEqual(routes);
      expect(mockRouteRepo.findAll).toHaveBeenCalled();
    });
  });

  describe("setBaseline", () => {
    it("should set baseline for existing route", async () => {
      const route = { routeId: "R001", isBaseline: true };
      mockRouteRepo.findByRouteId.mockResolvedValue(route);
      mockRouteRepo.setBaseline.mockResolvedValue(route);

      const result = await service.setBaseline("R001");
      expect(result.isBaseline).toBe(true);
    });

    it("should throw NotFoundError for non-existent route", async () => {
      mockRouteRepo.findByRouteId.mockResolvedValue(null);

      await expect(service.setBaseline("INVALID")).rejects.toThrow(NotFoundError);
    });
  });

  describe("getComparison", () => {
    it("should return comparison data", async () => {
      const baseline = { routeId: "R001", ghgIntensity: 91.0 };
      const routes = [
        baseline,
        { routeId: "R002", ghgIntensity: 88.0, vesselType: "Bulk", fuelType: "LNG", year: 2025 },
      ];
      mockRouteRepo.findBaseline.mockResolvedValue(baseline);
      mockRouteRepo.findAll.mockResolvedValue(routes);

      const result = await service.getComparison();
      expect(result).toHaveLength(1);
      expect(result[0].routeId).toBe("R002");
      expect(result[0]).toHaveProperty("percentDiff");
      expect(result[0]).toHaveProperty("compliant");
    });

    it("should throw NotFoundError when no baseline set", async () => {
      mockRouteRepo.findBaseline.mockResolvedValue(null);

      await expect(service.getComparison()).rejects.toThrow(NotFoundError);
    });
  });
});

describe("ComplianceService", () => {
  let service: ComplianceService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new ComplianceService(mockRouteRepo, mockComplianceRepo, mockBankRepo);
  });

  describe("getComplianceBalance", () => {
    it("should compute and return CB for existing ship", async () => {
      const route = { routeId: "R001", ghgIntensity: 91.0, fuelConsumption: 5000 };
      mockRouteRepo.findByRouteId.mockResolvedValue(route);
      mockComplianceRepo.upsert.mockResolvedValue(undefined);

      const result = await service.getComplianceBalance("R001", 2025);
      expect(result.shipId).toBe("R001");
      expect(result.year).toBe(2025);
      expect(result).toHaveProperty("cbGco2eq");
      expect(result).toHaveProperty("penaltyEur");
    });

    it("should throw NotFoundError for non-existent ship", async () => {
      mockRouteRepo.findByRouteId.mockResolvedValue(null);

      await expect(service.getComplianceBalance("INVALID", 2025)).rejects.toThrow(NotFoundError);
    });
  });

  describe("getAdjustedCB", () => {
    it("should return adjusted CB when compliance record exists", async () => {
      mockComplianceRepo.findByShipAndYear.mockResolvedValue({ cbGco2eq: 1000000 });
      mockBankRepo.getTotalBanked.mockResolvedValue(500000);

      const result = await service.getAdjustedCB("R001", 2025);
      expect(result.initialCB).toBe(1000000);
      expect(result.bankedSurplus).toBe(500000);
    });

    it("should compute CB if no compliance record exists", async () => {
      const route = { routeId: "R001", ghgIntensity: 88.0, fuelConsumption: 5000 };
      mockComplianceRepo.findByShipAndYear.mockResolvedValue(null);
      mockRouteRepo.findByRouteId.mockResolvedValue(route);
      mockComplianceRepo.upsert.mockResolvedValue(undefined);
      mockBankRepo.getTotalBanked.mockResolvedValue(0);

      const result = await service.getAdjustedCB("R001", 2025);
      expect(result.shipId).toBe("R001");
      expect(result).toHaveProperty("adjustedCB");
    });
  });
});

describe("BankingService", () => {
  let service: BankingService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new BankingService(mockComplianceRepo, mockBankRepo);
  });

  describe("getRecords", () => {
    it("should return banking records", async () => {
      const records = [{ id: 1, amountGco2eq: 1000 }];
      mockBankRepo.findByShipAndYear.mockResolvedValue(records);

      const result = await service.getRecords("R001", 2025);
      expect(result).toEqual(records);
    });
  });

  describe("bankSurplus", () => {
    it("should bank positive CB", async () => {
      mockComplianceRepo.findByShipAndYear.mockResolvedValue({ cbGco2eq: 1000000 });
      mockBankRepo.create.mockResolvedValue({ id: 1, amountGco2eq: 1000000 });

      const result = await service.bankSurplus("R001", 2025);
      expect(result.amountGco2eq).toBe(1000000);
    });

    it("should throw NotFoundError when no compliance record", async () => {
      mockComplianceRepo.findByShipAndYear.mockResolvedValue(null);

      await expect(service.bankSurplus("INVALID", 2025)).rejects.toThrow(NotFoundError);
    });

    it("should throw ValidationError when CB is not positive", async () => {
      mockComplianceRepo.findByShipAndYear.mockResolvedValue({ cbGco2eq: -1000 });

      await expect(service.bankSurplus("R001", 2025)).rejects.toThrow(ValidationError);
    });

    it("should throw ValidationError when CB is zero", async () => {
      mockComplianceRepo.findByShipAndYear.mockResolvedValue({ cbGco2eq: 0 });

      await expect(service.bankSurplus("R001", 2025)).rejects.toThrow(ValidationError);
    });
  });

  describe("applyBanked", () => {
    it("should apply banked amount", async () => {
      mockBankRepo.getTotalBanked.mockResolvedValue(1000000);
      mockComplianceRepo.findByShipAndYear.mockResolvedValue({ cbGco2eq: -500000 });
      mockComplianceRepo.upsert.mockResolvedValue(undefined);
      mockBankRepo.create.mockResolvedValue({ id: 2, amountGco2eq: -500000 });

      const result = await service.applyBanked("R001", 2025, 500000);
      expect(result.applied).toBe(500000);
      expect(result.remaining).toBe(500000);
    });

    it("should throw ValidationError when amount is zero or negative", async () => {
      await expect(service.applyBanked("R001", 2025, 0)).rejects.toThrow(ValidationError);
      await expect(service.applyBanked("R001", 2025, -100)).rejects.toThrow(ValidationError);
    });

    it("should throw ValidationError when amount exceeds banked", async () => {
      mockBankRepo.getTotalBanked.mockResolvedValue(100);

      await expect(service.applyBanked("R001", 2025, 500)).rejects.toThrow(ValidationError);
    });

    it("should throw NotFoundError when no compliance record", async () => {
      mockBankRepo.getTotalBanked.mockResolvedValue(1000000);
      mockComplianceRepo.findByShipAndYear.mockResolvedValue(null);

      await expect(service.applyBanked("R001", 2025, 500)).rejects.toThrow(NotFoundError);
    });
  });
});

describe("PoolingService", () => {
  let service: PoolingService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new PoolingService(mockPoolRepo);
  });

  describe("createPool", () => {
    it("should create valid pool", async () => {
      const members = [
        { shipId: "A", adjustedCB: 1000 },
        { shipId: "B", adjustedCB: -500 },
      ];
      mockPoolRepo.create.mockResolvedValue({
        id: 1,
        year: 2025,
        members: [
          { shipId: "A", cbBefore: 1000, cbAfter: 500 },
          { shipId: "B", cbBefore: -500, cbAfter: 0 },
        ],
      });

      const result = await service.createPool(2025, members);
      expect(result.id).toBe(1);
      expect(result.members).toHaveLength(2);
    });

    it("should throw ValidationError for less than 2 members", async () => {
      await expect(
        service.createPool(2025, [{ shipId: "A", adjustedCB: 1000 }])
      ).rejects.toThrow(ValidationError);
    });

    it("should throw ValidationError when pool sum is negative", async () => {
      const members = [
        { shipId: "A", adjustedCB: -1000 },
        { shipId: "B", adjustedCB: -500 },
      ];

      await expect(service.createPool(2025, members)).rejects.toThrow(ValidationError);
    });

    it("should handle pool with all surplus members", async () => {
      const members = [
        { shipId: "A", adjustedCB: 1000 },
        { shipId: "B", adjustedCB: 500 },
      ];
      mockPoolRepo.create.mockResolvedValue({
        id: 2,
        year: 2025,
        members: [
          { shipId: "A", cbBefore: 1000, cbAfter: 1000 },
          { shipId: "B", cbBefore: 500, cbAfter: 500 },
        ],
      });

      const result = await service.createPool(2025, members);
      expect(result.members[0].cbAfter).toBe(1000);
    });

    it("should handle exact coverage of deficit", async () => {
      const members = [
        { shipId: "A", adjustedCB: 500 },
        { shipId: "B", adjustedCB: -500 },
      ];
      mockPoolRepo.create.mockResolvedValue({
        id: 3,
        year: 2025,
        members: [
          { shipId: "A", cbBefore: 500, cbAfter: 0 },
          { shipId: "B", cbBefore: -500, cbAfter: 0 },
        ],
      });

      const result = await service.createPool(2025, members);
      expect(result.members.every((m: { cbAfter: number }) => m.cbAfter >= -500)).toBe(true);
    });

    it("should handle zero CB members", async () => {
      const members = [
        { shipId: "A", adjustedCB: 500 },
        { shipId: "B", adjustedCB: 0 },
        { shipId: "C", adjustedCB: -300 },
      ];
      mockPoolRepo.create.mockResolvedValue({
        id: 4,
        year: 2025,
        members: [
          { shipId: "C", cbBefore: -300, cbAfter: 0 },
          { shipId: "A", cbBefore: 500, cbAfter: 200 },
          { shipId: "B", cbBefore: 0, cbAfter: 0 },
        ],
      });

      const result = await service.createPool(2025, members);
      expect(result.members).toHaveLength(3);
    });

    it("should handle multiple deficit ships", async () => {
      const members = [
        { shipId: "A", adjustedCB: 1000 },
        { shipId: "B", adjustedCB: -300 },
        { shipId: "C", adjustedCB: -400 },
      ];
      mockPoolRepo.create.mockResolvedValue({
        id: 5,
        year: 2025,
        members: [
          { shipId: "B", cbBefore: -300, cbAfter: 0 },
          { shipId: "C", cbBefore: -400, cbAfter: 0 },
          { shipId: "A", cbBefore: 1000, cbAfter: 300 },
        ],
      });

      const result = await service.createPool(2025, members);
      expect(result.members).toHaveLength(3);
    });
  });
});
