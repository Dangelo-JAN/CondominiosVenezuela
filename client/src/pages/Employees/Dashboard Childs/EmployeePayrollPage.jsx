import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { HandlePayrollReceipts } from "@/redux/Thunks/PayrollThunk.js"
import { PayrollEndPoints } from "@/redux/apis/APIsEndpoints.js"
import { 
    Card, Table, TableContainer, TableHead, TableRow, TableCell, TableBody,
    Typography, Button, IconButton, Chip, Alert, Box, Grid, Paper,
    Table as TableComponent
} from "@mui/material"
import { 
    Download as DownloadIcon, 
    Visibility as VisibilityIcon, 
    Close as CloseIcon 
} from "@mui/icons-material"
import { formatCurrency, formatDate } from "@/utils/formatters.js"

// Componente modal para ver detalle del recibo
const ReceiptDetailModal = ({ receipt, onClose, onDownload }) => {
    if (!receipt) return null

    const lines = receipt.lines || []

    return (
        <Box
            sx={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                bgcolor: 'rgba(0,0,0,0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1300,
                p: 2,
            }}
            onClick={onClose}
        >
            <Paper sx={{ width: '100%', maxWidth: 900, maxHeight: '90vh', overflow: 'auto', p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h5">Detalle del Recibo</Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button startIcon={<DownloadIcon />} onClick={onDownload} variant="outlined">Descargar PDF</Button>
                        <IconButton onClick={onClose}><CloseIcon /></IconButton>
                    </Box>
                </Box>

                <Grid container spacing={2} mb={3}>
                    <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">Período</Typography>
                        <Typography variant="body1" fontWeight={500}>{receipt.period?.name}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">Fecha Pago</Typography>
                        <Typography variant="body1">{receipt.payment_date ? formatDate(receipt.payment_date) : 'Pendiente'}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">Estado</Typography>
                        <Chip label={receipt.status} color={receipt.status === 'PAID' ? 'success' : receipt.status === 'APPROVED' ? 'primary' : 'warning'} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">Empleado</Typography>
                        <Typography variant="body1">{receipt.employee?.firstname} {receipt.employee?.lastname}</Typography>
                    </Grid>
                </Grid>

                <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" gutterBottom>Conceptos</Typography>
                    <TableContainer>
                        <TableComponent size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Concepto</TableCell>
                                    <TableCell align="right">Tipo</TableCell>
                                    <TableCell align="right">Cantidad</TableCell>
                                    <TableCell align="right">Monto (VES)</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {lines.map((line, idx) => (
                                    <TableRow key={idx}>
                                        <TableCell>{line.concept_name}</TableCell>
                                        <TableCell align="right">
                                            <Chip label={line.kind} size="small" color={line.kind === 'INCOME' ? 'success' : 'error'} />
                                        </TableCell>
                                        <TableCell align="right">{line.quantity}</TableCell>
                                        <TableCell align="right">{formatCurrency(line.amount_ves, 'VES')}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </TableComponent>
                    </TableContainer>
                </Box>

                <Grid container spacing={2} sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                    <Grid item xs={12} sm={4}>
                        <Typography variant="body2" color="text.secondary">Total Ingresos</Typography>
                        <Typography variant="h6">{formatCurrency(receipt.total_income_ves, 'VES')}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <Typography variant="body2" color="text.secondary">Total Deducciones</Typography>
                        <Typography variant="h6" color="error">{formatCurrency(receipt.total_deductions_ves, 'VES')}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <Typography variant="body2" color="text.secondary">Neto a Pagar</Typography>
                        <Typography variant="h6" fontWeight={700}>{formatCurrency(receipt.net_pay_ves, 'VES')}</Typography>
                    </Grid>
                </Grid>
            </Paper>
        </Box>
    )
}

export const EmployeePayrollPage = () => {
    const dispatch = useDispatch()
    const payrollState = useSelector(state => state.payrollReducer)
    
    const [selectedReceipt, setSelectedReceipt] = useState(null)
    const [showModal, setShowModal] = useState(false)

    const { employeeReceipts } = payrollState
    const { receipts, isLoading, error } = employeeReceipts || {}

    useEffect(() => {
        // Cargar recibos del empleado autenticado
        dispatch(HandlePayrollReceipts({ 
            type: "GET_EMPLOYEE",
            endpoint: PayrollEndPoints.RECEIPTS_GET_EMPLOYEE
        }))
    }, [dispatch])

    const handleViewReceipt = (receipt) => {
        setSelectedReceipt(receipt)
        setShowModal(true)
    }

    const handleDownloadReceipt = async (receiptId) => {
        try {
            // TODO: Implementar descarga PDF
            alert("Descarga PDF pendiente de implementar")
        } catch (err) {
            console.error("Error descargando recibo:", err)
        }
    }

    if (error) {
        return (
            <Alert severity="error" sx={{ mb: 2 }}>
                Error cargando recibos: {error}
            </Alert>
        )
    }

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
                Mis Recibos de Nómina
            </Typography>
            <Typography variant="body1" color="text.secondary" gutterBottom>
                Historial de tus recibos de pago y liquidaciones
            </Typography>

            {isLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <Typography>Cargando recibos...</Typography>
                </Box>
            ) : !receipts || receipts.length === 0 ? (
                <Alert severity="info" sx={{ mb: 3 }}>
                    No tienes recibos de nómina registrados aún.
                </Alert>
            ) : (
                <Card>
                    <TableContainer>
                        <TableComponent>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Período</TableCell>
                                    <TableCell align="right">Ingresos</TableCell>
                                    <TableCell align="right">Deducciones</TableCell>
                                    <TableCell align="right">Neto</TableCell>
                                    <TableCell align="center">Estado</TableCell>
                                    <TableCell align="center">Fecha Pago</TableCell>
                                    <TableCell align="center">Acciones</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {receipts.map((receipt) => (
                                    <TableRow key={receipt._id} hover onClick={() => handleViewReceipt(receipt)}>
                                        <TableCell>
                                            <Typography variant="body2" fontWeight={500}>
                                                {receipt.period?.name || 'N/A'}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {formatDate(receipt.period?.start_date)} - {formatDate(receipt.period?.end_date)}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="right">
                                            <Typography variant="body2">
                                                {formatCurrency(receipt.total_income_ves || 0, 'VES')}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="right">
                                            <Typography variant="body2" color="error">
                                                {formatCurrency(receipt.total_deductions_ves || 0, 'VES')}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="right">
                                            <Typography variant="body2" fontWeight={600}>
                                                {formatCurrency(receipt.net_pay_ves || 0, 'VES')}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="center">
                                            <Chip 
                                                label={receipt.status} 
                                                size="small"
                                                color={
                                                    receipt.status === 'PAID' ? 'success' :
                                                    receipt.status === 'APPROVED' ? 'primary' :
                                                    receipt.status === 'CALCULATED' ? 'warning' :
                                                    'default'
                                                }
                                            />
                                        </TableCell>
                                        <TableCell align="center">
                                            <Typography variant="body2" color="text.secondary">
                                                {receipt.payment_date ? formatDate(receipt.payment_date) : '—'}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="center">
                                            <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleViewReceipt(receipt); }}>
                                                <VisibilityIcon />
                                            </IconButton>
                                            <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleDownloadReceipt(receipt._id); }}>
                                                <DownloadIcon />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </TableComponent>
                    </TableContainer>
                </Card>
            )}

            {/* Modal detalle recibo */}
            {showModal && selectedReceipt && (
                <ReceiptDetailModal 
                    receipt={selectedReceipt} 
                    onClose={() => { setShowModal(false); setSelectedReceipt(null); }}
                    onDownload={() => handleDownloadReceipt(selectedReceipt._id)}
                />
            )}
        </Box>
    )
}

export default EmployeePayrollPage