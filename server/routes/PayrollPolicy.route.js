import express from 'express'
import PayrollPolicyController from '../controllers/PayrollPolicyController.js'
import { VerifyhHRToken } from '../middlewares/Auth.middleware.js'
import { PermissionCheck } from '../middlewares/RoleAuth.middleware.js'

const router = express.Router()

router.use(VerifyhHRToken)

// Política de nómina
router.get('/policy', PermissionCheck('payroll', 'read'), PayrollPolicyController.getPolicy)
router.put('/policy', PermissionCheck('payroll', 'update'), PayrollPolicyController.updatePolicy)

// Configuración de empresa para nómina
router.get('/company', PermissionCheck('payroll', 'read'), PayrollPolicyController.getCompanyConfig)
router.put('/company', PermissionCheck('payroll', 'update'), PayrollPolicyController.updateCompanyConfig)

export default router