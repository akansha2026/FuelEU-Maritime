import type { PrismaClient } from "@prisma/client";
import type { IBankRepository } from "../../../core/ports/repositories";
import type { BankEntry } from "../../../core/domain/entities";

export class BankRepository implements IBankRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findByShipAndYear(shipId: string, year: number): Promise<BankEntry[]> {
    return this.prisma.bankEntry.findMany({
      where: { shipId, year },
      orderBy: { createdAt: "desc" },
    });
  }

  async getTotalBanked(shipId: string, year: number): Promise<number> {
    const result = await this.prisma.bankEntry.aggregate({
      where: { shipId, year },
      _sum: { amountGco2eq: true },
    });
    return result._sum.amountGco2eq ?? 0;
  }

  async create(
    shipId: string,
    year: number,
    amount: number,
  ): Promise<BankEntry> {
    return this.prisma.bankEntry.create({
      data: {
        shipId,
        year,
        amountGco2eq: amount,
      },
    });
  }
}
