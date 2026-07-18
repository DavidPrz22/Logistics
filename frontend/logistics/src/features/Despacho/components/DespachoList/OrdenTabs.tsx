import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { OrdenSearchParams } from "../../types/types";

interface OrdenTabsProps {
  search: OrdenSearchParams;
  counts: Record<string, number>;
  onTabChange: (tab: string) => void;
}

export function OrdenTabs({ search, counts, onTabChange }: OrdenTabsProps) {
  return (
    <Tabs value={search.tab} onValueChange={onTabChange}>
      <TabsList className="bg-secondary">
        {(["TODOS", "PREPARACION", "EN_RUTA", "LIQUIDADA"] as const).map((t) => (
          <TabsTrigger key={t} value={t} className="data-[state=active]:bg-background">
            {t === "TODOS" ? "Todos" : t === "PREPARACION" ? "Preparación" : t === "EN_RUTA" ? "En ruta" : "Liquidadas"}
            <span className="ml-2 text-xs text-muted-foreground tabular-nums">{counts[t]}</span>
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
