import mongoose from 'mongoose'
import { Schema } from "mongoose";

const BitacoraSchema = new Schema({
  title: {
    type: String,
    required: [true, "El título es requerido"],
    trim: true,
    maxlength: [200, "El título no puede exceder 200 caracteres"]
  },
  content: {
    type: String,
    required: [true, "El contenido es requerido"],
    trim: true
  },
  images: {
    type: [String],
    default: [],
    validate: {
      validator: function (arr) {
        return arr.length <= 5
      },
      message: "Máximo 5 imágenes por bitácora"
    }
  },
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Employee"
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

export const Bitacora = mongoose.model("Bitacora", BitacoraSchema)
