import mongoose from 'mongoose'
import { Schema } from 'mongoose'

const AccountingReportMappingSchema = new Schema({
    concept_code: {
        type: String,
        required: true,
        uppercase: true,
        trim: true
    },
    debit_account_subcategory: {
        type: Schema.Types.ObjectId,
        ref: 'AccountingAccountSubcategory',
        required: true
    },
    credit_account_subcategory: {
        type: Schema.Types.ObjectId,
        ref: 'AccountingAccountSubcategory',
        required: true
    },
    account_role: {
        type: String,
        required: true,
        enum: ['EXPENSE', 'LIABILITY', 'EMPLOYER_EXPENSE'],
        default: 'EXPENSE'
    },
    is_active: {
        type: Boolean,
        default: true
    },
    organizationID: {
        type: Schema.Types.ObjectId,
        ref: 'Organization',
        required: true
    }
}, { timestamps: true })

AccountingReportMappingSchema.index({ organizationID: 1, concept_code: 1, account_role: 1 }, { unique: true })

export const AccountingReportMapping = mongoose.model('AccountingReportMapping', AccountingReportMappingSchema)