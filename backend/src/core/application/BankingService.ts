/**
 * Banking Service - implements FuelEU Article 20 (Banking)
 * 
 * Key rules:
 * - Can only bank POSITIVE compliance balance (surplus)
 * - Banked surplus can be applied to future deficits
 * - Cannot apply more than available banked amount
 */

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

  /**
   * Get all banking records for a ship in a given year.
   * Includes both deposits (positive) and withdrawals (negative).
   */
  async getRecords(shipId: string, year: number): Promise<BankEntry[]> {
    return this.bankRepo.findByShipAndYear(shipId, year);
  }

  /**
   * Bank the current compliance surplus.
   * 
   * This takes the ship's positive CB and stores it for future use.
   * Throws if CB is not positive - you can't bank a deficit!
   */
  async bankSurplus(shipId: string, year: number): Promise<BankEntry> {
    const compliance = await this.complianceRepo.findByShipAndYear(shipId, year);
    
    if (!compliance) {
      throw new NotFoundError("Compliance record", `${shipId}/${year}`);
    }

    // The spec says "bank positive CB" - so we validate this
    if (compliance.cbGco2eq <= 0) {
      throw new ValidationError(
        "Cannot bank: CB is not positive (no surplus to bank)",
      );
    }

    return this.bankRepo.create(shipId, year, compliance.cbGco2eq);
  }

  /**
   * Apply banked surplus to offset a deficit.
   * 
   * This "withdraws" from the bank and adds to the CB.
   * Typical use: ship has deficit, applies previously banked surplus.
   * 
   * We store a negative amount to represent the withdrawal.
   */
  async applyBanked(
    shipId: string,
    year: number,
    amount: number,
  ): Promise<{ applied: number; remaining: number }> {
    if (amount <= 0) {
      throw new ValidationError("Amount to apply must be positive");
    }

    // Check available balance
    const totalBanked = await this.bankRepo.getTotalBanked(shipId, year);
    if (amount > totalBanked) {
      throw new ValidationError(
        `Cannot apply ${amount}: only ${totalBanked} available in bank`,
      );
    }

    // Get current compliance record
    const compliance = await this.complianceRepo.findByShipAndYear(shipId, year);
    if (!compliance) {
      throw new NotFoundError("Compliance record", `${shipId}/${year}`);
    }

    // Update CB with applied amount
    const newCB = compliance.cbGco2eq + amount;
    await this.complianceRepo.upsert(shipId, year, newCB);

    // Record the withdrawal (negative amount)
    await this.bankRepo.create(shipId, year, -amount);

    return {
      applied: amount,
      remaining: totalBanked - amount,
    };
  }
}
