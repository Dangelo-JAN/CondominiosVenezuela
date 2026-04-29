import * as React from "react"
import * as ToastPrimitives from "@radix-ui/react-toast"
import { cva } from "class-variance-authority"
import { X, CheckCircle2, AlertCircle, Info } from "lucide-react"
import { cn } from "@/lib/utils"

const ToastProvider = ToastPrimitives.Provider

const ToastViewport = React.forwardRef(({ className, ...props }, ref) => (
    <ToastPrimitives.Viewport
        ref={ref}
        className={cn(
            "fixed z-[100] flex max-h-screen w-full flex-col gap-2 p-4",
            "bottom-0 right-0 sm:max-w-[380px]",
            className
        )}
        {...props}
    />
))
ToastViewport.displayName = ToastPrimitives.Viewport.displayName

const toastVariants = cva(
    cn(
        "group pointer-events-auto relative flex w-full items-start gap-3 overflow-hidden rounded-2xl p-4 shadow-lg",
        "transition-all duration-300",
        "data-[swipe=cancel]:translate-x-0",
        "data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)]",
        "data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none",
        "data-[state=open]:animate-in data-[state=closed]:animate-out",
        "data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full",
        "data-[state=open]:slide-in-from-bottom-full"
    ),
    {
        variants: {
            variant: {
                default: cn(
                    "bg-white border border-gray-100 text-gray-900",
                    "dark:bg-[#1a1a2e] dark:border-[rgba(99,102,241,0.2)] dark:text-white",
                    "shadow-[0_8px_32px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
                ),
                destructive: cn(
                    "bg-red-50 border border-red-100 text-red-900",
                    "dark:bg-[rgba(239,68,68,0.1)] dark:border-[rgba(239,68,68,0.25)] dark:text-red-200",
                    "shadow-[0_8px_32px_rgba(239,68,68,0.08)] dark:shadow-[0_8px_32px_rgba(239,68,68,0.15)]"
                ),
                success: cn(
                    "bg-emerald-50 border border-emerald-100 text-emerald-900",
                    "dark:bg-[rgba(16,185,129,0.1)] dark:border-[rgba(16,185,129,0.25)] dark:text-emerald-200",
                    "shadow-[0_8px_32px_rgba(16,185,129,0.08)] dark:shadow-[0_8px_32px_rgba(16,185,129,0.15)]"
                ),
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
)

// Icon per variant
const variantIcon = {
    default:     <Info className="w-4 h-4 mt-0.5 flex-shrink-0 text-blue-500" />,
    destructive: <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-red-500" />,
    success:     <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0 text-emerald-500" />,
}

const Toast = React.forwardRef(({ className, variant = "default", ...props }, ref) => (
    <ToastPrimitives.Root
        ref={ref}
        className={cn(toastVariants({ variant }), className)}
        {...props}
    />
))
Toast.displayName = ToastPrimitives.Root.displayName

const ToastAction = React.forwardRef(({ className, ...props }, ref) => (
    <ToastPrimitives.Action
        ref={ref}
        className={cn(
            "inline-flex h-8 shrink-0 items-center justify-center rounded-lg px-3 text-xs font-semibold",
            "border border-blue-200 text-blue-600 bg-transparent",
            "hover:bg-blue-50 transition-colors duration-150",
            "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1",
            "dark:border-[rgba(99,102,241,0.3)] dark:text-blue-400 dark:hover:bg-[rgba(99,102,241,0.1)]",
            "disabled:pointer-events-none disabled:opacity-50",
            className
        )}
        {...props}
    />
))
ToastAction.displayName = ToastPrimitives.Action.displayName

const ToastClose = React.forwardRef(({ className, ...props }, ref) => (
    <ToastPrimitives.Close
        ref={ref}
        className={cn(
            "absolute right-3 top-3 rounded-lg p-1 opacity-0 group-hover:opacity-100",
            "transition-all duration-150",
            "text-gray-400 hover:text-gray-700 hover:bg-gray-100",
            "dark:text-[rgba(255,255,255,0.3)] dark:hover:text-white dark:hover:bg-[rgba(255,255,255,0.08)]",
            "focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-blue-500",
            className
        )}
        toast-close=""
        {...props}
    >
        <X className="h-3.5 w-3.5" />
    </ToastPrimitives.Close>
))
ToastClose.displayName = ToastPrimitives.Close.displayName

const ToastTitle = React.forwardRef(({ className, ...props }, ref) => (
    <ToastPrimitives.Title
        ref={ref}
        className={cn("text-sm font-semibold leading-tight", className)}
        {...props}
    />
))
ToastTitle.displayName = ToastPrimitives.Title.displayName

const ToastDescription = React.forwardRef(({ className, ...props }, ref) => (
    <ToastPrimitives.Description
        ref={ref}
        className={cn("text-xs mt-0.5 text-gray-500 dark:text-[rgba(255,255,255,0.45)] leading-relaxed", className)}
        {...props}
    />
))
ToastDescription.displayName = ToastPrimitives.Description.displayName

export {
    ToastProvider,
    ToastViewport,
    Toast,
    ToastTitle,
    ToastDescription,
    ToastClose,
    ToastAction,
    variantIcon,
}
