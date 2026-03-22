import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Landmark, Plus, ArrowDownToLine } from "lucide-react";
import { apiClient } from "../../infrastructure/apiClient";
import { KpiCard } from "../components/KpiCard";
import {
  PageToolbar,
  ToolbarRow,
  FieldGroup,
  Select,
  Button,
  Card,
  Alert,
  DataTableShell,
  DataTable,
  THead,
  TH,
  TBody,
  TR,
  TD,
  CenteredSpinner,
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

export function BankingTab() {
  const queryClient = useQueryClient();
  const [shipId, setShipId] = useState("R002");
  const [year, setYear] = useState(2024);
  const [applyAmount, setApplyAmount] = useState("");
  const [error, setError] = useState("");

  const { data: routes = [] } = useQuery({
    queryKey: ["routes"],
    queryFn: () => apiClient.getRoutes(),
  });

  const cbQuery = useQuery({
    queryKey: ["cb", shipId, year],
    queryFn: () => apiClient.getComplianceBalance(shipId, year),
    enabled: !!shipId,
  });

  const recordsQuery = useQuery({
    queryKey: ["bankRecords", shipId, year],
    queryFn: () => apiClient.getBankingRecords(shipId, year),
    enabled: !!shipId,
  });

  const bankMutation = useMutation({
    mutationFn: () => apiClient.bankSurplus(shipId, year),
    onSuccess: () => {
      setError("");
      queryClient.invalidateQueries({ queryKey: ["bankRecords"] });
      queryClient.invalidateQueries({ queryKey: ["cb"] });
    },
    onError: (err: Error & { response?: { data?: { error?: string } } }) => {
      setError(err.response?.data?.error || err.message);
    },
  });

  const applyMutation = useMutation({
    mutationFn: (amount: number) => apiClient.applyBanked(shipId, year, amount),
    onSuccess: () => {
      setError("");
      setApplyAmount("");
      queryClient.invalidateQueries({ queryKey: ["bankRecords"] });
      queryClient.invalidateQueries({ queryKey: ["cb"] });
    },
    onError: (err: Error & { response?: { data?: { error?: string } } }) => {
      setError(err.response?.data?.error || err.message);
    },
  });

  const cb = cbQuery.data;
  const records = recordsQuery.data ?? [];
  const totalBanked = records
    .filter((r) => r.amountGco2eq > 0)
    .reduce((sum, r) => sum + r.amountGco2eq, 0);

  const shipIds = [...new Set(routes.map((r) => r.routeId))];
  const shipOptions =
    shipIds.length > 0
      ? shipIds.map((id) => ({ value: id, label: id }))
      : [{ value: shipId, label: shipId }];

  return (
    <div className="space-y-6">
      <PageToolbar
        icon={Landmark}
        title="Banking & borrowing"
        description="Review compliance balance, bank surplus, and apply banked amounts for a ship and reporting year."
        actions={
          <ToolbarRow>
            <FieldGroup label="Ship">
              <Select
                value={shipId}
                onValueChange={setShipId}
                options={shipOptions}
                placeholder="Select ship"
              />
            </FieldGroup>
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
          </ToolbarRow>
        }
      />

      {cbQuery.isLoading && <CenteredSpinner />}

      {cb && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 md:grid-cols-3">
          <KpiCard
            label="Compliance balance"
            value={formatCO2(cb.cbGco2eq)}
            sublabel={`Target ${cb.ghgIntensityTarget.toFixed(2)} · Actual ${cb.ghgIntensityActual.toFixed(2)} gCO₂e/MJ`}
            variant={cb.cbGco2eq >= 0 ? "success" : "danger"}
          />
          <KpiCard label="Total banked" value={formatCO2(totalBanked)} />
          <KpiCard
            label="Penalty exposure"
            value={
              cb.penaltyEur > 0
                ? `€${cb.penaltyEur.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
                : "€0"
            }
            variant={cb.penaltyEur > 0 ? "danger" : "success"}
          />
        </div>
      )}

      {error && <Alert variant="error">{error}</Alert>}

      <Card>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
          <Button
            variant="primary"
            disabled={!cb || cb.cbGco2eq <= 0 || bankMutation.isPending}
            onClick={() => bankMutation.mutate()}
          >
            {bankMutation.isPending ? (
              <Spinner className="h-4 w-4" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            Bank surplus
          </Button>

          <div className="flex items-end gap-3">
            <FieldGroup label="Apply amount">
              <input
                type="number"
                placeholder="gCO₂eq"
                value={applyAmount}
                onChange={(e) => setApplyAmount(e.target.value)}
                className="h-9 w-[160px] rounded-lg border border-border bg-card px-3 text-sm"
              />
            </FieldGroup>
            <Button
              variant="secondary"
              disabled={
                !applyAmount ||
                Number(applyAmount) <= 0 ||
                applyMutation.isPending
              }
              onClick={() => applyMutation.mutate(Number(applyAmount))}
            >
              {applyMutation.isPending ? (
                <Spinner className="h-4 w-4" />
              ) : (
                <ArrowDownToLine className="h-4 w-4" />
              )}
              Apply banked
            </Button>
          </div>
        </div>
      </Card>

      {records.length > 0 && (
        <DataTableShell>
          <DataTable className="min-w-[480px]">
            <THead>
              <TH>ID</TH>
              <TH>Ship</TH>
              <TH>Year</TH>
              <TH>Amount</TH>
              <TH>Date</TH>
            </THead>
            <TBody>
              {records.map((r) => (
                <TR key={r.id} className="hover:bg-secondary/40">
                  <TD className="font-medium tabular-nums">{r.id}</TD>
                  <TD className="text-muted-foreground">{r.shipId}</TD>
                  <TD className="text-muted-foreground tabular-nums">
                    {r.year}
                  </TD>
                  <TD>
                    <span
                      className={`font-mono text-[12px] font-semibold tabular-nums ${
                        r.amountGco2eq >= 0
                          ? "text-success"
                          : "text-destructive"
                      }`}
                    >
                      {r.amountGco2eq >= 0 ? "+" : ""}
                      {formatCO2(r.amountGco2eq)}
                    </span>
                  </TD>
                  <TD className="text-muted-foreground">
                    {new Date(r.createdAt).toLocaleDateString()}
                  </TD>
                </TR>
              ))}
            </TBody>
          </DataTable>
        </DataTableShell>
      )}
    </div>
  );
}
