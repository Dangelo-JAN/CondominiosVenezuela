import {
    Dialog,
    DialogContent,
    DialogClose,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { CommonStateHandler } from "../../../utils/commonhandler.js"
import { useDispatch, useSelector } from "react-redux"
import { useIsDark } from "../../../hooks/useIsDark.js"
import { FormSubmitToast } from "./Toasts.jsx"
import { Loading } from "../loading.jsx"
import { HandleDeleteHREmployees, HandlePostHREmployees } from "../../../redux/Thunks/HREmployeesThunk.js"
import { HandlePostHRDepartments, HandlePatchHRDepartments, HandleDeleteHRDepartments } from "../../../redux/Thunks/HRDepartmentPageThunk.js"
import { HandleUpdateHRLeaveStatus } from "../../../redux/Thunks/HRLeavesThunk.js"
import { useToast } from "../../../hooks/use-toast.js"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import { fetchEmployeesIDs } from "../../../redux/Thunks/EmployeesIDsThunk.js"
import { UserPlus, Trash2, Eye, Building2, Users, X, Check, CheckCircle, XCircle, Calendar } from "lucide-react"
import { RichTextEditor } from "./RichTextEditor.jsx"

// ── Shared input style helper ──────────────────────────────────────────────
const inputCls = `w-full rounded-xl px-3 py-2 text-sm outline-none transition-all duration-200
    bg-gray-50 border border-gray-200 text-gray-900
    focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100
    dark:bg-[rgba(255,255,255,0.04)] dark:border-[rgba(255,255,255,0.08)] dark:text-white
    dark:focus:border-[rgba(0,61,165,0.5)] dark:focus:bg-[rgba(0,61,165,0.06)] dark:focus:ring-0`

const labelCls = `text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-[rgba(255,255,255,0.4)]`

const SectionLabel = ({ children }) => (
    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-500 dark:text-blue-400 mb-3">
        {children}
    </p>
)

// ── Add Employees ──────────────────────────────────────────────────────────
export const AddEmployeesDialogBox = () => {
    const dispatch = useDispatch()
    const [formdata, setformdata] = useState({
        firstname: "", lastname: "", email: "",
        contactnumber: "", textpassword: "", password: "",
    })
    const { toast } = useToast()

    console.log("[LOG CLIENT] AddEmployeesDialogBox - formdata state:", formdata)

    const handleformchange = (event) => {
        console.log("[LOG CLIENT] handleformchange - event:", event.target.name, event.target.value)
        CommonStateHandler(formdata, setformdata, event)
    }

    const handleSubmit = async () => {
        try {
            console.log("[LOG CLIENT] handleSubmit - ejecutando...")
            console.log("[LOG CLIENT] handleSubmit - formdata:", formdata)

            console.log("[LOG CLIENT] handleSubmit - dispatching HandlePostHREmployees...")

            // CORREGIDO: usar dispatch() para async thunks - siempre envía todos los datos
            const result = await dispatch(HandlePostHREmployees({ apiroute: "ADDEMPLOYEE", data: formdata }))

            console.log("[LOG CLIENT] handleSubmit - result:", result)

            if (result.error) {
                console.error("[LOG CLIENT] handleSubmit - ERROR:", result.payload)
                throw new Error(result.payload?.message || "Error al procesar")
            }

            toast({ variant: "success", title: "Empleado registrado", description: `${formdata.firstname} ${formdata.lastname} ha sido agregado. Se envió un correo de verificación automáticamente.` })

            // Limpiar formulario
            setformdata({ firstname: "", lastname: "", email: "", contactnumber: "", textpassword: "", password: "" })
        } catch (error) {
            console.error("[LOG CLIENT] handleSubmit - ERROR:", error)
            toast({ variant: "destructive", title: "Error", description: error.message || "Error al procesar la solicitud" })
        }
    }

    return (
        <Dialog>
            <DialogTrigger className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-200
                bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200
                dark:bg-[rgba(0,61,165,0.8)] dark:hover:bg-[rgba(0,61,165,1)] dark:shadow-[0_4px_16px_rgba(0,61,165,0.25)]">
                <UserPlus className="w-4 h-4" />
                Agregar Empleado
            </DialogTrigger>

            <DialogContent className="max-w-[340px] sm:max-w-[560px]
                bg-white border border-gray-100 shadow-2xl rounded-2xl
                dark:bg-[#13131f] dark:border-[rgba(0,61,165,0.15)]">
                <div className="flex flex-col gap-5 p-1">
                    <div>
                        <SectionLabel>Nuevo Empleado</SectionLabel>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Información del empleado</h2>
                        <p className="text-sm text-gray-400 dark:text-[rgba(255,255,255,0.3)] mt-1">
                            Completa todos los campos para registrar al empleado. Se enviará un correo de verificación automáticamente.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                            { id: "firstname", name: "firstname", label: "Nombre", type: "text", value: formdata.firstname },
                            { id: "lastname", name: "lastname", label: "Apellido", type: "text", value: formdata.lastname },
                            { id: "email", name: "email", label: "Correo electrónico", type: "email", value: formdata.email },
                            { id: "contactnumber", name: "contactnumber", label: "Teléfono", type: "number", value: formdata.contactnumber },
                        ].map(field => (
                            <div key={field.id} className="flex flex-col gap-1.5">
                                <label htmlFor={field.id} className={labelCls}>{field.label}</label>
                                <input
                                    id={field.id} name={field.name} type={field.type}
                                    value={field.value} onChange={handleformchange}
                                    className={inputCls}
                                />
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                            { id: "text-password", name: "textpassword", label: "Contraseña", type: "text", value: formdata.textpassword },
                            { id: "password", name: "password", label: "Confirmar contraseña", type: "password", value: formdata.password },
                        ].map(field => (
                            <div key={field.id} className="flex flex-col gap-1.5">
                                <label htmlFor={field.id} className={labelCls}>{field.label}</label>
                                <input
                                    id={field.id} name={field.name} type={field.type}
                                    value={field.value} onChange={handleformchange}
                                    className={inputCls}
                                />
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-end pt-1">
                        <Button
                            type="button"
                            onClick={handleSubmit}
                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg px-4 py-2"
                        >
                            <UserPlus className="w-4 h-4" />
                            Agregar Empleado
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}

// ── Employee Details ───────────────────────────────────────────────────────
export const EmployeeDetailsDialogBox = ({ EmployeeID }) => {
    const HREmployeesState = useSelector((state) => state.HREmployeesPageReducer)
    const employeeData = HREmployeesState.data?.find((item) => item._id === EmployeeID)

    if (!employeeData) return null

    const initials = `${employeeData.firstname?.slice(0, 1).toUpperCase()}${employeeData.lastname?.slice(0, 1).toUpperCase()}`

    const details = [
        { label: "Nombre", value: employeeData.firstname },
        { label: "Apellido", value: employeeData.lastname },
        { label: "Email", value: employeeData.email },
        { label: "Teléfono", value: employeeData.contactnumber },
        { label: "Departamento", value: employeeData.department ? employeeData.department.name : "Sin asignar" },
    ]

    const stats = [
        { label: "Avisos", value: employeeData.notice?.length ?? 0 },
        { label: "Registros salariales", value: employeeData.salary?.length ?? 0 },
        { label: "Solicitudes de ausencia", value: employeeData.leaverequest?.length ?? 0 },
        { label: "Solicitudes", value: employeeData.generaterequest?.length ?? 0 },
        { label: "Email verificado", value: employeeData.isverified ? "✓ Verificado" : "✗ No verificado" },
    ]

    return (
        <Dialog>
            <DialogTrigger className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200
                text-blue-600 bg-blue-50 border border-blue-100 hover:bg-blue-100
                dark:text-blue-300 dark:bg-[rgba(0,61,165,0.1)] dark:border-[rgba(0,61,165,0.2)] dark:hover:bg-[rgba(0,61,165,0.18)]">
                <Eye className="w-3.5 h-3.5" />
                Ver
            </DialogTrigger>

            <DialogContent className="max-w-[340px] lg:max-w-[580px]
                bg-white border border-gray-100 shadow-2xl rounded-2xl
                dark:bg-[#13131f] dark:border-[rgba(0,61,165,0.15)]">
                <div className="flex flex-col gap-5 p-1">
                    {/* Profile header */}
                    <div className="flex items-center gap-4 pb-4 border-b border-gray-100 dark:border-[rgba(0,61,165,0.1)]">
                        <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-lg font-bold flex-shrink-0
                            bg-blue-100 text-blue-600
                            dark:bg-[rgba(0,61,165,0.15)] dark:text-blue-300">
                            {initials}
                        </div>
                        <div>
                            <p className="text-lg font-bold text-gray-900 dark:text-white">
                                {`${employeeData.firstname} ${employeeData.lastname}`}
                            </p>
                            <p className="text-sm text-gray-400 dark:text-[rgba(255,255,255,0.35)]">
                                {employeeData.email}
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Personal info */}
                        <div className="flex flex-col gap-3">
                            <SectionLabel>Información personal</SectionLabel>
                            {details.map(d => (
                                <div key={d.label} className="flex flex-col gap-0.5">
                                    <p className={labelCls}>{d.label}</p>
                                    <p className="text-sm font-medium text-gray-800 dark:text-[rgba(255,255,255,0.8)]">{d.value}</p>
                                </div>
                            ))}
                        </div>

                        {/* Stats */}
                        <div className="flex flex-col gap-3">
                            <SectionLabel>Estadísticas</SectionLabel>
                            {stats.map(s => (
                                <div key={s.label} className="flex items-center justify-between py-1.5 border-b border-gray-50 dark:border-[rgba(255,255,255,0.04)]">
                                    <p className="text-sm text-gray-500 dark:text-[rgba(255,255,255,0.4)]">{s.label}</p>
                                    <p className="text-sm font-semibold text-gray-800 dark:text-white">{s.value}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}

// ── Delete Employee ────────────────────────────────────────────────────────
export const DeleteEmployeeDialogBox = ({ EmployeeID }) => {
    const dispatch = useDispatch()

    const DeleteEmployee = (EMID) => {
        dispatch(HandleDeleteHREmployees({ apiroute: `DELETE.${EMID}` }))
    }

    return (
        <Dialog>
            <DialogTrigger className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200
                text-red-500 bg-red-50 border border-red-100 hover:bg-red-100
                dark:text-red-400 dark:bg-[rgba(239,68,68,0.08)] dark:border-[rgba(239,68,68,0.15)] dark:hover:bg-[rgba(239,68,68,0.15)]">
                <Trash2 className="w-3.5 h-3.5" />
                Eliminar
            </DialogTrigger>

            <DialogContent className="max-w-[340px]
                bg-white border border-gray-100 shadow-2xl rounded-2xl
                dark:bg-[#13131f] dark:border-[rgba(0,61,165,0.15)]">
                <div className="flex flex-col items-center gap-5 p-1 text-center">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center
                        bg-red-50 dark:bg-[rgba(239,68,68,0.1)]">
                        <Trash2 className="w-7 h-7 text-red-400" />
                    </div>
                    <div>
                        <p className="text-base font-bold text-gray-900 dark:text-white mb-1">
                            ¿Eliminar empleado?
                        </p>
                        <p className="text-sm text-gray-400 dark:text-[rgba(255,255,255,0.35)]">
                            Esta acción no se puede deshacer.
                        </p>
                    </div>
                    <div className="flex gap-3 w-full">
                        <DialogClose asChild>
                            <Button onClick={() => DeleteEmployee(EmployeeID)}
                                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white
                                    bg-red-500 hover:bg-red-600 border-0
                                    dark:bg-[rgba(239,68,68,0.7)] dark:hover:bg-[rgba(239,68,68,0.9)]">
                                <Trash2 className="w-4 h-4" />
                                Eliminar
                            </Button>
                        </DialogClose>
                        <DialogClose asChild>
                            <Button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold
                                text-gray-600 bg-gray-100 hover:bg-gray-200 border-0
                                dark:text-[rgba(255,255,255,0.6)] dark:bg-[rgba(255,255,255,0.05)] dark:hover:bg-[rgba(255,255,255,0.1)]">
                                <X className="w-4 h-4" />
                                Cancelar
                            </Button>
                        </DialogClose>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}

// ── Create Department ──────────────────────────────────────────────────────
export const CreateDepartmentDialogBox = () => {
    const { toast } = useToast()
    const dispatch = useDispatch()
    const [formdata, setformdata] = useState({ name: "", description: "" })

    const handleformchange = (event) => {
        CommonStateHandler(formdata, setformdata, event)
    }

    const CreateDepartment = () => {
        dispatch(HandlePostHRDepartments({ apiroute: "CREATE", data: formdata }))
        setformdata({ name: "", description: "" })
    }

    const ShowToast = () => {
        toast({
            variant: "destructive",
            title: "Campos requeridos",
            description: "Todos los campos son necesarios para crear un departamento.",
        })
    }

    return (
        <Dialog>
            <DialogTrigger className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-200
                bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200
                dark:bg-[rgba(99,102,241,0.8)] dark:hover:bg-[rgba(99,102,241,1)] dark:shadow-[0_4px_16px_rgba(99,102,241,0.25)]">
                <Building2 className="w-4 h-4" />
                Crear Departamento
            </DialogTrigger>

            <DialogContent className="max-w-[340px] lg:max-w-[620px]
                bg-white border border-gray-100 shadow-2xl rounded-2xl
                dark:bg-[#13131f] dark:border-[rgba(0,61,165,0.15)]">
                <div className="flex flex-col gap-5 p-1">
                    <div>
                        <SectionLabel>Nuevo Departamento</SectionLabel>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Crear departamento</h2>
                    </div>

                    <div className="flex flex-col gap-4">
                        <div className="flex flex-col gap-1.5">
                            <label htmlFor="departmentname" className={labelCls}>Nombre del departamento</label>
                            <input
                                id="departmentname" name="name" type="text"
                                value={formdata.name} onChange={handleformchange}
                                placeholder="ej. Recursos Humanos"
                                className={inputCls}
                            />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className={labelCls}>Descripción</label>
                            <RichTextEditor
                                value={formdata.description}
                                onChange={(html) => setformdata({ ...formdata, description: html })}
                            />
                        </div>
                    </div>

                    <div className="flex justify-end">
                        {(formdata.name.trim().length === 0 || formdata.description.trim().length === 0 || formdata.description === "<p></p>") ? (
                            <Button onClick={ShowToast}
                                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white
                                    bg-blue-600 hover:bg-blue-700 border-0">
                                <Check className="w-4 h-4" />
                                Crear
                            </Button>
                        ) : (
                            <DialogClose asChild>
                                <Button onClick={CreateDepartment}
                                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white
                                        bg-blue-600 hover:bg-blue-700 border-0">
                                    <Check className="w-4 h-4" />
                                    Crear
                                </Button>
                            </DialogClose>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}

// ── Employees IDs (Add to Department) ─────────────────────────────────────
export const EmployeesIDSDialogBox = ({ DepartmentID }) => {
    const EmployeesIDState = useSelector((state) => state.EMployeesIDReducer)
    const dispatch = useDispatch()
    const [SelectedEmployeesData, Set_selectedEmployeesData] = useState({
        departmentID: DepartmentID,
        employeeIDArray: [],
    })

    const SelectEmployees = (EMID) => {
        if (SelectedEmployeesData.employeeIDArray.includes(EMID)) {
            Set_selectedEmployeesData({
                ...SelectedEmployeesData,
                employeeIDArray: SelectedEmployeesData.employeeIDArray.filter((item) => item !== EMID)
            })
        } else {
            Set_selectedEmployeesData({
                ...SelectedEmployeesData,
                employeeIDArray: [...SelectedEmployeesData.employeeIDArray, EMID]
            })
        }
    }

    const ClearSelectedEmployeesData = () => {
        Set_selectedEmployeesData({ departmentID: DepartmentID, employeeIDArray: [] })
    }

    const SetEmployees = () => {
        dispatch(HandlePatchHRDepartments({ apiroute: "UPDATE", data: SelectedEmployeesData }))
        ClearSelectedEmployeesData()
    }

    useEffect(() => {
        Set_selectedEmployeesData({ departmentID: DepartmentID, employeeIDArray: [] })
    }, [DepartmentID])

    return (
        <Dialog>
            <DialogTrigger
                onClick={() => dispatch(fetchEmployeesIDs({ apiroute: "GETALL" }))}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition-all duration-200
                    text-blue-600 bg-blue-50 border border-blue-100 hover:bg-blue-100
                    dark:text-blue-300 dark:bg-[rgba(99,102,241,0.1)] dark:border-[rgba(99,102,241,0.2)] dark:hover:bg-[rgba(99,102,241,0.18)]">
                <Users className="w-4 h-4" />
                Agregar Empleados
            </DialogTrigger>

            <DialogContent className="max-w-[340px] lg:max-w-[420px]
                bg-white border border-gray-100 shadow-2xl rounded-2xl
                dark:bg-[#13131f] dark:border-[rgba(0,61,165,0.15)]">
                {EmployeesIDState.isLoading ? <Loading height={"h-auto"} /> : (
                    <div className="flex flex-col gap-5 p-1">
                        <div>
                            <SectionLabel>Asignar personal</SectionLabel>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Seleccionar empleados</h2>
                        </div>

                        <Command className="rounded-xl border border-gray-100 dark:border-[rgba(99,102,241,0.15)] dark:bg-[rgba(255,255,255,0.02)]">
                            <CommandInput placeholder="Buscar empleado..." className="text-sm" />
                            <CommandList className="max-h-52">
                                <CommandEmpty className="text-sm text-gray-400 dark:text-[rgba(255,255,255,0.3)] py-4 text-center">
                                    No se encontraron resultados.
                                </CommandEmpty>
                                <CommandGroup heading="Todos los empleados">
                                    {EmployeesIDState.data ? EmployeesIDState.data.map((item, index) => (
                                        <CommandItem 
                                            key={index} 
                                            onSelect={(e) => e.preventDefault()}
                                            className="cursor-default"
                                        >
                                            <div 
                                                className="flex items-center gap-3 w-full cursor-pointer"
                                                onClick={(e) => { 
                                                    e.stopPropagation(); 
                                                    SelectEmployees(item._id); 
                                                }}
                                            >
                                                <input
                                                    type="checkbox"
                                                    id={`EmployeeID-${index + 1}`}
                                                    className="w-4 h-4 accent-blue-600 cursor-pointer"
                                                    onChange={() => SelectEmployees(item._id)}
                                                    checked={SelectedEmployeesData.employeeIDArray.includes(item._id) || false}
                                                    disabled={!!item.department}
                                                    onClick={(e) => e.stopPropagation()}
                                                />
                                                <label htmlFor={`EmployeeID-${index + 1}`} className="text-sm flex items-center gap-2 cursor-pointer">
                                                    <span className="font-medium text-gray-800 dark:text-white">
                                                        {`${item.firstname} ${item.lastname}`}
                                                    </span>
                                                    {item.department && (
                                                        <span className="text-xs px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-400 dark:bg-[rgba(255,255,255,0.06)] dark:text-[rgba(255,255,255,0.3)]">
                                                            {item.department.name}
                                                        </span>
                                                    )}
                                                </label>
                                            </div>
                                        </CommandItem>
                                    )) : null}
                                </CommandGroup>
                            </CommandList>
                        </Command>

                        <div className="flex gap-3">
                            <DialogClose asChild>
                                <Button onClick={SetEmployees}
                                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white
                                        bg-blue-600 hover:bg-blue-700 border-0">
                                    <Check className="w-4 h-4" />
                                    Agregar
                                </Button>
                            </DialogClose>
                            <DialogClose asChild>
                                <Button onClick={ClearSelectedEmployeesData}
                                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold
                                        text-gray-600 bg-gray-100 hover:bg-gray-200 border-0
                                        dark:text-[rgba(255,255,255,0.6)] dark:bg-[rgba(255,255,255,0.05)] dark:hover:bg-[rgba(255,255,255,0.1)]">
                                    <X className="w-4 h-4" />
                                    Cancelar
                                </Button>
                            </DialogClose>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}

// ── Remove Employee from Department ───────────────────────────────────────
export const RemoveEmployeeFromDepartmentDialogBox = ({ DepartmentName, DepartmentID, EmployeeID }) => {
    const dispatch = useDispatch()

    const RemoveEmployee = (EMID) => {
        dispatch(HandleDeleteHRDepartments({ apiroute: "DELETE", data: { departmentID: DepartmentID, employeeIDArray: [EMID], action: "delete-employee" } }))
    }

    return (
        <Dialog>
            <DialogTrigger className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200
                text-red-500 bg-red-50 border border-red-100 hover:bg-red-100
                dark:text-red-400 dark:bg-[rgba(239,68,68,0.08)] dark:border-[rgba(239,68,68,0.15)] dark:hover:bg-[rgba(239,68,68,0.15)]">
                <X className="w-3.5 h-3.5" />
                Remover
            </DialogTrigger>

            <DialogContent className="max-w-[340px]
                bg-white border border-gray-100 shadow-2xl rounded-2xl
                dark:bg-[#13131f] dark:border-[rgba(0,61,165,0.15)]">
                <div className="flex flex-col items-center gap-5 p-1 text-center">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-red-50 dark:bg-[rgba(239,68,68,0.1)]">
                        <Users className="w-7 h-7 text-red-400" />
                    </div>
                    <div>
                        <p className="text-base font-bold text-gray-900 dark:text-white mb-1">
                            ¿Remover del departamento?
                        </p>
                        <p className="text-sm text-gray-400 dark:text-[rgba(255,255,255,0.35)]">
                            El empleado será removido de <span className="font-semibold text-gray-600 dark:text-white">{DepartmentName}</span>.
                        </p>
                    </div>
                    <div className="flex gap-3 w-full">
                        <DialogClose asChild>
                            <Button onClick={() => RemoveEmployee(EmployeeID)}
                                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white
                                    bg-red-500 hover:bg-red-600 border-0">
                                <X className="w-4 h-4" />
                                Remover
                            </Button>
                        </DialogClose>
                        <DialogClose asChild>
                            <Button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold
                                text-gray-600 bg-gray-100 hover:bg-gray-200 border-0
                                dark:text-[rgba(255,255,255,0.6)] dark:bg-[rgba(255,255,255,0.05)] dark:hover:bg-[rgba(255,255,255,0.1)]">
                                Cancelar
                            </Button>
                        </DialogClose>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}

// ── Leave Actions (Approve/Reject) ────────────────────────────────────────────
export const LeaveActionsDialogBox = ({ LeaveID, EmployeeName }) => {
    const { toast } = useToast()
    const dispatch = useDispatch()
    const HRState = useSelector((state) => state.HRReducer)
    const [selectedAction, setSelectedAction] = useState(null)
    const [isLoading, setIsLoading] = useState(false)

    const HandleUpdateLeaveStatus = (status) => {
        if (!HRState.data?._id) {
            toast({ title: "Error", description: "No se pudo obtener el ID del HR", variant: "destructive" })
            return
        }

        setIsLoading(true)
        dispatch(HandleUpdateHRLeaveStatus({
            leaveID: LeaveID,
            status: status,
            HRID: HRState.data._id
        })).then((result) => {
            setIsLoading(false)
            if (result.error) {
                toast({ title: "Error", description: result.payload?.message || "Error al actualizar", variant: "destructive" })
            } else {
                toast({
                    title: status === "Approved" ? "Aprobado" : "Rechazado",
                    description: `La solicitud de ${EmployeeName} ha sido ${status === "Approved" ? "aprobada" : "rechazada"}`,
                    variant: "default"
                })
            }
        })
    }

    return (
        <Dialog>
            <DialogTrigger className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200
                text-cyan-600 bg-cyan-50 border border-cyan-100 hover:bg-cyan-100
                dark:text-cyan-300 dark:bg-[rgba(6,182,212,0.1)] dark:border-[rgba(6,182,212,0.2)] dark:hover:bg-[rgba(6,182,212,0.18)]">
                <Check className="w-3.5 h-3.5" />
                Revisar
            </DialogTrigger>

            <DialogContent className="max-w-[340px]
                bg-white border border-gray-100 shadow-2xl rounded-2xl
                dark:bg-[#13131f] dark:border-[rgba(6,182,212,0.15)]">
                <div className="flex flex-col gap-5 p-1">
                    <div className="text-center">
                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3"
                            style={{ background: isDark ? "rgba(6,182,212,0.1)" : "#cffafe" }}>
                            <Calendar className="w-6 h-6" style={{ color: isDark ? "#06b6d4" : "#0891b2" }} />
                        </div>
                        <p className="text-base font-bold text-gray-900 dark:text-white mb-1">
                            Revisar Solicitud
                        </p>
                        <p className="text-sm text-gray-400 dark:text-[rgba(255,255,255,0.35)]">
                            {EmployeeName}
                        </p>
                    </div>

                    <div className="flex flex-col gap-3">
                        <Button
                            onClick={() => HandleUpdateLeaveStatus("Approved")}
                            disabled={isLoading}
                            className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white
                                bg-emerald-500 hover:bg-emerald-600 border-0
                                dark:bg-[rgba(16,185,129,0.7)] dark:hover:bg-[rgba(16,185,129,0.9)]"
                        >
                            <CheckCircle className="w-4 h-4" />
                            Aprobar
                        </Button>
                        <Button
                            onClick={() => HandleUpdateLeaveStatus("Rejected")}
                            disabled={isLoading}
                            className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white
                                bg-red-500 hover:bg-red-600 border-0
                                dark:bg-[rgba(239,68,68,0.7)] dark:hover:bg-[rgba(239,68,68,0.9)]"
                        >
                            <XCircle className="w-4 h-4" />
                            Rechazar
                        </Button>
                    </div>
                    <DialogClose asChild>
                        <Button className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold
                            text-gray-600 bg-gray-100 hover:bg-gray-200 border-0
                            dark:text-[rgba(255,255,255,0.6)] dark:bg-[rgba(255,255,255,0.05)] dark:hover:bg-[rgba(255,255,255,0.1)]">
                            Cancelar
                        </Button>
                    </DialogClose>
                </div>
            </DialogContent>
        </Dialog>
    )
}
