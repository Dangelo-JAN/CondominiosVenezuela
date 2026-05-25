import mongoose from 'mongoose'
import { Schema } from "mongoose"

const PermissionModuleSchema = new Schema({
    create: { type: Boolean, default: false },
    read:   { type: Boolean, default: true  },
    update: { type: Boolean, default: false },
    delete: { type: Boolean, default: false },
}, { _id: false })

const PermissionsSchema = new Schema({
    employees:      { type: PermissionModuleSchema, default: () => ({}) },
    departments:    { type: PermissionModuleSchema, default: () => ({}) },
    schedules:      { type: PermissionModuleSchema, default: () => ({}) },
    photos:         { type: PermissionModuleSchema, default: () => ({}) },
    salaries:       { type: PermissionModuleSchema, default: () => ({}) },
    notices:        { type: PermissionModuleSchema, default: () => ({}) },
    leaves:         { type: PermissionModuleSchema, default: () => ({}) },
    requests:       { type: PermissionModuleSchema, default: () => ({}) },
    attendance:     { type: PermissionModuleSchema, default: () => ({}) },
    recruitment:    { type: PermissionModuleSchema, default: () => ({}) },
    interviews:     { type: PermissionModuleSchema, default: () => ({}) },
    hrprofiles:     { type: PermissionModuleSchema, default: () => ({}) },
    bitacoras:      { type: PermissionModuleSchema, default: () => ({}) },
}, { _id: false })

// ── Mapeo de Cargo a Rol ─────────────────────────────────────────────────
export const CARGO_TO_ROLE = {
    "Presidente": "HR-Admin",
    "Vice Presidente": "HR-Admin",
    "Secretario": "HR-Manager",
    "Coordinador": "HR-Manager",
    "Propietario": "HR-Viewer",
    "General": "HR-Viewer"
}

// ── Cargos que solo pueden tener un usuario por organización ─────────────
export const UNIQUE_CARGOS = ["Presidente", "Vice Presidente", "Secretario", "Coordinador"]

// ── Permisos por defecto según rol ────────────────────────────────────────
export const DEFAULT_PERMISSIONS = {
    "HR-Admin": {
        employees:   { create: true,  read: true, update: true,  delete: true  },
        departments: { create: true,  read: true, update: true,  delete: true  },
        schedules:   { create: true,  read: true, update: true,  delete: true  },
        photos:      { create: true,  read: true, update: true,  delete: true  },
        salaries:    { create: true,  read: true, update: true,  delete: true  },
        notices:     { create: true,  read: true, update: true,  delete: true  },
        leaves:      { create: true,  read: true, update: true,  delete: true  },
        requests:    { create: true,  read: true, update: true,  delete: true  },
        attendance:  { create: true,  read: true, update: true,  delete: true  },
        recruitment: { create: true,  read: true, update: true,  delete: true  },
        interviews:  { create: true,  read: true, update: true,  delete: true  },
        hrprofiles:  { create: true,  read: true, update: true,  delete: true  },
        bitacoras:   { create: false, read: true, update: false, delete: true  },
    },
    "HR-Manager": {
        employees:   { create: true,  read: true, update: true,  delete: true  },
        departments: { create: true,  read: true, update: true,  delete: true  },
        schedules:   { create: true,  read: true, update: true,  delete: true  },
        photos:      { create: true,  read: true, update: true,  delete: true  },
        salaries:    { create: true,  read: true, update: true,  delete: true  },
        notices:     { create: true,  read: true, update: true,  delete: true  },
        leaves:      { create: true,  read: true, update: true,  delete: true  },
        requests:    { create: true,  read: true, update: true,  delete: true  },
        attendance:  { create: true,  read: true, update: true,  delete: true  },
        recruitment: { create: true,  read: true, update: true,  delete: true  },
        interviews:  { create: true,  read: true, update: true,  delete: true  },
        hrprofiles:  { create: false, read: true, update: false, delete: false },
        bitacoras:   { create: false, read: true, update: false, delete: false },
    },
    "HR-Viewer": {
        employees:   { create: false, read: true, update: false, delete: false },
        departments: { create: false, read: true, update: false, delete: false },
        schedules:   { create: false, read: true, update: false, delete: false },
        photos:      { create: false, read: true, update: false, delete: false },
        salaries:    { create: false, read: true, update: false, delete: false },
        notices:     { create: false, read: true, update: false, delete: false },
        leaves:      { create: false, read: true, update: false, delete: false },
        requests:    { create: false, read: true, update: false, delete: false },
        attendance:  { create: false, read: true, update: false, delete: false },
        recruitment: { create: false, read: true, update: false, delete: false },
        interviews:  { create: false, read: true, update: false, delete: false },
        hrprofiles:  { create: false, read: false, update: false, delete: false },
        bitacoras:   { create: false, read: true,  update: false, delete: false },
    }
}

const HumanResourcesSchema = new Schema({
    firstname: { type: String, required: true },
    lastname:  { type: String, required: true },
    email: {
        type: String, required: true, unique: true,
        validate: {
            validator: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
            message: 'Invalid email address format',
        }
    },
    password:      { type: String, required: true },
    contactnumber: { type: String, required: true },
    role: {
        type: String,
        enum: ["HR-Admin", "HR-Manager", "HR-Viewer"],
        required: true,
        default: "HR-Admin"
    },
    // ── Campo Cargo (posición en la junta de condominio) ──────────────────
    cargo: {
        type: String,
        enum: ["Presidente", "Vice Presidente", "Secretario", "Coordinador", "Propietario", "General"],
        default: null
    },
    permissions: {
        type: PermissionsSchema,
        default: () => DEFAULT_PERMISSIONS["HR-Admin"]
    },
    // ── Sistema de invitación ─────────────────────────────────────────────
    invitedby: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "HumanResources",
        default: null
    },
    invitationtoken: {
        type: String,
        default: null
    },
    invitationtokenexpires: {
        type: Date,
        default: null
    },
    isactive: {
        type: Boolean,
        default: true
    },
    // ── Campos existentes ─────────────────────────────────────────────────
    lastlogin: { type: Date, default: new Date() },
    isverified: { type: Boolean, default: false },
    verificationtoken: { type: String },
    verificationtokenexpires: { type: Date },
    resetpasswordtoken: { type: String },
    resetpasswordexpires: { type: Date },
    department: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Department",
    },
    organizationID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Organization"
    }
}, { timestamps: true })

export const HumanResources = mongoose.model("HumanResources", HumanResourcesSchema)
