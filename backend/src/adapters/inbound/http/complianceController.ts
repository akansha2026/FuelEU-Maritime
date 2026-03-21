import { Router, Request, Response, NextFunction } from "express";
import type { IComplianceService } from "../../../core/ports/services";

export function createComplianceController(
  service: IComplianceService,
): Router {
  const router = Router();

  router.get(
    "/cb",
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { shipId, year } = req.query;
        if (!shipId || !year) {
          res.status(400).json({ error: "shipId and year are required" });
          return;
        }

        const cb = await service.getComplianceBalance(
          String(shipId),
          Number(year),
        );
        res.json(cb);
      } catch (err) {
        next(err);
      }
    },
  );

  router.get(
    "/adjusted-cb",
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { shipId, year } = req.query;
        if (!shipId || !year) {
          res.status(400).json({ error: "shipId and year are required" });
          return;
        }

        const adjusted = await service.getAdjustedCB(
          String(shipId),
          Number(year),
        );
        res.json(adjusted);
      } catch (err) {
        next(err);
      }
    },
  );

  return router;
}
