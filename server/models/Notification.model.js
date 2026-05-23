import mongoose from 'mongoose'
import { Schema } from "mongoose";

const NotificationSchema = new Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "HumanResources"
  },
  type: {
    type: String,
    required: true,
    enum: ["bitacora_created"],
    default: "bitacora_created"
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  relatedTo: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: "onModel"
  },
  onModel: {
    type: String,
    required: true,
    enum: ["Bitacora"]
  },
  isRead: {
    type: Boolean,
    default: false
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: {
    type: Date,
    default: null
  },
  organizationID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Organization"
  }
}, { timestamps: true });

// Índices para consultas eficientes
NotificationSchema.index({ recipient: 1, isRead: 1, isDeleted: 1 })
NotificationSchema.index({ recipient: 1, createdAt: -1 })

export const Notification = mongoose.model("Notification", NotificationSchema)
