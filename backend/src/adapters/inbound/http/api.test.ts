import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import request from "supertest";
import { createApp } from "../../../infrastructure/server/app";
import { prisma } from "../../../infrastructure/db/client";

const app = createApp();

describe("API Integration Tests", () => {
  beforeAll(async () => {
    await prisma.poolMember.deleteMany();
    await prisma.pool.deleteMany();
    await prisma.bankEntry.deleteMany();
    await prisma.shipCompliance.deleteMany();
    await prisma.route.deleteMany();

    await prisma.route.createMany({
      data: [
        {
          routeId: "R001",
          vesselType: "Container",
          fuelType: "HFO",
          year: 2024,
          ghgIntensity: 91.0,
          fuelConsumption: 5000,
          distance: 12000,
          totalEmissions: 4500,
          isBaseline: true,
        },
        {
          routeId: "R002",
          vesselType: "BulkCarrier",
          fuelType: "LNG",
          year: 2024,
          ghgIntensity: 88.0,
          fuelConsumption: 4800,
          distance: 11500,
          totalEmissions: 4200,
          isBaseline: false,
        },
        {
          routeId: "R003",
          vesselType: "Tanker",
          fuelType: "MGO",
          year: 2025,
          ghgIntensity: 85.0,
          fuelConsumption: 5100,
          distance: 12500,
          totalEmissions: 4700,
          isBaseline: false,
        },
      ],
    });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe("GET /routes", () => {
    it("should return all routes", async () => {
      const res = await request(app).get("/routes");
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(2);
    });

    it("should include route properties", async () => {
      const res = await request(app).get("/routes");
      const route = res.body[0];
      expect(route).toHaveProperty("routeId");
      expect(route).toHaveProperty("vesselType");
      expect(route).toHaveProperty("ghgIntensity");
      expect(route).toHaveProperty("isBaseline");
    });
  });

  describe("POST /routes/:routeId/baseline", () => {
    it("should set a route as baseline", async () => {
      const res = await request(app).post("/routes/R002/baseline");
      expect(res.status).toBe(200);
      expect(res.body.isBaseline).toBe(true);
      expect(res.body.routeId).toBe("R002");
    });

    it("should return 404 for non-existent route", async () => {
      const res = await request(app).post("/routes/INVALID/baseline");
      expect(res.status).toBe(404);
    });
  });

  describe("GET /routes/comparison", () => {
    it("should return comparison data", async () => {
      const res = await request(app).get("/routes/comparison");
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it("should include percentDiff and compliant flags", async () => {
      const res = await request(app).get("/routes/comparison");
      if (res.body.length > 0) {
        const comparison = res.body[0];
        expect(comparison).toHaveProperty("percentDiff");
        expect(comparison).toHaveProperty("compliant");
        expect(comparison).toHaveProperty("ghgIntensity");
        expect(comparison).toHaveProperty("baselineGhgIntensity");
      }
    });
  });

  describe("GET /compliance/cb", () => {
    it("should return compliance balance for a ship", async () => {
      const res = await request(app)
        .get("/compliance/cb")
        .query({ shipId: "R001", year: 2025 });
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("cbGco2eq");
      expect(res.body).toHaveProperty("ghgIntensityTarget");
      expect(res.body).toHaveProperty("penaltyEur");
    });

    it("should return 400 without required params", async () => {
      const res = await request(app).get("/compliance/cb");
      expect(res.status).toBe(400);
    });

    it("should return 404 for non-existent ship", async () => {
      const res = await request(app)
        .get("/compliance/cb")
        .query({ shipId: "INVALID", year: 2025 });
      expect(res.status).toBe(404);
    });
  });

  describe("GET /compliance/adjusted-cb", () => {
    it("should return adjusted CB for a ship", async () => {
      const res = await request(app)
        .get("/compliance/adjusted-cb")
        .query({ shipId: "R001", year: 2025 });
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("adjustedCB");
      expect(res.body).toHaveProperty("initialCB");
      expect(res.body).toHaveProperty("bankedSurplus");
    });

    it("should return 400 without required params", async () => {
      const res = await request(app).get("/compliance/adjusted-cb");
      expect(res.status).toBe(400);
    });

    it("should return adjusted CB when compliance record exists", async () => {
      // First create a compliance record
      await request(app)
        .get("/compliance/cb")
        .query({ shipId: "R003", year: 2025 });
      
      // Then get adjusted CB
      const res = await request(app)
        .get("/compliance/adjusted-cb")
        .query({ shipId: "R003", year: 2025 });
      expect(res.status).toBe(200);
      expect(res.body.shipId).toBe("R003");
    });
  });

  describe("GET /banking/records", () => {
    it("should return empty array when no records", async () => {
      const res = await request(app)
        .get("/banking/records")
        .query({ shipId: "R001", year: 2025 });
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it("should return 400 without required params", async () => {
      const res = await request(app).get("/banking/records");
      expect(res.status).toBe(400);
    });
  });

  describe("POST /banking/bank", () => {
    it("should bank surplus CB for compliant ship", async () => {
      // R003 has ghgIntensity 85 which is below target, so positive CB
      await request(app)
        .get("/compliance/cb")
        .query({ shipId: "R003", year: 2025 });

      const res = await request(app)
        .post("/banking/bank")
        .send({ shipId: "R003", year: 2025 });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("amountGco2eq");
      expect(res.body.amountGco2eq).toBeGreaterThan(0);
    });

    it("should return 400 without required params", async () => {
      const res = await request(app).post("/banking/bank").send({});
      expect(res.status).toBe(400);
    });

    it("should return 400 when trying to bank deficit CB", async () => {
      // R001 has ghgIntensity 91 which is above target, so negative CB
      await request(app)
        .get("/compliance/cb")
        .query({ shipId: "R001", year: 2025 });

      const res = await request(app)
        .post("/banking/bank")
        .send({ shipId: "R001", year: 2025 });

      expect(res.status).toBe(400);
    });
  });

  describe("POST /banking/apply", () => {
    it("should return 400 without required params", async () => {
      const res = await request(app).post("/banking/apply").send({});
      expect(res.status).toBe(400);
    });

    it("should return 400 when amount exceeds banked", async () => {
      const res = await request(app)
        .post("/banking/apply")
        .send({ shipId: "R001", year: 2025, amount: 999999999999 });
      expect(res.status).toBe(400);
    });
  });

  describe("POST /pools", () => {
    it("should return 400 for invalid pool (sum < 0)", async () => {
      const res = await request(app)
        .post("/pools")
        .send({
          year: 2025,
          members: [
            { shipId: "A", adjustedCB: -1000 },
            { shipId: "B", adjustedCB: -500 },
          ],
        });
      expect(res.status).toBe(400);
    });

    it("should return 400 for pool with less than 2 members", async () => {
      const res = await request(app)
        .post("/pools")
        .send({
          year: 2025,
          members: [{ shipId: "A", adjustedCB: 1000 }],
        });
      expect(res.status).toBe(400);
    });

    it("should return 400 without required params", async () => {
      const res = await request(app).post("/pools").send({});
      expect(res.status).toBe(400);
    });

    it("should create valid pool", async () => {
      const res = await request(app)
        .post("/pools")
        .send({
          year: 2025,
          members: [
            { shipId: "A", adjustedCB: 1000 },
            { shipId: "B", adjustedCB: -500 },
          ],
        });
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("id");
      expect(res.body).toHaveProperty("members");
      expect(res.body.members).toHaveLength(2);
    });

    it("should correctly allocate surplus to deficit", async () => {
      const res = await request(app)
        .post("/pools")
        .send({
          year: 2025,
          members: [
            { shipId: "X", adjustedCB: 500 },
            { shipId: "Y", adjustedCB: -300 },
          ],
        });
      expect(res.status).toBe(201);
      const memberY = res.body.members.find((m: { shipId: string }) => m.shipId === "Y");
      expect(memberY.cbAfter).toBe(0); // Deficit should be covered
    });
  });
});
