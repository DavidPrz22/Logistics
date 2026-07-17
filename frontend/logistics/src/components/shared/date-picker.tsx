import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export function DatePicker({
  value,
  onChange,
  placeholder = "Seleccionar fecha",
  className,
}: {
  value?: string; // ISO yyyy-MM-dd
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
}) {
  const date = value ? parseISO(value) : undefined;
  return (
    <Popover>
      <PopoverTrigger className={cn(buttonVariants({ variant: "outline" }), "w-full justify-start text-left font-normal", !date && "text-muted-foreground", className)}>
        <CalendarIcon className="mr-2 size-4 shrink-0" />
        <span className="flex-1 truncate">
          {date ? format(date, "PPP", { locale: es }) : placeholder}
        </span>
        {date && (
          <span
            role="button"
            tabIndex={0}
            onClick={(e) => { e.stopPropagation(); onChange(""); }}
            onKeyDown={(e) => { if (e.key === "Enter") { e.stopPropagation(); onChange(""); } }}
            className="ml-2 rounded p-0.5 hover:bg-muted"
            aria-label="Limpiar fecha"
          >
            <X className="size-3.5" />
          </span>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 pointer-events-auto" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={(d) => onChange(d ? format(d, "yyyy-MM-dd") : "")}
          initialFocus
          locale={es}
          className={cn("p-3 pointer-events-auto")}
        />
      </PopoverContent>
    </Popover>
  );
}