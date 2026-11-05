import { PayrollReceipt } from '../../models/payroll/PayrollReceipt.model.js'
import { PayrollPeriod } from '../../models/payroll/PayrollPeriod.model.js'
import { Employee } from '../../models/Employee.model.js'
import { PayrollCompany } from '../../models/payroll/PayrollCompany.model.js'
import fs from 'fs'
import path from 'path'

/**
 * Bank Export Service - Generates bank transfer files for Venezuelan banks
 * Compatible with major Venezuelan banks: Banesco, Mercantil, Venezuela, Provincial, BOD, BNC, etc.
 * Supports TXT (fixed width) and CSV formats
 */

export class BankExportGenerator {
    constructor(organizationID) {
        this.organizationID = organizationID
        this.company = null
        this.period = null
        this.receipts = []
        this.employees = []
    }

    async initialize(periodID) {
        this.period = await PayrollPeriod.findOne({ _id: periodID, organizationID: this.organizationID }).lean()
        if (!this.period) {
            throw new Error('Período no encontrado')
        }

        this.company = await PayrollCompany.findOne({ organizationID: this.organizationID }).lean()

        this.receipts = await PayrollReceipt.find({
            period: periodID,
            organizationID: this.organizationID,
            status: 'PAID'
        }).lean()

        if (this.receipts.length === 0) {
            throw new Error('No hay recibos en estado PAID para exportar')
        }

        const employeeIDs = this.receipts.map(r => r.employee)
        this.employees = await Employee.find({
            _id: { $in: employeeIDs },
            organizationID: this.organizationID
        }).lean()
    }

    /**
     * Genera archivo TXT formato bancario venezolano (ancho fijo)
     * Formato compatible con Banesco, Mercantil, Venezuela, Provincial
     */
    generateTXT() {
        const lines = []
        
        // Header
        const companyRIF = this.company?.rif?.replace(/[^0-9]/g, '') || '000000000'
        const periodDate = this.period.payment_date ? new Date(this.period.payment_date).toISOString().slice(0,10).replace(/-/g, '') : ''
        const totalAmount = this.receipts.reduce((sum, r) => sum + (r.net_pay_ves || 0), 0)
        const totalAmountStr = Math.round(totalAmount * 100).toString().padStart(15, '0')
        const recordCount = this.receipts.length.toString().padStart(6, '0')
        
        // Header: TIPO(1) + RIF_EMPRESA(10) + FECHA_PAGO(8) + MONTO_TOTAL(15) + CANT_REGISTROS(6) + RELLENO
        const header = `1${companyRIF.padStart(10, '0')}${periodDate}${totalAmountStr}${recordCount}${' '.padEnd(60)}`
        lines.push(header)

        // Detalle por cada empleado
        let sequence = 1
        for (const receipt of this.receipts) {
            const employee = this.employees.find(e => e._id.toString() === receipt.employee.toString())
            if (!employee) continue

            const nationalId = (employee.national_id || employee.rif || '').replace(/[^0-9]/g, '').padStart(10, '0')
            const bankCode = this.getBankCode(employee.bank_name) || '0000'
            const accountNumber = (employee.bank_account_number || '').replace(/[^0-9]/g, '').padStart(20, '0')
            const accountType = this.getAccountTypeCode(employee.bank_account_type) // 1=Corriente, 2=Ahorro
            const amount = Math.round((receipt.net_pay_ves || 0) * 100).toString().padStart(15, '0')
            const concept = this.sanitizeConcept(receipt.period.toString().slice(-8)).padEnd(20, ' ')
            const reference = `NOM${this.period._id.toString().slice(-8)}${sequence.toString().padStart(4, '0')}`.padEnd(20, ' ')
            
            // Detalle: TIPO(1) + CEDULA(10) + COD_BANCO(4) + CUENTA(20) + TIPO_CUENTA(1) + MONTO(15) + CONCEPTO(20) + REFERENCIA(20) + RELLENO
            const detail = `2${nationalId}${bankCode}${accountNumber}${accountType}${amount}${concept}${reference}${' '.padEnd(20)}`
            lines.push(detail)
            sequence++
        }

        // Trailer
        const trailer = `9${' '.padEnd(109)}`
        lines.push(trailer)

        return lines.join('\n')
    }

