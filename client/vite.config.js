import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Payroll module - split into separate chunks
          "payroll-periods": [
            "./src/pages/HumanResources/Dashboard Childs/Payroll/tabs/PayrollPeriodsTab.jsx",
            "./src/components/payroll/PayrollPeriodFormModal.jsx",
            "./src/components/payroll/form/PayrollPeriodFormFields.jsx",
            "./src/components/payroll/form/usePayrollPeriodFormState.js",
            "./src/components/payroll/form/usePayrollPeriodFormValidation.js",
          ],
          "payroll-tabs": [
            "./src/pages/HumanResources/Dashboard Childs/Payroll/tabs/PayrollReceiptsTab.jsx",
            "./src/pages/HumanResources/Dashboard Childs/Payroll/tabs/PayrollConceptsTab.jsx",
            "./src/pages/HumanResources/Dashboard Childs/Payroll/tabs/PayrollPolicyTab.jsx",
            "./src/pages/HumanResources/Dashboard Childs/Payroll/tabs/PayrollNoveltiesTab.jsx",
            "./src/pages/HumanResources/Dashboard Childs/Payroll/tabs/PayrollVacationsTab.jsx",
            "./src/pages/HumanResources/Dashboard Childs/Payroll/tabs/PayrollSocialBenefitsTab.jsx",
            "./src/pages/HumanResources/Dashboard Childs/Payroll/tabs/PayrollUtilitiesTab.jsx",
            "./src/pages/HumanResources/Dashboard Childs/Payroll/tabs/PayrollTabsContainer.jsx",
          ],
          // Vendor chunks (only core dependencies that are guaranteed to work)
          "vendor-react": ["react", "react-dom", "react-router-dom", "react-redux", "@reduxjs/toolkit"],
          "vendor-ui": ["lucide-react", "clsx", "tailwind-merge"],
          "vendor-mui": ["@mui/material", "@mui/icons-material", "@emotion/react", "@emotion/styled"],
          "vendor-radix": [
            "@radix-ui/react-dialog",
            "@radix-ui/react-dropdown-menu",
            "@radix-ui/react-label",
            "@radix-ui/react-popover",
            "@radix-ui/react-select",
            "@radix-ui/react-separator",
            "@radix-ui/react-slot",
            "@radix-ui/react-tabs",
            "@radix-ui/react-toast",
            "@radix-ui/react-tooltip",
          ],
          "vendor-charts": ["recharts"],
          "vendor-tiptap": ["@tiptap/react", "@tiptap/starter-kit"],
          "vendor-utils": ["axios", "cmdk", "input-otp", "react-top-loading-bar"],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
})

