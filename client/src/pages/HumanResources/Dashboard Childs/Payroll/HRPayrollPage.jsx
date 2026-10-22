import { Suspense, lazy } from "react"
import { useNavigate } from "react-router-dom"
import { Loading } from "../../../../components/common/loading.jsx"
import { PayrollTabsContainer } from "./tabs/PayrollTabsContainer.jsx"

// Lazy load all tab components for code splitting
const PayrollPeriodsTab = lazy(() => import("./tabs/PayrollPeriodsTab.jsx"))
const PayrollReceiptsTab = lazy(() => import("./tabs/PayrollReceiptsTab.jsx"))
const PayrollConceptsTab = lazy(() => import("./tabs/PayrollConceptsTab.jsx"))
const PayrollPolicyTab = lazy(() => import("./tabs/PayrollPolicyTab.jsx"))
const PayrollNoveltiesTab = lazy(() => import("./tabs/PayrollNoveltiesTab.jsx"))
const PayrollVacationsTab = lazy(() => import("./tabs/PayrollVacationsTab.jsx"))
const PayrollSocialBenefitsTab = lazy(() => import("./tabs/PayrollSocialBenefitsTab.jsx"))
const PayrollUtilitiesTab = lazy(() => import("./tabs/PayrollUtilitiesTab.jsx"))

const TAB_COMPONENTS = {
    periods: PayrollPeriodsTab,
    receipts: PayrollReceiptsTab,
    concepts: PayrollConceptsTab,
    policy: PayrollPolicyTab,
    novelties: PayrollNoveltiesTab,
    vacations: PayrollVacationsTab,
    "social-benefits": PayrollSocialBenefitsTab,
    utilities: PayrollUtilitiesTab,
}

export const HRPayrollPage = () => {
    const navigate = useNavigate()

    // Extract tab from URL or default to periods
    const path = window.location.pathname
    const tabMatch = path.match(/\/payroll\/([^\/]+)$/)
    const initialTab = tabMatch ? tabMatch[1] : "periods"

    const renderTabContent = (activeTab) => {
        const TabComponent = TAB_COMPONENTS[activeTab] || PayrollPeriodsTab

        return (
            <Suspense fallback={<Loading />}>
                <TabComponent />
            </Suspense>
        )
    }

    return (
        <PayrollTabsContainer>
            {renderTabContent}
        </PayrollTabsContainer>
    )
}

export default HRPayrollPage