    /**
     * Genera archivo CSV para importación genérica
     */
    generateCSV() {
        const headers = [
            'Cedula/Rif',
            'Nombre Completo',
            'Banco',
            'Codigo Banco',
            'Numero Cuenta',
            'Tipo Cuenta',
            'Monto (VES)',
            'Concepto',
            'Referencia',
            'Email'
        ]

        const rows = [headers.join(',')]

        for (const receipt of this.receipts) {
            const employee = this.employees.find(e => e._id.toString() === receipt.employee.toString())
            if (!employee) continue

            const nationalId = employee.national_id || employee.rif || ''
            const fullName = `${employee.firstname} ${employee.lastname}`.trim()
            const bankName = employee.bank_name || ''
            const bankCode = this.getBankCode(employee.bank_name) || ''
            const accountNumber = employee.bank_account_number || ''
            const accountType = employee.bank_account_type || 'CORRIENTE'
            const amount = (receipt.net_pay_ves || 0).toFixed(2)
            const concept = `Nómina ${this.period.name}`
            const reference = `NOM-${this.period._id.toString().slice(-8)}-${receipt._id.toString().slice(-6)}`
            const email = employee.email || ''

            const row = [
                this.escapeCSV(nationalId),
                this.escapeCSV(fullName),
                this.escapeCSV(bankName),
                this.escapeCSV(bankCode),
                this.escapeCSV(accountNumber),
                this.escapeCSV(accountType),
                amount,
                this.escapeCSV(concept),
                this.escapeCSV(reference),
                this.escapeCSV(email)
            ].join(',')

            rows.push(row)
        }

        return rows.join('\n')
    }

    /**
     * Genera archivo Excel (requiere librería xlsx - opcional)
     * Por ahora retorna CSV con extensión .xls para compatibilidad
     */
    generateExcel() {
        // Usar CSV con BOM para que Excel lo abra correctamente
        const csv = this.generateCSV()
        return '\uFEFF' + csv // BOM UTF-8
    }

    /**
     * Guarda archivo en disco y retorna ruta
     */
    async saveFile(content, periodID, format = 'txt') {
        const dir = path.join(process.cwd(), 'exports', 'bank', this.organizationID.toString())
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true })
        }

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
        const filename = `bank_export_${periodID}_${timestamp}.${format}`
        const filepath = path.join(dir, filename)

        fs.writeFileSync(filepath, content, 'utf-8')

        return {
            filepath,
            filename,
            format,
            records: this.receipts.length,
            totalAmount: this.receipts.reduce((sum, r) => sum + (r.net_pay_ves || 0), 0)
        }
    }

    // Utilidades privadas
    getBankCode(bankName) {
        if (!bankName) return '0000'
        const name = bankName.toUpperCase()
        const codes = {
            'BANESCO': '0102',
            'MERCANTIL': '0105',
            'VENEZUELA': '0104',
            'PROVINCIAL': '0108',
            'BOD': '0114',
            'BNC': '0191',
            'BANCRECER': '0172',
            'BANCAMIGA': '0175',
            'BANPLUS': '0177',
            'EXTERIOR': '0115',
            'BFC': '0134',
            'CITIBANK': '0157',
            'DEL SUR': '0168',
            'ACTIVO': '0166',
            'BICENTENARIO': '0171',
            'PUEBLO': '0173',
            'MUJER': '0176',
            'AGRICOLA': '0180',
            'BANFANB': '0189'
        }
        for (const [key, code] of Object.entries(codes)) {
            if (name.includes(key)) return code
        }
        return '0000'
    }

    getAccountTypeCode(accountType) {
        if (!accountType) return '1'
        const type = accountType.toUpperCase()
        if (type.includes('AHORRO')) return '2'
        if (type.includes('CORRIENTE')) return '1'
        return '1'
    }

    sanitizeConcept(str) {
        return str.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 20)
    }

    escapeCSV(value) {
        if (value === null || value === undefined) return ''
        const str = String(value)
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
            return `"${str.replace(/"/g, '""')}"`
        }
        return str
    }

    /**
     * Genera todos los formatos y los guarda
     */
    async generateAllFormats(periodID) {
        await this.initialize(periodID)

        const txt = this.generateTXT()
        const csv = this.generateCSV()
        const excel = this.generateExcel()

        const [txtFile, csvFile, excelFile] = await Promise.all([
            this.saveFile(txt, periodID, 'txt'),
            this.saveFile(csv, periodID, 'csv'),
            this.saveFile(excel, periodID, 'xls')
        ])

        return {
            txt: txtFile,
            csv: csvFile,
            excel: excelFile,
            summary: {
                period: this.period.name,
                paymentDate: this.period.payment_date,
                employeeCount: this.receipts.length,
                totalAmount: this.receipts.reduce((sum, r) => sum + (r.net_pay_ves || 0), 0),
                generatedAt: new Date().toISOString()
            }
        }
    }
}

/**
 * Función helper para usar en controller
 */
export async function exportBankFiles(organizationID, periodID) {
    const generator = new BankExportGenerator(organizationID)
    return await generator.generateAllFormats(periodID)
}

export default BankExportGenerator