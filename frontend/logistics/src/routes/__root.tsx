import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  HeadContent,
  Scripts,
  useLocation,
  useNavigate,
} from "@tanstack/react-router";
import { type ReactNode, useEffect } from "react";

import { Truck, Warehouse, Receipt, CreditCardIcon, BoxIcon, LayoutDashboard, Package } from "lucide-react";
import { Toaster } from "@/components/ui/sonner";
import { UserMenu } from "@/features/Auth/components/UserMenu";
import { useAuthStore } from "@/features/Auth/store/zustandstore";
import { useHasPermission } from "@/features/Auth/hooks/useHasPermission";
import { toast } from "sonner";

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
      { title: "Trafico ERP - Órdenes, Despachos e Inventario" },
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
  const location = useLocation();
  const navigate = useNavigate();
  const isAuthRoute = location.pathname === '/login' || location.pathname === '/register';
  const initializeAuth = useAuthStore((state) => state.initializeAuth);
  const setAuth = useAuthStore((state) => state.setAuth);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const googleAuthData = params.get('google_auth');

    if (googleAuthData) {
      try {
        const { accessToken, usuario } = JSON.parse(decodeURIComponent(googleAuthData));
        const payload = { accessToken, usuario };
        const isPopupWindow = Boolean(window.opener || window.name === 'Google Login');

        // 1. Notify via BroadcastChannel
        if (typeof window.BroadcastChannel !== 'undefined') {
          try {
            const channel = new BroadcastChannel('google_oauth_channel');
            channel.postMessage({ type: 'GOOGLE_AUTH_SUCCESS', payload });
            channel.close();
          } catch (err) {
            console.error('Error sending through BroadcastChannel:', err);
          }
        }

        // 2. Notify via postMessage if window.opener is available
        if (window.opener) {
          try {
            window.opener.postMessage(
              { type: 'GOOGLE_AUTH_SUCCESS', payload },
              '*'
            );
          } catch (err) {
            console.error('Error sending through window.opener:', err);
          }
        }

        // 3. Notify via localStorage (triggers storage event in other same-origin windows)
        try {
          localStorage.setItem(
            'google_oauth_success',
            JSON.stringify({ ...payload, timestamp: Date.now() })
          );
        } catch (err) {
          console.error('Error writing to localStorage:', err);
        }

        // If this window was opened as a popup, close it
        if (isPopupWindow) {
          setTimeout(() => {
            window.close();
          }, 150);
        } else {
          // If navigated directly in the main window
          setAuth(usuario, accessToken);
          toast.success('Sesión iniciada con Google');
          window.history.replaceState({}, '', '/');
          navigate({ to: '/', replace: true });
        }
      } catch (error) {
        console.error('Error processing Google auth data:', error);
        toast.error('Error al procesar la autenticación de Google');
        window.history.replaceState({}, '', '/');
      }
    }
  }, [setAuth, navigate]);

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen flex bg-background text-foreground" style={{ fontFamily: "Inter, system-ui, sans-serif" }}>
        {!isAuthRoute && <AppSidebar />}
        <main className="flex-1 min-w-0">
          <Outlet />
        </main>
      </div>
      <Toaster richColors position="top-right" />
    </QueryClientProvider>
  );
}

function AppSidebar() {
  const hasPaymentsView = useHasPermission("payments:view");

  const items = [
    { to: "/", label: "Panel", icon: LayoutDashboard, exact: true },
    { to: "/despachos", label: "Despachos", icon: Truck },
    { to: "/facturacion", label: "Facturación", icon: Receipt },
    ...(hasPaymentsView ? [{ to: "/pagos", label: "Pagos", icon: CreditCardIcon }] : []),
    { to: "/kardex", label: "Kárdex", icon: BoxIcon },
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
            <div className="text-[11px] uppercase tracking-widest text-sidebar-foreground/60">Logística   v1</div>
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
      <div className="fixed bottom-0 w-60 p-4 border-t border-sidebar-border">
        <UserMenu />
      </div>
    </aside>
  );
}

// Preserve unused import protection
void Package;
