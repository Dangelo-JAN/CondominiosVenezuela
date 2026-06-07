import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Check, ChevronsUpDown, Settings, Pencil, Trash2, Building2, Users, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"
import {
    Command, CommandEmpty, CommandGroup,
    CommandInput, CommandItem, CommandList,
} from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useState, useEffect } from "react"
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useSelector, useDispatch } from "react-redux"
import { HandleGetHRDepartments, HandleDeleteHRDepartments, HandlePatchHRDepartments } from "../../../redux/Thunks/HRDepartmentPageThunk"
import { Dialog, DialogContent, DialogClose } from "@/components/ui/dialog"
import { Loading } from "../loading.jsx"
import { useHRAuth } from "../../../hooks/useHRAuth.js"
import { ThemedHeadingBar } from "./ListDesigns.jsx"
import { DepartmentListItems } from "./ListDesigns.jsx"
import { useToast } from "../../../hooks/use-toast.js"
import { EmployeesIDSDialogBox } from "./dialogboxes.jsx"
import { RichTextEditor } from "./RichTextEditor.jsx"


export const HRDepartmentTabs = () => {
    const { toast } = useToast()
    const HRDepartmentState = useSelector((state) => state.HRDepartmentPageReducer)
    const dispatch = useDispatch()
    const { isViewer: isHRViewer } = useHRAuth()
    const [department, setdepartment] = useState("All Departments")
    const [showDeleteDialog, setShowDeleteDialog] = useState(false)
    const [showEditDialog, setShowEditDialog] = useState(false)
    const [editFormData, setEditFormData] = useState({ name: "", description: "" })

    const departments = []
    if (HRDepartmentState.data) {
        for (let index = 0; index < HRDepartmentState.data.length; index++) {
            departments.push({
                value: HRDepartmentState.data[index].name,
                label: HRDepartmentState.data[index].name
            })
        }
    }

    useEffect(() => {
        if (HRDepartmentState.fetchData) {
            dispatch(HandleGetHRDepartments({ apiroute: "GETALL" }))
        }
        if (HRDepartmentState.error.status) {
            toast({
                variant: "destructive",
                title: "Uh oh! Something went wrong.",
                description: `${HRDepartmentState.error.message}`,
            })
        }
        if (HRDepartmentState.success.status) {
            toast({
                title: <p className="text-xl m-1">Success!</p>,
                description: (
                    <div className="flex justify-center items-center gap-2">
                        <img src="../../src/assets/HR-Dashboard/correct.png" alt="" className="w-6" />
                        <p className="font-bold">{HRDepartmentState.success.message}</p>
                    </div>
                ),
            })
        }
    }, [HRDepartmentState.fetchData, HRDepartmentState.error, HRDepartmentState.success])

    useEffect(() => {
        dispatch(HandleGetHRDepartments({ apiroute: "GETALL" }))
    }, [])

    if (HRDepartmentState.isLoading) {
        return <Loading />
    }

    return (
        <div className="flex flex-col gap-4 rounded-2xl h-full overflow-auto
            bg-blue-50/50 border border-blue-100 p-3 sm:p-5
            dark:bg-[rgba(0,61,165,0.04)] dark:border-[rgba(0,61,165,0.1)]">

            {/* Selector + Settings row */}
            <div className="flex justify-between items-center gap-3">
                <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold hidden sm:block
                        text-gray-500 dark:text-[rgba(255,255,255,0.35)]">
                        Departamento:
                    </span>
                    <ComboDropDown
                        DepartmentData={departments}
                        CurrentDepartment={department}
                        SetCurrentDepartment={setdepartment}
                    />
                </div>

                {department !== "All Departments" && !isHRViewer && (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold
                                text-blue-600 bg-blue-50 border border-blue-100 hover:bg-blue-100
                                dark:text-blue-300 dark:bg-[rgba(0,61,165,0.1)] dark:border-[rgba(0,61,165,0.2)] dark:hover:bg-[rgba(0,61,165,0.18)]"
                                style={{ background: "none" }}>
                                <Settings className="w-4 h-4" />
                                <span className="hidden sm:inline">Ajustes</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="flex flex-col gap-1 p-2 rounded-xl
                            bg-white border border-gray-100 shadow-xl
                            dark:bg-[#13131f] dark:border-[rgba(0,61,165,0.15)]">
                            <DropdownMenuItem
                                onClick={() => {
                                    const currentDept = HRDepartmentState.data?.find((item) => item.name === department)
                                    if (currentDept) {
                                        setEditFormData({ name: currentDept.name, description: currentDept.description })
                                        setShowEditDialog(true)
                                    }
                                }}
                                className="flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer text-sm font-medium
                                text-blue-600 hover:bg-blue-50
                                dark:text-blue-300 dark:hover:bg-[rgba(0,61,165,0.1)]">
                                <Pencil className="w-4 h-4" />
                                Actualizar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => setShowDeleteDialog(true)}
                                className="flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer text-sm font-medium
                                text-red-500 hover:bg-red-50
                                dark:text-red-400 dark:hover:bg-[rgba(239,68,68,0.08)]">
                                <Trash2 className="w-4 h-4" />
                                Eliminar
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
            </div>

            {/* Main content */}
            <div className="flex flex-col gap-4 h-full">
                {department === "All Departments"
                    ? <AllDepartments DepartmentData={HRDepartmentState} SetCurrentDepartment={setdepartment} />
                    : <DepartmentContent CurrentDepartmentData={
                        HRDepartmentState.data
                            ? HRDepartmentState.data.find((item) => item.name === department)
                            : null
                    } />
                }
            </div>

            {/* Edit dialog */}
            {(() => {
                const currentDeptData = HRDepartmentState.data?.find((item) => item.name === department)
                const inputCls = `w-full rounded-xl px-3 py-2 text-sm outline-none transition-all duration-200
                    bg-gray-50 border border-gray-200 text-gray-900
                    focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100
                    dark:bg-[rgba(255,255,255,0.04)] dark:border-[rgba(255,255,255,0.08)] dark:text-white
                    dark:focus:border-[rgba(0,61,165,0.5)] dark:focus:bg-[rgba(0,61,165,0.06)]`
                return (
                    <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
                        <DialogContent className="max-w-[340px] lg:max-w-[620px]
                            bg-white border border-gray-100 shadow-2xl rounded-2xl
                            dark:bg-[#13131f] dark:border-[rgba(0,61,165,0.15)]">
                            <div className="flex flex-col gap-5 p-1">
                                <div className="flex items-center gap-3 pb-3 border-b border-gray-100 dark:border-[rgba(0,61,165,0.1)]">
                                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0
                                        bg-blue-100 dark:bg-[rgba(0,61,165,0.15)]">
                                        <Pencil className="w-5 h-5 text-blue-500 dark:text-blue-300" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-blue-500 dark:text-blue-400">
                                            Editar departamento
                                        </p>
                                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                                            {department}
                                        </h2>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-4">
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-[rgba(255,255,255,0.4)]">
                                            Nombre
                                        </label>
                                        <input
                                            type="text"
                                            value={editFormData.name}
                                            onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                                            className={inputCls}
                                        />
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-[rgba(255,255,255,0.4)]">
                                            Descripción
                                        </label>
                                        <RichTextEditor
                                            value={editFormData.description}
                                            onChange={(html) => setEditFormData({ ...editFormData, description: html })}
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <Button
                                        onClick={() => {
                                            if (currentDeptData && editFormData.name.trim() && editFormData.description.trim()) {
                                                dispatch(HandlePatchHRDepartments({
                                                    apiroute: "UPDATE",
                                                    data: {
                                                        departmentID: currentDeptData._id,
                                                        UpdatedDepartment: editFormData
                                                    }
                                                }))
                                                setdepartment("All Departments")
                                                setShowEditDialog(false)
                                            }
                                        }}
                                        className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white
                                            bg-blue-600 hover:bg-blue-700 border-0">
                                        <Check className="w-4 h-4 mr-2 inline" />
                                        Guardar cambios
                                    </Button>
                                    <Button
                                        onClick={() => setShowEditDialog(false)}
                                        className="flex-1 py-2.5 rounded-xl text-sm font-semibold
                                            text-gray-600 bg-gray-100 hover:bg-gray-200 border-0
                                            dark:text-[rgba(255,255,255,0.6)] dark:bg-[rgba(255,255,255,0.05)] dark:hover:bg-[rgba(255,255,255,0.1)]">
                                        Cancelar
                                    </Button>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                )
            })()}

            {/* Delete confirmation dialog */}
            {(() => {
                const currentDeptData = HRDepartmentState.data?.find((item) => item.name === department)
                return (
                    <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                        <DialogContent className="max-w-[340px]
                            bg-white border border-gray-100 shadow-2xl rounded-2xl
                            dark:bg-[#13131f] dark:border-[rgba(0,61,165,0.15)]">
                            <div className="flex flex-col items-center gap-5 p-1 text-center">
                                <div className="w-14 h-14 rounded-2xl flex items-center justify-center
                                    bg-red-50 dark:bg-[rgba(239,68,68,0.1)]">
                                    <AlertTriangle className="w-7 h-7 text-red-400" />
                                </div>
                                <div>
                                    <p className="text-base font-bold text-gray-900 dark:text-white mb-1">
                                        ¿Eliminar departamento?
                                    </p>
                                    <p className="text-sm text-gray-400 dark:text-[rgba(255,255,255,0.35)]">
                                        Se eliminará <span className="font-semibold text-gray-600 dark:text-white">{department}</span> y sus empleados quedarán sin departamento asignado.
                                    </p>
                                </div>
                                <div className="flex gap-3 w-full">
                                    <Button
                                        onClick={() => {
                                            if (currentDeptData) {
                                                dispatch(HandleDeleteHRDepartments({
                                                    apiroute: "DELETE",
                                                    data: { departmentID: currentDeptData._id, action: "delete-department" }
                                                }))
                                            }
                                            setShowDeleteDialog(false)
                                            setdepartment("All Departments")
                                        }}
                                        className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white
                                            bg-red-500 hover:bg-red-600 border-0">
                                        <Trash2 className="w-4 h-4 mr-2 inline" />
                                        Eliminar
                                    </Button>
                                    <Button
                                        onClick={() => setShowDeleteDialog(false)}
                                        className="flex-1 py-2.5 rounded-xl text-sm font-semibold
                                            text-gray-600 bg-gray-100 hover:bg-gray-200 border-0
                                            dark:text-[rgba(255,255,255,0.6)] dark:bg-[rgba(255,255,255,0.05)] dark:hover:bg-[rgba(255,255,255,0.1)]">
                                        Cancelar
                                    </Button>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                )
            })()}
        </div>
    )
}


export const ComboDropDown = ({ DepartmentData, CurrentDepartment, SetCurrentDepartment }) => {
    const [open, setOpen] = useState(false)

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-auto justify-between gap-2 rounded-xl text-sm font-semibold
                        bg-white border border-gray-200 text-gray-700 hover:bg-gray-50
                        dark:bg-[rgba(255,255,255,0.04)] dark:border-[rgba(99,102,241,0.2)] dark:text-white dark:hover:bg-[rgba(99,102,241,0.08)]"
                >
                    {CurrentDepartment}
                    <ChevronsUpDown className="h-4 w-4 opacity-50 flex-shrink-0" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 rounded-xl shadow-xl
                bg-white border border-gray-100
                dark:bg-[#13131f] dark:border-[rgba(0,61,165,0.15)]">
                <Command className="dark:bg-transparent">
                    <CommandInput placeholder="Buscar departamento..." className="text-sm" />
                    <CommandList>
                        <CommandEmpty className="text-sm text-gray-400 py-3 text-center">
                            No se encontraron departamentos.
                        </CommandEmpty>
                        <CommandGroup>
                            {DepartmentData.map((dept) => (
                                <CommandItem
                                    key={dept.value}
                                    value={dept.value}
                                    onSelect={(currentValue) => {
                                        SetCurrentDepartment(currentValue === CurrentDepartment ? "All Departments" : currentValue)
                                        setOpen(false)
                                    }}
                                    className="text-sm cursor-pointer rounded-lg
                                        text-gray-700 dark:text-[rgba(255,255,255,0.7)]"
                                >
                                    <Check className={cn(
                                        "mr-2 h-4 w-4 text-blue-500",
                                        CurrentDepartment === dept.value ? "opacity-100" : "opacity-0"
                                    )} />
                                    {dept.label}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}


export const DepartmentContent = ({ CurrentDepartmentData }) => {
    const table_headings_employees = ["Full Name", "Email", "Contact Number", "Remove Employee"]
    const table_headings_notice = ["Title", "Audience", "Createdby", "View Notice"]

    return (
        <div className="flex flex-col gap-4 h-full">
            {/* Department name + description */}
            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0
                        bg-blue-100 dark:bg-[rgba(0,61,165,0.15)]">
                        <Building2 className="w-5 h-5 text-blue-500 dark:text-blue-300" />
                    </div>
                    <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight
                        text-gray-900 dark:text-white">
                        {CurrentDepartmentData.name}
                    </h2>
                </div>
                <div
                    className="text-sm text-gray-500 dark:text-[rgba(255,255,255,0.4)] sm:text-start text-center
                        prose prose-sm max-w-none
                        [&_h2]:text-gray-700 [&_h2]:font-bold [&_h2]:text-sm [&_h2]:mt-2 [&_h2]:mb-1
                        [&_ul]:list-disc [&_ul]:pl-4 [&_ul]:my-1
                        [&_ol]:list-decimal [&_ol]:pl-4 [&_ol]:my-1
                        [&_li]:mb-0.5 [&_strong]:font-semibold [&_strong]:text-gray-600
                        [&_>_p]:my-3
                        [&_hr]:border-gray-200 [&_hr]:my-2
                        dark:[&_h2]:text-[rgba(255,255,255,0.7)] dark:[&_strong]:text-[rgba(255,255,255,0.6)]
                        dark:[&_hr]:border-[rgba(255,255,255,0.08)]"
                    dangerouslySetInnerHTML={{ __html: CurrentDepartmentData.description }}
                />
            </div>

            {/* Tabs */}
            <Tabs defaultValue="account" className="w-full h-full">
                <div className="flex justify-between items-center flex-col-reverse sm:flex-row gap-3 mb-2">
                    <TabsList className="rounded-xl p-1
                        bg-blue-50 border border-blue-100
                        dark:bg-[rgba(99,102,241,0.08)] dark:border-[rgba(99,102,241,0.15)]">
                        <TabsTrigger value="account"
                            className="rounded-lg px-4 py-1.5 text-sm font-semibold transition-all
                                text-blue-400 data-[state=active]:text-blue-700 data-[state=active]:bg-white data-[state=active]:shadow-sm
                                dark:text-blue-400 dark:data-[state=active]:text-white dark:data-[state=active]:bg-[rgba(99,102,241,0.25)]">
                            <Users className="w-4 h-4 mr-1.5 inline" />
                            {CurrentDepartmentData.employees.length} Empleados
                        </TabsTrigger>
                        <TabsTrigger value="password"
                            className="rounded-lg px-4 py-1.5 text-sm font-semibold transition-all
                                text-blue-400 data-[state=active]:text-blue-700 data-[state=active]:bg-white data-[state=active]:shadow-sm
                                dark:text-blue-400 dark:data-[state=active]:text-white dark:data-[state=active]:bg-[rgba(99,102,241,0.25)]">
                            {CurrentDepartmentData.notice.length} Avisos
                        </TabsTrigger>
                    </TabsList>
                    <EmployeesIDSDialogBox DepartmentID={CurrentDepartmentData._id} />
                </div>

                <TabsContent value="account"
                    className="rounded-xl overflow-auto p-2 h-[85%]
                        border border-blue-100 bg-white
                        dark:border-[rgba(0,61,165,0.1)] dark:bg-[rgba(255,255,255,0.02)]">
                    <ThemedHeadingBar accent="purple" table_layout={"sm:grid-cols-4"} table_headings={table_headings_employees} />
                    <DepartmentListItems TargetedState={CurrentDepartmentData} />
                </TabsContent>

                <TabsContent value="password"
                    className="rounded-xl overflow-auto p-2 h-[85%]
                        border border-blue-100 bg-white
                        dark:border-[rgba(0,61,165,0.1)] dark:bg-[rgba(255,255,255,0.02)]">
                    <ThemedHeadingBar accent="purple" table_layout={"sm:grid-cols-4"} table_headings={table_headings_notice} />
                </TabsContent>
            </Tabs>
        </div>
    )
}


export const AllDepartments = ({ DepartmentData, SetCurrentDepartment }) => {
    return (
        <div className="flex flex-col gap-3">
            {DepartmentData.data ? DepartmentData.data.map((department) => (
                <div key={department.name}
                    className="flex flex-col gap-3 p-4 rounded-2xl transition-all duration-200
                        bg-white border border-gray-100 hover:border-blue-200 hover:shadow-md
                        dark:bg-[rgba(255,255,255,0.02)] dark:border-[rgba(0,61,165,0.1)] dark:hover:border-[rgba(99,102,241,0.25)] dark:hover:bg-[rgba(99,102,241,0.05)]">
                    <div className="flex justify-between items-center gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0
                                bg-blue-100 dark:bg-[rgba(0,61,165,0.15)]">
                                <Building2 className="w-5 h-5 text-blue-500 dark:text-blue-300" />
                            </div>
                            <h2 className="text-lg sm:text-xl font-bold truncate
                                text-gray-900 dark:text-white">
                                {department.name}
                            </h2>
                        </div>
                        <Button
                            onClick={() => SetCurrentDepartment(department.name)}
                            className="flex-shrink-0 px-3 py-1.5 rounded-xl text-sm font-semibold
                                text-blue-600 bg-blue-50 border border-blue-100 hover:bg-blue-100
                                dark:text-blue-300 dark:bg-[rgba(99,102,241,0.1)] dark:border-[rgba(99,102,241,0.2)] dark:hover:bg-[rgba(99,102,241,0.2)]"
                            style={{ background: "none" }}>
                            Ver
                        </Button>
                    </div>
                    <div
                        className="text-sm text-gray-500 dark:text-[rgba(255,255,255,0.4)] sm:text-start text-center
                            prose prose-sm max-w-none
                            [&_h2]:text-gray-700 [&_h2]:font-bold [&_h2]:text-sm [&_h2]:mt-2 [&_h2]:mb-1
                            [&_ul]:list-disc [&_ul]:pl-4 [&_ul]:my-1
                            [&_ol]:list-decimal [&_ol]:pl-4 [&_ol]:my-1
                            [&_li]:mb-0.5 [&_strong]:font-semibold [&_strong]:text-gray-600
                            [&_>_p]:my-3
                            [&_hr]:border-gray-200 [&_hr]:my-2
                            dark:[&_h2]:text-[rgba(255,255,255,0.7)] dark:[&_strong]:text-[rgba(255,255,255,0.6)]
                            dark:[&_hr]:border-[rgba(255,255,255,0.08)]"
                        dangerouslySetInnerHTML={{ __html: department.description }}
                    />
                </div>
            )) : null}
        </div>
    )
}
