import mongoose from 'mongoose'
import { Schema } from "mongoose";

const DepartmentSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    employees: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Employee"
        }
    ],
    HumanResources: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "HumanResources"
        }
    ],
    notice: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Notice"
        }
    ],
    organizationID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Organization"
    }
}, { timestamps: true });

// Compound index: same department name allowed across different organizations, but unique within one
DepartmentSchema.index({ name: 1, organizationID: 1 }, { unique: true })

export const Department = mongoose.model("Department", DepartmentSchema)