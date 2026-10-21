import express from 'express'
import PayrollConceptController from '../controllers/PayrollConceptController.js'
import { VerifyhHRToken } from '../middlewares/Auth.middleware.js'
import { PermissionCheck } from '../middlewares/RoleAuth.middleware.js'

const router = express.Router()

router.use(VerifyhHRToken)

router.get('/', PermissionCheck('payroll', 'read'), PayrollConceptController.getAll)
router.get('/:id', PermissionCheck('payroll', 'read'), PayrollConceptController.getById)
router.post('/', PermissionCheck('payroll', 'create'), PayrollConceptController.create)
router.put('/:id', PermissionCheck('payroll', 'update'), PayrollConceptController.update)
router.delete('/:id', PermissionCheck('payroll', 'delete'), PayrollConceptController.delete)

router.post('/validate-formula', PermissionCheck('payroll', 'create'), PayrollConceptController.validateFormula)

// Tipos de recibo
router.get('/receipt-types', PermissionCheck('payroll', 'read'), PayrollConceptController.getReceiptTypes)
router.post('/receipt-types', PermissionCheck('payroll', 'create'), PayrollConceptController.createReceiptType)

export default router