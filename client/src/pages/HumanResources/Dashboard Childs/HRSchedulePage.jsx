import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { HandleHRSchedule } from "../../../redux/Thunks/HRScheduleThunk.js"
import { HandleGetHREmployees } from "../../../redux/Thunks/HREmployeesThunk.js"
import { Loading } from "../../../components/common/loading.jsx"
import { useToast } from "@/hooks/use-toast"
import { useHRAuth } from "../../../hooks/useHRAuth.js"
import { ListItemCard, StatusBadge } from "../../../components/common/Dashboard/ListItemCard.jsx"
import {
    Plus, Trash2, CalendarDays, ChevronDown, ChevronUp,
    Users, ClipboardList, X, CheckCircle2, Circle,
    Pencil, ToggleLeft, ToggleRight, Copy
} from "lucide-react"

const DAYS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"]

const emptyTask = () => ({ title: "", description: "", starttime: "", endtime: "" })
const emptyDay  = () => ({ day: "Lunes", tasks: [emptyTask()] })

const formatDate = (d) => d ? new Date(d).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" }) : ""

// ── Card de horario en la lista (usando ListItemCard) ───────────────────
const ScheduleCard = ({ schedule, employees, onDelete, onToggle, onEdit, onDuplicate, isViewer = false }) => {
    const [open, setOpen] = useState(false)
    const assignedEmployee = employees?.find(e => e._id === schedule.employee?._id || e._id === schedule.employee)

    const allTasks  = schedule.schedule?.flatMap(d => d.tasks) || []
    const completed = allTasks.filter(t => t.completed).length

    // Botones de acción (sin el toggle de expandir - se maneja en ListItemCard)
    const actionButtons = isViewer ? null : (
        <>
            <button
                onClick={() => onDuplicate(schedule)}
                title="Copiar horario"
                className="p-1.5 rounded-lg transition-colors duration-150 hover:bg-gray-100 dark:hover:bg-[rgba(255,255,255,0.06)]"
            >
                <Copy className="w-4 h-4 text-gray-400 hover:text-blue-500 transition-colors" />
            </button>
            <button
                onClick={() => onToggle(schedule)}
                title={schedule.isactive ? "Desactivar" : "Activar"}
                className="p-1.5 rounded-lg transition-colors duration-150 hover:bg-gray-100 dark:hover:bg-[rgba(255,255,255,0.06)]"
            >
                {schedule.isactive
                    ? <ToggleRight className="w-5 h-5 text-emerald-500" />
                    : <ToggleLeft  className="w-5 h-5 text-gray-400" />
                }
            </button>
            <button
                onClick={() => onEdit(schedule)}
                className="p-1.5 rounded-lg transition-colors duration-150 hover:bg-gray-100 dark:hover:bg-[rgba(255,255,255,0.06)]"
            >
                <Pencil className="w-4 h-4 text-gray-400 hover:text-blue-500 transition-colors" />
            </button>
            <button
                onClick={() => onDelete(schedule._id)}
                className="p-1.5 rounded-lg transition-colors duration-150 hover:bg-red-50 dark:hover:bg-[rgba(239,68,68,0.08)]"
            >
                <Trash2 className="w-4 h-4 text-gray-400 dark:text-gray-500 hover:text-red-400 transition-colors" />
            </button>
        </>
    )

    // Contenido del header - Misma info que versión anterior
    const headerContent = (
        <div className="flex items-center gap-3 flex-wrap">
            {assignedEmployee && (
                <div className="flex items-center gap-1">
                    <Users className="w-3 h-3 text-blue-400" />
                    <span className="text-[11px] text-blue-500 dark:text-blue-400 font-medium">
                        {assignedEmployee.firstname} {assignedEmployee.lastname}
                    </span>
                </div>
            )}
            <div className="flex items-center gap-1">
                <CalendarDays className="w-3 h-3 text-gray-300 dark:text-gray-600" />
                <span className="text-[11px] text-gray-400 dark:text-gray-600">
                    {formatDate(schedule.startdate)} → {formatDate(schedule.enddate)}
                </span>
            </div>
            <div className="flex items-center gap-1">
                <ClipboardList className="w-3 h-3 text-gray-300 dark:text-gray-600" />
                <span className="text-[11px] text-gray-400 dark:text-gray-600">
                    {completed}/{allTasks.length} tareas
                </span>
            </div>
        </div>
    )

    // Contenido expandable - CON BORDES VISIBLES como versión anterior
    const expandableContent = (
        <div className="flex flex-col gap-2">
            {schedule.schedule?.map(day => (
                <div key={day._id} className="flex flex-col gap-1.5">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-blue-500 dark:text-blue-400">
                        {day.day}
                    </p>
                    {day.tasks.map(task => (
                        <div key={task._id}
                            className="flex items-start gap-2 px-3 py-2 rounded-xl
                                bg-gray-50 dark:bg-[rgba(255,255,255,0.03)]
                                border border-gray-100 dark:border-[rgba(255,255,255,0.04)]">
                            {task.completed
                                ? <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 text-emerald-500 flex-shrink-0" />
                                : <Circle       className="w-3.5 h-3.5 mt-0.5 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                            }
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-gray-700 dark:text-[rgba(255,255,255,0.7)]">
                                    {task.title}
                                </p>
                                {task.description && (
                                    <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                                        {task.description}
                                    </p>
                                )}
                            </div>
                            <span className="text-[11px] text-gray-500 dark:text-gray-400 flex-shrink-0">
                                {task.starttime}–{task.endtime}
                            </span>
                        </div>
                    ))}
                </div>
            ))}
        </div>
    )

    // Verificar si el horario está vencido
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const endDate = new Date(schedule.enddate)
    endDate.setHours(0, 0, 0, 0)
    const isExpired = endDate < today
    const isActive = schedule.isactive && !isExpired

    return (
        <ListItemCard
            accent="blue"
            title={schedule.title}
            description={schedule.description}
            badge={<StatusBadge active={isActive} />}
            actions={actionButtons}
            headerMeta={headerContent}
            isOpen={open}
            onToggle={() => setOpen(p => !p)}
        >
            {expandableContent}
        </ListItemCard>
    )
}

// ── Editor de tareas dentro del formulario ────────────────────────────────
const TaskEditor = ({ task, index, onChange, onRemove, canRemove }) => (
    <div className="flex flex-col gap-2 p-3 rounded-xl
        bg-gray-50 border border-gray-100
        dark:bg-[rgba(255,255,255,0.02)] dark:border-[rgba(255,255,255,0.05)]">
        <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                Tarea {index + 1}
            </p>
            {canRemove && (
                <button onClick={onRemove} className="text-red-400 hover:text-red-500 transition-colors">
                    <X className="w-3.5 h-3.5" />
                </button>
            )}
        </div>
        <input
            placeholder="Título de la tarea *"
            value={task.title}
            onChange={e => onChange("title", e.target.value)}
            className="input-field"
        />
        <input
            placeholder="Descripción (opcional)"
            value={task.description}
            onChange={e => onChange("description", e.target.value)}
            className="input-field"
        />
        <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col gap-1">
                <label className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                    Inicio
                </label>
                <input type="time" value={task.starttime}
                    onChange={e => onChange("starttime", e.target.value)}
                    className="input-field" />
            </div>
            <div className="flex flex-col gap-1">
                <label className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                    Fin
                </label>
                <input type="time" value={task.endtime}
                    onChange={e => onChange("endtime", e.target.value)}
                    className="input-field" />
            </div>
        </div>
    </div>
)

// ── Editor de día dentro del formulario ──────────────────────────────────
const DayEditor = ({ dayItem, dayIndex, onChange, onRemove, canRemove }) => {
    const updateTask = (taskIndex, field, value) => {
        const updated = dayItem.tasks.map((t, i) =>
            i === taskIndex ? { ...t, [field]: value } : t
        )
        onChange(dayIndex, "tasks", updated)
    }

    const addTask = () => {
        onChange(dayIndex, "tasks", [...dayItem.tasks, emptyTask()])
    }

    const removeTask = (taskIndex) => {
        onChange(dayIndex, "tasks", dayItem.tasks.filter((_, i) => i !== taskIndex))
    }

    return (
        <div className="rounded-2xl overflow-hidden border
            border-gray-100 dark:border-[rgba(255,255,255,0.06)]
            bg-white dark:bg-[rgba(255,255,255,0.02)]">

            {/* Header del día */}
            <div className="flex items-center justify-between px-4 py-3 border-b
                border-gray-50 dark:border-[rgba(255,255,255,0.04)]">
                <div className="flex items-center gap-2">
                    <CalendarDays className="w-4 h-4 text-blue-400" />
                    <select
                        value={dayItem.day}
                        onChange={e => onChange(dayIndex, "day", e.target.value)}
                        className="text-sm font-semibold bg-transparent outline-none cursor-pointer
                            text-gray-900 dark:text-white"
                    >
                        {DAYS.map(d => (
                            <option key={d} value={d}
                                className="bg-white dark:bg-[#1a1a2e] text-gray-900 dark:text-white">
                                {d}
                            </option>
                        ))}
                    </select>
                </div>
                {canRemove && (
                    <button onClick={() => onRemove(dayIndex)}
                        className="text-xs text-red-400 hover:text-red-500 flex items-center gap-1 transition-colors">
                        <X className="w-3.5 h-3.5" /> Eliminar día
                    </button>
                )}
            </div>

            {/* Tareas */}
            <div className="p-4 flex flex-col gap-3">
                {dayItem.tasks.map((task, taskIndex) => (
                    <TaskEditor
                        key={taskIndex}
                        task={task}
                        index={taskIndex}
                        onChange={(field, value) => updateTask(taskIndex, field, value)}
                        onRemove={() => removeTask(taskIndex)}
                        canRemove={dayItem.tasks.length > 1}
                    />
                ))}
                <button
                    onClick={addTask}
                    className="flex items-center gap-1.5 text-xs font-semibold text-blue-500
                        hover:text-blue-600 transition-colors duration-150 w-fit"
                >
                    <Plus className="w-3.5 h-3.5" /> Agregar tarea
                </button>
            </div>
        </div>
    )
}

// ── Formulario de creación / edición ─────────────────────────────────────
const ScheduleForm = ({ employees, onSubmit, onCancel, editingSchedule, viewMode }) => {
    const isEdit = !!editingSchedule && !!editingSchedule._id
  
    // Verificar si es una copia (tiene schedule pero no tiene _id)
    const isDuplicated = viewMode === "duplicate" || (!!editingSchedule && !editingSchedule._id)

    const [form, setForm] = useState({
        title:       editingSchedule?.title       || "",
        description: editingSchedule?.description || "",
        employee:    editingSchedule?.employee?._id || editingSchedule?.employee || "",
        startdate:   (editingSchedule?.startdate?.split("T")[0]) || "",
        enddate:     (editingSchedule?.enddate?.split("T")[0])   || "",
        isactive:    editingSchedule?.isactive ?? true,
        schedule:    editingSchedule?.schedule?.map(d => ({
                day:   d.day,
                tasks: d.tasks.map(t => ({
                    title:       t.title,
                    description: t.description || "",
                    starttime:   t.starttime,
                    endtime:     t.endtime
                }))
            })) || [emptyDay()]
    })

    const updateDay = (dayIndex, field, value) => {
        setForm(p => ({
            ...p,
            schedule: p.schedule.map((d, i) =>
                i === dayIndex ? { ...d, [field]: value } : d
            )
        }))
    }

    const addDay = () => setForm(p => ({ ...p, schedule: [...p.schedule, emptyDay()] }))

    const removeDay = (dayIndex) => {
        setForm(p => ({ ...p, schedule: p.schedule.filter((_, i) => i !== dayIndex) }))
    }

    const handleSubmit = () => {
        // Para duplicados, solo requerir título y empleado (fechas opcionales)
        if (isDuplicated) {
            if (!form.title || !form.employee) return
            onSubmit({ ...form, scheduleID: editingSchedule?._id })
        } else if (isEdit) {
            if (!form.title || !form.employee || !form.startdate || !form.enddate) return
            onSubmit({ ...form, scheduleID: editingSchedule?._id })
        } else {
            if (!form.title || !form.employee || !form.startdate || !form.enddate) return
            onSubmit(form)
        }
    }

    return (
        <div className="flex flex-col gap-5">

            {/* Datos generales */}
            <div className="rounded-2xl p-5 flex flex-col gap-4
                bg-gray-50 border border-gray-100
                dark:bg-[rgba(255,255,255,0.02)] dark:border-[rgba(255,255,255,0.06)]">

                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-blue-500 dark:text-blue-400">
                    Información general
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="sm:col-span-2">
                        <input
                            placeholder="Título del horario *"
                            value={form.title}
                            onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                            className="input-field w-full"
                        />
                    </div>
                    <div className="sm:col-span-2">
                        <input
                            placeholder="Descripción (opcional)"
                            value={form.description}
                            onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                            className="input-field w-full"
                        />
                    </div>

                    {/* Empleado */}
                    <div className="sm:col-span-2">
                        <select
                            value={form.employee}
                            onChange={e => setForm(p => ({ ...p, employee: e.target.value }))}
                            className="input-field w-full"
                        >
                            <option value="">Seleccionar empleado *</option>
                            {(employees || []).map(emp => (
                                <option key={emp._id} value={emp._id}
                                    className="bg-white dark:bg-[#1a1a2e]">
                                    {emp.firstname} {emp.lastname}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Fechas */}
                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-semibold uppercase tracking-wider
                            text-gray-400 dark:text-gray-500">
                            Fecha inicio *
                        </label>
                        <input type="date" value={form.startdate}
                            onChange={e => setForm(p => ({ ...p, startdate: e.target.value }))}
                            className="input-field w-full" />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-semibold uppercase tracking-wider
                            text-gray-400 dark:text-gray-500">
                            Fecha fin *
                        </label>
                        <input type="date" value={form.enddate}
                            onChange={e => setForm(p => ({ ...p, enddate: e.target.value }))}
                            className="input-field w-full" />
                    </div>

                    {/* Activo */}
                    <div className="sm:col-span-2 flex items-center gap-3">
                        <button
                            onClick={() => setForm(p => ({ ...p, isactive: !p.isactive }))}
                            className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400"
                        >
                            {form.isactive
                                ? <ToggleRight className="w-5 h-5 text-emerald-500" />
                                : <ToggleLeft  className="w-5 h-5 text-gray-400" />
                            }
                            Horario {form.isactive ? "activo" : "inactivo"}
                        </button>
                    </div>
                </div>
            </div>

            {/* Días y tareas */}
            <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-blue-500 dark:text-blue-400">
                        Días y tareas
                    </p>
                    <button
                        onClick={addDay}
                        className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl
                            bg-blue-50 text-blue-600 border border-blue-100 hover:bg-blue-100
                            dark:bg-[rgba(99,102,241,0.1)] dark:text-blue-400
                            dark:border-[rgba(99,102,241,0.2)] dark:hover:bg-[rgba(99,102,241,0.15)]
                            transition-colors duration-150"
                    >
                        <Plus className="w-3.5 h-3.5" /> Agregar día
                    </button>
                </div>

                {form.schedule.map((day, i) => (
                    <DayEditor
                        key={i}
                        dayItem={day}
                        dayIndex={i}
                        onChange={updateDay}
                        onRemove={removeDay}
                        canRemove={form.schedule.length > 1}
                    />
                ))}
            </div>

            {/* Botones */}
            <div className="flex gap-3 sticky bottom-0 pb-4 pt-2
                bg-white dark:bg-[#0f0f1a]">
                <button
                    onClick={handleSubmit}
                    disabled={!form.title || !form.employee || !form.startdate || !form.enddate}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold
                        text-white transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed
                        hover:opacity-90 active:scale-95"
                    style={{ background: "linear-gradient(135deg, #003DA5, #8b5cf6)" }}
                >
                    <CheckCircle2 className="w-4 h-4" />
                    {isEdit ? "Guardar cambios" : "Crear horario"}
                </button>
                <button
                    onClick={onCancel}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium
                        border transition-all duration-200
                        text-gray-500 border-gray-200 hover:bg-gray-50
                        dark:text-gray-400 dark:border-[rgba(255,255,255,0.08)]
                        dark:hover:bg-[rgba(255,255,255,0.04)]"
                >
                    <X className="w-4 h-4" /> Cancelar
                </button>
            </div>
        </div>
    )
}

// ── Página principal ──────────────────────────────────────────────────────
export const HRSchedulePage = () => {
    const dispatch = useDispatch()
    const { toast }     = useToast()
    const { isViewer: isHRViewer } = useHRAuth()
    const scheduleState = useSelector(s => s.HRScheduleReducer)
    const employeesState = useSelector(s => s.HREmployeesPageReducer)

    // "list" | "create" | "edit"
    const [view, setView] = useState("list")
    const [editingSchedule, setEditingSchedule] = useState(null)

    useEffect(() => {
        dispatch(HandleHRSchedule({ type: "GetAll" }))
        dispatch(HandleGetHREmployees({ apiroute: "GETALL" }))
    }, [])

    const handleCreate = async (data) => {
        // Si es una copia (tiene scheduleID), usar el endpoint de duplicar
        if (data.scheduleID) {
            const res = await dispatch(HandleHRSchedule({ 
                type: "Duplicate", 
                data: { scheduleID: data.scheduleID, ...data } 
            }))
            if (res.payload?.success) {
                toast({ variant: "success", title: "Horario copiado", description: res.payload.message })
                setView("list")
            } else {
                toast({ variant: "destructive", title: "Error", description: res.payload?.message })
            }
        } else {
            const res = await dispatch(HandleHRSchedule({ type: "Create", data }))
            if (res.payload?.success) {
                toast({ variant: "success", title: "Horario creado", description: res.payload.message })
                setView("list")
            } else {
                toast({ variant: "destructive", title: "Error", description: res.payload?.message })
            }
        }
    }

    const handleUpdate = async (data) => {
        const res = await dispatch(HandleHRSchedule({ type: "Update", data }))
        if (res.payload?.success) {
            toast({ variant: "success", title: "Horario actualizado", description: res.payload.message })
            setView("list")
            setEditingSchedule(null)
        } else {
            toast({ variant: "destructive", title: "Error", description: res.payload?.message })
        }
    }

    const handleDelete = async (scheduleID) => {
        const res = await dispatch(HandleHRSchedule({ type: "Delete", data: { scheduleID } }))
        if (res.payload?.success) {
            toast({ variant: "success", title: "Horario eliminado" })
        } else {
            toast({ variant: "destructive", title: "Error", description: res.payload?.message })
        }
    }

    const handleToggle = async (schedule) => {
        // No permitir activar horarios vencidos
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const endDate = new Date(schedule.enddate)
        endDate.setHours(0, 0, 0, 0)
        
        if (!schedule.isactive && endDate < today) {
            toast({
                variant: "destructive",
                title: "No se puede activar",
                description: "El horario está vencido"
            })
            return
        }
        
        const res = await dispatch(HandleHRSchedule({
            type: "Update",
            data: { scheduleID: schedule._id, isactive: !schedule.isactive }
        }))
        if (res.payload?.success) {
            toast({
                variant: "success",
                title: `Horario ${!schedule.isactive ? "activado" : "desactivado"}`
            })
        }
    }

    const handleEdit = (schedule) => {
        setEditingSchedule(schedule)
        setView("edit")
    }

    const handleDuplicate = async (schedule) => {
        // Extraer los datos del horario para precargar el formulario
        const duplicatedData = {
            title: `${schedule.title} (Copia)`,
            description: schedule.description || "",
            employee: schedule.employee?._id || schedule.employee || "",
            startdate: "", // Vacío como solicitaste
            enddate: "",   // Vacío como solicitaste
            schedule: schedule.schedule.map(d => ({
                day: d.day,
                tasks: d.tasks.map(t => ({
                    title: t.title,
                    description: t.description || "",
                    starttime: t.starttime,
                    endtime: t.endtime
                }))
            }))
        }
        setEditingSchedule(duplicatedData)
        setView("duplicate")
    }

    const schedules  = scheduleState.data || []
    const employees  = employeesState.data || []
    const isLoading  = scheduleState.isLoading

    if (isLoading && schedules.length === 0) return <Loading />

    return (
        <div className="flex flex-col w-full px-4 py-6 gap-6 overflow-y-auto
            bg-white dark:bg-[#0f0f1a] min-h-full">

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] mb-1
                        text-blue-500 dark:text-blue-400">
                        Gestión de personal
                    </p>
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl xl:text-3xl font-bold tracking-tight
                            text-gray-900 dark:text-white">
                            {view === "list"     ? "Horarios"          : ""}
                            {view === "create"    ? "Nuevo horario"     : ""}
                            {view === "edit"      ? "Editar horario"   : ""}
                            {view === "duplicate" ? "Copiar horario"  : ""}
                        </h1>
                        {view === "list" && (
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold
                                bg-blue-50 text-blue-600 border border-blue-100
                                dark:bg-[rgba(99,102,241,0.12)] dark:text-blue-300
                                dark:border-[rgba(99,102,241,0.2)]">
                                {schedules.length} total
                            </span>
                        )}
                    </div>
                </div>

                {view === "list" && !isHRViewer && (
                    <button
                        onClick={() => setView("create")}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl self-start sm:self-auto
                            text-sm font-semibold text-white transition-all duration-200
                            hover:opacity-90 active:scale-95"
                        style={{ background: "linear-gradient(135deg, #003DA5, #8b5cf6)" }}
                    >
                        <Plus className="w-4 h-4" />
                        Nuevo horario
                    </button>
                )}
            </div>

            <div className="h-px w-full bg-gray-100 dark:bg-[rgba(99,102,241,0.08)]" />

            {/* ── Vista Lista ──────────────────────────────────────────── */}
            {view === "list" && (
                <div className="flex flex-col gap-3">
                    {schedules.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-3">
                            <div className="w-14 h-14 rounded-2xl flex items-center justify-center
                                bg-blue-50 dark:bg-[rgba(99,102,241,0.1)]">
                                <ClipboardList className="w-7 h-7 text-blue-300 dark:text-blue-500" />
                            </div>
                            <p className="text-base font-semibold text-gray-400 dark:text-gray-500">
                                Sin horarios creados
                            </p>
                            <p className="text-sm text-gray-300 dark:text-gray-700 text-center max-w-xs">
                                Crea el primer horario y asígnalo a un empleado
                            </p>
                        </div>
                    ) : (
                        schedules.map(s => (
                            <ScheduleCard
                                key={s._id}
                                schedule={s}
                                employees={employees}
                                onDelete={handleDelete}
                                onToggle={handleToggle}
                                onEdit={handleEdit}
                                onDuplicate={handleDuplicate}
                                isViewer={isHRViewer}
                            />
                        ))
                    )}
                </div>
            )}

            {/* ── Vista Crear ──────────────────────────────────────────── */}
            {view === "create" && (
                <ScheduleForm
                    employees={employees}
                    onSubmit={handleCreate}
                    onCancel={() => setView("list")}
                    editingSchedule={null}
                    viewMode="create"
                />
            )}

            {/* ── Vista Copiar ──────────────────────────────────────────── */}
            {view === "duplicate" && (
                <ScheduleForm
                    employees={employees}
                    onSubmit={handleCreate}
                    onCancel={() => { setView("list"); setEditingSchedule(null) }}
                    editingSchedule={editingSchedule}
                    viewMode="duplicate"
                />
            )}

            {/* ── Vista Editar ─────────────────────────────────────────── */}
            {view === "edit" && editingSchedule && (
                <ScheduleForm
                    employees={employees}
                    onSubmit={handleUpdate}
                    onCancel={() => { setView("list"); setEditingSchedule(null) }}
                    editingSchedule={editingSchedule}
                    viewMode="edit"
                />
            )}
        </div>
    )
}
