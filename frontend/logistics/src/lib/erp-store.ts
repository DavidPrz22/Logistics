import { useSyncExternalStore } from "react";
import type {
  DetalleOrden, DetalleRechazo, Lote,
  MotivoRechazo, Movimiento, OrdenDespacho, Producto, Variante,
} from "@/types/types";

// -------- Seed data --------
const motivosRechazo: MotivoRechazo[] = [
  { id: 1, codigo: "ROTO", descripcion: "Producto roto / dañado", requiere_merma: true },
  { id: 2, codigo: "VENC", descripcion: "Vencido o próximo a vencer", requiere_merma: true },
  { id: 3, codigo: "RECH", descripcion: "Rechazado por cliente", requiere_merma: false },
  { id: 4, codigo: "NOPE", descripcion: "Cliente ausente / cerrado", requiere_merma: false },
  { id: 5, codigo: "ERRD", descripcion: "Error de despacho", requiere_merma: false },
];

const productos: Producto[] = [
  { id: 1, nombre: "Salsa de Tomate Ketchup" },
  { id: 2, nombre: "Mayonesa Casera" },
  { id: 3, nombre: "Aceite Vegetal" },
  { id: 4, nombre: "Vinagre Blanco" },
];

const variantes: Variante[] = [
  { id: 1, producto_id: 1, sku: "KTC-350-VD", nombre: "Ketchup 350g Botella", precio_base: 85.5 },
  { id: 2, producto_id: 1, sku: "KTC-1000-GL", nombre: "Ketchup 1kg Galón", precio_base: 220.0 },
  { id: 3, producto_id: 2, sku: "MYN-200-FR", nombre: "Mayonesa 200ml Frasco", precio_base: 110.0 },
  { id: 4, producto_id: 2, sku: "MYN-500-FR", nombre: "Mayonesa 500ml Frasco", precio_base: 240.0 },
  { id: 5, producto_id: 3, sku: "ACV-1L-BT", nombre: "Aceite Vegetal 1L", precio_base: 175.0 },
  { id: 6, producto_id: 4, sku: "VNB-750-BT", nombre: "Vinagre Blanco 750ml", precio_base: 65.0 },
];

const lotes: Lote[] = [
  { id: 1, variante_id: 1, numero_lote: "L-2026-0114-A", fecha_vencimiento: "2027-06-30", stock_actual: 480, almacen_id: 1 },
  { id: 2, variante_id: 1, numero_lote: "L-2026-0210-B", fecha_vencimiento: "2027-08-15", stock_actual: 620, almacen_id: 1 },
  { id: 3, variante_id: 2, numero_lote: "L-2026-0118-A", fecha_vencimiento: "2027-05-20", stock_actual: 210, almacen_id: 1 },
  { id: 4, variante_id: 3, numero_lote: "L-2026-0301-A", fecha_vencimiento: "2026-12-01", stock_actual: 340, almacen_id: 1 },
  { id: 5, variante_id: 4, numero_lote: "L-2026-0225-A", fecha_vencimiento: "2027-02-10", stock_actual: 180, almacen_id: 1 },
  { id: 6, variante_id: 5, numero_lote: "L-2026-0405-C", fecha_vencimiento: "2027-04-01", stock_actual: 520, almacen_id: 1 },
  { id: 7, variante_id: 6, numero_lote: "L-2026-0110-A", fecha_vencimiento: "2028-01-10", stock_actual: 900, almacen_id: 1 },
  { id: 8, variante_id: 1, numero_lote: "L-2026-0114-A", fecha_vencimiento: "2027-06-30", stock_actual: 60, almacen_id: 2 },
  { id: 9, variante_id: 3, numero_lote: "L-2026-0301-A", fecha_vencimiento: "2026-12-01", stock_actual: 12, almacen_id: 5 },
];

const ordenes: OrdenDespacho[] = [
  { id: 1, numero_orden: "ORD-2026-0001", cliente_id: 1, chofer_id: 1, almacen_transito_id: 2, fecha_salida: "2026-07-10T08:12:00Z", estado: "LIQUIDADA", total_facturado_original: 4275.0, saldo_neto_cobrar: 3945.0, total_rechazado: 330.0 },
  { id: 2, numero_orden: "ORD-2026-0002", cliente_id: 3, chofer_id: 2, almacen_transito_id: 3, fecha_salida: "2026-07-12T07:45:00Z", estado: "EN_RUTA", total_facturado_original: 6820.0, saldo_neto_cobrar: 6820.0, total_rechazado: 0 },
  { id: 3, numero_orden: "ORD-2026-0003", cliente_id: 2, chofer_id: 1, almacen_transito_id: 2, fecha_salida: "2026-07-13T09:00:00Z", estado: "PREPARACION", total_facturado_original: 0, saldo_neto_cobrar: 0, total_rechazado: 0 },
  { id: 4, numero_orden: "ORD-2026-0004", cliente_id: 5, chofer_id: 3, almacen_transito_id: 4, fecha_salida: "2026-07-13T10:30:00Z", estado: "EN_RUTA", total_facturado_original: 12450.0, saldo_neto_cobrar: 12450.0, total_rechazado: 0 },
  { id: 5, numero_orden: "ORD-2026-0005", cliente_id: 4, chofer_id: 4, almacen_transito_id: 3, fecha_salida: "2026-07-14T06:15:00Z", estado: "PREPARACION", total_facturado_original: 0, saldo_neto_cobrar: 0, total_rechazado: 0 },
  { id: 6, numero_orden: "ORD-2026-0006", cliente_id: 1, chofer_id: 2, almacen_transito_id: 3, fecha_salida: "2026-07-09T07:00:00Z", estado: "LIQUIDADA", total_facturado_original: 8900.0, saldo_neto_cobrar: 8570.0, total_rechazado: 330.0 },
];

