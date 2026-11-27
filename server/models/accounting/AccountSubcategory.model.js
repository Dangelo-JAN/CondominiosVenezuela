import mongoose from 'mongoose'
import { Schema } from 'mongoose'

const AccountSubcategorySchema = new Schema({
    code: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    is_active: {
        type: Boolean,
        default: true
    },
    group: {
        type: Schema.Types.ObjectId,
        ref: 'AccountGroup'
    },
    dre_role: {
        type: String,
        enum: ['INCOME', 'EXPENSE', 'ASSET', 'LIABILITY', 'EQUITY'],
        default: 'EXPENSE'
    },
    organizationID: {
        type: Schema.Types.ObjectId,
        ref: 'Organization',
        required: true
    }
}, { timestamps: true })

AccountSubcategorySchema.index({ organizationID: 1, code: 1 }, { unique: true })

export const AccountingAccountSubcategory = mongoose.model('AccountingAccountSubcategory', AccountSubcategorySchema)