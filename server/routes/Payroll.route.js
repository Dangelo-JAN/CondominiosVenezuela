import express from 'express'
import PayrollPeriodController from '../controllers/PayrollPeriodController.js'
import PayrollReceiptController from '../controllers/PayrollReceiptController.js'
import PayrollConceptController from '../controllers/PayrollConceptController.js'
import PayrollPolicyController from '../controllers/PayrollPolicyController.js'
import PayrollNoveltyController from '../controllers/PayrollNoveltyController.js'
import VacationController from '../controllers/VacationController.js'
import SocialBenefitsController from '../controllers/SocialBenefitsController.js'
import UtilidadesController from '../controllers/UtilidadesController.js'
import { VerifyEmployeeToken, VerifyhHRToken } from '../middlewares/Auth.middleware.js'
import { PermissionCheck } from '../middlewares/RoleAuth.middleware.js'

const router = express.Router()

// ============================================================================
// RUTAS EMPLEADO (VerifyEmployeeToken) - Para que el empleado vea SU información
// ============================================================================

// Recibos del empleado autenticado
router.get('/receipts/me', VerifyEmployeeToken, PayrollReceiptController.getMyReceipts)

// Saldos de vacaciones del empleado autenticado
router.get('/vacations/balances/me', VerifyEmployeeToken, VacationController.getMyBalance)

// Solicitudes de vacaciones del empleado autenticado
router.get('/vacations/requests/me', VerifyEmployeeToken, VacationController.getMyRequests)
router.post('/vacations/requests', VerifyEmployeeToken, VacationController.createRequest)

// Prestaciones sociales del empleado autenticado
router.get('/social-benefits/ledger/me', VerifyEmployeeToken, SocialBenefitsController.getMyLedger)

// Utilidades del empleado autenticado
router.get('/utilidades/payments/me', VerifyEmployeeToken, UtilidadesController.getMyPayments)

// ============================================================================
// RUTAS HR (VerifyhHRToken + PermissionCheck) - Gestión completa
// ============================================================================

// ---- PERÍODOS DE NÓMINA (/periods) ----
router.get('/periods', VerifyhHRToken, PermissionCheck('payroll', 'read'), PayrollPeriodController.getAll)
router.get('/periods/:id', VerifyhHRToken, PermissionCheck('payroll', 'read'), PayrollPeriodController.getById)
router.post('/periods', VerifyhHRToken, PermissionCheck('payroll', 'create'), PayrollPeriodController.create)
router.put('/periods/:id', VerifyhHRToken, PermissionCheck('payroll', 'update'), PayrollPeriodController.update)
router.delete('/periods/:id', VerifyhHRToken, PermissionCheck('payroll', 'delete'), PayrollPeriodController.delete)

// Acciones de estado del período
router.post('/periods/:id/calculate', VerifyhHRToken, PermissionCheck('payroll', 'calculate'), PayrollPeriodController.calculate)
router.post('/periods/:id/approve', VerifyhHRToken, PermissionCheck('payroll', 'approve'), PayrollPeriodController.approve)
router.post('/periods/:id/pay', VerifyhHRToken, PermissionCheck('payroll', 'pay'), PayrollPeriodController.pay)
router.post('/periods/:id/close', VerifyhHRToken, PermissionCheck('payroll', 'close'), PayrollPeriodController.close)

// ---- RECIBOS DE NÓMINA (/receipts) ----
router.get('/receipts', VerifyhHRToken, PermissionCheck('payroll', 'read'), PayrollReceiptController.getAll)
router.get('/receipts/:id', VerifyhHRToken, PermissionCheck('payroll', 'read'), PayrollReceiptController.getById)
router.get('/receipts/employee/:employeeId', VerifyhHRToken, PermissionCheck('payroll', 'read'), PayrollReceiptController.getByEmployee)

