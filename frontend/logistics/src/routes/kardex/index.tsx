import { createFileRoute } from '@tanstack/react-router';
import { CardexSearch } from '@/features/Kardex/components/KardexSearch';
import { KardexPageHeader } from '@/features/Kardex/components/KardexPageHeader';
import { KardexRecentSearches } from '@/features/Kardex/components/KardexRecentSearches';

export const Route = createFileRoute('/kardex/')({
  head: () => ({
    meta: [
      { title: 'Cárdex e historial de movimientos — Inventario | Tráfico ERP' },
      {
        name: 'description',
        content:
          'Busca un producto o SKU para auditar su cárdex: entradas, salidas, documento, costo unitario y saldo resultante por movimiento.',
      },
      { property: 'og:title', content: 'Cárdex e historial de movimientos' },
      {
        property: 'og:description',
        content:
          'Consulta el historial de inventario por SKU con saldo acumulado y trazabilidad de documentos.',
      },
      { property: 'og:type', content: 'website' },
      { name: 'twitter:card', content: 'summary_large_image' },
    ],
  }),
  component: CardexIndexView,
});

function CardexIndexView() {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-2rem)] max-w-3xl flex-col items-center justify-center px-6 py-16">
      <div className="w-full space-y-8">
        <KardexPageHeader />
        <CardexSearch size="lg" autoFocus />
        <KardexRecentSearches />
      </div>
    </div>
  );
}