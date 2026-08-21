import { Loader2 } from "lucide-react";

export function PagoLoading() {
  return (
    <div className="p-8 flex items-center justify-center">
      <Loader2 className="size-8 animate-spin text-muted-foreground" />
    </div>
  );
}
