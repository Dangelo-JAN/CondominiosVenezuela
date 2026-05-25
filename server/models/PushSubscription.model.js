import mongoose from "mongoose"
import { Schema } from "mongoose"

const PushSubscriptionSchema = new Schema(
    {
        hr: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "HumanResources",
            required: true,
        },
        token: {
            type: String,
            required: true,
        },
        platform: {
            type: String,
            enum: ["web", "android", "ios"],
            default: "web",
        },
        userAgent: {
            type: String,
            default: "",
        },
    },
    { timestamps: true }
)

// Índice compuesto único: un HR no puede tener el mismo token repetido
PushSubscriptionSchema.index({ hr: 1, token: 1 }, { unique: true })
// Índice para búsqueda por organización vía populate
PushSubscriptionSchema.index({ hr: 1 })

export const PushSubscription = mongoose.model("PushSubscription", PushSubscriptionSchema)
