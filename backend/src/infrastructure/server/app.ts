import express from "express";
import cors from "cors";
import type { Request, Response, NextFunction } from "express";
import { AppError } from "../../shared/errors";

import { prisma } from "../db/client";

import { RouteRepository } from "../../adapters/outbound/postgres/RouteRepository";
import { ComplianceRepository } from "../../adapters/outbound/postgres/ComplianceRepository";
import { BankRepository } from "../../adapters/outbound/postgres/BankRepository";
import { PoolRepository } from "../../adapters/outbound/postgres/PoolRepository";

import { RouteService } from "../../core/application/RouteService";
import { ComplianceService } from "../../core/application/ComplianceService";
import { BankingService } from "../../core/application/BankingService";
import { PoolingService } from "../../core/application/PoolingService";

import { createRouteController } from "../../adapters/inbound/http/routeController";
import { createComplianceController } from "../../adapters/inbound/http/complianceController";
import { createBankingController } from "../../adapters/inbound/http/bankingController";
import { createPoolController } from "../../adapters/inbound/http/poolController";

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  const routeRepo = new RouteRepository(prisma);
  const complianceRepo = new ComplianceRepository(prisma);
  const bankRepo = new BankRepository(prisma);
  const poolRepo = new PoolRepository(prisma);

  const routeService = new RouteService(routeRepo);
  const complianceService = new ComplianceService(
    routeRepo,
    complianceRepo,
    bankRepo,
  );
  const bankingService = new BankingService(complianceRepo, bankRepo);
  const poolingService = new PoolingService(poolRepo);

  app.use("/routes", createRouteController(routeService));
  app.use("/compliance", createComplianceController(complianceService));
  app.use("/banking", createBankingController(bankingService));
  app.use("/pools", createPoolController(poolingService));

  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    if (err instanceof AppError) {
      res.status(err.statusCode).json({ error: err.message });
      return;
    }
    console.error("Unhandled error:", err);
    res.status(500).json({ error: "Internal server error" });
  });

  return app;
}