router.post('/receipts/:id/recalculate', VerifyhHRToken, PermissionCheck('payroll', 'calculate'), PayrollReceiptController.recalculate)
router.post('/receipts/:id/void', VerifyhHRToken, PermissionCheck('payroll', 'void'), PayrollReceiptController.voidReceipt)
router.get('/receipts/:id/export', VerifyhHRToken, PermissionCheck('payroll', 'read'), PayrollReceiptController.exportReceipt)

// ---- CONCEPTOS DE NÓMINA (/concepts) ----
router.get('/concepts', VerifyhHRToken, PermissionCheck('payroll', 'read'), PayrollConceptController.getAll)
router.get('/concepts/:id', VerifyhHRToken, PermissionCheck('payroll', 'read'), PayrollConceptController.getById)
router.post('/concepts', VerifyhHRToken, PermissionCheck('payroll', 'create'), PayrollConceptController.create)
router.put('/concepts/:id', VerifyhHRToken, PermissionCheck('payroll', 'update'), PayrollConceptController.update)
router.delete('/concepts/:id', VerifyhHRToken, PermissionCheck('payroll', 'delete'), PayrollConceptController.delete)
router.post('/concepts/validate-formula', VerifyhHRToken, PermissionCheck('payroll', 'calculate'), PayrollConceptController.validateFormula)
router.get('/concepts/receipt-types', VerifyhHRToken, PermissionCheck('payroll', 'read'), PayrollConceptController.getReceiptTypes)
router.post('/concepts/receipt-types', VerifyhHRToken, PermissionCheck('payroll', 'create'), PayrollConceptController.createReceiptType)

// ---- POLÍTICAS Y CONFIGURACIÓN (/policies) ----
router.get('/policies', VerifyhHRToken, PermissionCheck('payroll', 'read'), PayrollPolicyController.getPolicy)
router.put('/policies', VerifyhHRToken, PermissionCheck('payroll', 'update'), PayrollPolicyController.updatePolicy)
router.get('/policies/company', VerifyhHRToken, PermissionCheck('payroll', 'read'), PayrollPolicyController.getCompany)
router.put('/policies/company', VerifyhHRToken, PermissionCheck('payroll', 'update'), PayrollPolicyController.updateCompany)

// ---- NOVEDADES (/novelties) ----
router.get('/novelties', VerifyhHRToken, PermissionCheck('payroll', 'read'), PayrollNoveltyController.getAll)
router.get('/novelties/:id', VerifyhHRToken, PermissionCheck('payroll', 'read'), PayrollNoveltyController.getById)
router.post('/novelties', VerifyhHRToken, PermissionCheck('payroll', 'create'), PayrollNoveltyController.create)
router.put('/novelties/:id', VerifyhHRToken, PermissionCheck('payroll', 'update'), PayrollNoveltyController.update)
router.delete('/novelties/:id', VerifyhHRToken, PermissionCheck('payroll', 'delete'), PayrollNoveltyController.delete)
router.post('/novelties/:id/apply', VerifyhHRToken, PermissionCheck('payroll', 'calculate'), PayrollNoveltyController.apply)
router.post('/novelties/:id/reject', VerifyhHRToken, PermissionCheck('payroll', 'calculate'), PayrollNoveltyController.reject)
router.post('/novelties/bulk-create', VerifyhHRToken, PermissionCheck('payroll', 'create'), PayrollNoveltyController.bulkCreate)

// ---- VACACIONES (/vacations) ----
router.get('/vacations/balances', VerifyhHRToken, PermissionCheck('payroll', 'read'), VacationController.getAllBalances)
router.get('/vacations/balances/:employeeId', VerifyhHRToken, PermissionCheck('payroll', 'read'), VacationController.getBalanceByEmployee)

