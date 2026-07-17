import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { type ReactNode } from "react";

import { Truck, Package, ClipboardList, LayoutDashboard, Boxes, Warehouse } from "lucide-react";
import { Toaster } from "@/components/ui/sonner";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Trafico ERP — Órdenes, Despachos e Inventario" },
      { name: "description", content: "Sistema ERP para gestión de órdenes de despacho, liquidación de retornos y control de inventario por lote." },
      { property: "og:title", content: "Trafico ERP" },
      { property: "og:description", content: "Órdenes, despachos e inventario en tiempo real." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      {
        rel: "stylesheet",
      },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@500;600&display=swap" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <>
      <HeadContent />
      {children}
      <Scripts />
    </>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen flex bg-background text-foreground" style={{ fontFamily: "Inter, system-ui, sans-serif" }}>
        <AppSidebar />
        <main className="flex-1 min-w-0">
          <Outlet />
        </main>
      </div>
      <Toaster richColors position="top-right" />
    </QueryClientProvider>
  );
}

function AppSidebar() {
  const items = [
    { to: "/", label: "Panel", icon: LayoutDashboard, exact: true },
    { to: "/despachos", label: "Despachos", icon: Truck },
    { to: "/inventario/stock", label: "Stock", icon: Boxes },
    { to: "/inventario/kardex", label: "Kardex", icon: ClipboardList },
  ];
  return (
    <aside className="w-60 shrink-0 bg-sidebar text-sidebar-foreground border-r border-sidebar-border flex flex-col">
      <div className="px-5 py-6 border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          <div className="size-9 rounded-md bg-sidebar-primary text-sidebar-primary-foreground grid place-items-center">
            <Warehouse className="size-5" />
          </div>
          <div>
            <div className="font-semibold tracking-tight">Tráfico ERP</div>
            <div className="text-[11px] uppercase tracking-widest text-sidebar-foreground/60">Logística · v1</div>
          </div>
        </div>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {items.map((it) => (
          <Link
            key={it.to}
            to={it.to}
            activeOptions={{ exact: it.exact }}
            className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors data-[status=active]:bg-sidebar-accent data-[status=active]:text-sidebar-primary data-[status=active]:font-semibold"
          >
            <it.icon className="size-4" />
            {it.label}
          </Link>
        ))}
      </nav>
      <div className="p-4 border-t border-sidebar-border">
        <div className="text-xs text-sidebar-foreground/60">Operador</div>
        <div className="text-sm font-medium">admin</div>
      </div>
    </aside>
  );
}

// Preserve unused import protection
void Package;
