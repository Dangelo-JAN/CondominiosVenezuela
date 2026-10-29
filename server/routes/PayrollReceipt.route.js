import express from 'express'
import PayrollReceiptController from '../controllers/PayrollReceiptController.js'
import { VerifyhHRToken } from '../middlewares/Auth.middleware.js'
import { PermissionCheck } from '../middlewares/RoleAuth.middleware.js'

const router = express.Router()

router.use(VerifyhHRToken)

router.get('/', PermissionCheck('payroll', 'read'), PayrollReceiptController.getAll)
router.get('/:id', PermissionCheck('payroll', 'read'), PayrollReceiptController.getById)
router.get('/employee/:employeeId', PermissionCheck('payroll', 'read'), PayrollReceiptController.getByEmployee)

router.post('/:id/recalculate', PermissionCheck('payroll', 'calculate'), PayrollReceiptController.recalculate)
router.post('/:id/void', PermissionCheck('payroll', 'void'), PayrollReceiptController.voidReceipt)
router.get('/:id/export', PermissionCheck('payroll', 'read'), PayrollReceiptController.exportReceipt)

export default router