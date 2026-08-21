import { useState, useRef, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Search, Package, Clock, X, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { useDebounce } from '@/hooks/useDebounce';
import { useKardexSearch } from '../hooks/queries/queries';
import { useKardexSearchStore } from '../store/zustandstore';
import type { VarianteKardex } from '../schemas/schemas';

interface FlatItem {
  type: 'recent' | 'result';
  sku: string;
  nombre: string;
  productName: string;
  id: number;
}

export function CardexSearch({
  size = 'md',
  autoFocus = false,
}: {
  size?: 'md' | 'lg';
  autoFocus?: boolean;
}) {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [open, setOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const debouncedSearch = useDebounce(searchTerm, 300);
  const isQueryActive = debouncedSearch.trim().length >= 3;

  const {
    data: searchResults = [],
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useKardexSearch(debouncedSearch);

  const { recientes, addRecent, removeRecent, clearRecientes } = useKardexSearchStore();

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Global Ctrl+K / Cmd+K listener
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Flatten items for keyboard navigation
  const flatItems: FlatItem[] = isQueryActive
    ? searchResults.flatMap((group) =>
        group.variantes.map((v) => ({
          type: 'result' as const,
          sku: v.sku,
          nombre: v.nombre,
          productName: group.nombre,
          id: v.id,
        }))
      )
    : recientes.map((r) => ({
        type: 'recent' as const,
        sku: r.sku,
        nombre: r.nombre,
        productName: r.productName,
        id: r.id,
      }));

  const handleSelect = (item: {
    sku: string;
    nombre: string;
    productName: string;
    id: number;
  }) => {
    addRecent({
      id: item.id,
      sku: item.sku,
      nombre: item.nombre,
      productName: item.productName,
    });
    setOpen(false);
    navigate({
      to: '/kardex/$skuid',
      params: { skuid: item.sku },
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setOpen(true);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (flatItems.length === 0) return;
      setSelectedIndex((prev) => (prev < flatItems.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (flatItems.length === 0) return;
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : flatItems.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < flatItems.length) {
        handleSelect(flatItems[selectedIndex]);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setOpen(false);
      setSelectedIndex(-1);
    }
  };

  const lowerSearch = debouncedSearch.trim().toLowerCase();

  return (
    <div ref={containerRef} className="relative w-full">
      <Search
        className={cn(
          'absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none',
          size === 'lg' ? 'size-5' : 'size-4'
        )}
      />
      <Input
        ref={inputRef}
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          setOpen(true);
          setSelectedIndex(-1);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={handleKeyDown}
        autoFocus={autoFocus}
        placeholder="Buscar producto o SKU… (KTC-350-VD, Mayonesa…)"
        className={cn(
          'pl-11 pr-24',
          size === 'lg' && 'h-14 text-base pl-12 pr-28 shadow-sm'
        )}
      />

      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
        {(isLoading || isFetching) && (
          <Loader2 className="size-4 animate-spin text-muted-foreground" />
        )}
        {searchTerm && (
          <button
            type="button"
            onClick={() => {
              setSearchTerm('');
              setSelectedIndex(-1);
              inputRef.current?.focus();
            }}
            className="p-1 text-muted-foreground hover:text-foreground rounded"
            tabIndex={-1}
          >
            <X className="size-3.5" />
          </button>
        )}
        <kbd
          className={cn(
            'rounded border border-border bg-muted px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground select-none',
            size === 'md' && 'hidden sm:block'
          )}
        >
          Ctrl + K
        </kbd>
      </div>

      {open && (
        <div className="absolute z-50 mt-2 w-full overflow-hidden rounded-lg border border-border bg-popover text-popover-foreground shadow-lg">
          {/* Recent searches when query is short */}
          {!isQueryActive && (
            <div className="p-2">
              <div className="flex items-center justify-between px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="size-3.5" /> Búsquedas recientes
                </span>
                {recientes.length > 0 && (
                  <button
                    type="button"
                    onClick={clearRecientes}
                    className="text-[10px] lowercase text-muted-foreground hover:text-foreground underline underline-offset-2"
                  >
                    limpiar
                  </button>
                )}
              </div>
              {recientes.length === 0 ? (
                <div className="px-3 py-4 text-center text-xs text-muted-foreground">
                  Escribe al menos 3 letras para buscar productos o SKUs.
                </div>
              ) : (
                <div className="max-h-72 overflow-y-auto space-y-0.5">
                  {recientes.map((r, idx) => {
                    const isSelected = selectedIndex === idx;
                    return (
                      <div
                        key={r.sku}
                        className={cn(
                          'flex items-center justify-between rounded-md px-3 py-2 text-left text-sm transition-colors cursor-pointer group',
                          isSelected ? 'bg-accent text-accent-foreground' : 'hover:bg-muted'
                        )}
                        onClick={() => handleSelect(r)}
                      >
                        <div className="min-w-0">
                          <span className="block truncate font-medium">{r.nombre}</span>
                          <span className="block font-mono text-xs text-muted-foreground">
                            {r.sku} · <span className="opacity-80">{r.productName}</span>
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeRecent(r.sku);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-destructive transition-opacity"
                        >
                          <X className="size-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Active Query: Error State */}
          {isQueryActive && isError && (
            <div className="flex flex-col items-center gap-2 px-4 py-6 text-center text-sm text-destructive">
              <div className="flex items-center gap-1.5 font-medium">
                <AlertCircle className="size-4 shrink-0" />
                <span>{error instanceof Error ? error.message : 'Error al buscar productos.'}</span>
              </div>
              <button
                type="button"
                onClick={() => refetch()}
                className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground underline underline-offset-2 mt-1"
              >
                <RefreshCw className="size-3" /> Reintentar
              </button>
            </div>
          )}

          {/* Active Query: Empty results */}
          {isQueryActive && !isLoading && !isError && searchResults.length === 0 && (
            <div className="px-4 py-6 text-center text-sm text-muted-foreground">
              Sin resultados para &ldquo;{debouncedSearch}&rdquo;.
            </div>
          )}

          {/* Active Query: Results */}
          {isQueryActive && !isError && searchResults.length > 0 && (
            <div className="max-h-85 overflow-y-auto py-1">
              {searchResults.map((group) => (
                <div key={group.nombre} className="mb-1">
                  <div className="flex items-center gap-2 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground bg-muted/30">
                    <Package className="size-3.5" /> {group.nombre}
                  </div>
                  {group.variantes.map((v: VarianteKardex) => {
                    const globalIdx = flatItems.findIndex(
                      (item) => item.type === 'result' && item.sku === v.sku
                    );
                    const isSelected = selectedIndex === globalIdx;
                    const isExactSku = v.sku.toLowerCase() === lowerSearch;

                    return (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() =>
                          handleSelect({
                            id: v.id,
                            sku: v.sku,
                            nombre: v.nombre,
                            productName: group.nombre,
                          })
                        }
                        className={cn(
                          'flex w-full items-center justify-between gap-3 px-3 py-2 text-left transition-colors',
                          isSelected ? 'bg-accent text-accent-foreground' : 'hover:bg-muted'
                        )}
                      >
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-medium">{v.nombre}</span>
                          <span className="block font-mono text-xs text-muted-foreground">{v.sku}</span>
                        </span>
                        {isExactSku && (
                          <span className="shrink-0 rounded bg-primary px-1.5 py-0.5 text-[10px] font-bold uppercase text-primary-foreground">
                            SKU exacto
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}