import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { HandleHRProfiles } from "../../../redux/Thunks/HRProfilesThunk.js"
import { Loading } from "../../../components/common/loading.jsx"
import { useToast } from "@/hooks/use-toast"
import { useIsDark } from "../../../hooks/useIsDark.js"
import { ListItemCard } from "../../../components/common/Dashboard/ListItemCard.jsx"
import { CustomSelect } from "../../../components/ui/custom-select.jsx"
import {
    Users, Plus, Trash2,
    ToggleLeft, ToggleRight, X, Shield, ShieldCheck,
    ShieldAlert, Mail, Send
} from "lucide-react"

const MODULES = [
    { key: "employees",   label: "Empleados" },
    { key: "departments", label: "Departamentos" },
    { key: "schedules",   label: "Horarios" },
    { key: "photos",      label: "Fotos" },
    { key: "salaries",    label: "Nóminas" },
    { key: "notices",     label: "Avisos" },
    { key: "leaves",      label: "Ausencias" },
    { key: "requests",    label: "Solicitudes" },
    { key: "attendance",  label: "Asistencia" },
    { key: "recruitment", label: "Reclutamiento" },
    { key: "interviews",  label: "Entrevistas" },
    { key: "hrprofiles",  label: "Perfiles HR" },
]

const ACTIONS = ["create", "read", "update", "delete"]
const ACTION_LABELS = { create: "Crear", read: "Ver", update: "Editar", delete: "Eliminar" }

const ROLE_STYLES = {
    "HR-Admin":   { bg: "rgba(99,102,241,0.15)",  border: "rgba(99,102,241,0.35)", color: "#003DA5",  icon: ShieldCheck },
    "HR-Manager": { bg: "rgba(139,92,246,0.15)",  border: "rgba(139,92,246,0.35)", color: "#8b5cf6",  icon: Shield },
    "HR-Viewer":  { bg: "rgba(100,116,139,0.15)", border: "rgba(100,116,139,0.35)",color: "#64748b",  icon: ShieldAlert },
}

