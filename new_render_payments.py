with open('src/pages/HumanResources/Dashboard Childs/Payroll/tabs/PayrollUtilitiesTab.jsx', 'r') as f:
    content = f.read()

old_marker = '    const renderPaymentsTab = () => {'
end_marker = '    const renderCalculationTab = () => {'

start_idx = content.find(old_marker)
end_idx = content.find(end_marker)

if start_idx == -1 or end_idx == -1:
    print('Markers not found')
else:
    print(f'Found at {start_idx} to {end_idx}')
    
    new_func = '''    const renderPaymentsTab = () => {
        return (
            <div className="w-full h-full flex flex-col p-4 gap-4 overflow-auto">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Pagos de Utilidades</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Detalle de pagos individuales por empleado y período</p>
                    </div>
                </div>

                {/* Filtros */}
                <div className="flex flex-wrap items-center gap-4 p-4 rounded-xl border transition-colors"
                    style={{
                        background: isDark ? "rgba(0,61,165,0.05)" : "rgba(0,61,165,0.03)",
                        borderColor: isDark ? "rgba(0,61,165,0.15)" : "rgba(0,61,165,0.2)"
                    }}>
                    <div className="flex-1 min-w-[200px]">
                        <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: isDark ? "rgba(255,255,255,0.5)" : "#6b7280" }}>
                            Período <span className="text-red-500">*</span>
                        </label>
                        <CustomSelect
                            value={paymentFilters.period}
                            onValueChange={(val) => handlePaymentFilterChange("period", val)}
                            options={periodOptions}
                            placeholder="Seleccionar período..."
                            accentColor="blue"
                        />
                    </div>
                    <div className="flex-1 min-w-[180px]">
                        <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: isDark ? "rgba(255,255,255,0.5)" : "#6b7280" }}>
                            Estado
                        </label>
                        <CustomSelect
                            value={paymentFilters.status}
                            onValueChange={(val) => handlePaymentFilterChange("status", val)}
                            options={PAYMENT_STATUS_OPTIONS}
                            placeholder="Todos los estados"
                            accentColor="blue"
                        />
                    </div>
                    <div className="flex-1 min-w-[250px]">
                        <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: isDark ? "rgba(255,255,255,0.5)" : "#6b7280" }}>
                            Buscar
                        </label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: isDark ? "rgba(255,255,255,0.4)" : "#9ca3af" }} />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => handleSearchChange(e.target.value)}
                                placeholder="Buscar por empleado, monto..."
                                className={`w-full rounded-xl px-10 py-2.5 text-sm outline-none transition-all duration-200
                                    bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400
                                    focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100
                                    dark:bg-[rgba(255,255,255,0.04)] dark:border-[rgba(255,255,255,0.08)] dark:text-white
                                    dark:placeholder-[rgba(255,255,255,0.25)] dark:focus:border-[rgba(0,61,165,0.5)]`}
                            />
                        </div>
                    </div>
                </div>

                {paymentFilters.period === "select" ? (
                    <div className="flex flex-col items-center justify-center h-32 gap-2 text-gray-500 dark:text-gray-400">
                        <CreditCard className="w-10 h-10 opacity-50" />
                        <p>Seleccione un período para ver los pagos</p>
                    </div>
                ) : (
                    <ThemedListWrapper accent="blue">
                        <ThemedHeadingBar
                            table_layout="sm:grid-cols-8"
                            table_headings={["Empleado", "Días Trab.", "Salario Prom.", "Bruto", "ISLR", "Neto", "Estado", "Acciones"]}
                            accent="blue"
                        />
                        <ThemedListContainer accent="blue">
                            {utilidadesPayments.isLoading ? (
                                <div className="flex items-center justify-center h-32">
                                    <Loading />
                                </div>
                            ) : utilidadesPayments.data?.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-32 gap-2 text-gray-500 dark:text-gray-400">
                                    <CreditCard className="w-10 h-10 opacity-50" />
                                    <p>No hay pagos registrados para este período</p>
                                </div>
                            ) : (
                                <div>
                                    {utilidadesPayments.data.map((payment, index) => {
                                        const statusConfig = getPaymentStatusConfig(payment.status)
                                        const StatusIcon = statusConfig.icon
                                        const canPay = payment.status === "PENDING" && can("payroll", "update")

                                        return (
                                            <div
                                                key={payment._id ?? index}
                                                className="grid min-[250px]:grid-cols-2 sm:grid-cols-8 gap-2 px-3 py-3 items-center
                                                    border-b last:border-b-0 transition-colors duration-150
                                                    border-[#dde5ff] dark:border-[rgba(255,255,255,0.08)]
                                                    hover:bg-[#e0f2fe] dark:hover:bg-[rgba(0,61,165,0.08)]"
                                            >
                                                {/* Empleado */}
                                                <div className="flex items-center gap-2.5 min-w-0">
                                                    <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold"
                                                        style={{
                                                            background: isDark ? "rgba(0,61,165,0.15)" : "rgba(0,61,165,0.1)",
                                                            color: "#003DA5"
                                                        }}>
                                                            {payment.employee?.firstname?.slice(0, 1).toUpperCase()}{payment.employee?.lastname?.slice(0, 1).toUpperCase()}
                                                        </div>
                                                        <p className="text-sm font-semibold truncate text-gray-900 dark:text-white">
                                                            {payment.employee?.firstname} {payment.employee?.lastname}
                                                        </p>
                                                </div>

                                                {/* Días Trabajados */}
                                                <div className="min-[250px]:hidden sm:flex sm:justify-center">
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                                        {payment.days_worked || 0}
                                                    </p>
                                                </div>

                                                {/* Salario Promedio */}
                                                <div className="min-[250px]:hidden sm:flex sm:justify-center">
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                                        {formatCurrency(payment.daily_rate_ves)}
                                                    </p>
                                                </div>

                                                {/* Bruto */}
                                                <div className="min-[250px]:hidden sm:flex sm:justify-center">
                                                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                        {formatCurrency(payment.gross_amount_ves)}
                                                    </p>
                                                </div>

                                                {/* ISLR */}
                                                <div className="min-[250px]:hidden sm:flex sm:justify-center">
                                                    <p className="text-sm text-red-600 dark:text-red-400">
                                                        {formatCurrency(payment.islr_retention_ves)}
                                                    </p>
                                                </div>

                                                {/* Neto */}
                                                <div className="min-[250px]:hidden sm:flex sm:justify-center">
                                                    <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                                                        {formatCurrency(payment.net_amount_ves)}
                                                    </p>
                                                </div>

                                                {/* Estado */}
                                                <div className="min-[250px]:hidden sm:flex sm:justify-center">
                                                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${statusConfig.bg}`}>
                                                        <StatusIcon className="w-3 h-3" />
                                                        {statusConfig.label}
                                                    </span>
                                                </div>

                                                {/* Acciones */}
                                                <div className="flex justify-center items-center gap-1.5">
                                                    <button
                                                        onClick={() => openPaymentDetail(payment)}
                                                        className="p-2 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors text-blue-600 dark:text-blue-400"
                                                        title="Ver detalle"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                    {canPay && (
                                                        <button
                                                            onClick={() => handlePayPayment(payment)}
                                                            className="p-2 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors text-emerald-600 dark:text-emerald-400"
                                                            title="Marcar como pagado"
                                                        >
                                                            <DollarSign className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </ThemedListContainer>
                        </ThemedListWrapper>
                    )}
                </div>
            </div>
        )
    }'''

with open('src/pages/HumanResources/Dashboard Childs/Payroll/tabs/PayrollUtilitiesTab.jsx', 'r') as f:
    content = f.read()

start_marker = '    const renderPaymentsTab = () => {'
end_marker = '    const renderCalculationTab = () => {'

start_idx = content.find(old_marker)
end_idx = content.find(end_marker)

if start_idx == -1 or end_idx == -1:
    print('Markers not found')
else:
    print(f'Found at {start_idx} to {end_idx}')
    new_content = content[:start_idx] + new_func + content[end_idx:]
    with open('src/pages/HumanResources/Dashboard Childs/Payroll/tabs/PayrollUtilitiesTab.jsx', 'w') as f:
        f.write(new_content)
    print('Replaced renderPaymentsTab function')