import mongoose from 'mongoose'
import { Schema } from 'mongoose'

const HolidaySchema = new Schema({
    date: {
        type: Date,
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    type: {
        type: String,
        required: true,
        enum: ['NATIONAL', 'REGIONAL', 'RELIGIOUS', 'COMPANY'],
        default: 'NATIONAL'
    },
    is_recurring: {
        type: Boolean,
        default: false
    },
    region: {
        type: String,
        default: ''
    },
    branch: {
        type: Schema.Types.ObjectId,
        ref: 'Branch'
    },
    organizationID: {
        type: Schema.Types.ObjectId,
        ref: 'Organization',
        required: true
    }
}, { timestamps: true })

HolidaySchema.index({ organizationID: 1, date: 1 }, { unique: true })
HolidaySchema.index({ organizationID: 1, type: 1 })

export const Holiday = mongoose.model('Holiday', HolidaySchema)