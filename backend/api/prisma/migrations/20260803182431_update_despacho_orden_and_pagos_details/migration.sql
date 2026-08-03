/*
  Warnings:

  - You are about to drop the column `referenciaOrigen` on the `documentoDeuda` table. All the data in the column will be lost.
  - Added the required column `ordenId` to the `documentoDeuda` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tipoOrden` to the `ordenDespacho` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tipoDePago` to the `transaccionPago` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_documentoDeuda" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "sistemaOrigen" TEXT NOT NULL,
    "ordenId" INTEGER NOT NULL,
    "identificadorCliente" TEXT NOT NULL,
    "montoTotalBase" DECIMAL NOT NULL,
    "saldoPendienteBase" DECIMAL NOT NULL,
    "estado" TEXT DEFAULT 'PENDIENTE',
    "tipoDocumento" TEXT DEFAULT 'FACTURA',
    "fechaEmision" DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "documentoDeuda_ordenId_fkey" FOREIGN KEY ("ordenId") REFERENCES "ordenDespacho" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_documentoDeuda" ("estado", "fechaEmision", "id", "identificadorCliente", "montoTotalBase", "saldoPendienteBase", "sistemaOrigen", "tipoDocumento") SELECT "estado", "fechaEmision", "id", "identificadorCliente", "montoTotalBase", "saldoPendienteBase", "sistemaOrigen", "tipoDocumento" FROM "documentoDeuda";
DROP TABLE "documentoDeuda";
ALTER TABLE "new_documentoDeuda" RENAME TO "documentoDeuda";
CREATE UNIQUE INDEX "documentoDeuda_ordenId_key" ON "documentoDeuda"("ordenId");
CREATE UNIQUE INDEX "documentoDeuda_sistemaOrigen_ordenId_key" ON "documentoDeuda"("sistemaOrigen", "ordenId");
CREATE TABLE "new_ordenDespacho" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "numeroOrden" TEXT NOT NULL,
    "clienteId" INTEGER NOT NULL,
    "choferId" INTEGER,
    "almacenTransitoId" INTEGER NOT NULL,
    "fechaSalida" DATETIME DEFAULT CURRENT_TIMESTAMP,
    "estado" TEXT DEFAULT 'PREPARACION',
    "tipoOrden" TEXT NOT NULL,
    "totalOriginal" DECIMAL DEFAULT 0.00,
    "totalRechazado" DECIMAL DEFAULT 0.00,
    "montoFacturadoNeto" DECIMAL DEFAULT 0.00,
    "totalAbonado" DECIMAL DEFAULT 0.00,
    "saldoNetoCobrar" DECIMAL DEFAULT 0.00,
    CONSTRAINT "ordenDespacho_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "cliente" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ordenDespacho_choferId_fkey" FOREIGN KEY ("choferId") REFERENCES "chofer" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "ordenDespacho_almacenTransitoId_fkey" FOREIGN KEY ("almacenTransitoId") REFERENCES "almacen" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_ordenDespacho" ("almacenTransitoId", "choferId", "clienteId", "estado", "fechaSalida", "id", "montoFacturadoNeto", "numeroOrden", "saldoNetoCobrar", "totalAbonado", "totalOriginal", "totalRechazado") SELECT "almacenTransitoId", "choferId", "clienteId", "estado", "fechaSalida", "id", "montoFacturadoNeto", "numeroOrden", "saldoNetoCobrar", "totalAbonado", "totalOriginal", "totalRechazado" FROM "ordenDespacho";
DROP TABLE "ordenDespacho";
ALTER TABLE "new_ordenDespacho" RENAME TO "ordenDespacho";
CREATE UNIQUE INDEX "ordenDespacho_numeroOrden_key" ON "ordenDespacho"("numeroOrden");
CREATE TABLE "new_transaccionPago" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "documentoId" INTEGER,
    "ordenId" INTEGER,
    "tipoDePago" TEXT NOT NULL,
    "metodoPagoId" INTEGER NOT NULL,
    "divisaPagoId" INTEGER NOT NULL,
    "montoOrigen" DECIMAL NOT NULL,
    "tasaAplicada" DECIMAL NOT NULL,
    "montoEquivalenteBase" DECIMAL NOT NULL,
    "numeroReferencia" TEXT,
    "estado" TEXT DEFAULT 'APROBADO',
    "tipoOperacion" TEXT DEFAULT 'INGRESO',
    "fechaPago" DATETIME DEFAULT CURRENT_TIMESTAMP,
    "cuentaDestinoId" INTEGER,
    "usuarioId" INTEGER NOT NULL,
    CONSTRAINT "transaccionPago_documentoId_fkey" FOREIGN KEY ("documentoId") REFERENCES "documentoDeuda" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "transaccionPago_metodoPagoId_fkey" FOREIGN KEY ("metodoPagoId") REFERENCES "metodoPago" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "transaccionPago_divisaPagoId_fkey" FOREIGN KEY ("divisaPagoId") REFERENCES "divisa" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "transaccionPago_cuentaDestinoId_fkey" FOREIGN KEY ("cuentaDestinoId") REFERENCES "cuentaDestino" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "transaccionPago_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuario" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_transaccionPago" ("cuentaDestinoId", "divisaPagoId", "documentoId", "estado", "fechaPago", "id", "metodoPagoId", "montoEquivalenteBase", "montoOrigen", "numeroReferencia", "tasaAplicada", "tipoOperacion", "usuarioId") SELECT "cuentaDestinoId", "divisaPagoId", "documentoId", "estado", "fechaPago", "id", "metodoPagoId", "montoEquivalenteBase", "montoOrigen", "numeroReferencia", "tasaAplicada", "tipoOperacion", "usuarioId" FROM "transaccionPago";
DROP TABLE "transaccionPago";
ALTER TABLE "new_transaccionPago" RENAME TO "transaccionPago";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
