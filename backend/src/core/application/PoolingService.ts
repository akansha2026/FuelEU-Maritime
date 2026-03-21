import type { IPoolingService } from "../ports/services";
import type { IPoolRepository } from "../ports/repositories";
import type { Pool, PoolMember, PoolMemberInput } from "../domain/entities";
import { allocatePool } from "../domain/formulas";
import { ValidationError } from "../../shared/errors";

export class PoolingService implements IPoolingService {
  constructor(private readonly poolRepo: IPoolRepository) {}

  async createPool(
    year: number,
    members: PoolMemberInput[],
  ): Promise<Pool & { members: PoolMember[] }> {
    if (members.length < 2) {
      throw new ValidationError("Pool must have at least 2 members");
    }

    const totalCB = members.reduce((sum, m) => sum + m.adjustedCB, 0);
    if (totalCB < 0) {
      throw new ValidationError(
        `Pool sum must be >= 0, got ${totalCB.toFixed(2)}`,
      );
    }

    const allocated = allocatePool(members);

    for (const member of allocated) {
      const input = members.find((m) => m.shipId === member.shipId);
      if (!input) continue;

      if (input.adjustedCB < 0 && member.cbAfter < input.adjustedCB) {
        throw new ValidationError(
          `Deficit ship ${member.shipId} cannot exit worse than entry`,
        );
      }

      if (input.adjustedCB > 0 && member.cbAfter < 0) {
        throw new ValidationError(
          `Surplus ship ${member.shipId} cannot exit negative`,
        );
      }
    }

    return this.poolRepo.create(year, allocated);
  }
}
