import express from 'express'
import VacationController from '../controllers/VacationController.js'
import { VerifyhHRToken } from '../middlewares/Auth.middleware.js'
import { PermissionCheck } from '../middlewares/RoleAuth.middleware.js'

const router = express.Router()

router.use(VerifyhHRToken)

// Saldos de vacaciones
router.get('/balances', PermissionCheck('payroll', 'read'), VacationController.getBalances)
router.get('/balances/:employeeId', PermissionCheck('payroll', 'read'), VacationController.getBalanceByEmployee)

// Solicitudes de vacaciones
router.post('/requests', PermissionCheck('payroll', 'create'), VacationController.createRequest)
router.get('/requests', PermissionCheck('payroll', 'read'), VacationController.getRequests)
router.get('/requests/:id', PermissionCheck('payroll', 'read'), VacationController.getRequestById)
router.post('/requests/:id/approve', PermissionCheck('payroll', 'approve'), VacationController.approveRequest)
router.post('/requests/:id/reject', PermissionCheck('payroll', 'approve'), VacationController.rejectRequest)
router.post('/requests/:id/pay', PermissionCheck('payroll', 'pay'), VacationController.payVacation)

// Feriados
router.get('/holidays', PermissionCheck('payroll', 'read'), VacationController.getHolidays)
router.post('/holidays', PermissionCheck('payroll', 'create'), VacationController.createHoliday)
router.delete('/holidays/:id', PermissionCheck('payroll', 'delete'), VacationController.deleteHoliday)

export default router