import { describe, it, expect } from '@jest/globals'
import {
    REPORT_MODES,
    startOfUTCDay,
    addUTCDays,
    mondayOfUTCWeek,
    getISOWeek,
    getReportWindow,
    getPreviousClosedWeek
} from '../utils/reportWindow.util.js'

// ── Fechas ancla verificadas del calendario ISO ────────────────────────────
// Semana de referencia: lun 17 ago – dom 23 ago 2026 (semana en curso al
// momento de la tarea #035). 2026-08-21 es viernes (verificado).

const MON_2026_08_17 = new Date('2026-08-17T00:00:00.000Z')
const TUE_2026_08_18 = new Date('2026-08-18T00:00:00.000Z')
const THU_2026_08_20 = new Date('2026-08-20T00:00:00.000Z')
const FRI_2026_08_21 = new Date('2026-08-21T00:00:00.000Z')
const SAT_2026_08_22 = new Date('2026-08-22T00:00:00.000Z')
const SUN_2026_08_23 = new Date('2026-08-23T00:00:00.000Z')
const NEXT_MON_2026_08_24 = new Date('2026-08-24T00:00:00.000Z')

describe('startOfUTCDay', () => {
    it('trunca a medianoche UTC', () => {
        const d = new Date('2026-08-21T15:42:33.123Z')
        expect(startOfUTCDay(d).toISOString()).toBe('2026-08-21T00:00:00.000Z')
    })
})

describe('addUTCDays', () => {
    it('avanza días sin mutar el original', () => {
        const original = new Date('2026-08-21T10:00:00.000Z')
        const result = addUTCDays(original, 3)
        expect(result.toISOString()).toBe('2026-08-24T10:00:00.000Z')
        expect(original.toISOString()).toBe('2026-08-21T10:00:00.000Z')
    })

    it('retrocede días cruzando meses', () => {
        const result = addUTCDays(new Date('2026-08-02T00:00:00.000Z'), -3)
        expect(result.toISOString()).toBe('2026-07-30T00:00:00.000Z')
    })
})

describe('mondayOfUTCWeek', () => {
    it('lunes → mismo día', () => {
        expect(mondayOfUTCWeek(MON_2026_08_17).getTime()).toBe(MON_2026_08_17.getTime())
    })

    it('viernes → lunes de esa semana', () => {
        const fri = new Date('2026-08-21T18:30:00.000Z')
        expect(mondayOfUTCWeek(fri).toISOString()).toBe('2026-08-17T00:00:00.000Z')
    })

    it('domingo → lunes de SU semana (no la siguiente)', () => {
        const sun = new Date('2026-08-23T23:59:59.999Z')
        expect(mondayOfUTCWeek(sun).toISOString()).toBe('2026-08-17T00:00:00.000Z')
    })
})

describe('getISOWeek', () => {
    it('ancla: 2026-01-01 (jueves) → semana 1 de 2026', () => {
        expect(getISOWeek(new Date('2026-01-01T12:00:00.000Z'))).toEqual({ week: 1, isoYear: 2026 })
    })

    it('ancla: 2025-12-29 (lunes) → semana 1 de 2026', () => {
        expect(getISOWeek(new Date('2025-12-29T12:00:00.000Z'))).toEqual({ week: 1, isoYear: 2026 })
    })

    it('ancla: 2024-12-30 (lunes) → semana 1 de 2025', () => {
        expect(getISOWeek(new Date('2024-12-30T12:00:00.000Z'))).toEqual({ week: 1, isoYear: 2025 })
    })

    it('lunes y domingo de una misma semana comparten número', () => {
        expect(getISOWeek(MON_2026_08_17)).toEqual(getISOWeek(SUN_2026_08_23))
    })

    it('la semana incrementa al cruzar de domingo a lunes', () => {
        const sun = getISOWeek(SUN_2026_08_23)
        const mon = getISOWeek(NEXT_MON_2026_08_24)
        expect(mon.week).toBe(sun.week + 1)
    })
})

