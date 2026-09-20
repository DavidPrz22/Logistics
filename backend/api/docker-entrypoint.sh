#!/bin/sh
set -eu

MAX_RETRIES="${DB_WAIT_RETRIES:-30}"
RETRY_INTERVAL="${DB_WAIT_INTERVAL:-2}"

wait_for_database() {
  i=1
  while [ "$i" -le "$MAX_RETRIES" ]; do
    if prisma migrate deploy; then
      echo "Database is up and migrations applied."
      return 0
    fi
    echo "Database not ready (attempt $i/$MAX_RETRIES), retrying in ${RETRY_INTERVAL}s..."
    i=$((i + 1))
    sleep "$RETRY_INTERVAL"
  done

  echo "Database did not become ready in time."
  exit 1
}

wait_for_database

if [ "${SKIP_SEED:-false}" != "true" ]; then
  echo "Seeding database..."
  tsx db_data/seed-usuario.ts
  tsx db_data/seed-almacen.ts
  tsx db_data/seed-chofer.ts
  tsx db_data/seed-cliente.ts
  tsx db_data/seed-motivoRechazo.ts
  tsx db_data/seed-metodoPago.ts
  tsx db_data/seed-divisa.ts
  tsx db_data/seed-cuentaDestino.ts
  tsx db_data/seed-producto.ts
  tsx db_data/seed-lote.ts
  echo "Seeding complete."
fi

exec node dist/main.js
