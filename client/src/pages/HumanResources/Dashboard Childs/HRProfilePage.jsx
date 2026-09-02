import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { HandleGetHumanResources, HandlePatchHumanResources } from "../../../redux/Thunks/HRThunk.js"
import { Loading } from "../../../components/common/loading.jsx"
import { useIsDark } from "../../../hooks/useIsDark.js"
import {
    User, Mail, Phone, Building2, ShieldCheck,
    ShieldAlert, Clock, CalendarDays, Briefcase,
    Save, X, Pencil
} from "lucide-react"

const formatDate = (d) => d ? new Date(d).toLocaleDateString("es-ES", {
    day: "numeric", month: "long", year: "numeric"
}) : "—"

const formatTime = (d) => d ? new Date(d).toLocaleTimeString("es-ES", {
    hour: "2-digit", minute: "2-digit"
}) : "—"

// Mapa de colores de acento → valores concretos para claro y oscuro
// (Design System v4: paleta Venezuela 🇻🇪 — blue/cyan/emerald aprobados)
const ACCENT_MAP = {
    "#003DA5": { lightBg: "#d9e2f2", lightBorder: "#99b1db", darkBg: "rgba(0,61,165,0.20)", darkBorder: "rgba(0,61,165,0.40)" },
    "#06b6d4": { lightBg: "#cffafe", lightBorder: "#67e8f9", darkBg: "rgba(6,182,212,0.20)", darkBorder: "rgba(6,182,212,0.40)" },
    "#10b981": { lightBg: "#d1fae5", lightBorder: "#6ee7b7", darkBg: "rgba(16,185,129,0.20)", darkBorder: "rgba(16,185,129,0.40)" },
}

// ── Tarjeta de información (solo lectura) ──────────────────────────────────
const InfoCard = ({ icon: Icon, label, value, accent, isDark }) => {
    const colors = ACCENT_MAP[accent] || ACCENT_MAP["#003DA5"]
    return (
        <div className="flex items-center gap-3 p-4 rounded-2xl transition-all duration-200"
            style={{
                background: isDark ? "rgba(255,255,255,0.05)" : "#ffffff",
                border: `1px solid ${isDark ? "rgba(255,255,255,0.12)" : "#e0e7ff"}`,
                boxShadow: isDark ? "none" : "0 2px 8px rgba(0,0,0,0.05)",
            }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{
                    background: isDark ? colors.darkBg : colors.lightBg,
                    border: `1px solid ${isDark ? colors.darkBorder : colors.lightBorder}`,
                }}>
                <Icon className="w-5 h-5" style={{ color: accent }} />
            </div>
            <div className="min-w-0 flex-1">
                <p className="text-[10px] font-semibold uppercase tracking-wider mb-0.5"
                    style={{ color: isDark ? "rgba(255,255,255,0.4)" : "rgba(107,114,128,1)" }}>
                    {label}
                </p>
                <p className="text-sm font-semibold truncate"
                    style={{ color: isDark ? "#ffffff" : "#111827" }}>
                    {value || "—"}
                </p>
            </div>
        </div>
    )
}

