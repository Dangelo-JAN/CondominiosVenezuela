import express from 'express'
import PayrollNoveltyController from '../controllers/PayrollNoveltyController.js'
import { VerifyhHRToken } from '../middlewares/Auth.middleware.js'
import { PermissionCheck } from '../middlewares/RoleAuth.middleware.js'

const router = express.Router()

router.use(VerifyhHRToken)

router.get('/', PermissionCheck('payroll', 'read'), PayrollNoveltyController.getAll)
router.get('/:id', PermissionCheck('payroll', 'read'), PayrollNoveltyController.getById)
router.post('/', PermissionCheck('payroll', 'create'), PayrollNoveltyController.create)
router.put('/:id', PermissionCheck('payroll', 'update'), PayrollNoveltyController.update)
router.delete('/:id', PermissionCheck('payroll', 'delete'), PayrollNoveltyController.delete)

router.post('/:id/apply', PermissionCheck('payroll', 'apply_novelty'), PayrollNoveltyController.apply)
router.post('/:id/reject', PermissionCheck('payroll', 'apply_novelty'), PayrollNoveltyController.reject)

router.post('/bulk-create', PermissionCheck('payroll', 'create'), PayrollNoveltyController.bulkCreate)

export default router