const detalles: DetalleOrden[] = [
  { id: 1, orden_id: 1, lote_id: 1, cantidad_enviada: 30, precio_unitario: 85.5 },
  { id: 2, orden_id: 1, lote_id: 4, cantidad_enviada: 15, precio_unitario: 110.0 },
  { id: 3, orden_id: 2, lote_id: 2, cantidad_enviada: 40, precio_unitario: 85.5 },
  { id: 4, orden_id: 2, lote_id: 3, cantidad_enviada: 12, precio_unitario: 220.0 },
  { id: 5, orden_id: 2, lote_id: 6, cantidad_enviada: 15, precio_unitario: 175.0 },
  { id: 6, orden_id: 4, lote_id: 5, cantidad_enviada: 20, precio_unitario: 240.0 },
  { id: 7, orden_id: 4, lote_id: 7, cantidad_enviada: 50, precio_unitario: 65.0 },
  { id: 8, orden_id: 4, lote_id: 6, cantidad_enviada: 25, precio_unitario: 175.0 },
  { id: 9, orden_id: 6, lote_id: 2, cantidad_enviada: 60, precio_unitario: 85.5 },
  { id: 10, orden_id: 6, lote_id: 4, cantidad_enviada: 20, precio_unitario: 110.0 },
];

const rechazos: DetalleRechazo[] = [
  { id: 1, detalle_orden_id: 1, cantidad_rechazada: 3, motivo_rechazo_id: 1, almacen_reingreso_id: 5, observaciones: "Envases aplastados en descarga" },
  { id: 2, detalle_orden_id: 9, cantidad_rechazada: 3, motivo_rechazo_id: 3, almacen_reingreso_id: 1 },
  { id: 3, detalle_orden_id: 10, cantidad_rechazada: 1, motivo_rechazo_id: 4, almacen_reingreso_id: 1 },
];

const movimientos: Movimiento[] = [
  { id: 1, lote_id: 1, almacen_id: 1, tipo_movimiento: "SALIDA", cantidad: 30, fecha_movimiento: "2026-07-10T08:10:00Z", referencia: "Despacho ORD-2026-0001", usuario: "admin", detalle_orden_id: 1 },
  { id: 2, lote_id: 4, almacen_id: 1, tipo_movimiento: "SALIDA", cantidad: 15, fecha_movimiento: "2026-07-10T08:10:00Z", referencia: "Despacho ORD-2026-0001", usuario: "admin", detalle_orden_id: 2 },
  { id: 3, lote_id: 1, almacen_id: 5, tipo_movimiento: "ENTRADA", cantidad: 3, fecha_movimiento: "2026-07-10T18:00:00Z", referencia: "Liquidación Retorno ORD-2026-0001", usuario: "admin", detalle_orden_id: 1 },
  { id: 4, lote_id: 2, almacen_id: 1, tipo_movimiento: "SALIDA", cantidad: 40, fecha_movimiento: "2026-07-12T07:40:00Z", referencia: "Despacho ORD-2026-0002", usuario: "admin", detalle_orden_id: 3 },
  { id: 5, lote_id: 3, almacen_id: 1, tipo_movimiento: "SALIDA", cantidad: 12, fecha_movimiento: "2026-07-12T07:40:00Z", referencia: "Despacho ORD-2026-0002", usuario: "admin", detalle_orden_id: 4 },
  { id: 6, lote_id: 6, almacen_id: 1, tipo_movimiento: "SALIDA", cantidad: 15, fecha_movimiento: "2026-07-12T07:40:00Z", referencia: "Despacho ORD-2026-0002", usuario: "admin", detalle_orden_id: 5 },
  { id: 7, lote_id: 5, almacen_id: 1, tipo_movimiento: "SALIDA", cantidad: 20, fecha_movimiento: "2026-07-13T10:25:00Z", referencia: "Despacho ORD-2026-0004", usuario: "admin", detalle_orden_id: 6 },
  { id: 8, lote_id: 7, almacen_id: 1, tipo_movimiento: "SALIDA", cantidad: 50, fecha_movimiento: "2026-07-13T10:25:00Z", referencia: "Despacho ORD-2026-0004", usuario: "admin", detalle_orden_id: 7 },
];

