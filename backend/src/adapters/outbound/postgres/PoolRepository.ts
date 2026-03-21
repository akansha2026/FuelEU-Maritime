import type { PrismaClient } from "@prisma/client";
import type { IPoolRepository } from "../../../core/ports/repositories";
import type { Pool, PoolMember } from "../../../core/domain/entities";

export class PoolRepository implements IPoolRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(
    year: number,
    members: { shipId: string; cbBefore: number; cbAfter: number }[],
  ): Promise<Pool & { members: PoolMember[] }> {
    const pool = await this.prisma.pool.create({
      data: {
        year,
        members: {
          create: members.map((m) => ({
            shipId: m.shipId,
            cbBefore: m.cbBefore,
            cbAfter: m.cbAfter,
          })),
        },
      },
      include: {
        members: true,
      },
    });

    return {
      id: pool.id,
      year: pool.year,
      createdAt: pool.createdAt,
      members: pool.members.map((m) => ({
        shipId: m.shipId,
        cbBefore: m.cbBefore,
        cbAfter: m.cbAfter,
      })),
    };
  }
}
