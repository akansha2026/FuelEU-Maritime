import type { PrismaClient } from "@prisma/client";
import type { IComplianceRepository } from "../../../core/ports/repositories";

export class ComplianceRepository implements IComplianceRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async upsert(shipId: string, year: number, cbGco2eq: number): Promise<void> {
    await this.prisma.shipCompliance.upsert({
      where: {
        shipId_year: { shipId, year },
      },
      update: { cbGco2eq },
      create: { shipId, year, cbGco2eq },
    });
  }

  async findByShipAndYear(
    shipId: string,
    year: number,
  ): Promise<{ cbGco2eq: number } | null> {
    return this.prisma.shipCompliance.findUnique({
      where: {
        shipId_year: { shipId, year },
      },
      select: { cbGco2eq: true },
    });
  }
}
