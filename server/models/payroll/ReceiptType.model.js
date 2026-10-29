import mongoose from 'mongoose'
import { Schema } from 'mongoose'

const ReceiptTypeSchema = new Schema({
    code: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        default: ''
    },
    is_system: {
        type: Boolean,
        default: false
    },
    active: {
        type: Boolean,
        default: true
    },
    organizationID: {
        type: Schema.Types.ObjectId,
        ref: 'Organization'
    }
}, { timestamps: true })

ReceiptTypeSchema.index({ organizationID: 1, code: 1 }, { unique: true })

export const ReceiptType = mongoose.model('ReceiptType', ReceiptTypeSchema)