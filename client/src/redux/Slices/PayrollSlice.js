import { createSlice } from "@reduxjs/toolkit"
import {
    HandlePayrollPeriods,
    HandlePayrollReceipts,
    HandlePayrollConcepts,
    HandlePayrollPolicy,
    HandlePayrollNovelties,
    HandleVacations,
    HandleSocialBenefits,
    HandleUtilidades
} from "../Thunks/PayrollThunk.js"

const PayrollSlice = createSlice({
    name: "Payroll",
    initialState: {
        // Períodos
        periods: { data: [], isLoading: false, error: null, pagination: {} },
        period: { data: null, isLoading: false, error: null },

        // Recibos
        receipts: { data: [], isLoading: false, error: null, pagination: {} },
        receipt: { data: null, isLoading: false, error: null },
        employeeReceipts: { data: [], isLoading: false, error: null },

        // Conceptos
        concepts: { data: [], isLoading: false, error: null, pagination: {} },
        concept: { data: null, isLoading: false, error: null },
        receiptTypes: { data: [], isLoading: false, error: null },

        // Política
        policy: { data: null, isLoading: false, error: null },
        companyConfig: { data: null, isLoading: false, error: null },

        // Novedades
        novelties: { data: [], isLoading: false, error: null, pagination: {} },
        novelty: { data: null, isLoading: false, error: null },

        // Vacaciones
        vacationBalances: { data: [], isLoading: false, error: null, pagination: {} },
        vacationBalance: { data: null, isLoading: false, error: null },
        vacationRequests: { data: [], isLoading: false, error: null, pagination: {} },
        vacationRequest: { data: null, isLoading: false, error: null },
        holidays: { data: [], isLoading: false, error: null },

        // Prestaciones
        socialBenefitsLedger: { data: [], isLoading: false, error: null, pagination: {} },
        socialBenefitsLedgerEmployee: { data: { entries: [], totals: {} }, isLoading: false, error: null },
        settlements: { data: [], isLoading: false, error: null, pagination: {} },
        settlement: { data: null, isLoading: false, error: null },
        settlementCalculation: { data: null, isLoading: false, error: null },
        accrualCalculation: { data: null, isLoading: false, error: null },

        // Utilidades
        utilidadesPeriods: { data: [], isLoading: false, error: null, pagination: {} },
        utilidadesPeriod: { data: null, isLoading: false, error: null },
        utilidadesPayments: { data: [], isLoading: false, error: null, pagination: {} },
        utilidadesPayment: { data: null, isLoading: false, error: null }
    },
    reducers: {
        clearPayrollError: (state, action) => {
            const key = action.payload
            if (state[key]) state[key].error = null
        },
        clearPeriod: (state) => {
            state.period = { data: null, isLoading: false, error: null }
        },
        clearReceipt: (state) => {
            state.receipt = { data: null, isLoading: false, error: null }
        },
        clearConcept: (state) => {
            state.concept = { data: null, isLoading: false, error: null }
        },
        clearNovelty: (state) => {
            state.novelty = { data: null, isLoading: false, error: null }
        },
        clearVacationRequest: (state) => {
            state.vacationRequest = { data: null, isLoading: false, error: null }
        },
        clearSettlement: (state) => {
            state.settlement = { data: null, isLoading: false, error: null }
        },
        clearUtilidadesPeriod: (state) => {
            state.utilidadesPeriod = { data: null, isLoading: false, error: null }
        }
    },
    extraReducers: (builder) => {
        // ─── PERÍODOS ───
        builder
            .addCase(HandlePayrollPeriods.pending, (state) => {
                state.periods.isLoading = true
                state.periods.error = null
            })
            .addCase(HandlePayrollPeriods.fulfilled, (state, action) => {
                state.periods.isLoading = false
                state.periods.error = null
                if (action.payload.type === "GETALL") {
                    state.periods.data = action.payload.data
                    state.periods.pagination = action.payload.pagination
                } else if (action.payload.type === "GETONE") {
                    state.period.data = action.payload.data
                } else if (action.payload.type === "CREATE") {
                    state.periods.data = [action.payload.data, ...state.periods.data]
                    state.period.data = action.payload.data
                } else if (action.payload.type === "UPDATE") {
                    state.periods.data = state.periods.data.map(p =>
                        p._id === action.payload.data._id ? action.payload.data : p
                    )
                    state.period.data = action.payload.data
                } else if (action.payload.type === "DELETE") {
                    state.periods.data = state.periods.data.filter(p => p._id !== action.payload.periodID)
                } else if (["CALCULATE", "APPROVE", "PAY", "CLOSE"].includes(action.payload.type)) {
                    state.periods.data = state.periods.data.map(p =>
                        p._id === action.payload.data._id ? action.payload.data : p
                    )
                    state.period.data = action.payload.data
                }
            })
            .addCase(HandlePayrollPeriods.rejected, (state, action) => {
                state.periods.isLoading = false
                state.periods.error = action.payload?.message || "Error en períodos"
                state.period.error = action.payload?.message || "Error en período"
            })

        // ─── RECIBOS ───
        builder
            .addCase(HandlePayrollReceipts.pending, (state, action) => {
                if (action.meta.arg?.type === "GET_EMPLOYEE") {
                    state.employeeReceipts.isLoading = true
                } else if (action.meta.arg?.type === "GETONE") {
                    state.receipt.isLoading = true
                } else {
                    state.receipts.isLoading = true
                }
            })
            .addCase(HandlePayrollReceipts.fulfilled, (state, action) => {
                state.receipts.isLoading = false
                state.receipt.isLoading = false
                state.employeeReceipts.isLoading = false
                state.receipts.error = null
                state.receipt.error = null
                state.employeeReceipts.error = null

                if (action.payload.type === "GETALL") {
                    state.receipts.data = action.payload.data
                    state.receipts.pagination = action.payload.pagination
                } else if (action.payload.type === "GETONE") {
                    state.receipt.data = action.payload.data
                } else if (action.payload.type === "GET_EMPLOYEE") {
                    state.employeeReceipts.data = action.payload.data
                } else if (action.payload.type === "RECALCULATE") {
                    state.receipt.data = action.payload.data
                } else if (action.payload.type === "VOID") {
                    state.receipt.data = action.payload.data
                    state.receipts.data = state.receipts.data.map(r =>
                        r._id === action.payload.data._id ? action.payload.data : r
                    )
                }
            })
            .addCase(HandlePayrollReceipts.rejected, (state, action) => {
                state.receipts.isLoading = false
                state.receipt.isLoading = false
                state.employeeReceipts.isLoading = false
                const msg = action.payload?.message || "Error en recibos"
                state.receipts.error = msg
                state.receipt.error = msg
                state.employeeReceipts.error = msg
            })

        // ─── CONCEPTOS ───
        builder
            .addCase(HandlePayrollConcepts.pending, (state) => {
                state.concepts.isLoading = true
                state.concept.isLoading = true
            })
            .addCase(HandlePayrollConcepts.fulfilled, (state, action) => {
                state.concepts.isLoading = false
                state.concept.isLoading = false
                state.concepts.error = null
                state.concept.error = null
                state.receiptTypes.error = null

                if (action.payload.type === "GETALL") {
                    state.concepts.data = action.payload.data
                    state.concepts.pagination = action.payload.pagination
                } else if (action.payload.type === "GETONE") {
                    state.concept.data = action.payload.data
                } else if (action.payload.type === "CREATE") {
                    state.concepts.data = [action.payload.data, ...state.concepts.data]
                    state.concept.data = action.payload.data
                } else if (action.payload.type === "UPDATE") {
                    state.concepts.data = state.concepts.data.map(c =>
                        c._id === action.payload.data._id ? action.payload.data : c
                    )
                    state.concept.data = action.payload.data
                } else if (action.payload.type === "DELETE") {
                    state.concepts.data = state.concepts.data.filter(c => c._id !== action.payload.conceptID)
                } else if (action.payload.type === "VALIDATE_FORMULA") {
                    state.concept.data = action.payload.data
                } else if (action.payload.type === "RECEIPT_TYPES") {
                    state.receiptTypes.data = action.payload.data
                } else if (action.payload.type === "CREATE_RECEIPT_TYPE") {
                    state.receiptTypes.data = [action.payload.data, ...state.receiptTypes.data]
                }
            })
            .addCase(HandlePayrollConcepts.rejected, (state, action) => {
                state.concepts.isLoading = false
                state.concept.isLoading = false
                const msg = action.payload?.message || "Error en conceptos"
                state.concepts.error = msg
                state.concept.error = msg
                state.receiptTypes.error = msg
            })

        // ─── POLÍTICA ───
        builder
            .addCase(HandlePayrollPolicy.pending, (state, action) => {
                if (action.meta.arg?.endpoint?.includes("policy")) {
                    state.policy.isLoading = true
                } else {
                    state.companyConfig.isLoading = true
                }
            })
            .addCase(HandlePayrollPolicy.fulfilled, (state, action) => {
                state.policy.isLoading = false
                state.companyConfig.isLoading = false
                state.policy.error = null
                state.companyConfig.error = null

                if (action.payload.type === "POLICY_GET") {
                    state.policy.data = action.payload.data
                } else if (action.payload.type === "POLICY_UPDATE") {
                    state.policy.data = action.payload.data
                } else if (action.payload.type === "COMPANY_GET") {
                    state.companyConfig.data = action.payload.data
                } else if (action.payload.type === "COMPANY_UPDATE") {
                    state.companyConfig.data = action.payload.data
                }
            })
            .addCase(HandlePayrollPolicy.rejected, (state, action) => {
                state.policy.isLoading = false
                state.companyConfig.isLoading = false
                const msg = action.payload?.message || "Error en política"
                state.policy.error = msg
                state.companyConfig.error = msg
            })

        // ─── NOVEDADES ───
        builder
            .addCase(HandlePayrollNovelties.pending, (state) => {
                state.novelties.isLoading = true
                state.novelty.isLoading = true
            })
            .addCase(HandlePayrollNovelties.fulfilled, (state, action) => {
                state.novelties.isLoading = false
                state.novelty.isLoading = false
                state.novelties.error = null
                state.novelty.error = null

                if (action.payload.type === "GETALL") {
                    state.novelties.data = action.payload.data
                    state.novelties.pagination = action.payload.pagination
                } else if (action.payload.type === "GETONE") {
                    state.novelty.data = action.payload.data
                } else if (action.payload.type === "CREATE") {
                    state.novelties.data = [action.payload.data, ...state.novelties.data]
                    state.novelty.data = action.payload.data
                } else if (action.payload.type === "UPDATE") {
                    state.novelties.data = state.novelties.data.map(n =>
                        n._id === action.payload.data._id ? action.payload.data : n
                    )
                    state.novelty.data = action.payload.data
                } else if (action.payload.type === "DELETE") {
                    state.novelties.data = state.novelties.data.filter(n => n._id !== action.payload.noveltyID)
                } else if (["APPLY", "REJECT", "BULK_CREATE"].includes(action.payload.type)) {
                    state.novelty.data = action.payload.data
                }
            })
            .addCase(HandlePayrollNovelties.rejected, (state, action) => {
                state.novelties.isLoading = false
                state.novelty.isLoading = false
                const msg = action.payload?.message || "Error en novedades"
                state.novelties.error = msg
                state.novelty.error = msg
            })

        // ─── VACACIONES ───
        builder
            .addCase(HandleVacations.pending, (state, action) => {
                if (action.meta.arg?.endpoint?.includes("balances")) {
                    if (action.meta.arg?.type === "GETONE") {
                        state.vacationBalance.isLoading = true
                    } else {
                        state.vacationBalances.isLoading = true
                    }
                } else if (action.meta.arg?.endpoint?.includes("requests")) {
                    if (action.meta.arg?.type === "GETONE") {
                        state.vacationRequest.isLoading = true
                    } else {
                        state.vacationRequests.isLoading = true
                    }
                } else if (action.meta.arg?.endpoint?.includes("holidays")) {
                    state.holidays.isLoading = true
                }
            })
            .addCase(HandleVacations.fulfilled, (state, action) => {
                state.vacationBalances.isLoading = false
                state.vacationBalance.isLoading = false
                state.vacationRequests.isLoading = false
                state.vacationRequest.isLoading = false
                state.holidays.isLoading = false
                state.vacationBalances.error = null
                state.vacationBalance.error = null
                state.vacationRequests.error = null
                state.vacationRequest.error = null
                state.holidays.error = null

                if (action.payload.type === "BALANCES_GETALL") {
                    state.vacationBalances.data = action.payload.data
                    state.vacationBalances.pagination = action.payload.pagination
                } else if (action.payload.type === "BALANCES_GETONE") {
                    state.vacationBalance.data = action.payload.data
                } else if (action.payload.type === "REQUESTS_GETALL") {
                    state.vacationRequests.data = action.payload.data
                    state.vacationRequests.pagination = action.payload.pagination
                } else if (action.payload.type === "REQUESTS_GETONE") {
                    state.vacationRequest.data = action.payload.data
                } else if (action.payload.type === "REQUESTS_CREATE") {
                    state.vacationRequests.data = [action.payload.data, ...state.vacationRequests.data]
                    state.vacationRequest.data = action.payload.data
                } else if (action.payload.type === "REQUESTS_APPROVE") {
                    state.vacationRequests.data = state.vacationRequests.data.map(r =>
                        r._id === action.payload.data._id ? action.payload.data : r
                    )
                    state.vacationRequest.data = action.payload.data
                } else if (action.payload.type === "REQUESTS_REJECT") {
                    state.vacationRequests.data = state.vacationRequests.data.map(r =>
                        r._id === action.payload.data._id ? action.payload.data : r
                    )
                    state.vacationRequest.data = action.payload.data
                } else if (action.payload.type === "REQUESTS_PAY") {
                    state.vacationRequest.data = action.payload.data
                } else if (action.payload.type === "HOLIDAYS_GETALL") {
                    state.holidays.data = action.payload.data
                } else if (action.payload.type === "HOLIDAYS_CREATE") {
                    state.holidays.data = [action.payload.data, ...state.holidays.data]
                } else if (action.payload.type === "HOLIDAYS_DELETE") {
                    state.holidays.data = state.holidays.data.filter(h => h._id !== action.payload.holidayID)
                }
            })
            .addCase(HandleVacations.rejected, (state, action) => {
                state.vacationBalances.isLoading = false
                state.vacationBalance.isLoading = false
                state.vacationRequests.isLoading = false
                state.vacationRequest.isLoading = false
                state.holidays.isLoading = false
                const msg = action.payload?.message || "Error en vacaciones"
                state.vacationBalances.error = msg
                state.vacationBalance.error = msg
                state.vacationRequests.error = msg
                state.vacationRequest.error = msg
                state.holidays.error = msg
            })

        // ─── PRESTACIONES ───
        builder
            .addCase(HandleSocialBenefits.pending, (state, action) => {
                if (action.meta.arg?.endpoint?.includes("ledger")) {
                    if (action.meta.arg?.type === "GET_EMPLOYEE") {
                        state.socialBenefitsLedgerEmployee.isLoading = true
                    } else {
                        state.socialBenefitsLedger.isLoading = true
                    }
                } else if (action.meta.arg?.endpoint?.includes("settlements")) {
                    if (action.meta.arg?.type === "CALCULATE") {
                        state.settlementCalculation.isLoading = true
                    } else if (action.meta.arg?.type === "GETONE") {
                        state.settlement.isLoading = true
                    } else {
                        state.settlements.isLoading = true
                    }
                } else if (action.meta.arg?.endpoint?.includes("accrual")) {
                    state.accrualCalculation.isLoading = true
                }
            })
            .addCase(HandleSocialBenefits.fulfilled, (state, action) => {
                state.socialBenefitsLedger.isLoading = false
                state.socialBenefitsLedgerEmployee.isLoading = false
                state.settlements.isLoading = false
                state.settlement.isLoading = false
                state.settlementCalculation.isLoading = false
                state.accrualCalculation.isLoading = false
                state.socialBenefitsLedger.error = null
                state.socialBenefitsLedgerEmployee.error = null
                state.settlements.error = null
                state.settlement.error = null
                state.settlementCalculation.error = null
                state.accrualCalculation.error = null

                if (action.payload.type === "LEDGER_GETALL") {
                    state.socialBenefitsLedger.data = action.payload.data
                    state.socialBenefitsLedger.pagination = action.payload.pagination
                } else if (action.payload.type === "LEDGER_GET_EMPLOYEE") {
                    state.socialBenefitsLedgerEmployee.data = action.payload.data
                } else if (action.payload.type === "SETTLEMENTS_CALCULATE") {
                    state.settlementCalculation.data = action.payload.data
                } else if (action.payload.type === "SETTLEMENTS_CREATE") {
                    state.settlements.data = [action.payload.data, ...state.settlements.data]
                    state.settlement.data = action.payload.data
                } else if (action.payload.type === "SETTLEMENTS_GETALL") {
                    state.settlements.data = action.payload.data
                    state.settlements.pagination = action.payload.pagination
                } else if (action.payload.type === "SETTLEMENTS_GETONE") {
                    state.settlement.data = action.payload.data
                } else if (action.payload.type === "SETTLEMENTS_APPROVE") {
                    state.settlements.data = state.settlements.data.map(s =>
                        s._id === action.payload.data._id ? action.payload.data : s
                    )
                    state.settlement.data = action.payload.data
                } else if (action.payload.type === "SETTLEMENTS_PAY") {
                    state.settlement.data = action.payload.data
                } else if (action.payload.type === "ACCRUAL_CALCULATE") {
                    state.accrualCalculation.data = action.payload.data
                } else if (action.payload.type === "ACCRUAL_RECORD") {
                    state.socialBenefitsLedger.data = [action.payload.data, ...state.socialBenefitsLedger.data]
                }
            })
            .addCase(HandleSocialBenefits.rejected, (state, action) => {
                state.socialBenefitsLedger.isLoading = false
                state.socialBenefitsLedgerEmployee.isLoading = false
                state.settlements.isLoading = false
                state.settlement.isLoading = false
                state.settlementCalculation.isLoading = false
                state.accrualCalculation.isLoading = false
                const msg = action.payload?.message || "Error en prestaciones"
                state.socialBenefitsLedger.error = msg
                state.socialBenefitsLedgerEmployee.error = msg
                state.settlements.error = msg
                state.settlement.error = msg
                state.settlementCalculation.error = msg
                state.accrualCalculation.error = msg
            })

        // ─── UTILIDADES ───
        builder
            .addCase(HandleUtilidades.pending, (state, action) => {
                if (action.meta.arg?.endpoint?.includes("periods")) {
                    if (action.meta.arg?.type === "GETONE") {
                        state.utilidadesPeriod.isLoading = true
                    } else {
                        state.utilidadesPeriods.isLoading = true
                    }
                } else if (action.meta.arg?.endpoint?.includes("payments")) {
                    if (action.meta.arg?.type === "GETONE") {
                        state.utilidadesPayment.isLoading = true
                    } else {
                        state.utilidadesPayments.isLoading = true
                    }
                }
            })
            .addCase(HandleUtilidades.fulfilled, (state, action) => {
                state.utilidadesPeriods.isLoading = false
                state.utilidadesPeriod.isLoading = false
                state.utilidadesPayments.isLoading = false
                state.utilidadesPayment.isLoading = false
                state.utilidadesPeriods.error = null
                state.utilidadesPeriod.error = null
                state.utilidadesPayments.error = null
                state.utilidadesPayment.error = null

                if (action.payload.type === "PERIODS_GETALL") {
                    state.utilidadesPeriods.data = action.payload.data
                    state.utilidadesPeriods.pagination = action.payload.pagination
                } else if (action.payload.type === "PERIODS_GETONE") {
                    state.utilidadesPeriod.data = action.payload.data
                } else if (action.payload.type === "PERIODS_CREATE") {
                    state.utilidadesPeriods.data = [action.payload.data, ...state.utilidadesPeriods.data]
                    state.utilidadesPeriod.data = action.payload.data
                } else if (["PERIODS_CALCULATE", "PERIODS_APPROVE", "PERIODS_PAY"].includes(action.payload.type)) {
                    state.utilidadesPeriods.data = state.utilidadesPeriods.data.map(p =>
                        p._id === action.payload.data._id ? action.payload.data : p
                    )
                    state.utilidadesPeriod.data = action.payload.data
                } else if (action.payload.type === "PAYMENTS_GETALL") {
                    state.utilidadesPayments.data = action.payload.data
                    state.utilidadesPayments.pagination = action.payload.pagination
                } else if (action.payload.type === "PAYMENTS_GETONE") {
                    state.utilidadesPayment.data = action.payload.data
                } else if (action.payload.type === "PAYMENTS_PAY") {
                    state.utilidadesPayment.data = action.payload.data
                    state.utilidadesPayments.data = state.utilidadesPayments.data.map(p =>
                        p._id === action.payload.data._id ? action.payload.data : p
                    )
                }
            })
            .addCase(HandleUtilidades.rejected, (state, action) => {
                state.utilidadesPeriods.isLoading = false
                state.utilidadesPeriod.isLoading = false
                state.utilidadesPayments.isLoading = false
                state.utilidadesPayment.isLoading = false
                const msg = action.payload?.message || "Error en utilidades"
                state.utilidadesPeriods.error = msg
                state.utilidadesPeriod.error = msg
                state.utilidadesPayments.error = msg
                state.utilidadesPayment.error = msg
            })
    }
})

export const {
    clearPayrollError,
    clearPeriod,
    clearReceipt,
    clearConcept,
    clearNovelty,
    clearVacationRequest,
    clearSettlement,
    clearUtilidadesPeriod
} = PayrollSlice.actions

export default PayrollSlice.reducer