// ── Campo de edición ───────────────────────────────────────────────────────
const EditableField = ({ icon: Icon, label, value, field, accent, isDark, onChange }) => {
    const colors = ACCENT_MAP[accent] || ACCENT_MAP["#003DA5"]
    return (
        <div className="flex items-center gap-3 p-4 rounded-2xl transition-all duration-200"
            style={{
                background: isDark ? "rgba(255,255,255,0.05)" : "#ffffff",
                border: `1px solid ${isDark ? "rgba(255,255,255,0.12)" : "#e0e7ff"}`,
                boxShadow: isDark ? "none" : "0 2px 8px rgba(0,0,0,0.05)",
            }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{
                    background: isDark ? colors.darkBg : colors.lightBg,
                    border: `1px solid ${isDark ? colors.darkBorder : colors.lightBorder}`,
                }}>
                <Icon className="w-5 h-5" style={{ color: accent }} />
            </div>
            <div className="min-w-0 flex-1">
                <p className="text-[10px] font-semibold uppercase tracking-wider mb-1"
                    style={{ color: isDark ? "rgba(255,255,255,0.4)" : "rgba(107,114,128,1)" }}>
                    {label}
                </p>
                <input
                    type="text"
                    value={value || ""}
                    onChange={(e) => onChange(field, e.target.value)}
                    className="w-full text-sm font-semibold rounded-lg px-3 py-1.5 outline-none transition-all duration-200"
                    style={{
                        background: isDark ? "rgba(255,255,255,0.08)" : "#f9fafb",
                        border: `1px solid ${isDark ? "rgba(255,255,255,0.15)" : "#d1d5db"}`,
                        color: isDark ? "#ffffff" : "#111827",
                    }}
                />
            </div>
        </div>
    )
}

