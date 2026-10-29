import express from 'express'
import PayrollReceiptController from '../controllers/PayrollReceiptController.js'
import { VerifyhHRToken, VerifyEmployeeToken } from '../middlewares/Auth.middleware.js'
import { PermissionCheck } from '../middlewares/RoleAuth.middleware.js'

const router = express.Router()

// Rutas HR (requieren VerifyhHRToken + PermissionCheck)
router.get('/', VerifyhHRToken, PermissionCheck('payroll', 'read'), PayrollReceiptController.getAll)
router.get('/:id', VerifyhHRToken, PermissionCheck('payroll', 'read'), PayrollReceiptController.getById)
router.get('/employee/:employeeId', VerifyhHRToken, PermissionCheck('payroll', 'read'), PayrollReceiptController.getByEmployee)

router.post('/:id/recalculate', VerifyhHRToken, PermissionCheck('payroll', 'calculate'), PayrollReceiptController.recalculate)
router.post('/:id/void', VerifyhHRToken, PermissionCheck('payroll', 'void'), PayrollReceiptController.voidReceipt)
router.get('/:id/export', VerifyhHRToken, PermissionCheck('payroll', 'read'), PayrollReceiptController.exportReceipt)

// Ruta Empleado (requiere VerifyEmployeeToken) - para que el empleado vea SUS propORS recibos
router.get('/employee/me', VerifyEmployeeToken, PayrollReceiptController.getMyReceipts)

export default router