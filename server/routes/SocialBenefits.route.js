import express from 'express'
import SocialBenefitsController from '../controllers/SocialBenefitsController.js'
import { VerifyhHRToken } from '../middlewares/Auth.middleware.js'
import { PermissionCheck } from '../middlewares/RoleAuth.middleware.js'

const router = express.Router()

router.use(VerifyhHRToken)

// Libro de prestaciones
router.get('/ledger', PermissionCheck('payroll', 'read'), SocialBenefitsController.getLedger)
router.get('/ledger/employee/:employeeId', PermissionCheck('payroll', 'read'), SocialBenefitsController.getLedgerByEmployee)

// Liquidaciones
router.post('/settlements/calculate', PermissionCheck('payroll', 'calculate'), SocialBenefitsController.calculateSettlement)
router.post('/settlements', PermissionCheck('payroll', 'create'), SocialBenefitsController.createSettlement)
router.get('/settlements', PermissionCheck('payroll', 'read'), SocialBenefitsController.getSettlements)
router.get('/settlements/:id', PermissionCheck('payroll', 'read'), SocialBenefitsController.getSettlementById)
router.post('/settlements/:id/approve', PermissionCheck('payroll', 'approve'), SocialBenefitsController.approveSettlement)
router.post('/settlements/:id/pay', PermissionCheck('payroll', 'pay'), SocialBenefitsController.paySettlement)

// Acumulación mensual
router.get('/accrual/calculate', PermissionCheck('payroll', 'read'), SocialBenefitsController.calculateAccrual)
router.post('/accrual/record', PermissionCheck('payroll', 'create'), SocialBenefitsController.recordAccrual)

export default router