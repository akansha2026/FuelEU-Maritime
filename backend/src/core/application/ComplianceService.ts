import type { IComplianceService } from "../ports/services";
import type {
  IRouteRepository,
  IComplianceRepository,
  IBankRepository,
} from "../ports/repositories";
import type { ComplianceBalance, AdjustedCB } from "../domain/entities";
import {
  computeComplianceBalance,
  computePenalty,
} from "../domain/formulas";
import { NotFoundError } from "../../shared/errors";

export class ComplianceService implements IComplianceService {
  constructor(
    private readonly routeRepo: IRouteRepository,
    private readonly complianceRepo: IComplianceRepository,
    private readonly bankRepo: IBankRepository,
  ) {}

  async getComplianceBalance(
    shipId: string,
    year: number,
  ): Promise<ComplianceBalance> {
    const route = await this.routeRepo.findByRouteId(shipId);
    if (!route) {
      throw new NotFoundError("Route/Ship", shipId);
    }

    const { cb, target, energyInScope } = computeComplianceBalance(
      route.ghgIntensity,
      year,
      route.fuelConsumption,
    );

    const penalty = computePenalty(cb, route.ghgIntensity);

    await this.complianceRepo.upsert(shipId, year, cb);

    return {
      shipId,
      year,
      ghgIntensityTarget: target,
      ghgIntensityActual: route.ghgIntensity,
      energyInScope,
      cbGco2eq: cb,
      penaltyEur: penalty,
    };
  }

  async getAdjustedCB(shipId: string, year: number): Promise<AdjustedCB> {
    const compliance = await this.complianceRepo.findByShipAndYear(shipId, year);
    if (!compliance) {
      const cb = await this.getComplianceBalance(shipId, year);
      const banked = await this.bankRepo.getTotalBanked(shipId, year);

      return {
        shipId,
        year,
        initialCB: cb.cbGco2eq,
        bankedSurplus: banked,
        appliedFromBank: 0,
        adjustedCB: cb.cbGco2eq,
      };
    }

    const banked = await this.bankRepo.getTotalBanked(shipId, year);

    return {
      shipId,
      year,
      initialCB: compliance.cbGco2eq,
      bankedSurplus: banked,
      appliedFromBank: 0,
      adjustedCB: compliance.cbGco2eq,
    };
  }
}
