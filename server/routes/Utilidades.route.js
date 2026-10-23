import express from 'express'
import UtilidadesController from '../controllers/UtilidadesController.js'
import { VerifyhHRToken } from '../middlewares/Auth.middleware.js'
import { PermissionCheck } from '../middlewares/RoleAuth.middleware.js'

const router = express.Router()

router.use(VerifyhHRToken)

// Períodos de utilidades
router.get('/periods', PermissionCheck('payroll', 'read'), UtilidadesController.getPeriods)
router.get('/periods/:id', PermissionCheck('payroll', 'read'), UtilidadesController.getPeriodById)
router.post('/periods', PermissionCheck('payroll', 'create'), UtilidadesController.createPeriod)
router.post('/periods/:id/calculate', PermissionCheck('payroll', 'calculate'), UtilidadesController.calculatePeriod)
router.post('/periods/:id/approve', PermissionCheck('payroll', 'approve'), UtilidadesController.approvePeriod)
router.post('/periods/:id/pay', PermissionCheck('payroll', 'pay'), UtilidadesController.payPeriod)

// Pagos individuales
router.get('/payments', PermissionCheck('payroll', 'read'), UtilidadesController.getPayments)
router.get('/payments/:id', PermissionCheck('payroll', 'read'), UtilidadesController.getPaymentById)
router.post('/payments/:id/pay', PermissionCheck('payroll', 'pay'), UtilidadesController.payIndividual)

export default router