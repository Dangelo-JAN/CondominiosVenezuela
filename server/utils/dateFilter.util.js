/**
 * dateFilter.util.js — Filtrado por fechas (convención UTC del proyecto)
 *
 * Centraliza la normalización de los query params `startDate` / `endDate`
 * a rangos UTC (inclusive) para las consultas server-side de listados
 * filtrados por fecha (fotos, bitácoras de empleado, etc.).
 *
 * Convención (regla #035): la app usa UTC para ventanas de fecha.
 *   - startDate "YYYY-MM-DD"  → inicio del día (00:00:00.000 UTC)
 *   - endDate   "YYYY-MM-DD"  → fin del día (23:59:59.999 UTC)
 *
 * @param {string} [startDate]   'YYYY-MM-DD' o Date válido
 * @param {string} [endDate]     'YYYY-MM-DD' o Date válido
 * @returns {{ $gte?: Date, $lte?: Date } | undefined}
 */
export function buildDateRangeFilter(startDate, endDate) {
    const range = {}

    if (startDate) {
        const d = new Date(startDate)
        if (!isNaN(d.getTime())) {
            // inicio del día en UTC: 00:00:00.000
            range.$gte = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()))
        }
    }

    if (endDate) {
        const d = new Date(endDate)
        if (!isNaN(d.getTime())) {
            // fin del día en UTC: 23:59:59.999
            range.$lte = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 23, 59, 59, 999))
        }
    }

    return Object.keys(range).length ? range : undefined
}
