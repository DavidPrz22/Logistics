/*
  Warnings:

  - You are about to drop the column `origenTasa` on the `tasaCambio` table. All the data in the column will be lost.
  - Added the required column `fuenteTasaId` to the `tasaCambio` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "fuenteTasa" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_tasaCambio" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "divisaOrigenId" INTEGER NOT NULL,
    "divisaDestinoId" INTEGER NOT NULL,
    "tasa" DECIMAL NOT NULL,
    "fuenteTasaId" INTEGER NOT NULL,
    "fechaVigencia" DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "tasaCambio_divisaOrigenId_fkey" FOREIGN KEY ("divisaOrigenId") REFERENCES "divisa" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "tasaCambio_divisaDestinoId_fkey" FOREIGN KEY ("divisaDestinoId") REFERENCES "divisa" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "tasaCambio_fuenteTasaId_fkey" FOREIGN KEY ("fuenteTasaId") REFERENCES "fuenteTasa" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_tasaCambio" ("divisaDestinoId", "divisaOrigenId", "fechaVigencia", "id", "tasa") SELECT "divisaDestinoId", "divisaOrigenId", "fechaVigencia", "id", "tasa" FROM "tasaCambio";
DROP TABLE "tasaCambio";
ALTER TABLE "new_tasaCambio" RENAME TO "tasaCambio";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "fuenteTasa_nombre_key" ON "fuenteTasa"("nombre");
