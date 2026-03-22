import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Network, RefreshCw, Combine, CheckCircle2 } from "lucide-react";
import { apiClient } from "../../infrastructure/apiClient";
import type { Pool } from "../../../core/domain/types";
import {
  PageToolbar,
  ToolbarRow,
  FieldGroup,
  Select,
  Button,
  Alert,
  DataTableShell,
  DataTable,
  THead,
  TH,
  TBody,
  TR,
  TD,
  Card,
  Spinner,
} from "../primitives";

const YEARS = [2024, 2025, 2026];

function formatCO2(value: number): string {
  if (Math.abs(value) >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(2)} MtCO₂eq`;
  }
  if (Math.abs(value) >= 1_000) {
    return `${(value / 1_000).toFixed(2)} ktCO₂eq`;
  }
  return `${value.toFixed(0)} gCO₂eq`;
}

interface ShipCB {
  shipId: string;
  adjustedCB: number;
  selected: boolean;
}

export function PoolingTab() {
  const [year, setYear] = useState(2025);
  const [ships, setShips] = useState<ShipCB[]>([]);
  const [poolResult, setPoolResult] = useState<Pool | null>(null);
  const [error, setError] = useState("");
  const [loadingCBs, setLoadingCBs] = useState(false);

  const { data: routes = [] } = useQuery({
    queryKey: ["routes"],
    queryFn: () => apiClient.getRoutes(),
  });

  const loadCBs = async () => {
    setError("");
    setPoolResult(null);
    setLoadingCBs(true);
    try {
      const results = await Promise.all(
        routes.map(async (r) => {
          const cb = await apiClient.getAdjustedCB(r.routeId, year);
          return {
            shipId: r.routeId,
            adjustedCB: cb.adjustedCB,
            selected: false,
          };
        }),
      );
      setShips(results);
    } catch (err: unknown) {
      const error = err as Error & { response?: { data?: { error?: string } } };
      setError(error.response?.data?.error || error.message);
    } finally {
      setLoadingCBs(false);
    }
  };

  const toggleShip = (shipId: string) => {
    setShips((prev) =>
      prev.map((s) =>
        s.shipId === shipId ? { ...s, selected: !s.selected } : s,
      ),
    );
  };

  const selectedShips = ships.filter((s) => s.selected);
  const poolSum = selectedShips.reduce((sum, s) => sum + s.adjustedCB, 0);
  const isValid = selectedShips.length >= 2 && poolSum >= 0;

  const createPoolMutation = useMutation({
    mutationFn: () =>
      apiClient.createPool(
        year,
        selectedShips.map((s) => ({
          shipId: s.shipId,
          adjustedCB: s.adjustedCB,
        })),
      ),
    onSuccess: (pool) => {
      setPoolResult(pool);
      setError("");
    },
    onError: (err: Error & { response?: { data?: { error?: string } } }) => {
      setError(err.response?.data?.error || err.message);
    },
  });

  return (
    <div className="space-y-6">
      <PageToolbar
        icon={Network}
        title="Ship pooling"
        description="Load adjusted compliance balances, select ships, and validate that the pooled sum is non-negative before creating a pool."
        actions={
          <ToolbarRow>
            <FieldGroup label="Year">
              <Select
                value={String(year)}
                onValueChange={(v) => setYear(Number(v))}
                options={YEARS.map((y) => ({
                  value: String(y),
                  label: String(y),
                }))}
                placeholder="Year"
              />
            </FieldGroup>
            <Button
              variant="secondary"
              disabled={loadingCBs}
              onClick={loadCBs}
            >
              {loadingCBs ? (
                <Spinner className="h-4 w-4" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              Load ship CBs
            </Button>
          </ToolbarRow>
        }
      />

      {error && <Alert variant="error">{error}</Alert>}

      {ships.length > 0 && (
        <>
          <DataTableShell>
            <DataTable className="min-w-[340px]">
              <THead>
                <TH className="w-12"> </TH>
                <TH>Ship</TH>
                <TH>Adjusted CB</TH>
                <TH>Position</TH>
              </THead>
              <TBody>
                {ships.map((s) => (
                  <TR
                    key={s.shipId}
                    onClick={() => toggleShip(s.shipId)}
                    className={`cursor-pointer ${
                      s.selected
                        ? "bg-primary/[0.06] dark:bg-primary/10"
                        : "hover:bg-secondary/40"
                    }`}
                  >
                    <TD>
                      <input
                        type="checkbox"
                        checked={s.selected}
                        onChange={() => toggleShip(s.shipId)}
                        className="h-4 w-4 rounded border-border"
                      />
                    </TD>
                    <TD className="font-medium">{s.shipId}</TD>
                    <TD>
                      <span
                        className={`font-mono text-[12px] font-semibold tabular-nums ${
                          s.adjustedCB >= 0
                            ? "text-success"
                            : "text-destructive"
                        }`}
                      >
                        {formatCO2(s.adjustedCB)}
                      </span>
                    </TD>
                    <TD>
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          s.adjustedCB >= 0
                            ? "bg-success/10 text-success"
                            : "bg-destructive/10 text-destructive"
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            s.adjustedCB >= 0 ? "bg-success" : "bg-destructive"
                          }`}
                        />
                        {s.adjustedCB >= 0 ? "Surplus" : "Deficit"}
                      </span>
                    </TD>
                  </TR>
                ))}
              </TBody>
            </DataTable>
          </DataTableShell>

          <Card>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div
                className={`inline-flex flex-col gap-1 rounded-xl border px-4 py-3 sm:flex-row sm:items-center sm:gap-3 ${
                  poolSum >= 0
                    ? "border-success/25 bg-success/10 text-success"
                    : "border-destructive/25 bg-destructive/10 text-destructive"
                }`}
              >
                <span className="text-sm font-semibold tabular-nums">
                  Pool sum: {formatCO2(poolSum)}
                </span>
                <span className="text-[12px] opacity-80">
                  {poolSum >= 0
                    ? "Valid — sum is ≥ 0"
                    : "Invalid — sum must be ≥ 0"}
                </span>
              </div>

              <Button
                variant="primary"
                disabled={!isValid || createPoolMutation.isPending}
                onClick={() => createPoolMutation.mutate()}
              >
                {createPoolMutation.isPending ? (
                  <Spinner className="h-4 w-4" />
                ) : (
                  <Combine className="h-4 w-4" />
                )}
                Create pool
              </Button>
            </div>
          </Card>
        </>
      )}

      {poolResult && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-success">
            <CheckCircle2 className="h-5 w-5" />
            <h3 className="text-lg font-semibold tracking-tight">
              Pool #{poolResult.id} created
            </h3>
          </div>
          <DataTableShell>
            <DataTable className="min-w-[400px]">
              <THead>
                <TH>Ship</TH>
                <TH>CB before</TH>
                <TH>CB after</TH>
                <TH>Transfer</TH>
              </THead>
              <TBody>
                {poolResult.members.map((m) => (
                  <TR key={m.shipId} className="hover:bg-secondary/40">
                    <TD className="font-medium">{m.shipId}</TD>
                    <TD>
                      <span
                        className={`font-mono text-[12px] tabular-nums ${
                          m.cbBefore >= 0 ? "text-success" : "text-destructive"
                        }`}
                      >
                        {formatCO2(m.cbBefore)}
                      </span>
                    </TD>
                    <TD>
                      <span
                        className={`font-mono text-[12px] tabular-nums ${
                          m.cbAfter >= 0 ? "text-success" : "text-destructive"
                        }`}
                      >
                        {formatCO2(m.cbAfter)}
                      </span>
                    </TD>
                    <TD className="font-mono text-[12px] text-muted-foreground tabular-nums">
                      {formatCO2(m.cbAfter - m.cbBefore)}
                    </TD>
                  </TR>
                ))}
              </TBody>
            </DataTable>
          </DataTableShell>
        </div>
      )}
    </div>
  );
}