// ── Página principal ──────────────────────────────────────────────────────
export const HRProfilePage = () => {
    const dispatch = useDispatch()
    const isDark = useIsDark()
    const { data: hrData, isLoading: hrLoading } = useSelector(s => s.HRReducer)

    const [isEditing, setIsEditing] = useState(false)
    const [editData, setEditData] = useState({ firstname: "", lastname: "", contactnumber: "" })
    const [isSaving, setIsSaving] = useState(false)
    const [saveMessage, setSaveMessage] = useState(null)

    // ── Cargar datos del HR al montar ───────────────────────────────────
    useEffect(() => {
        const load = async () => {
            await dispatch(HandleGetHumanResources({ apiroute: "CHECKLOGIN" }))
            await dispatch(HandleGetHumanResources({ apiroute: "GET_HR_ME" }))
        }
        load()
    }, [dispatch])

    // ── Sincronizar editData con hrData cuando cambia ───────────────────
    useEffect(() => {
        if (hrData) {
            setEditData({
                firstname: hrData.firstname || "",
                lastname: hrData.lastname || "",
                contactnumber: hrData.contactnumber || ""
            })
        }
    }, [hrData])

    const handleEditChange = (field, value) => {
        setEditData(prev => ({ ...prev, [field]: value }))
        setSaveMessage(null)
    }

    const handleCancel = () => {
        // Restaurar datos originales
        setEditData({
            firstname: hrData.firstname || "",
            lastname: hrData.lastname || "",
            contactnumber: hrData.contactnumber || ""
        })
        setIsEditing(false)
        setSaveMessage(null)
    }

    const handleSave = async () => {
        // Validaciones básicas
        if (!editData.firstname.trim() || !editData.lastname.trim() || !editData.contactnumber.trim()) {
            setSaveMessage({ type: "error", text: "Todos los campos son obligatorios" })
            return
        }

        setIsSaving(true)
        setSaveMessage(null)

        try {
            const result = await dispatch(HandlePatchHumanResources({
                Updatedata: {
                    firstname: editData.firstname.trim(),
                    lastname: editData.lastname.trim(),
                    contactnumber: editData.contactnumber.trim()
                }
            })).unwrap()

            if (result.success) {
                setSaveMessage({ type: "success", text: "Perfil actualizado correctamente" })
                setIsEditing(false)
            } else {
                setSaveMessage({ type: "error", text: result.message || "Error al actualizar" })
            }
        } catch (err) {
            setSaveMessage({ type: "error", text: err?.message || "Error al guardar los cambios" })
        } finally {
            setIsSaving(false)
        }
    }

    if (hrLoading && !hrData) return <Loading />

    const emp = hrData

    // Estilos del card hero (avatar + nombre)
    const heroStyle = {
        background: isDark ? "rgba(255,255,255,0.05)" : "#f0f2ff",
        border: `1px solid ${isDark ? "rgba(255,255,255,0.12)" : "#c7d2fe"}`,
        boxShadow: isDark ? "0 4px 24px rgba(0,0,0,0.2)" : "0 2px 16px rgba(0,61,165,0.08)",
    }

    // Nombre display (modo edición o vista)
    const displayName = isEditing
        ? `${editData.firstname} ${editData.lastname}`
        : `${emp?.firstname} ${emp?.lastname}`

    return (
        <div className="flex flex-col w-full px-4 py-6 gap-6 overflow-y-auto min-h-full"
            style={{ background: isDark ? "#0f0f1a" : "#ffffff" }}>

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] mb-1
                        text-blue-500 dark:text-blue-400">
                        Mi Cuenta
                    </p>
                    <h1 className="text-2xl xl:text-3xl font-bold tracking-tight
                        text-gray-900 dark:text-white">
                        Mi Perfil
                    </h1>
                    <p className="text-sm mt-1 text-gray-400 dark:text-gray-500">
                        Tu información personal y detalles de tu rol
                    </p>
                </div>

                {/* Botones de acción */}
                <div className="flex items-center gap-2">
                    {isEditing ? (
                        <>
                            <button
                                onClick={handleCancel}
                                disabled={isSaving}
                                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200"
                                style={{
                                    background: isDark ? "rgba(255,255,255,0.08)" : "#f3f4f6",
                                    border: `1px solid ${isDark ? "rgba(255,255,255,0.15)" : "#d1d5db"}`,
                                    color: isDark ? "rgba(255,255,255,0.7)" : "#374151",
                                }}>
                                <X className="w-4 h-4" />
                                Cancelar
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all duration-200"
                                style={{
                                    background: "linear-gradient(135deg, #003DA5, #00247D)",
                                    opacity: isSaving ? 0.7 : 1,
                                }}>
                                <Save className="w-4 h-4" />
                                {isSaving ? "Guardando..." : "Guardar"}
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all duration-200 hover:opacity-90"
                            style={{
                                background: "linear-gradient(135deg, #003DA5, #00247D)",
                            }}>
                            <Pencil className="w-4 h-4" />
                            Editar perfil
                        </button>
                    )}
                </div>
            </div>

            {/* Mensaje de guardado */}
            {saveMessage && (
                <div className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300"
                    style={{
                        background: saveMessage.type === "success"
                            ? (isDark ? "rgba(16,185,129,0.15)" : "#ecfdf5")
                            : (isDark ? "rgba(239,68,68,0.15)" : "#fef2f2"),
                        border: `1px solid ${saveMessage.type === "success"
                            ? (isDark ? "rgba(16,185,129,0.3)" : "#a7f3d0")
                            : (isDark ? "rgba(239,68,68,0.3)" : "#fecaca")}`,
                        color: saveMessage.type === "success"
                            ? (isDark ? "#34d399" : "#065f46")
                            : (isDark ? "#f87171" : "#991b1b"),
                    }}>
                    {saveMessage.type === "success"
                        ? <ShieldCheck className="w-4 h-4 flex-shrink-0" />
                        : <ShieldAlert className="w-4 h-4 flex-shrink-0" />}
                    {saveMessage.text}
                </div>
            )}

            <div className="h-px w-full"
                style={{ background: isDark ? "rgba(0,61,165,0.15)" : "#d9e2f2" }} />

            {/* Avatar + nombre */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 p-5 rounded-2xl"
                style={heroStyle}>

                <div className="w-20 h-20 rounded-2xl flex items-center justify-center flex-shrink-0
                    text-white text-2xl font-bold"
                    style={{ background: "linear-gradient(135deg, #003DA5, #00247D)" }}>
                    {emp?.firstname?.[0]?.toUpperCase()}{emp?.lastname?.[0]?.toUpperCase()}
                </div>

                <div className="flex flex-col gap-1.5 text-center sm:text-left">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        {displayName}
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{emp?.email}</p>
                    <div className="flex items-center justify-center sm:justify-start gap-2 mt-1 flex-wrap">
                        <span className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${emp?.isverified
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-[rgba(16,185,129,0.12)] dark:text-emerald-400 dark:border-[rgba(16,185,129,0.3)]"
                                : "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-[rgba(245,158,11,0.12)] dark:text-yellow-400 dark:border-[rgba(245,158,11,0.3)]"
                            }`}>
                            {emp?.isverified
                                ? <><ShieldCheck className="w-3 h-3" /> Verificado</>
                                : <><ShieldAlert className="w-3 h-3" /> Sin verificar</>
                            }
                        </span>
                        <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border
                            bg-blue-50 text-blue-700 border-blue-200
                            dark:bg-[rgba(0,61,165,0.15)] dark:text-blue-300 dark:border-[rgba(0,61,165,0.3)]">
                            <Briefcase className="w-3 h-3" /> {emp?.role || "HR"}
                        </span>
                        {emp?.cargo && (
                            <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border
                                bg-blue-50 text-blue-700 border-blue-200
                                dark:bg-[rgba(0,61,165,0.15)] dark:text-blue-300 dark:border-[rgba(0,61,165,0.3)]">
                                {emp?.cargo}
                            </span>
                        )}
                    </div>
                </div>

                <div className="sm:ml-auto flex flex-col items-center sm:items-end gap-1">
                    <p className="text-[10px] font-semibold uppercase tracking-wider"
                        style={{ color: isDark ? "rgba(255,255,255,0.35)" : "rgba(107,114,128,1)" }}>
                        Último acceso
                    </p>
                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                        {formatDate(emp?.lastlogin)}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-600">
                        {formatTime(emp?.lastlogin)}
                    </p>
                </div>
            </div>

            {/* Información personal */}
            <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] mb-3
                    text-blue-500 dark:text-blue-400">
                    Información Personal
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {isEditing ? (
                        <>
                            <EditableField icon={User} label="Nombre" value={editData.firstname}
                                field="firstname" accent="#003DA5" isDark={isDark} onChange={handleEditChange} />
                            <EditableField icon={User} label="Apellido" value={editData.lastname}
                                field="lastname" accent="#003DA5" isDark={isDark} onChange={handleEditChange} />
                            <EditableField icon={Phone} label="Teléfono" value={editData.contactnumber}
                                field="contactnumber" accent="#06b6d4" isDark={isDark} onChange={handleEditChange} />
                        </>
                    ) : (
                        <>
                            <InfoCard icon={User} label="Nombre" value={`${emp?.firstname} ${emp?.lastname}`} accent="#003DA5" isDark={isDark} />
                            <InfoCard icon={Mail} label="Correo" value={emp?.email} accent="#003DA5" isDark={isDark} />
                            <InfoCard icon={Phone} label="Teléfono" value={emp?.contactnumber} accent="#06b6d4" isDark={isDark} />
                        </>
                    )}
                </div>
            </div>

            {/* Detalles del rol */}
            <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] mb-3
                    text-blue-500 dark:text-blue-400">
                    Detalles del Rol
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    <InfoCard icon={Briefcase} label="Rol" value={emp?.role} accent="#003DA5" isDark={isDark} />
                    <InfoCard icon={ShieldCheck} label="Cargo" value={emp?.cargo} accent="#003DA5" isDark={isDark} />
                    <InfoCard icon={Building2} label="Departamento" value={emp?.department?.name || "Sin asignar"} accent="#10b981" isDark={isDark} />
                    <InfoCard icon={CalendarDays} label="Miembro desde" value={formatDate(emp?.createdAt)} accent="#06b6d4" isDark={isDark} />
                    <InfoCard icon={Clock} label="Último acceso" value={`${formatDate(emp?.lastlogin)} · ${formatTime(emp?.lastlogin)}`} accent="#003DA5" isDark={isDark} />
                </div>
            </div>
        </div>
    )
}
