import mongoose from 'mongoose'
import { Schema } from 'mongoose'

const ISLRRetentionTableSchema = new Schema({
    year: {
        type: Number,
        required: true
    },
    income_from_ut: {
        type: Number,
        required: true
    },
    income_to_ut: {
        type: Number,
        default: null
    },
    rate: {
        type: Number,
        required: true
    },
    subtrahend: {
        type: Number,
        default: 0
    },
    ut_value: {
        type: Number,
        required: true
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

ISLRRetentionTableSchema.index({ organizationID: 1, year: 1, income_from_ut: 1 }, { unique: true })

export const ISLRRetentionTable = mongoose.model('ISLRRetentionTable', ISLRRetentionTableSchema)