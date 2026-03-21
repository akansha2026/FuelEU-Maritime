import type { IRouteService } from "../ports/services";
import type { IRouteRepository } from "../ports/repositories";
import type { Route, ComparisonResult } from "../domain/entities";
import { computePercentDiff, isCompliant } from "../domain/formulas";
import { NotFoundError } from "../../shared/errors";

export class RouteService implements IRouteService {
  constructor(private readonly routeRepo: IRouteRepository) {}

  async getAll(): Promise<Route[]> {
    return this.routeRepo.findAll();
  }

  async setBaseline(routeId: string): Promise<Route> {
    const route = await this.routeRepo.findByRouteId(routeId);
    if (!route) {
      throw new NotFoundError("Route", routeId);
    }
    return this.routeRepo.setBaseline(routeId);
  }

  async getComparison(): Promise<ComparisonResult[]> {
    const baseline = await this.routeRepo.findBaseline();
    if (!baseline) {
      throw new NotFoundError("Baseline", "none set");
    }

    const allRoutes = await this.routeRepo.findAll();
    const others = allRoutes.filter((r) => r.routeId !== baseline.routeId);

    return others.map((route) => ({
      routeId: route.routeId,
      vesselType: route.vesselType,
      fuelType: route.fuelType,
      year: route.year,
      ghgIntensity: route.ghgIntensity,
      baselineGhgIntensity: baseline.ghgIntensity,
      percentDiff: computePercentDiff(route.ghgIntensity, baseline.ghgIntensity),
      compliant: isCompliant(route.ghgIntensity, route.year),
    }));
  }
}
