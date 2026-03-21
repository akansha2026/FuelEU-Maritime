import { Router, Request, Response, NextFunction } from "express";
import type { IBankingService } from "../../../core/ports/services";

export function createBankingController(service: IBankingService): Router {
  const router = Router();

  router.get(
    "/records",
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { shipId, year } = req.query;
        if (!shipId || !year) {
          res.status(400).json({ error: "shipId and year are required" });
          return;
        }

        const records = await service.getRecords(
          String(shipId),
          Number(year),
        );
        res.json(records);
      } catch (err) {
        next(err);
      }
    },
  );

  router.post(
    "/bank",
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { shipId, year } = req.body;
        if (!shipId || !year) {
          res.status(400).json({ error: "shipId and year are required" });
          return;
        }

        const entry = await service.bankSurplus(String(shipId), Number(year));
        res.status(201).json(entry);
      } catch (err) {
        next(err);
      }
    },
  );

  router.post(
    "/apply",
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { shipId, year, amount } = req.body;
        if (!shipId || !year || amount === undefined) {
          res.status(400).json({
            error: "shipId, year, and amount are required",
          });
          return;
        }

        const result = await service.applyBanked(
          String(shipId),
          Number(year),
          Number(amount),
        );
        res.json(result);
      } catch (err) {
        next(err);
      }
    },
  );

  return router;
}
