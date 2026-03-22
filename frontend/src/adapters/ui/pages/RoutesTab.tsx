import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Anchor } from "lucide-react";
import { apiClient } from "../../infrastructure/apiClient";
import type { Route } from "../../../core/domain/types";
import {
  PageToolbar,
  ToolbarRow,
  FieldGroup,
  Select,
  SELECT_ALL,
  DataTableShell,
  DataTable,
  THead,
  TH,
  TBody,
  TR,
  TD,
  Button,
  Chip,
  Pill,
  CenteredSpinner,
} from "../primitives";

export function RoutesTab() {
  const queryClient = useQueryClient();
  const [filterVessel, setFilterVessel] = useState("");
  const [filterFuel, setFilterFuel] = useState("");
  const [filterYear, setFilterYear] = useState("");

  const { data: routes = [], isLoading } = useQuery({
    queryKey: ["routes"],
    queryFn: () => apiClient.getRoutes(),
  });

  const baselineMutation = useMutation({
    mutationFn: (routeId: string) => apiClient.setBaseline(routeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["routes"] });
      queryClient.invalidateQueries({ queryKey: ["comparison"] });
    },
  });

  const vesselTypes = [...new Set(routes.map((r) => r.vesselType))];
  const fuelTypes = [...new Set(routes.map((r) => r.fuelType))];
  const years = [...new Set(routes.map((r) => r.year))].sort();

  const filtered = routes.filter((r) => {
    if (filterVessel && r.vesselType !== filterVessel) return false;
    if (filterFuel && r.fuelType !== filterFuel) return false;
    if (filterYear && r.year !== Number(filterYear)) return false;
    return true;
  });

  if (isLoading) {
    return <CenteredSpinner />;
  }

  return (
    <div className="space-y-6">
      <PageToolbar
        icon={Anchor}
        title="Voyage routes"
        description="Filter voyages, inspect intensity and emissions, and set the regulatory baseline for comparisons."
        meta={<Pill>{filtered.length} shown</Pill>}
        actions={
          <ToolbarRow>
            <FieldGroup label="Vessel">
              <Select
                value={filterVessel || SELECT_ALL}
                onValueChange={(v) =>
                  setFilterVessel(v === SELECT_ALL ? "" : v)
                }
                options={[
                  { value: SELECT_ALL, label: "All vessels" },
                  ...vesselTypes.map((v) => ({ value: v, label: v })),
                ]}
                placeholder="All vessels"
              />
            </FieldGroup>
            <FieldGroup label="Fuel">
              <Select
                value={filterFuel || SELECT_ALL}
                onValueChange={(v) =>
                  setFilterFuel(v === SELECT_ALL ? "" : v)
                }
                options={[
                  { value: SELECT_ALL, label: "All fuels" },
                  ...fuelTypes.map((f) => ({ value: f, label: f })),
                ]}
                placeholder="All fuels"
              />
            </FieldGroup>
            <FieldGroup label="Year">
              <Select
                value={filterYear || SELECT_ALL}
                onValueChange={(v) =>
                  setFilterYear(v === SELECT_ALL ? "" : v)
                }
                options={[
                  { value: SELECT_ALL, label: "All years" },
                  ...years.map((y) => ({
                    value: String(y),
                    label: String(y),
                  })),
                ]}
                placeholder="All years"
              />
            </FieldGroup>
          </ToolbarRow>
        }
      />

      <DataTableShell>
        <DataTable className="min-w-[880px]">
          <THead>
            <TH>Route</TH>
            <TH>Vessel</TH>
            <TH>Fuel</TH>
            <TH>Year</TH>
            <TH>GHG intensity</TH>
            <TH>Fuel use</TH>
            <TH>Distance</TH>
            <TH>Emissions</TH>
            <TH className="text-right">Action</TH>
          </THead>
          <TBody>
            {filtered.map((route: Route) => (
              <TR
                key={route.routeId}
                className={
                  route.isBaseline
                    ? "bg-primary/[0.06] dark:bg-primary/10"
                    : "hover:bg-secondary/40"
                }
              >
                <TD className="font-medium whitespace-nowrap">
                  <span className="flex flex-wrap items-center gap-2">
                    {route.routeId}
                    {route.isBaseline && (
                      <span className="rounded-full bg-primary/12 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary dark:bg-primary/20">
                        Baseline
                      </span>
                    )}
                  </span>
                </TD>
                <TD className="text-muted-foreground">{route.vesselType}</TD>
                <TD>
                  <Chip>{route.fuelType}</Chip>
                </TD>
                <TD className="text-muted-foreground tabular-nums">
                  {route.year}
                </TD>
                <TD className="font-mono text-[12px] tabular-nums">
                  {route.ghgIntensity.toFixed(2)}
                  <span className="ml-1 text-[10px] font-sans text-muted-foreground">
                    gCO₂e/MJ
                  </span>
                </TD>
                <TD className="font-mono text-[12px] tabular-nums">
                  {route.fuelConsumption.toLocaleString()}
                  <span className="ml-1 text-[10px] font-sans text-muted-foreground">
                    t
                  </span>
                </TD>
                <TD className="font-mono text-[12px] tabular-nums">
                  {route.distance.toLocaleString()}
                  <span className="ml-1 text-[10px] font-sans text-muted-foreground">
                    km
                  </span>
                </TD>
                <TD className="font-mono text-[12px] tabular-nums">
                  {route.totalEmissions.toLocaleString()}
                  <span className="ml-1 text-[10px] font-sans text-muted-foreground">
                    t
                  </span>
                </TD>
                <TD className="text-right whitespace-nowrap">
                  <Button
                    size="sm"
                    variant={route.isBaseline ? "secondary" : "primary"}
                    disabled={route.isBaseline || baselineMutation.isPending}
                    onClick={() => baselineMutation.mutate(route.routeId)}
                  >
                    {route.isBaseline ? "Baseline" : "Set baseline"}
                  </Button>
                </TD>
              </TR>
            ))}
            {filtered.length === 0 && (
              <TR>
                <TD
                  colSpan={9}
                  className="py-14 text-center text-muted-foreground"
                >
                  No routes match the selected filters.
                </TD>
              </TR>
            )}
          </TBody>
        </DataTable>
      </DataTableShell>
    </div>
  );
}
