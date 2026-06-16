"use client"

import * as React from "react"
import * as SelectPrimitive from "@radix-ui/react-select"
import { Check, ChevronDown, Search } from "lucide-react"

import { cn } from "@/lib/utils"
import { useIsDark } from "../../hooks/useIsDark.js"

// ── Accent Color Configuration ──────────────────────────────────────────────
const ACCENT_CONFIG = {
  yellow: {
    trigger: "focus:border-yellow-400 focus:bg-white focus:ring-2 focus:ring-yellow-100 dark:focus:border-[rgba(245,158,11,0.5)] dark:focus:bg-[rgba(245,158,11,0.06)]",
    search: "focus:border-yellow-400 focus:ring-2 focus:ring-yellow-100 dark:focus:border-[rgba(245,158,11,0.5)] dark:focus:ring-[rgba(245,158,11,0.15)]",
    check: "text-yellow-500",
  },
  blue: {
    trigger: "focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100 dark:focus:border-[rgba(0,61,165,0.5)] dark:focus:bg-[rgba(0,61,165,0.06)]",
    search: "focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:border-[rgba(0,61,165,0.5)] dark:focus:ring-[rgba(0,61,165,0.15)]",
    check: "text-blue-500",
  },
}

// ── Select Root ─────────────────────────────────────────────────────────────
const Select = SelectPrimitive.Root

const SelectGroup = SelectPrimitive.Group

const SelectValue = SelectPrimitive.Value

// ── Select Trigger (el botón que abre el dropdown) ───────────────────────
const SelectTrigger = React.forwardRef(({ className, children, searchPlaceholder, showSearch, ...props }, ref) => {
  const isDark = useIsDark()

  return (
    <SelectPrimitive.Trigger
      ref={ref}
      className={cn(
        "flex h-10 w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm outline-none transition-all duration-200",
        "bg-gray-50 border border-gray-200 text-gray-900",
        "placeholder:text-gray-400",
        "disabled:cursor-not-allowed disabled:opacity-50",
        // Dark mode
        "dark:bg-[rgba(255,255,255,0.05)] dark:border-[rgba(255,255,255,0.12)] dark:text-white",
        "dark:placeholder:text-[rgba(255,255,255,0.4)]",
        className
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <ChevronDown className="h-4 w-4 opacity-50" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  )
})
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName

// ── Select Content (el dropdown) ─────────────────────────────────────────
const SelectContent = React.forwardRef(({ className, children, position = "popper", ...props }, ref) => {
  const isDark = useIsDark()

  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        ref={ref}
        className={cn(
          "relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-xl border shadow-xl",
          "bg-white dark:bg-[#0f0f1a]",
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
          "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
          "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2",
          "data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
          position === "popper" &&
            "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
          className
        )}
        position={position}
        style={{
          borderColor: isDark ? "rgba(255,255,255,0.12)" : "#e5e7eb",
        }}
        {...props}
      >
        <SelectPrimitive.Viewport
          className={cn(
            "p-1",
            position === "popper" &&
              "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]"
          )}
        >
          {children}
        </SelectPrimitive.Viewport>
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  )
})
SelectContent.displayName = SelectPrimitive.Content.displayName

// ── Select Label (header de grupo) ────────────────────────────────────────
const SelectLabel = React.forwardRef(({ className, ...props }, ref) => {
  const isDark = useIsDark()
  return (
    <SelectPrimitive.Label
      ref={ref}
      className={cn(
        "py-1.5 pl-8 pr-2 text-xs font-semibold",
        isDark ? "text-[rgba(255,255,255,0.4)]" : "text-gray-500",
        className
      )}
      {...props}
    />
  )
})
SelectLabel.displayName = SelectPrimitive.Label.displayName

// ── Select Item (cada opción) ────────────────────────────────────────────
const SelectItem = React.forwardRef(({ className, children, checkClassName = "text-yellow-500", ...props }, ref) => {
  const isDark = useIsDark()

  return (
    <SelectPrimitive.Item
      ref={ref}
      className={cn(
        "relative flex w-full cursor-pointer select-none items-center rounded-lg py-2 pl-8 pr-2 text-sm outline-none",
        "transition-colors duration-150",
        "text-gray-700 dark:text-[rgba(255,255,255,0.8)]",
        "hover:bg-gray-100 dark:hover:bg-[rgba(255,255,255,0.08)]",
        "focus:bg-gray-100 dark:focus:bg-[rgba(255,255,255,0.08)]",
        "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        className
      )}
      {...props}
    >
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        <SelectPrimitive.ItemIndicator>
          <Check className={cn("h-4 w-4", checkClassName)} />
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  )
})
SelectItem.displayName = SelectPrimitive.Item.displayName

// ── Select Separator (separador) ──────────────────────────────────────────
const SelectSeparator = React.forwardRef(({ className, ...props }, ref) => {
  const isDark = useIsDark()
  return (
    <SelectPrimitive.Separator
      ref={ref}
      className={cn(
        "-mx-1 my-1 h-px",
        isDark ? "bg-[rgba(255,255,255,0.08)]" : "bg-gray-100",
        className
      )}
      {...props}
    />
  )
})
SelectSeparator.displayName = SelectPrimitive.Separator.displayName

// ── CustomSelect Componente Compuesto (con búsqueda) ─────────────────────
const CustomSelect = ({
  value,
  onValueChange,
  options = [],
  placeholder = "Seleccionar...",
  searchPlaceholder = "Buscar...",
  groupLabel,
  disabled = false,
  className = "",
  emptyMessage = "No hay opciones disponibles",
  accentColor = "yellow",
}) => {
  const isDark = useIsDark()
  const [search, setSearch] = React.useState("")

  // Resolver estilos de acento
  const accent = ACCENT_CONFIG[accentColor] || ACCENT_CONFIG.yellow

  // Filtrar opciones basado en búsqueda
  const filteredOptions = React.useMemo(() => {
    if (!search) return options
    const lowerSearch = search.toLowerCase()
    return options.filter(opt => 
      opt.label.toLowerCase().includes(lowerSearch) ||
      opt.value.toLowerCase().includes(lowerSearch)
    )
  }, [options, search])

  // Mostrar búsqueda solo si hay más de 5 opciones
  const showSearch = options.length > 5

  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger className={cn(className, accent.trigger)}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>

      <SelectContent>
        {/* Input de búsqueda */}
        {showSearch && (
          <div className="relative px-2 py-2">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 opacity-40" 
              style={{ color: isDark ? "rgba(255,255,255,0.4)" : "#9ca3af" }} />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={cn(
                "w-full h-9 rounded-lg pl-9 pr-3 text-sm outline-none transition-colors",
                "bg-gray-50 border border-gray-200 text-gray-900",
                "placeholder:text-gray-400",
                accent.search,
                "dark:bg-[rgba(255,255,255,0.05)] dark:border-[rgba(255,255,255,0.12)] dark:text-white",
                "dark:placeholder:text-[rgba(255,255,255,0.4)]"
              )}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        )}

        {/* Grupo de opciones */}
        <SelectGroup>
          {groupLabel && (
            <SelectLabel>{groupLabel}</SelectLabel>
          )}
          
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option) => (
              <SelectItem key={option.value} value={option.value} checkClassName={accent.check}>
                {option.label}
              </SelectItem>
            ))
          ) : (
            <div className="py-6 text-center text-sm px-2"
              style={{ color: isDark ? "rgba(255,255,255,0.4)" : "#9ca3af" }}>
              {emptyMessage}
            </div>
          )}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  CustomSelect,
}
