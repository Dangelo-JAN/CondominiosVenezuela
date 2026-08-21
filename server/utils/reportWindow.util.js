// ── Report Window Utility ──────────────────────────────────────────────────
// Lógica temporal central del sistema de reportes diarios/semanales.
//
// CONVENCIÓN DE ZONA HORARIA: UTC — es la que YA usa la aplicación para
// registrar asistencia (Attendance.controller.js usa `toISOString()` para
// logdate) y para el cron de ausencias. NO cambiar sin migrar todo el sistema.
//
// Definición de semana: Lunes 00:00 UTC → Domingo 23:59:59.999 UTC (ISO 8601).
//
// Modos (matriz aprobada — tarea #035):
//   WEEK_START  (Lunes)        → sección diaria VACÍA explícita, semanal oculta
//   DAILY       (Mar–Jue)      → diario = día anterior completo, semanal oculta
//   WEEKLY_LIVE (Vie–Sáb–Dom)  → preliminar semanal Lun→now + diario:
//                                   Vie = día anterior | Sáb/Dom = HOY en vivo
//                                                 (requisito #3: actividades del
//                                                  fin de semana entran al
//                                                  semanal Y al diario)

/**
 * Modos posibles del reporte.
 * @enum {string}
 */
export const REPORT_MODES = {
    WEEK_START: "WEEK_START",   // Lunes — semana iniciando, nada que mostrar aún
    DAILY: "DAILY",             // Martes a Jueves — solo ventana diaria (ayer)
    WEEKLY_LIVE: "WEEKLY_LIVE"  // Viernes a Domingo — semanal preliminar en vivo
}

const MS_PER_DAY = 24 * 60 * 60 * 1000
const DAYS_ES = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"]

/**
 * Inicio del día UTC (00:00:00.000) de una fecha dada.
 * @param {Date} date
 * @returns {Date}
 */
export function startOfUTCDay(date) {
    return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()))
}

/**
 * Desplaza una fecha N días (aritmética UTC pura).
 * @param {Date} date
 * @param {number} days
 * @returns {Date}
 */
export function addUTCDays(date, days) {
    return new Date(date.getTime() + days * MS_PER_DAY)
}

/**
 * Lunes 00:00 UTC de la semana a la que pertenece `date`.
 * @param {Date} date
 * @returns {Date}
 */
export function mondayOfUTCWeek(date) {
    const dayStart = startOfUTCDay(date)
    const dow = dayStart.getUTCDay()          // 0=Dom .. 6=Sáb
    const offset = (dow + 6) % 7              // 0=Lun .. 6=Dom
    return addUTCDays(dayStart, -offset)
}

/**
 * Número de semana ISO 8601 y su año ISO.
 * Algoritmo estándar: la semana 1 es la que contiene el primer jueves del año.
 * @param {Date} date
 * @returns {{ week: number, isoYear: number }}
 */
export function getISOWeek(date) {
    const d = startOfUTCDay(date)
    const dayNum = (d.getUTCDay() + 6) % 7            // Lun=0 .. Dom=6
    d.setUTCDate(d.getUTCDate() - dayNum + 3)         // llevar al jueves más cercano
    const isoYear = d.getUTCFullYear()
    const firstThursday = new Date(Date.UTC(isoYear, 0, 4))
    const firstDayNum = (firstThursday.getUTCDay() + 6) % 7
    firstThursday.setUTCDate(firstThursday.getUTCDate() - firstDayNum + 3)
    const week = 1 + Math.round((d.getTime() - firstThursday.getTime()) / MS_PER_DAY / 7)
    return { week, isoYear }
}

/**
 * Calcula la ventana de reporte vigente para un instante dado.
 * Función PURA y determinista — toda la UI se renderiza a partir de este resultado.
 *
 * @param {Date} [now=new Date()] Instante de consulta (default: ahora, UTC).
 * @returns {{
 *   mode: string,                       // REPORT_MODES.*
 *   referenceDate: Date,                // instante de cálculo
 *   dailyWindow: {start: Date, end: Date}|null,   // null en lunes
 *   dailyLabelDay: string|null,         // nombre del día que cubre la ventana diaria
 *   weeklyWindow: {start: Date, end: Date}|null,  // null si la semanal no se muestra
 *   currentWeek: {week: number, isoYear: number},
 *   previousWeek: {week: number, isoYear: number} // semana cerrada (para snapshot/histórico)
 * }}
 */
export function getReportWindow(now = new Date()) {
    const todayStart = startOfUTCDay(now)
    const dow = now.getUTCDay()

    const previousWeek = getISOWeek(addUTCDays(mondayOfUTCWeek(todayStart), -1))

    // ── Lunes: semana iniciando — sección diaria vacía explícita (requisito #1)
    if (dow === 1) {
        return {
            mode: REPORT_MODES.WEEK_START,
            referenceDate: now,
            dailyWindow: null,
            dailyLabelDay: null,
            weeklyWindow: null,
            currentWeek: getISOWeek(now),
            previousWeek
        }
    }

    const isFriday = dow === 5
    const isWeekend = dow === 0 || dow === 6

    let mode
    let dailyWindow
    let dailyLabelDay

    if (isFriday || isWeekend) {
        // ── Vie–Dom: semanal preliminar abierta (ventana de gracia)
        mode = REPORT_MODES.WEEKLY_LIVE
        // Viernes muestra AYER (requisito #1); Sáb/Dom muestran HOY en vivo (requisito #3)
        const dailyStart = isFriday ? addUTCDays(todayStart, -1) : todayStart
        dailyWindow = isFriday
            ? { start: dailyStart, end: new Date(todayStart.getTime() - 1) }
            : { start: todayStart, end: now }
        dailyLabelDay = DAYS_ES[dailyStart.getUTCDay()]
    } else {
        // ── Mar–Jue: solo día anterior completo
        mode = REPORT_MODES.DAILY
        dailyWindow = {
            start: addUTCDays(todayStart, -1),
            end: new Date(todayStart.getTime() - 1)
        }
        dailyLabelDay = DAYS_ES[dailyWindow.start.getUTCDay()]
    }

    const weeklyWindow = mode === REPORT_MODES.WEEKLY_LIVE
        ? { start: mondayOfUTCWeek(todayStart), end: now }
        : null

    return {
        mode,
        referenceDate: now,
        dailyWindow,
        dailyLabelDay,
        weeklyWindow,
        currentWeek: getISOWeek(now),
        previousWeek
    }
}

/**
 * Ventana de la ÚLTIMA SEMANA COMPLETADA (para el cron de cierre).
 * Idempotente: sin importar qué día se dispare, siempre devuelve la semana
 * anterior completa Lun 00:00 → Dom 23:59:59.999 UTC.
 *
 * @param {Date} [now=new Date()]
 * @returns {{ start: Date, end: Date, week: number, isoYear: number }}
 */
export function getPreviousClosedWeek(now = new Date()) {
    const thisMonday = mondayOfUTCWeek(startOfUTCDay(now))
    const prevMonday = addUTCDays(thisMonday, -7)
    const prevSundayEnd = new Date(thisMonday.getTime() - 1)
    const { week, isoYear } = getISOWeek(prevMonday)
    return { start: prevMonday, end: prevSundayEnd, week, isoYear }
}
