import express from 'express'
import {
    HandleGetCurrentReport,
    HandleGetMyReport,
    HandleGetReportHistory,
    HandleGetReportByWeek,
    HandleGetMyReportHistory,
    HandleCronCloseAllWeeks
} from '../controllers/Report.controller.js'
import { VerifyEmployeeToken, VerifyhHRToken } from '../middlewares/Auth.middleware.js'
import { PermissionCheck } from '../middlewares/RoleAuth.middleware.js'

const router = express.Router()

// ============ RUTAS HR ============
// Reporte vigente (diario/preliminar semanal según matriz temporal) — toda la organización
router.get("/current", VerifyhHRToken, PermissionCheck("bitacoras", "read"), HandleGetCurrentReport)
// Histórico de snapshots cerrados (listado liviano)
router.get("/history", VerifyhHRToken, PermissionCheck("bitacoras", "read"), HandleGetReportHistory)
// Snapshot completo de una semana específica
router.get("/history/:isoYear/:weekNumber", VerifyhHRToken, PermissionCheck("bitacoras", "read"), HandleGetReportByWeek)

// ============ RUTAS EMPLEADO ============
// Reporte vigente filtrado al departamento del empleado autenticado
router.get("/my-report", VerifyEmployeeToken, HandleGetMyReport)
// Histórico de SUS reportes semanales cerrados (aislado por token — req.EMPID)
router.get("/my-history", VerifyEmployeeToken, HandleGetMyReportHistory)

// ============ RUTAS CRON (sin auth — patrón cron-job.org existente) ============
// Cierra la semana anterior para todas las organizaciones. Lunes 07:00 UTC (03:00 AM Caracas).
// Idempotente: puede re-dispararse sin duplicar snapshots.
router.get("/cron/close-week", HandleCronCloseAllWeeks)

export default router
