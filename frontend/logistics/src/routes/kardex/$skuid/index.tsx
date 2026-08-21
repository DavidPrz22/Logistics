import { createFileRoute } from '@tanstack/react-router';
import { KardexDetailView } from '@/features/Kardex/components/KardexDetailView';

export const Route = createFileRoute('/kardex/$skuid/')({
  component: CardexDetailView,
});

function CardexDetailView() {
  const { skuid } = Route.useParams();
  return <KardexDetailView skuid={skuid} />;
}
