-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_tasaCambio" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "divisaOrigenId" INTEGER NOT NULL,
    "divisaDestinoId" INTEGER NOT NULL,
    "tasa" DECIMAL NOT NULL,
    "tasaMoficada" DECIMAL,
    "registroTasasId" INTEGER NOT NULL,
    "fuente" TEXT NOT NULL DEFAULT 'PARALELO',
    "fechaVigencia" DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "tasaCambio_divisaOrigenId_fkey" FOREIGN KEY ("divisaOrigenId") REFERENCES "divisa" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "tasaCambio_divisaDestinoId_fkey" FOREIGN KEY ("divisaDestinoId") REFERENCES "divisa" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "tasaCambio_registroTasasId_fkey" FOREIGN KEY ("registroTasasId") REFERENCES "registroTasas" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_tasaCambio" ("divisaDestinoId", "divisaOrigenId", "fechaVigencia", "id", "registroTasasId", "tasa", "tasaMoficada") SELECT "divisaDestinoId", "divisaOrigenId", "fechaVigencia", "id", "registroTasasId", "tasa", "tasaMoficada" FROM "tasaCambio";
DROP TABLE "tasaCambio";
ALTER TABLE "new_tasaCambio" RENAME TO "tasaCambio";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
