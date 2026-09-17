-- Ejecutar UNA sola vez sobre la base de datos "edifiq" que ya tienes,
-- para no tener que borrar y recrear todo desde bd.sql.
--
-- 1) Agrega el nuevo estado que falta.
--    (Si ya arrancaste la app con ddl-auto=update, las columnas
--     ruta_comprobante y fecha_pago de la tabla recibo ya se crearon solas;
--     si no, descomenta el ALTER TABLE de abajo.)

INSERT INTO estado_recibo (nombre)
SELECT 'Pendiente por revisar'
WHERE NOT EXISTS (
    SELECT 1 FROM estado_recibo WHERE nombre = 'Pendiente por revisar'
);

-- Solo necesario si NO has vuelto a levantar el backend desde este cambio:
-- ALTER TABLE recibo
--   ADD COLUMN ruta_comprobante VARCHAR(255) NULL,
--   ADD COLUMN fecha_pago DATETIME NULL;
