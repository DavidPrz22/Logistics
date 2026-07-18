import { createFileRoute } from "@tanstack/react-router";
import { DespachoCreatePage } from "@/features/Despacho/components/DespachoCreate/DespachoCreatePage";

export const Route = createFileRoute("/despachos/crear")({ component: DespachoCreatePage });
