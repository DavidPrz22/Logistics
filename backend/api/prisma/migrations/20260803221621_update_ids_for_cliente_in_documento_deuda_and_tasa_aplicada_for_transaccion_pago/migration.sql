/*
  Warnings:

  - You are about to drop the column `identificadorCliente` on the `documentoDeuda` table. All the data in the column will be lost.
  - You are about to drop the column `tasaAplicada` on the `transaccionPago` table. All the data in the column will be lost.
  - Added the required column `clienteId` to the `documentoDeuda` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tasaAplicadaId` to the `transaccionPago` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_documentoDeuda" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "sistemaOrigen" TEXT NOT NULL,
    "ordenId" INTEGER NOT NULL,
    "clienteId" INTEGER NOT NULL,
    "montoTotalBase" DECIMAL NOT NULL,
    "saldoPendienteBase" DECIMAL NOT NULL,
    "estado" TEXT DEFAULT 'PENDIENTE',
    "tipoDocumento" TEXT DEFAULT 'FACTURA',
    "fechaEmision" DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "documentoDeuda_ordenId_fkey" FOREIGN KEY ("ordenId") REFERENCES "ordenDespacho" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "documentoDeuda_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "cliente" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_documentoDeuda" ("estado", "fechaEmision", "id", "montoTotalBase", "ordenId", "saldoPendienteBase", "sistemaOrigen", "tipoDocumento") SELECT "estado", "fechaEmision", "id", "montoTotalBase", "ordenId", "saldoPendienteBase", "sistemaOrigen", "tipoDocumento" FROM "documentoDeuda";
DROP TABLE "documentoDeuda";
ALTER TABLE "new_documentoDeuda" RENAME TO "documentoDeuda";
CREATE UNIQUE INDEX "documentoDeuda_ordenId_key" ON "documentoDeuda"("ordenId");
CREATE UNIQUE INDEX "documentoDeuda_sistemaOrigen_ordenId_key" ON "documentoDeuda"("sistemaOrigen", "ordenId");
CREATE TABLE "new_transaccionPago" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "documentoId" INTEGER,
    "ordenId" INTEGER,
    "tipoDePago" TEXT NOT NULL,
    "metodoPagoId" INTEGER NOT NULL,
    "divisaPagoId" INTEGER NOT NULL,
    "montoOrigen" DECIMAL NOT NULL,
    "tasaAplicadaId" INTEGER NOT NULL,
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
    CONSTRAINT "transaccionPago_tasaAplicadaId_fkey" FOREIGN KEY ("tasaAplicadaId") REFERENCES "tasaCambio" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "transaccionPago_cuentaDestinoId_fkey" FOREIGN KEY ("cuentaDestinoId") REFERENCES "cuentaDestino" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "transaccionPago_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuario" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_transaccionPago" ("cuentaDestinoId", "divisaPagoId", "documentoId", "estado", "fechaPago", "id", "metodoPagoId", "montoEquivalenteBase", "montoOrigen", "numeroReferencia", "ordenId", "tipoDePago", "tipoOperacion", "usuarioId") SELECT "cuentaDestinoId", "divisaPagoId", "documentoId", "estado", "fechaPago", "id", "metodoPagoId", "montoEquivalenteBase", "montoOrigen", "numeroReferencia", "ordenId", "tipoDePago", "tipoOperacion", "usuarioId" FROM "transaccionPago";
DROP TABLE "transaccionPago";
ALTER TABLE "new_transaccionPago" RENAME TO "transaccionPago";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
