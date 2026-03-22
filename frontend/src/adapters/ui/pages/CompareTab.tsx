import { useQuery } from "@tanstack/react-query";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { BarChart3 } from "lucide-react";
import { apiClient } from "../../infrastructure/apiClient";
import { getGhgTarget } from "../../../shared/constants";
import {
  PageToolbar,
  Card,
  Alert,
  DataTableShell,
  DataTable,
  THead,
  TH,
  TBody,
  TR,
  TD,
  Chip,
  CenteredSpinner,
} from "../primitives";

const GHG_TARGET_2025 = getGhgTarget(2025);

export function CompareTab() {
  const { data: comparison = [], isLoading } = useQuery({
    queryKey: ["comparison"],
    queryFn: () => apiClient.getComparison(),
  });

  if (isLoading) {
    return <CenteredSpinner />;
  }

  if (comparison.length === 0) {
    return (
      <div className="space-y-6">
        <PageToolbar
          icon={BarChart3}
          title="GHG intensity comparison"
          description="Compare each route against your selected baseline and the regulatory target."
        />
        <Alert variant="info">
          No baseline is set yet. Open <strong>Routes</strong> and choose{" "}
          <strong>Set baseline</strong> on a voyage to unlock this view.
        </Alert>
      </div>
    );
  }

  const chartData = comparison.map((c) => ({
    name: c.routeId,
    ghgIntensity: c.ghgIntensity,
    compliant: c.compliant,
  }));

  return (
    <div className="space-y-6">
      <PageToolbar
        icon={BarChart3}
        title="GHG intensity comparison"
        description="Bars show actual intensity; the dashed line is the FuelEU target for the reference year."
      />

      <Card className="overflow-hidden">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Chart
            </p>
            <p className="text-sm font-medium">Intensity by route (gCO₂e/MJ)</p>
          </div>
          <div className="flex gap-4 text-[12px] text-muted-foreground">
            <span className="inline-flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-success" />
              Compliant
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-destructive" />
              Above target
            </span>
          </div>
        </div>

        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
                axisLine={{ stroke: "var(--border)" }}
                tickLine={false}
              />
              <YAxis
                domain={[75, 100]}
                tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                }}
              />
              <ReferenceLine
                y={GHG_TARGET_2025}
                stroke="var(--warning)"
                strokeDasharray="6 4"
                strokeWidth={2}
                label={{
                  value: `Target ${GHG_TARGET_2025.toFixed(2)}`,
                  position: "right",
                  fill: "var(--warning)",
                  fontSize: 11,
                }}
              />
              <Bar dataKey="ghgIntensity" radius={[8, 8, 0, 0]} maxBarSize={50}>
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.compliant ? "var(--success)" : "var(--destructive)"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <DataTableShell>
        <DataTable className="min-w-[720px]">
          <THead>
            <TH>Route</TH>
            <TH>Vessel</TH>
            <TH>Fuel</TH>
            <TH>Year</TH>
            <TH>Intensity</TH>
            <TH>Baseline</TH>
            <TH>Δ vs baseline</TH>
            <TH>Status</TH>
          </THead>
          <TBody>
            {comparison.map((c) => (
              <TR key={c.routeId} className="hover:bg-secondary/40">
                <TD className="font-medium">{c.routeId}</TD>
                <TD className="text-muted-foreground">{c.vesselType}</TD>
                <TD>
                  <Chip>{c.fuelType}</Chip>
                </TD>
                <TD className="text-muted-foreground tabular-nums">{c.year}</TD>
                <TD className="font-mono text-[12px] tabular-nums">
                  {c.ghgIntensity.toFixed(2)}
                </TD>
                <TD className="font-mono text-[12px] tabular-nums text-muted-foreground">
                  {c.baselineGhgIntensity.toFixed(2)}
                </TD>
                <TD>
                  <span
                    className={`font-mono text-[12px] font-semibold tabular-nums ${
                      c.percentDiff < 0 ? "text-success" : "text-destructive"
                    }`}
                  >
                    {c.percentDiff > 0 ? "+" : ""}
                    {c.percentDiff.toFixed(2)}%
                  </span>
                </TD>
                <TD>
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      c.compliant
                        ? "bg-success/10 text-success"
                        : "bg-destructive/10 text-destructive"
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        c.compliant ? "bg-success" : "bg-destructive"
                      }`}
                    />
                    {c.compliant ? "Compliant" : "Non-compliant"}
                  </span>
                </TD>
              </TR>
            ))}
          </TBody>
        </DataTable>
      </DataTableShell>
    </div>
  );
}
