import Queue from 'bull'
import { redisClient } from './redis.js'

// Configuración de colas Bull para procesamiento async de nómina
export const payrollQueues = {}

/**
 * Inicializa todas las colas de nómina
 */
export async function initializePayrollQueues() {
    await redisClient.connect().catch(() => {}) // Ignorar si ya conectado

    // Cola para exportación bancaria
    payrollQueues.bankExport = new Queue('bank-export', {
        redis: {
            host: process.env.REDIS_HOST || 'localhost',
            port: parseInt(process.env.REDIS_PORT) || 6379,
            password: process.env.REDIS_PASSWORD || undefined,
        },
        defaultJobOptions: {
            removeOnComplete: 100,
            removeOnFail: 50,
            attempts: 3,
            backoff: {
                type: 'exponential',
                delay: 2000
            }
        }
    })

    // Cola para envío de boletas por email
    payrollQueues.payslipEmail = new Queue('payslip-email', {
        redis: {
            host: process.env.REDIS_HOST || 'localhost',
            port: parseInt(process.env.REDIS_PORT) || 6379,
            password: process.env.REDIS_PASSWORD || undefined,
        },
        defaultJobOptions: {
            removeOnComplete: 500,
            removeOnFail: 100,
            attempts: 3,
            backoff: {
                type: 'exponential',
                delay: 1000
            }
        }
    })

    // Cola para cálculo de nómina pesado (batch processing)
    payrollQueues.payrollCalculation = new Queue('payroll-calculation', {
        redis: {
            host: process.env.REDIS_HOST || 'localhost',
            port: parseInt(process.REDIS_PORT) || 6379,
            password: process.env.REDIS_PASSWORD || undefined,
        },
        defaultJobOptions: {
            removeOnComplete: 50,
            removeOnFail: 20,
            attempts: 2,
            backoff: {
                type: 'exponential',
                delay: 5000
            }
        }
    })

    // Cola genérica para notificaciones
    payrollQueues.notifications = new Queue('notifications', {
        redis: {
            host: process.env.REDIS_HOST || 'localhost',
            port: parseInt(process.env.REDIS_PORT) || 6379,
            password: process.env.REDIS_PASSWORD || undefined,
        },
        defaultJobOptions: {
            removeOnComplete: 1000,
            removeOnFail: 200,
            attempts: 3,
            backoff: {
                type: 'exponential',
                delay: 1000
            }
        }
    })

    // Event listeners para logging
    Object.entries(payrollQueues).forEach(([name, queue]) => {
        queue.on('completed', (job) => {
            console.log(`[Queue:${name}] Job ${job.id} completed`)
        })
        queue.on('failed', (job, err) => {
            console.error(`[Queue:${name}] Job ${job.id} failed:`, err.message)
        })
        queue.on('stalled', (job) => {
            console.warn(`[Queue:${name}] Job ${job.id} stalled`)
        })
    })

    console.log('[Payroll Queues] Inicializadas:', Object.keys(payrollQueues).join(', '))
    return payrollQueues
}

/**
 * Agrega job de exportación bancaria
 */
export async function addBankExportJob(organizationID, periodID) {
    if (!payrollQueues.bankExport) await initializePayrollQueues()
    return payrollQueues.bankExport.add('export', { organizationID, periodID })
}

/**
 * Agrega job de envío de boletas
 */
export async function addPayslipEmailJob(organizationID, periodID, payslipBaseURL) {
    if (!payrollQueues.payslipEmail) await initializePayrollQueues()
    return payrollQueues.payslipEmail.add('send', { organizationID, periodID, payslipBaseURL })
}

/**
 * Agrega job de cálculo de nómina
 */
export async function addPayrollCalculationJob(organizationID, periodID, options = {}) {
    if (!payrollQueues.payrollCalculation) await initializePayrollQueues()
    return payrollQueues.payrollCalculation.add('calculate', { organizationID, periodID, ...options })
}

/**
 * Cierra todas las colas gracefully
 */
export async function closePayrollQueues() {
    await Promise.all(
        Object.values(payrollQueues).map(q => q.close())
    )
    await redisClient.quit()
    console.log('[Payroll Queues] Cerradas correctamente')
}

export default payrollQueues