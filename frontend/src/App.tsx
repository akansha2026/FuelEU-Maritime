/**
 * Main App component for FuelEU Maritime Compliance Dashboard
 * 
 * Features:
 * - Four tabs: Routes, Compare, Banking, Pooling
 * - Dark mode toggle (persists to localStorage)
 * - React Query for server state management
 */

import { useState, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Ship, BarChart3, Landmark, Network, Sun, Moon } from "lucide-react";
import { RoutesTab } from "./adapters/ui/pages/RoutesTab";
import { CompareTab } from "./adapters/ui/pages/CompareTab";
import { BankingTab } from "./adapters/ui/pages/BankingTab";
import { PoolingTab } from "./adapters/ui/pages/PoolingTab";
import { cn } from "./adapters/ui/primitives/cn";

// Configure React Query - disable refetch on window focus during dev
// (it's annoying when switching between code and browser)
const queryClient = new QueryClient({
  defaultOptions: {
    queries: { 
      retry: 1, 
      refetchOnWindowFocus: false,
    },
  },
});

const TABS = [
  { id: "routes", label: "Routes", icon: Ship },
  { id: "compare", label: "Compare", icon: BarChart3 },
  { id: "banking", label: "Banking", icon: Landmark },
  { id: "pooling", label: "Pooling", icon: Network },
] as const;

/**
 * Custom hook for dark mode with localStorage persistence.
 * 
 * Note: There's also a script in index.html that runs before React
 * to prevent flash of wrong theme on page load.
 */
function useDarkMode() {
  const [dark, setDark] = useState(() => {
    if (typeof window === "undefined") return false;
    return document.documentElement.classList.contains("dark");
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  return [dark, () => setDark((d) => !d)] as const;
}

function Dashboard() {
  const [activeTab, setActiveTab] = useState("routes");
  const [dark, toggleDark] = useDarkMode();

  return (
    <div className="relative min-h-screen bg-background text-foreground transition-colors duration-300">
      {/* Background gradient mesh - purely decorative */}
      <div className="app-mesh" aria-hidden />

      {/* Sticky header with glass effect */}
      <header className="sticky top-0 z-50 glass border-b border-border/60">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:h-16 sm:px-6">
          {/* Logo and title */}
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#007aff] via-[#5856d6] to-[#30d158] shadow-md">
              <Ship className="h-4 w-4 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-sm font-semibold tracking-tight sm:text-base">
                FuelEU Maritime
              </h1>
              <p className="hidden text-xs text-muted-foreground sm:block">
                Compliance Dashboard
              </p>
            </div>
          </div>

          {/* Dark mode toggle */}
          <button
            type="button"
            onClick={toggleDark}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
          >
            {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        {/* Tab navigation - segmented control style */}
        <nav className="segmented mb-6 w-full sm:mb-8 sm:w-fit" aria-label="Primary">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id)}
              className={cn(
                "segmented-item",
                activeTab === id ? "segmented-item-active" : "segmented-item-inactive",
              )}
            >
              <Icon className="h-4 w-4 opacity-80" />
              {label}
            </button>
          ))}
        </nav>

        {/* Tab content - key forces remount for fade animation */}
        <div className="fade-in" key={activeTab}>
          {activeTab === "routes" && <RoutesTab />}
          {activeTab === "compare" && <CompareTab />}
          {activeTab === "banking" && <BankingTab />}
          {activeTab === "pooling" && <PoolingTab />}
        </div>
      </main>

      <footer className="mx-auto max-w-6xl px-4 pb-6 pt-2 sm:px-6">
        <p className="text-center text-[11px] text-muted-foreground">
          FuelEU Maritime Compliance Dashboard
        </p>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Dashboard />
    </QueryClientProvider>
  );
}