router.get('/vacations/requests', VerifyhHRToken, PermissionCheck('payroll', 'read'), VacationController.getAllRequests)
router.get('/vacations/requests/:id', VerifyhHRToken, PermissionCheck('payroll', 'read'), VacationController.getRequestById)
router.post('/vacations/requests', VerifyhHRToken, PermissionCheck('payroll', 'create'), VacationController.createRequest)
router.post('/vacations/requests/:id/approve', VerifyhHRToken, PermissionCheck('payroll', 'approve'), VacationController.approveRequest)
router.post('/vacations/requests/:id/reject', VerifyhHRToken, PermissionCheck('payroll', 'approve'), VacationController.rejectRequest)
router.post('/vacations/requests/:id/pay', VerifyhHRToken, PermissionCheck('payroll', 'pay'), VacationController.payRequest)

router.get('/vacations/holidays', VerifyhHRToken, PermissionCheck('payroll', 'read'), VacationController.getHolidays)
router.post('/vacations/holidays', VerifyhHRToken, PermissionCheck('payroll', 'create'), VacationController.createHoliday)
router.delete('/vacations/holidays/:id', VerifyhHRToken, PermissionCheck('payroll', 'delete'), VacationController.deleteHoliday)

// ---- PRESTACIONES SOCIALES (/social-benefits) ----
router.get('/social-benefits/ledger', VerifyhHRToken, PermissionCheck('payroll', 'read'), SocialBenefitsController.getAllLedger)
router.get('/social-benefits/ledger/employee/:employeeId', VerifyhHRToken, PermissionCheck('payroll', 'read'), SocialBenefitsController.getLedgerByEmployee)

router.post('/social-benefits/settlements/calculate', VerifyhHRToken, PermissionCheck('payroll', 'calculate'), SocialBenefitsController.calculateSettlement)
router.post('/social-benefits/settlements', VerifyhHRToken, PermissionCheck('payroll', 'create'), SocialBenefitsController.createSettlement)
router.get('/social-benefits/settlements', VerifyhHRToken, PermissionCheck('payroll', 'read'), SocialBenefitsController.getAllSettlements)
router.get('/social-benefits/settlements/:id', VerifyhHRToken, PermissionCheck('payroll', 'read'), SocialBenefitsController.getSettlementById)
router.post('/social-benefits/settlements/:id/approve', VerifyhHRToken, PermissionCheck('payroll', 'approve'), SocialBenefitsController.approveSettlement)
router.post('/social-benefits/settlements/:id/pay', VerifyhHRToken, PermissionCheck('payroll', 'pay'), SocialBenefitsController.paySettlement)

router.post('/social-benefits/accrual/calculate', VerifyhHRToken, PermissionCheck('payroll', 'calculate'), SocialBenefitsController.calculateAccrual)
router.post('/social-benefits/accrual/record', VerifyhHRToken, PermissionCheck('payroll', 'create'), SocialBenefitsController.recordAccrual)

// ---- UTILIDADES (/utilidades) ----
router.get('/utilidades/periods', VerifyhHRToken, PermissionCheck('payroll', 'read'), UtilidadesController.getAllPeriods)
router.get('/utilidades/periods/:id', VerifyhHRToken, PermissionCheck('payroll', 'read'), UtilidadesController.getPeriodById)
router.post('/utilidades/periods', VerifyhHRToken, PermissionCheck('payroll', 'create'), UtilidadesController.createPeriod)
router.post('/utilidades/periods/:id/calculate', VerifyhHRToken, PermissionCheck('payroll', 'calculate'), UtilidadesController.calculatePeriod)
router.post('/utilidades/periods/:id/approve', VerifyhHRToken, PermissionCheck('payroll', 'approve'), UtilidadesController.approvePeriod)
router.post('/utilidades/periods/:id/pay', VerifyhHRToken, PermissionCheck('payroll', 'pay'), UtilidadesController.payPeriod)

router.get('/utilidades/payments', VerifyhHRToken, PermissionCheck('payroll', 'read'), UtilidadesController.getAllPayments)
router.get('/utilidades/payments/:id', VerifyhHRToken, PermissionCheck('payroll', 'read'), UtilidadesController.getPaymentById)
router.post('/utilidades/payments/:id/pay', VerifyhHRToken, PermissionCheck('payroll', 'pay'), UtilidadesController.payPayment)

export default router