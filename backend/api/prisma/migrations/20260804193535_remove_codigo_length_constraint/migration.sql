-- 1. Create a new temporary table WITHOUT any length CHECK constraint
CREATE TABLE "new_divisa" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "codigo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "esMonedaBase" BOOLEAN DEFAULT false
);

-- 2. Safely transfer all existing rows to the new table
INSERT INTO "new_divisa" ("id", "codigo", "nombre", "esMonedaBase")
SELECT "id", "codigo", "nombre", "esMonedaBase" FROM "divisa";

-- 3. Drop the restricted table and rename the new one
DROP TABLE "divisa";
ALTER TABLE "new_divisa" RENAME TO "divisa";

-- 4. Re-apply the UNIQUE constraint on codigo
CREATE UNIQUE INDEX "divisa_codigo_key" ON "divisa"("codigo");