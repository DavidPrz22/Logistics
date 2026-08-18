-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_transaccionPago" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "documentoId" INTEGER,
    "ordenId" INTEGER,
    "tipoDePago" TEXT NOT NULL,
    "metodoPagoId" INTEGER NOT NULL,
    "divisaPagoId" INTEGER NOT NULL,
    "montoOrigen" DECIMAL NOT NULL,
    "tasaAplicadaId" INTEGER,
    "tasaAplicadaValor" DECIMAL,
    "montoEquivalenteBase" DECIMAL NOT NULL,
    "montoCalculadoVes" DECIMAL,
    "numeroReferencia" TEXT,
    "estado" TEXT DEFAULT 'APROBADO',
    "tipoOperacion" TEXT DEFAULT 'INGRESO',
    "fechaPago" DATETIME DEFAULT CURRENT_TIMESTAMP,
    "cuentaDestinoId" INTEGER,
    "usuarioId" INTEGER NOT NULL,
    "motivoAnulacion" TEXT,
    CONSTRAINT "transaccionPago_documentoId_fkey" FOREIGN KEY ("documentoId") REFERENCES "documentoDeuda" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "transaccionPago_ordenId_fkey" FOREIGN KEY ("ordenId") REFERENCES "ordenDespacho" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "transaccionPago_metodoPagoId_fkey" FOREIGN KEY ("metodoPagoId") REFERENCES "metodoPago" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "transaccionPago_divisaPagoId_fkey" FOREIGN KEY ("divisaPagoId") REFERENCES "divisa" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "transaccionPago_tasaAplicadaId_fkey" FOREIGN KEY ("tasaAplicadaId") REFERENCES "tasaCambio" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "transaccionPago_cuentaDestinoId_fkey" FOREIGN KEY ("cuentaDestinoId") REFERENCES "cuentaDestino" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "transaccionPago_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuario" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_transaccionPago" ("cuentaDestinoId", "divisaPagoId", "documentoId", "estado", "fechaPago", "id", "metodoPagoId", "montoCalculadoVes", "montoEquivalenteBase", "montoOrigen", "motivoAnulacion", "numeroReferencia", "ordenId", "tasaAplicadaId", "tasaAplicadaValor", "tipoDePago", "tipoOperacion", "usuarioId") SELECT "cuentaDestinoId", "divisaPagoId", "documentoId", "estado", "fechaPago", "id", "metodoPagoId", "montoCalculadoVes", "montoEquivalenteBase", "montoOrigen", "motivoAnulacion", "numeroReferencia", "ordenId", "tasaAplicadaId", "tasaAplicadaValor", "tipoDePago", "tipoOperacion", "usuarioId" FROM "transaccionPago";
DROP TABLE "transaccionPago";
ALTER TABLE "new_transaccionPago" RENAME TO "transaccionPago";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