// ── Toggle de permiso ─────────────────────────────────────────────────────
const PermToggle = ({ value, onChange, disabled }) => (
    <button
        onClick={() => !disabled && onChange(!value)}
        disabled={disabled}
        className={`w-8 h-4 rounded-full relative transition-colors duration-200 flex-shrink-0
            ${disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}
        style={{ background: value ? "#003DA5" : "#e2e8f0" }}
    >
        <div
            className="absolute top-0.5 w-3 h-3 rounded-full bg-white shadow-sm transition-all duration-200"
            style={{ left: value ? "18px" : "2px" }}
        />
    </button>
)

// ── Card de perfil HR (usando ListItemCard) ──────────────────────────────
const HRCard = ({ hr, isCurrentUser, onUpdatePermissions, onUpdateRole, onToggleActive, onDelete }) => {
    const [open, setOpen] = useState(false)
    const [localPerms, setLocalPerms] = useState(hr.permissions || {})
    const [saving, setSaving] = useState(false)
    const { toast } = useToast()
    const isDark = useIsDark()

    const isAdmin = hr.role === "HR-Admin"
    const roleStyle = ROLE_STYLES[hr.role] || ROLE_STYLES["HR-Viewer"]
    const RoleIcon = roleStyle.icon

    const handlePermChange = (module, action, value) => {
        setLocalPerms(p => ({
            ...p,
            [module]: { ...p[module], [action]: value }
        }))
    }

    const handleSavePerms = async () => {
        setSaving(true)
        const success = await onUpdatePermissions(hr._id, localPerms)
        setSaving(false)
        if (success) toast({ variant: "success", title: "Permisos guardados" })
        else toast({ variant: "destructive", title: "Error al guardar permisos" })
    }

    const handleRoleChange = async (newRole) => {
        const success = await onUpdateRole(hr._id, newRole)
        if (success) toast({ variant: "success", title: "Rol actualizado" })
        else toast({ variant: "destructive", title: "Error al actualizar rol" })
    }

    // Badge para usuario actual
    const currentUserBadge = isCurrentUser && (
        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full
            bg-blue-50 text-blue-500 dark:bg-[rgba(99,102,241,0.15)] dark:text-blue-300">
            Tú
        </span>
    )

    // Badge de estado inactivo
    const inactiveBadge = !hr.isactive && (
        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full
            bg-red-50 text-red-400 dark:bg-[rgba(239,68,68,0.15)] dark:text-red-300">
            Inactivo
        </span>
    )

    // Badge de verificación pendiente
    const pendingBadge = !hr.isverified && (
        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full
            bg-yellow-50 text-yellow-500 dark:bg-[rgba(252,227,0,0.15)] dark:text-yellow-300">
            Pendiente
        </span>
    )

    // Título con badges
    const titleContent = (
        <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                {hr.firstname} {hr.lastname}
            </p>
            {currentUserBadge}
            {inactiveBadge}
            {pendingBadge}
        </div>
    )

    // Selector de rol (solo si no es Admin ni uno mismo)
    const roleSelector = !isAdmin && !isCurrentUser && (
        <CustomSelect
            value={hr.role}
            onValueChange={handleRoleChange}
            options={[
                { value: "HR-Manager", label: "HR-Manager" },
                { value: "HR-Viewer", label: "HR-Viewer" },
            ]}
            className="text-xs font-semibold px-2 py-1 rounded-lg border border-gray-200 dark:border-[rgba(255,255,255,0.12)] bg-white dark:bg-[rgba(255,255,255,0.05)] text-gray-700 dark:text-gray-300"
        />
    )

    // Badge de Admin
    const adminBadge = isAdmin && (
        <span className="text-xs font-semibold px-2.5 py-1 rounded-lg"
            style={{ background: roleStyle.bg, color: roleStyle.color, border: `1px solid ${roleStyle.border}` }}>
            HR-Admin
        </span>
    )

    // Botones de acción
    const actionButtons = !isAdmin && !isCurrentUser && (
        <>
            <button onClick={() => onToggleActive(hr._id)}
                className="p-1.5 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-[rgba(255,255,255,0.06)]">
                {hr.isactive
                    ? <ToggleRight className="w-5 h-5 text-emerald-500" />
                    : <ToggleLeft  className="w-5 h-5 text-gray-400" />
                }
            </button>
            <button onClick={() => onDelete(hr._id)}
                className="p-1.5 rounded-lg transition-colors hover:bg-red-50 dark:hover:bg-[rgba(239,68,68,0.08)]">
                <Trash2 className="w-4 h-4 text-gray-400 dark:text-gray-500 hover:text-red-400 transition-colors" />
            </button>
        </>
    )

    // Contenido del panel de permisos
    const permissionsContent = (
        <div className="border-t px-4 py-4"
            style={{ borderColor: "rgba(255,255,255,0.04)" }}>
            <div className="overflow-x-auto">
                <table className="w-full text-xs">
                    <thead>
                        <tr>
                            <th className="text-left pb-3 pr-4 font-semibold uppercase tracking-wider
                                text-gray-400 dark:text-gray-500 w-32">
                                Módulo
                            </th>
                            {ACTIONS.map(a => (
                                <th key={a} className="pb-3 px-2 font-semibold uppercase tracking-wider
                                    text-gray-400 dark:text-gray-500 text-center">
                                    {ACTION_LABELS[a]}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 dark:divide-[rgba(255,255,255,0.03)]">
                        {MODULES.map(mod => (
                            <tr key={mod.key}>
                                <td className="py-2 pr-4 font-medium text-gray-600 dark:text-[rgba(255,255,255,0.5)]">
                                    {mod.label}
                                </td>
                                {ACTIONS.map(action => (
                                    <td key={action} className="py-2 px-2 text-center">
                                        <div className="flex justify-center">
                                            <PermToggle
                                                value={localPerms[mod.key]?.[action] ?? false}
                                                onChange={(val) => handlePermChange(mod.key, action, val)}
                                                disabled={isCurrentUser}
                                            />
                                        </div>
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {!isCurrentUser && (
                <div className="flex justify-end mt-4">
                    <button
                        onClick={handleSavePerms}
                        disabled={saving}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold
                            text-white transition-all duration-200 disabled:opacity-50"
                        style={{ background: "linear-gradient(135deg, #003DA5, #8b5cf6)" }}
                    >
                        {saving ? "Guardando..." : "Guardar permisos"}
                    </button>
                </div>
            )}
        </div>
    )

    return (
        <ListItemCard
            accent="blue"
            title={hr.firstname + " " + hr.lastname}
            description={hr.email}
            badge={
                <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                        style={{ background: roleStyle.bg, border: `1px solid ${roleStyle.border}` }}>
                        <RoleIcon className="w-4 h-4" style={{ color: roleStyle.color }} />
                    </div>
                    {roleSelector}
                    {adminBadge}
                </div>
            }
            actions={actionButtons}
            isOpen={open}
            onToggle={!isAdmin ? () => setOpen(p => !p) : undefined}
        >
            {permissionsContent}
        </ListItemCard>
    )
}

// ── Modal de invitación ───────────────────────────────────────────────────
const InviteModal = ({ onClose, onInvite }) => {
    const [form, setForm] = useState({ firstname: "", lastname: "", email: "", role: "HR-Manager" })
    const [sending, setSending] = useState(false)
    const { toast } = useToast()
    const isDark = useIsDark()

    const handleSubmit = async () => {
        if (!form.firstname || !form.lastname || !form.email) {
            toast({ variant: "destructive", title: "Todos los campos son requeridos" })
            return
        }
        setSending(true)
        const success = await onInvite(form)
        setSending(false)
        if (success) {
            toast({ variant: "success", title: "Invitación enviada", description: `Se envió un correo a ${form.email}` })
            onClose()
        } else {
            toast({ variant: "destructive", title: "Error al enviar invitación" })
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.5)" }}
            onClick={onClose}>
            <div className="w-full max-w-md rounded-2xl p-6 flex flex-col gap-4
                bg-white dark:bg-[#0d0d18] border border-gray-100 dark:border-[rgba(99,102,241,0.2)]
                shadow-2xl"
                onClick={e => e.stopPropagation()}>

                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-base font-bold text-gray-900 dark:text-white">
                            Invitar coordinador
                        </h2>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                            Se enviará un correo con el link de acceso
                        </p>
                    </div>
                    <button onClick={onClose}
                        className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-[rgba(255,255,255,0.1)] transition-colors">
                        <X className={`w-4 h-4 ${isDark ? "text-white opacity-90" : "text-gray-400"}`} />
                    </button>
                </div>

                <div className="flex flex-col gap-3">
                    <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1">
                            <label className="text-[11px] font-semibold uppercase tracking-wider
                                text-gray-400 dark:text-gray-500">Nombre</label>
                            <input
                                placeholder="Nombre *"
                                value={form.firstname}
                                onChange={e => setForm(p => ({ ...p, firstname: e.target.value }))}
                                className="input-field w-full"
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-[11px] font-semibold uppercase tracking-wider
                                text-gray-400 dark:text-gray-500">Apellido</label>
                            <input
                                placeholder="Apellido *"
                                value={form.lastname}
                                onChange={e => setForm(p => ({ ...p, lastname: e.target.value }))}
                                className="input-field w-full"
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-[11px] font-semibold uppercase tracking-wider
                            text-gray-400 dark:text-gray-500">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 dark:text-gray-600" />
                            <input
                                type="email"
                                placeholder="correo@ejemplo.com *"
                                value={form.email}
                                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                                className="input-field w-full pl-9"
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-[11px] font-semibold uppercase tracking-wider
                            text-gray-400 dark:text-gray-500">Rol</label>
                        <CustomSelect
                            value={form.role}
                            onValueChange={(val) => setForm(p => ({ ...p, role: val }))}
                            options={[
                                { value: "HR-Manager", label: "HR-Manager" },
                                { value: "HR-Viewer", label: "HR-Viewer" },
                            ]}
                            placeholder="Seleccionar rol"
                            className="input-field w-full"
                        />
                    </div>
                </div>

                <div className="flex gap-3 mt-2">
                    <button
                        onClick={handleSubmit}
                        disabled={sending}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl
                            text-sm font-semibold text-white transition-all duration-200
                            disabled:opacity-50 hover:opacity-90"
                        style={{ background: "linear-gradient(135deg, #003DA5, #8b5cf6)" }}
                    >
                        <Send className="w-4 h-4" />
                        {sending ? "Enviando..." : "Enviar invitación"}
                    </button>
                    <button onClick={onClose}
                        className="px-4 py-2.5 rounded-xl text-sm font-medium border transition-colors
                            text-gray-500 border-gray-200 hover:bg-gray-50
                            dark:text-gray-400 dark:border-[rgba(255,255,255,0.08)]
                            dark:hover:bg-[rgba(255,255,255,0.04)]">
                        Cancelar
                    </button>
                </div>
            </div>
        </div>
    )
}

// ── Página principal ──────────────────────────────────────────────────────
export const HRProfilesPage = () => {
    const dispatch = useDispatch()
    const { toast } = useToast()
    const { data: profiles, isLoading } = useSelector(s => s.HRProfilesReducer)
    const currentHRId = useSelector(s => s.HRReducer.data?.HRid)
    const [showInvite, setShowInvite] = useState(false)

    useEffect(() => {
        dispatch(HandleHRProfiles({ type: "GetAll" }))
    }, [])

    const handleInvite = async (data) => {
        const res = await dispatch(HandleHRProfiles({ type: "Invite", data }))
        return res.payload?.success
    }

    const handleUpdatePermissions = async (hrID, permissions) => {
        const res = await dispatch(HandleHRProfiles({ type: "UpdatePermissions", data: { hrID, permissions } }))
        return res.payload?.success
    }

    const handleUpdateRole = async (hrID, role) => {
        const res = await dispatch(HandleHRProfiles({ type: "UpdateRole", data: { hrID, role } }))
        return res.payload?.success
    }

    const handleToggleActive = async (hrID) => {
        const res = await dispatch(HandleHRProfiles({ type: "ToggleActive", data: { hrID } }))
        if (res.payload?.success) {
            toast({ variant: "success", title: res.payload.message })
        } else {
            toast({ variant: "destructive", title: "Error", description: res.payload?.message })
        }
    }

    const handleDelete = async (hrID) => {
        const res = await dispatch(HandleHRProfiles({ type: "Delete", data: { hrID } }))
        if (res.payload?.success) {
            toast({ variant: "success", title: "Perfil eliminado" })
        } else {
            toast({ variant: "destructive", title: "Error", description: res.payload?.message })
        }
    }

    if (isLoading && profiles.length === 0) return <Loading />

    return (
        <div className="flex flex-col w-full px-4 py-6 gap-6 overflow-y-auto
            bg-white dark:bg-[#0f0f1a] min-h-full">

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] mb-1
                        text-blue-500 dark:text-blue-400">
                        Administración
                    </p>
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl xl:text-3xl font-bold tracking-tight
                            text-gray-900 dark:text-white">
                            Perfiles HR
                        </h1>
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold
                            bg-blue-50 text-blue-600 border border-blue-100
                            dark:bg-[rgba(99,102,241,0.12)] dark:text-blue-300
                            dark:border-[rgba(99,102,241,0.2)]">
                            {profiles.length} total
                        </span>
                    </div>
                    <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                        Gestiona los coordinadores y sus permisos de acceso
                    </p>
                </div>

                <button
                    onClick={() => setShowInvite(true)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl self-start sm:self-auto
                        text-sm font-semibold text-white transition-all duration-200
                        hover:opacity-90 active:scale-95"
                    style={{ background: "linear-gradient(135deg, #003DA5, #8b5cf6)" }}
                >
                    <Plus className="w-4 h-4" />
                    Invitar coordinador
                </button>
            </div>

            <div className="h-px w-full bg-gray-100 dark:bg-[rgba(99,102,241,0.08)]" />

            {/* Lista de perfiles */}
            {profiles.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center
                        bg-blue-50 dark:bg-[rgba(99,102,241,0.1)]">
                        <Users className="w-7 h-7 text-blue-300 dark:text-blue-600" />
                    </div>
                    <p className="text-base font-semibold text-gray-400 dark:text-gray-500">
                        Sin perfiles HR adicionales
                    </p>
                    <p className="text-sm text-gray-300 dark:text-gray-700 text-center max-w-xs">
                        Invita coordinadores para que puedan acceder al sistema
                    </p>
                </div>
            ) : (
                <div className="flex flex-col gap-3">
                    {profiles.map(hr => (
                        <HRCard
                            key={hr._id}
                            hr={hr}
                            isCurrentUser={hr._id === currentHRId}
                            onUpdatePermissions={handleUpdatePermissions}
                            onUpdateRole={handleUpdateRole}
                            onToggleActive={handleToggleActive}
                            onDelete={handleDelete}
                        />
                    ))}
                </div>
            )}

            {showInvite && (
                <InviteModal
                    onClose={() => setShowInvite(false)}
                    onInvite={handleInvite}
                />
            )}
        </div>
    )
}
