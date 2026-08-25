/*
  Warnings:

  - You are about to drop the column `hashContrasena` on the `usuario` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_usuario" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombreUsuario" TEXT NOT NULL,
    "hashPassword" TEXT NOT NULL DEFAULT 'HASH',
    "correo" TEXT NOT NULL DEFAULT 'Correo',
    "refreshToken" TEXT,
    "fechaCreacion" DATETIME DEFAULT CURRENT_TIMESTAMP,
    "Rol" TEXT
);
INSERT INTO "new_usuario" ("Rol", "correo", "fechaCreacion", "id", "nombreUsuario", "refreshToken") SELECT "Rol", coalesce("correo", 'Correo') AS "correo", "fechaCreacion", "id", "nombreUsuario", "refreshToken" FROM "usuario";
DROP TABLE "usuario";
ALTER TABLE "new_usuario" RENAME TO "usuario";
CREATE UNIQUE INDEX "usuario_nombreUsuario_key" ON "usuario"("nombreUsuario");
CREATE UNIQUE INDEX "usuario_correo_key" ON "usuario"("correo");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
