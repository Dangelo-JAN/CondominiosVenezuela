import { Department } from "../models/Department.model.js"
import { HumanResources } from "../models/HR.model.js"
import { Organization } from "../models/Organization.model.js"

// Obtener datos del HR actual autenticado
export const HandleHRMe = async (req, res) => {
    try {
        const HR = await HumanResources.findOne({ _id: req.HRid, organizationID: req.ORGID })

        if (!HR) {
            return res.status(404).json({ success: false, message: "HR Not Found", type: "HRMe" })
        }

        return res.status(200).json({
            success: true,
            message: "HR Data Retrieved Successfully",
            type: "HRMe",
            data: {
                _id: HR._id,
                firstname: HR.firstname,
                lastname: HR.lastname,
                email: HR.email,
                contactnumber: HR.contactnumber,
                role: HR.role,
                cargo: HR.cargo,
                department: HR.department ? { _id: HR.department._id, name: HR.department.name } : null,
                organizationID: HR.organizationID,
                permissions: HR.permissions ? HR.permissions.toObject() : {},
                isactive: HR.isactive,
                isverified: HR.isverified,
                lastlogin: HR.lastlogin,
                createdAt: HR.createdAt
                organizationID: HR.organizationID,
                permissions: HR.permissions ? HR.permissions.toObject() : {}
            }
        })
    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error })
    }
}

export const HandleAllHR = async (req, res) => {
    try {
        const HR = await HumanResources.find({ organizationID: req.ORGID }).populate("department")
        return res.status(200).json({ success: true, message: "All Human Resources Found Successfully", data: HR })

    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error })
    }
}

export const HandleHR = async (req, res) => {
    try {
        const { HRID } = req.params
        const HR = await HumanResources.findOne({ _id: HRID, organizationID: req.ORGID })

        if (!HR) {
            return res.status(404).json({ success: false, message: "HR Record Not Found" })
        }

        return res.status(200).json({ success: true, message: "Human Resources Found Successfully", data: HR })
    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error })
    }
}

export const HandleUpdateHR = async (req, res) => {
    try {
        const { HRID, Updatedata } = req.body

        if (!HRID || !Updatedata) {
            return res.status(400).json({ success: false, message: "Missing HRID or Updatedata" })
        }

        const updatedHR = await HumanResources.findByIdAndUpdate(HRID, Updatedata, { new: true })

        if (!updatedHR) {
            return res.status(404).json({ success: false, message: "HR Record Not Found" })
        }

        return res.status(200).json({ success: true, message: "Human Resources Updated Successfully", data: updatedHR })

    } catch (error) {
        return res.status(500).json({ success: false, message: "internal Server Error", error: error })
    }
}

// ── Autoedición de perfil (el HR actualiza sus propios datos) ───────────────
const SELF_UPDATE_ALLOWED_FIELDS = ["firstname", "lastname", "contactnumber"]

export const HandleUpdateMyProfile = async (req, res) => {
    try {
        const { Updatedata } = req.body

        if (!Updatedata || typeof Updatedata !== "object") {
            return res.status(400).json({ success: false, message: "Missing or invalid Updatedata" })
        }

        // Whitelist: solo permitir campos seguros
        const sanitized = {}
        for (const field of SELF_UPDATE_ALLOWED_FIELDS) {
            if (Updatedata[field] !== undefined) {
                const value = String(Updatedata[field]).trim()
                if (value.length === 0) {
                    return res.status(400).json({ success: false, message: `El campo '${field}' no puede estar vacío` })
                }
                sanitized[field] = value
            }
        }

        if (Object.keys(sanitized).length === 0) {
            return res.status(400).json({ success: false, message: "No hay campos válidos para actualizar" })
        }

        const updatedHR = await HumanResources.findByIdAndUpdate(
            req.HRid,
            sanitized,
            { new: true, runValidators: true }
        ).populate("department")

        if (!updatedHR) {
            return res.status(404).json({ success: false, message: "HR Not Found" })
        }

        return res.status(200).json({
            success: true,
            message: "Perfil actualizado correctamente",
            data: {
                _id: updatedHR._id,
                firstname: updatedHR.firstname,
                lastname: updatedHR.lastname,
                email: updatedHR.email,
                contactnumber: updatedHR.contactnumber,
                role: updatedHR.role,
                cargo: updatedHR.cargo,
                department: updatedHR.department ? { _id: updatedHR.department._id, name: updatedHR.department.name } : null,
                organizationID: updatedHR.organizationID,
                permissions: updatedHR.permissions ? updatedHR.permissions.toObject() : {},
                isactive: updatedHR.isactive,
                isverified: updatedHR.isverified,
                lastlogin: updatedHR.lastlogin,
                createdAt: updatedHR.createdAt
            }
        })
    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error })
    }
}

export const HandleDeleteHR = async (req, res) => {
    try {
        const { HRID } = req.params

        const HR = await HumanResources.findOne({ _id: HRID, organizationID: req.ORGID })

        if (!HR) {
            return res.status(404).json({ success: false, message: "HR Record Not Found" })
        }


        if (HR.department) {

            const department = await Department.findById(HR.department)

            if (department && department.HumanResources.includes(HRID)) {
                const index = department.HumanResources.indexOf(HRID)
                department.HumanResources.splice(index, 1)
            }

            await department.save()
        }

        const organization = await Organization.findById(req.ORGID)
        organization.HRs.splice(organization.HRs.indexOf(HRID), 1)

        await organization.save()
        await HR.deleteOne()

        return res.status(200).json({ success: true, message: "Human Resources Deleted Successfully" })
    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error })
    }
}
