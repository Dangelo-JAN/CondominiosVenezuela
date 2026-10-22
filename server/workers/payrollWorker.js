import { payrollQueues, initializePayrollQueues } from '../config/queue.js'
import { exportBankFiles } from '../services/payroll/bank-export.js'
import { SendPayslipEmail } from '../sendgrid/emails.js'
import { PayrollReceipt } from '../models/payroll/PayrollReceipt.model.js'
import { Employee } from '../models/Employee.model.js'
import { PayrollPeriod } from '../models/payroll/PayrollPeriod.model.js'

/**
 * Worker para procesar colas de nómina
 * Ejecutar como proceso separado: node server/workers/payrollWorker.js
 */

async function processBankExportJob(job) {
    const { organizationID, periodID } = job.data
    console.log(`[Worker:bank-export] Procesando período ${periodID} para org ${organizationID}`)
    
    const result = await exportBankFiles(organizationID, periodID)
    
    console.log(`[Worker:bank-export] Completado:`, result.summary)
    return result
}

async function processPayslipEmailJob(job) {
    const { organizationID, periodID, payslipBaseURL } = job.data
    console.log(`[Worker:payslip-email] Procesando período ${periodID} para org ${organizationID}`)
    
    const period = await PayrollPeriod.findOne({ _id: periodID, organizationID }).lean()
    if (!period) throw new Error('Período no encontrado')

    const paidReceipts = await PayrollReceipt.find({
        period: periodID,
        organizationID,
        status: 'PAID'
    }).lean()

    const employees = await Employee.find({
        _id: { $in: paidReceipts.map(r => r.employee) },
        organizationID
    }).lean()

    const baseURL = payslipBaseURL || process.env.CLIENT_URL || 'https://app.condove.com'
    let sent = 0
    let failed = 0

    for (const receipt of paidReceipts) {
        const employee = employees.find(e => e._id.toString() === receipt.employee.toString())
        if (!employee?.email) {
            console.warn(`[Worker:payslip-email] Empleado ${receipt.employee} sin email`)
            continue
        }

        try {
            const paymentDate = new Date().toLocaleDateString('es-VE', { day: '2-digit', month: '2-digit', year: 'numeric' })
            const payslipURL = `${baseURL}/HR/dashboard/payroll?receipt=${receipt._id}`
            
            await SendPayslipEmail(
                employee.email,
                `${employee.firstname} ${employee.lastname}`,
                period.name,
                paymentDate,
                receipt.total_income_ves || 0,
                receipt.total_deductions_ves || 0,
                receipt.net_pay_ves || 0,
                payslipURL
            )
            sent++
        } catch (err) {
            failed++
            console.error(`[Worker:payslip-email] Error enviando a ${employee.email}:`, err.message)
        }
    }

    console.log(`[Worker:payslip-email] Completado: ${sent} enviados, ${failed} fallidos`)
    return { sent, failed, total: paidReceipts.length }
}

async function processPayrollCalculationJob(job) {
    const { organizationID, periodID, batchSize = 50 } = job.data
    console.log(`[Worker:payroll-calculation] Procesando período ${periodID} para org ${organizationID}`)
    
    // Import dinámico para evitar dependencias circulares
    const { calculatePayrollPeriod } = await import('../services/payroll/payroll-engine.js')
    
    const receipts = await calculatePayrollPeriod(organizationID, periodID)
    
    console.log(`[Worker:payroll-calculation] Completado: ${receipts.length} recibos generados`)
    return { receiptsCount: receipts.length }
}

async function startWorker() {
    console.log('[Payroll Worker] Iniciando...')
    
    await initializePayrollQueues()

    // Procesadores por cola
    payrollQueues.bankExport.process('export', 2, processBankExportJob) // 2 concurrent
    payrollQueues.payslipEmail.process('send', 5, processPayslipEmailJob) // 5 concurrent
    payrollQueues.payrollCalculation.process('calculate', 1, processPayrollCalculationJob) // 1 a la vez (pesado)
    payrollQueues.notifications.process('notify', 10, async (job) => {
        console.log('[Worker:notifications]', job.data)
        return { ok: true }
    })

    // Graceful shutdown
    const shutdown = async (signal) => {
        console.log(`[Payroll Worker] Recibido ${signal}, cerrando...`)
        await payrollQueues.bankExport.close()
        await payrollQueues.payslipEmail.close()
        await payrollQueues.payrollCalculation.close()
        await payrollQueues.notifications.close()
        process.exit(0)
    }

    process.on('SIGTERM', () => shutdown('SIGTERM'))
    process.on('SIGINT', () => shutdown('SIGINT'))

    console.log('[Payroll Worker] Activo y escuchando colas:', Object.keys(payrollQueues).join(', '))
}

startWorker().catch(err => {
    console.error('[Payroll Worker] Error fatal:', err)
    process.exit(1)
})