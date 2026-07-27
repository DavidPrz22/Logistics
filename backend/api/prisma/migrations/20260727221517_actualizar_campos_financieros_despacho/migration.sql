/*
  Warnings:

  - You are about to drop the column `totalFacturadoOriginal` on the `ordenDespacho` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ordenDespacho" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "numeroOrden" TEXT NOT NULL,
    "clienteId" INTEGER NOT NULL,
    "choferId" INTEGER,
    "almacenTransitoId" INTEGER NOT NULL,
    "fechaSalida" DATETIME DEFAULT CURRENT_TIMESTAMP,
    "estado" TEXT DEFAULT 'PREPARACION',
    "totalOriginal" DECIMAL DEFAULT 0.00,
    "totalRechazado" DECIMAL DEFAULT 0.00,
    "montoFacturadoNeto" DECIMAL DEFAULT 0.00,
    "totalAbonado" DECIMAL DEFAULT 0.00,
    "saldoNetoCobrar" DECIMAL DEFAULT 0.00,
    CONSTRAINT "ordenDespacho_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "cliente" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ordenDespacho_choferId_fkey" FOREIGN KEY ("choferId") REFERENCES "chofer" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "ordenDespacho_almacenTransitoId_fkey" FOREIGN KEY ("almacenTransitoId") REFERENCES "almacen" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_ordenDespacho" ("almacenTransitoId", "choferId", "clienteId", "estado", "fechaSalida", "id", "numeroOrden", "saldoNetoCobrar", "totalRechazado", "totalOriginal") SELECT "almacenTransitoId", "choferId", "clienteId", "estado", "fechaSalida", "id", "numeroOrden", "saldoNetoCobrar", "totalRechazado", "totalFacturadoOriginal" FROM "ordenDespacho";
DROP TABLE "ordenDespacho";
ALTER TABLE "new_ordenDespacho" RENAME TO "ordenDespacho";
CREATE UNIQUE INDEX "ordenDespacho_numeroOrden_key" ON "ordenDespacho"("numeroOrden");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
