import type { IBankingService } from "../ports/services";
import type {
  IComplianceRepository,
  IBankRepository,
} from "../ports/repositories";
import type { BankEntry } from "../domain/entities";
import { ValidationError, NotFoundError } from "../../shared/errors";

export class BankingService implements IBankingService {
  constructor(
    private readonly complianceRepo: IComplianceRepository,
    private readonly bankRepo: IBankRepository,
  ) {}

  async getRecords(shipId: string, year: number): Promise<BankEntry[]> {
    return this.bankRepo.findByShipAndYear(shipId, year);
  }

  async bankSurplus(shipId: string, year: number): Promise<BankEntry> {
    const compliance = await this.complianceRepo.findByShipAndYear(shipId, year);
    if (!compliance) {
      throw new NotFoundError("Compliance record", `${shipId}/${year}`);
    }

    if (compliance.cbGco2eq <= 0) {
      throw new ValidationError(
        "Cannot bank: CB is not positive (no surplus to bank)",
      );
    }

    return this.bankRepo.create(shipId, year, compliance.cbGco2eq);
  }

  async applyBanked(
    shipId: string,
    year: number,
    amount: number,
  ): Promise<{ applied: number; remaining: number }> {
    if (amount <= 0) {
      throw new ValidationError("Amount to apply must be positive");
    }

    const totalBanked = await this.bankRepo.getTotalBanked(shipId, year);
    if (amount > totalBanked) {
      throw new ValidationError(
        `Cannot apply ${amount}: only ${totalBanked} available in bank`,
      );
    }

    const compliance = await this.complianceRepo.findByShipAndYear(shipId, year);
    if (!compliance) {
      throw new NotFoundError("Compliance record", `${shipId}/${year}`);
    }

    const newCB = compliance.cbGco2eq + amount;
    await this.complianceRepo.upsert(shipId, year, newCB);

    await this.bankRepo.create(shipId, year, -amount);

    return {
      applied: amount,
      remaining: totalBanked - amount,
    };
  }
}
