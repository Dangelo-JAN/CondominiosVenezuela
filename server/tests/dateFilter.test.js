import { buildDateRangeFilter } from "../utils/dateFilter.util.js"

describe("buildDateRangeFilter (Fase 2 — filtros server-side por fecha)", () => {
    test("sin parámetros devuelve undefined (sin filtro)", () => {
        expect(buildDateRangeFilter()).toBeUndefined()
        expect(buildDateRangeFilter(undefined, undefined)).toBeUndefined()
    })

    test("startDate: devuelve $gte al inicio del día UTC (00:00:00.000)", () => {
        const r = buildDateRangeFilter("2026-08-17")
        expect(r.$gte.toISOString()).toBe("2026-08-17T00:00:00.000Z")
        expect(r.$lte).toBeUndefined()
    })

    test("endDate: devuelve $lte al fin del día UTC (23:59:59.999)", () => {
        const r = buildDateRangeFilter(undefined, "2026-08-23")
        expect(r.$gte).toBeUndefined()
        expect(r.$lte.toISOString()).toBe("2026-08-23T23:59:59.999Z")
    })

    test("startDate + endDate: rango inclusivo del día completo", () => {
        const r = buildDateRangeFilter("2026-08-17", "2026-08-23")
        expect(r.$gte.toISOString()).toBe("2026-08-17T00:00:00.000Z")
        expect(r.$lte.toISOString()).toBe("2026-08-23T23:59:59.999Z")
    })

    test("fechas inválidas se ignoran (no rompen el rango)", () => {
        // una sola fecha válida prevalece; inválida no añade clave
        const r = buildDateRangeFilter("no-valid", "2026-08-23")
        expect(r.$gte).toBeUndefined()
        expect(r.$lte.toISOString()).toBe("2026-08-23T23:59:59.999Z")
    })

    test("acepta instancias Date como entrada", () => {
        const r = buildDateRangeFilter(new Date("2026-08-17T10:20:00Z"))
        expect(r.$gte.toISOString()).toBe("2026-08-17T00:00:00.000Z")
    })
})
