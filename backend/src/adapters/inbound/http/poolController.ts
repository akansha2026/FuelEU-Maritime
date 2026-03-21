import { Router, Request, Response, NextFunction } from "express";
import type { IPoolingService } from "../../../core/ports/services";

export function createPoolController(service: IPoolingService): Router {
  const router = Router();

  router.post("/", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { year, members } = req.body;

      if (!year || !Array.isArray(members)) {
        res.status(400).json({
          error: "year and members array are required",
        });
        return;
      }

      const pool = await service.createPool(Number(year), members);
      res.status(201).json(pool);
    } catch (err) {
      next(err);
    }
  });

  return router;
}