describe('getReportWindow — matriz semanal aprobada (#035)', () => {
    it('LUNES → WEEK_START: diario null, semanal null (sección vacía explícita)', () => {
        const w = getReportWindow(new Date('2026-08-17T15:00:00.000Z'))
        expect(w.mode).toBe(REPORT_MODES.WEEK_START)
        expect(w.dailyWindow).toBeNull()
        expect(w.dailyLabelDay).toBeNull()
        expect(w.weeklyWindow).toBeNull()
    })

    it('LUNES 00:00:00.001 UTC → sigue siendo WEEK_START', () => {
        const w = getReportWindow(new Date('2026-08-17T00:00:00.001Z'))
        expect(w.mode).toBe(REPORT_MODES.WEEK_START)
    })

    it.each([
        ['MARTES', '2026-08-18T10:00:00.000Z'],
        ['MIÉRCOLES', '2026-08-19T16:45:00.000Z'],
        ['JUEVES', '2026-08-20T22:10:00.000Z']
    ])('%s → DAILY: ventana = día anterior completo', (_label, iso) => {
        const w = getReportWindow(new Date(iso))
        expect(w.mode).toBe(REPORT_MODES.DAILY)
        // Cubre exactamente el día completo anterior
        expect(w.dailyWindow.start.getTime()).toBe(addUTCDays(startOfUTCDay(new Date(iso)), -1).getTime())
        expect(w.dailyWindow.end.getTime()).toBe(startOfUTCDay(new Date(iso)).getTime() - 1)
        expect(w.weeklyWindow).toBeNull()
    })

    it('MARTES: etiqueta del día anterior es Lunes', () => {
        const w = getReportWindow(TUE_2026_08_18)
        expect(w.dailyLabelDay).toBe('Lunes')
    })

    it('JUEVES: etiqueta del día anterior es Miércoles', () => {
        const w = getReportWindow(THU_2026_08_20)
        expect(w.dailyLabelDay).toBe('Miércoles')
    })

    it('VIERNES → WEEKLY_LIVE: diario = AYER completo + semanal Lun→now', () => {
        const now = new Date('2026-08-21T12:00:00.000Z')
        const w = getReportWindow(now)
        expect(w.mode).toBe(REPORT_MODES.WEEKLY_LIVE)
        expect(w.dailyWindow.start.toISOString()).toBe('2026-08-20T00:00:00.000Z')
        expect(w.dailyWindow.end.toISOString()).toBe('2026-08-20T23:59:59.999Z')
        expect(w.dailyLabelDay).toBe('Jueves')
        expect(w.weeklyWindow.start.toISOString()).toBe('2026-08-17T00:00:00.000Z')
        expect(w.weeklyWindow.end.getTime()).toBe(now.getTime())
    })

    it.each([
        ['SÁBADO', '2026-08-22T14:30:00.000Z'],
        ['DOMINGO', '2026-08-23T20:00:00.000Z']
    ])('%s → WEEKLY_LIVE: diario = HOY en vivo (requisito #3)', (_label, iso) => {
        const now = new Date(iso)
        const w = getReportWindow(now)
        expect(w.mode).toBe(REPORT_MODES.WEEKLY_LIVE)
        expect(w.dailyWindow.start.toISOString()).toBe(startOfUTCDay(now).toISOString())
        expect(w.dailyWindow.end.getTime()).toBe(now.getTime())
        expect(w.weeklyWindow.start.toISOString()).toBe('2026-08-17T00:00:00.000Z')
        expect(w.weeklyWindow.end.getTime()).toBe(now.getTime())
    })

    it('SÁBADO: actividades creadas el sábado quedan dentro de AMBAS ventanas', () => {
        const saturdayActivity = new Date('2026-08-22T09:15:00.000Z')
        const w = getReportWindow(new Date('2026-08-22T18:00:00.000Z'))
        expect(saturdayActivity >= w.dailyWindow.start).toBe(true)
        expect(saturdayActivity <= w.dailyWindow.end).toBe(true)
        expect(saturdayActivity >= w.weeklyWindow.start).toBe(true)
        expect(saturdayActivity <= w.weeklyWindow.end).toBe(true)
    })

    it('previousWeek siempre apunta a la semana cerrada previa', () => {
        const w = getReportWindow(FRI_2026_08_21)
        expect(w.previousWeek.isoYear).toBe(getISOWeek(addUTCDays(MON_2026_08_17, -7)).isoYear)
        expect(w.previousWeek.week).toBe(getISOWeek(addUTCDays(MON_2026_08_17, -7)).week)
    })
})

describe('getPreviousClosedWeek — ventana para cron de cierre', () => {
    it('disparado LUNES 07:00 UTC (03:00 Caracas) → semana anterior completa', () => {
        const cronFire = new Date('2026-08-24T07:00:00.000Z')
        const w = getPreviousClosedWeek(cronFire)
        expect(w.start.toISOString()).toBe('2026-08-17T00:00:00.000Z')
        expect(w.end.toISOString()).toBe('2026-08-23T23:59:59.999Z')
        expect(w.week).toBe(getISOWeek(MON_2026_08_17).week)
        expect(w.isoYear).toBe(2026)
    })

    it('es idempotente dentro de la misma semana (cualquier día da la misma ventana)', () => {
        const mon = getPreviousClosedWeek(new Date('2026-08-24T07:00:00.000Z'))
        const wed = getPreviousClosedWeek(new Date('2026-08-26T11:00:00.000Z'))
        const sun = getPreviousClosedWeek(new Date('2026-08-30T23:00:00.000Z'))
        expect(mon.start.getTime()).toBe(wed.start.getTime())
        expect(mon.end.getTime()).toBe(wed.end.getTime())
        expect(wed.start.getTime()).toBe(sun.start.getTime())
        expect(wed.end.getTime()).toBe(sun.end.getTime())
    })

    it('al cambiar de semana, avanza la ventana (no se estanca)', () => {
        const week1 = getPreviousClosedWeek(new Date('2026-08-24T07:00:00.000Z'))
        const week2 = getPreviousClosedWeek(new Date('2026-08-31T07:00:00.000Z'))
        expect(week2.start.getTime()).toBeGreaterThan(week1.end.getTime())
        expect(week2.week).toBe(week1.week + 1)
    })
})
