import { Router, Request, Response, NextFunction } from "express";
import type { IRouteService } from "../../../core/ports/services";

export function createRouteController(service: IRouteService): Router {
  const router = Router();

  router.get("/", async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const routes = await service.getAll();
      res.json(routes);
    } catch (err) {
      next(err);
    }
  });

  router.post(
    "/:routeId/baseline",
    async (req: Request<{ routeId: string }>, res: Response, next: NextFunction) => {
      try {
        const route = await service.setBaseline(req.params.routeId);
        res.json(route);
      } catch (err) {
        next(err);
      }
    },
  );

  router.get(
    "/comparison",
    async (_req: Request, res: Response, next: NextFunction) => {
      try {
        const comparison = await service.getComparison();
        res.json(comparison);
      } catch (err) {
        next(err);
      }
    },
  );

  return router;
}