// -------- Store --------
interface ERPState {
  motivosRechazo: MotivoRechazo[];
  productos: Producto[];
  variantes: Variante[];
  lotes: Lote[];
  ordenes: OrdenDespacho[];
  detalles: DetalleOrden[];
  rechazos: DetalleRechazo[];
  movimientos: Movimiento[];
}

let state: ERPState = {
  motivosRechazo, productos, variantes,
  lotes, ordenes, detalles, rechazos, movimientos,
};

const listeners = new Set<() => void>();
const subscribe = (cb: () => void) => { listeners.add(cb); return () => { listeners.delete(cb); }; };
const emit = () => listeners.forEach((l) => l());
const getSnapshot = () => state;

export function useERP<T>(selector: (s: ERPState) => T): T {
  return useSyncExternalStore(subscribe, () => selector(getSnapshot()), () => selector(getSnapshot()));
}

function mutate(fn: (s: ERPState) => ERPState) {
  state = fn({ ...state });
  emit();
}

let nextId = 1000;
const nid = () => ++nextId;

// -------- Actions --------
export const erpActions = {

  despachar(orden_id: number) {
    const s = state;
    const orden = s.ordenes.find((o) => o.id === orden_id);
    if (!orden) return;
    const dets = s.detalles.filter((d) => d.orden_id === orden_id);
    if (dets.length === 0) return;
    const nuevos: Movimiento[] = dets.map((d) => ({
      id: nid(), lote_id: d.lote_id, almacen_id: 1, almacen_destino_id: orden.almacen_transito_id,
      tipo_movimiento: "SALIDA", cantidad: d.cantidad_enviada,
      fecha_movimiento: new Date().toISOString(),
      referencia: `Despacho ${orden.numero_orden}`, usuario: "admin", detalle_orden_id: d.id,
    }));
    mutate((st) => ({
      ...st,
      ordenes: st.ordenes.map((o) => o.id === orden_id ? { ...o, estado: "EN_RUTA" } : o),
      movimientos: [...st.movimientos, ...nuevos],
    }));
  },

  liquidar(orden_id: number, liquidaciones: { detalle_orden_id: number; rechazos: { cantidad: number; motivo_rechazo_id: number; almacen_reingreso_id: number; observaciones?: string }[] }[]) {
    const s = state;
    const orden = s.ordenes.find((o) => o.id === orden_id);
    if (!orden) return;
    const nuevosRech: DetalleRechazo[] = [];
    const nuevosMov: Movimiento[] = [];
    let totalRech = 0;
    for (const liq of liquidaciones) {
      const det = s.detalles.find((d) => d.id === liq.detalle_orden_id);
      if (!det) continue;
      for (const r of liq.rechazos) {
        if (r.cantidad <= 0) continue;
        const rid = nid();
        nuevosRech.push({ id: rid, detalle_orden_id: det.id, cantidad_rechazada: r.cantidad, motivo_rechazo_id: r.motivo_rechazo_id, almacen_reingreso_id: r.almacen_reingreso_id, observaciones: r.observaciones });
        nuevosMov.push({ id: nid(), lote_id: det.lote_id, almacen_id: r.almacen_reingreso_id, tipo_movimiento: "ENTRADA", cantidad: r.cantidad, fecha_movimiento: new Date().toISOString(), referencia: `Liquidación Retorno ${orden.numero_orden}`, usuario: "admin", detalle_orden_id: det.id });
        totalRech += r.cantidad * det.precio_unitario;
      }
    }
    mutate((st) => ({
      ...st,
      rechazos: [...st.rechazos, ...nuevosRech],
      movimientos: [...st.movimientos, ...nuevosMov],
      ordenes: st.ordenes.map((o) => o.id === orden_id ? { ...o, estado: "LIQUIDADA", total_rechazado: totalRech, saldo_neto_cobrar: o.total_facturado_original - totalRech } : o),
    }));
  },
};

// -------- Selectors / helpers --------
export const findLote = (s: ERPState, id: number) => s.lotes.find((l) => l.id === id);
export const findVariante = (s: ERPState, id: number) => s.variantes.find((v) => v.id === id);
export const findProducto = (s: ERPState, id: number) => s.productos.find((p) => p.id === id);
export const findMotivo = (s: ERPState, id: number) => s.motivosRechazo.find((m) => m.id === id);

export function loteFullName(s: ERPState, lote_id: number) {
  const l = findLote(s, lote_id); if (!l) return "—";
  const v = findVariante(s, l.variante_id);
  return `${v?.sku ?? "?"} · ${l.numero_lote}`;
}