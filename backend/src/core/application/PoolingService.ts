/**
 * Pooling Service - implements FuelEU Article 21 (Pooling)
 * 
 * Pooling allows ships to share compliance balances.
 * Ships with surplus can offset ships with deficit.
 * 
 * Key validation rules from the regulation:
 * 1. Pool sum must be >= 0 (you can't create a net-deficit pool)
 * 2. Deficit ships cannot exit worse than they entered
 * 3. Surplus ships cannot exit with negative CB
 */

import type { IPoolingService } from "../ports/services";
import type { IPoolRepository } from "../ports/repositories";
import type { Pool, PoolMember, PoolMemberInput } from "../domain/entities";
import { allocatePool } from "../domain/formulas";
import { ValidationError } from "../../shared/errors";

export class PoolingService implements IPoolingService {
  constructor(private readonly poolRepo: IPoolRepository) {}

  /**
   * Create a new pool with the given members.
   * 
   * This validates the pool, runs the allocation algorithm,
   * and persists the result.
   */
  async createPool(
    year: number,
    members: PoolMemberInput[],
  ): Promise<Pool & { members: PoolMember[] }> {
    // Basic validation - need at least 2 ships to pool
    if (members.length < 2) {
      throw new ValidationError("Pool must have at least 2 members");
    }

    // Validate pool sum >= 0
    // This is a key rule - you can't create a pool that's net-negative
    const totalCB = members.reduce((sum, m) => sum + m.adjustedCB, 0);
    if (totalCB < 0) {
      throw new ValidationError(
        `Pool sum must be >= 0, got ${totalCB.toFixed(2)}`,
      );
    }

    // Run the greedy allocation algorithm
    const allocated = allocatePool(members);

    // Post-allocation validation
    // These are safety checks from Article 21
    for (const member of allocated) {
      const input = members.find((m) => m.shipId === member.shipId);
      if (!input) continue;

      // Rule: deficit ship cannot exit worse than entry
      // (i.e., if you entered with -100, you can't exit with -150)
      if (input.adjustedCB < 0 && member.cbAfter < input.adjustedCB) {
        throw new ValidationError(
          `Deficit ship ${member.shipId} cannot exit worse than entry`,
        );
      }

      // Rule: surplus ship cannot exit negative
      // (i.e., if you entered with +100, you can't be forced to -50)
      if (input.adjustedCB > 0 && member.cbAfter < 0) {
        throw new ValidationError(
          `Surplus ship ${member.shipId} cannot exit negative`,
        );
      }
    }

    // All validations passed - save the pool
    return this.poolRepo.create(year, allocated);
  }
}
