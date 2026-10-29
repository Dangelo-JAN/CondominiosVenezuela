import express from 'express'
import PayrollPeriodController from '../controllers/PayrollPeriodController.js'
import { VerifyhHRToken } from '../middlewares/Auth.middleware.js'
import { PermissionCheck } from '../middlewares/RoleAuth.middleware.js'

const router = express.Router()

// Todas las rutas requieren autenticación y permisos
router.use(VerifyhHRToken)

router.get('/', PermissionCheck('payroll', 'read'), PayrollPeriodController.getAll)
router.get('/:id', PermissionCheck('payroll', 'read'), PayrollPeriodController.getById)
router.post('/', PermissionCheck('payroll', 'create'), PayrollPeriodController.create)
router.put('/:id', PermissionCheck('payroll', 'update'), PayrollPeriodController.update)
router.delete('/:id', PermissionCheck('payroll', 'delete'), PayrollPeriodController.delete)

// Acciones de estado del período
router.post('/:id/calculate', PermissionCheck('payroll', 'calculate'), PayrollPeriodController.calculate)
router.post('/:id/approve', PermissionCheck('payroll', 'approve'), PayrollPeriodController.approve)
router.post('/:id/pay', PermissionCheck('payroll', 'pay'), PayrollPeriodController.pay)
router.post('/:id/close', PermissionCheck('payroll', 'close'), PayrollPeriodController.close)

export default router