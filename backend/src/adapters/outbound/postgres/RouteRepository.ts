import type { PrismaClient } from "@prisma/client";
import type { IRouteRepository } from "../../../core/ports/repositories";
import type { Route } from "../../../core/domain/entities";

export class RouteRepository implements IRouteRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findAll(): Promise<Route[]> {
    return this.prisma.route.findMany({
      orderBy: { id: "asc" },
    });
  }

  async findById(id: number): Promise<Route | null> {
    return this.prisma.route.findUnique({
      where: { id },
    });
  }

  async findByRouteId(routeId: string): Promise<Route | null> {
    return this.prisma.route.findUnique({
      where: { routeId },
    });
  }

  async findBaseline(): Promise<Route | null> {
    return this.prisma.route.findFirst({
      where: { isBaseline: true },
    });
  }

  async setBaseline(routeId: string): Promise<Route> {
    await this.prisma.route.updateMany({
      where: { isBaseline: true },
      data: { isBaseline: false },
    });

    return this.prisma.route.update({
      where: { routeId },
      data: { isBaseline: true },
    });
  }
}
