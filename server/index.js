import express from 'express';
import dotenv from 'dotenv'
import EmployeeAuthRouter from './routes/EmployeeAuth.route.js'
import HRAuthrouter from './routes/HRAuth.route.js'
import DashboardRouter from './routes/Dashbaord.route.js'
import EmployeeRouter from './routes/Employee.route.js'
import HRRouter from './routes/HR.route.js'
import DepartmentRouter from './routes/Department.route.js'
import SalaryRouter from './routes/Salary.route.js'
import NoticeRouter from "./routes/Notice.route.js"
import LeaveRouter from './routes/Leave.route.js'
import AbsenceRouter from './routes/Absence.route.js'
import AttendanceRouter from './routes/Attendance.route.js'
import RecruitmentRouter from './routes/Recuritment.route.js'
import ApplicantRouter from './routes/Applicant.route.js'
import InterviewInsightRouter from './routes/InterviewInsights.route.js'
import GenerateRequestRouter from './routes/GenerateRequest.route.js'
import CorporateCalendarRouter from './routes/CorporateCalendar.route.js'
import BalanceRouter from './routes/Balance.route.js'
import ScheduleRouter from './routes/Schedule.route.js'
import WorkPhotoRouter from './routes/WorkPhoto.route.js'
import HRProfilesRouter from './routes/HRProfiles.route.js'
import ContactSalesRouter from './routes/ContactSales.route.js'
import ContactGeneralRouter from './routes/ContactGeneral.route.js'
import BitacoraRouter from './routes/Bitacora.route.js'
import NotificationRouter from './routes/Notification.route.js'
import PushNotificationRouter from './routes/PushNotification.route.js'
import ReportRouter from './routes/Report.route.js'
import PayrollRouter from './routes/Payroll.route.js'
import { ConnectDB } from './config/connectDB.js';
import cookieParser from 'cookie-parser';
import cors from "cors"

dotenv.config()
const app = express();
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true, limit: "10mb" }))
app.use(cookieParser())

// --- CONFIGURACIÓN DE CORS CON REGEX ---
const corsOriginRegex = process.env.CORS_ORIGIN_REGEX

const allowedOrigins = [
  process.env.CLIENT_URL,
  /.vercel.app$/,
  /cron-job.org$/,  // Para servicios de cron externos
]

// Si existe CORS_ORIGIN_REGEX en env, usarlo como patrón adicional
if (corsOriginRegex) {
  try {
    allowedOrigins.push(new RegExp(corsOriginRegex))
  } catch (e) {
    console.warn('[CORS] CORS_ORIGIN_REGEX inválido:', corsOriginRegex)
  }
}

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true)
    const isAllowed = allowedOrigins.some((pattern) =>
      pattern instanceof RegExp ? pattern.test(origin) : pattern === origin
    )
    if (isAllowed) {
      callback(null, true)
    } else {
      callback(new Error('No permitido por CORS'))
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie']
}))

app.use("/api/auth/employee", EmployeeAuthRouter)
app.use("/api/auth/HR", HRAuthrouter)
app.use("/api/v1/dashboard", DashboardRouter)
app.use("/api/v1/employee", EmployeeRouter)
app.use("/api/v1/HR", HRRouter)
app.use("/api/v1/department", DepartmentRouter)
app.use("/api/v1/salary", SalaryRouter)
app.use("/api/v1/notice", NoticeRouter)
app.use("/api/v1/leave", LeaveRouter)
app.use("/api/v1/absence", AbsenceRouter)
app.use("/api/v1/attendance", AttendanceRouter)
app.use("/api/v1/recruitment", RecruitmentRouter)
app.use("/api/v1/applicant", ApplicantRouter)
app.use("/api/v1/interview-insights", InterviewInsightRouter)
app.use("/api/v1/generate-request", GenerateRequestRouter)
app.use("/api/v1/corporate-calendar", CorporateCalendarRouter)
app.use("/api/v1/balance", BalanceRouter)
app.use("/api/v1/schedule", ScheduleRouter)
app.use("/api/v1/workphoto", WorkPhotoRouter)
app.use("/api/v1/hr-profiles", HRProfilesRouter)
app.use("/api/v1/contact", ContactSalesRouter)
app.use("/api/v1/contact", ContactGeneralRouter)
app.use("/api/v1/bitacora", BitacoraRouter)
app.use("/api/v1/notification", NotificationRouter)
app.use("/api/v1/push", PushNotificationRouter)
app.use("/api/v1/report", ReportRouter)
app.use("/api/v1/payroll", PayrollRouter)

// ✅ Health check extendido (DB + Redis + Firebase)
app.get("/api/health", async (req, res) => {
    const checks = {
        status: "ok",
        timestamp: new Date().toISOString(),
        services: {}
    }

    // 1. MongoDB
    try {
        const db = (await import("./config/connectDB.js")).default
        // ConnectDB returns mongoose connection
        const mongoose = (await import("mongoose")).default
        checks.services.mongodb = {
            status: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
            readyState: mongoose.connection.readyState
        }
    } catch (e) {
        checks.services.mongodb = { status: "error", message: e.message }
        checks.status = "degraded"
    }

    // 2. Redis / Bull Queue
    try {
        const { redisClient } = await import("./config/redis.js")
        checks.services.redis = {
            status: redisClient.status === "ready" ? "connected" : redisClient.status,
            clientStatus: redisClient.status
        }
        if (redisClient.status !== "ready") checks.status = "degraded"
    } catch (e) {
        checks.services.redis = { status: "error", message: e.message }
        checks.status = "degraded"
    }

    // 3. Bull Queues
    try {
        const { payrollQueues } = await import("./config/queue.js")
        const queueStatus = {}
        for (const [name, queue] of Object.entries(payrollQueues)) {
            queueStatus[name] = {
                status: "ready",
                waiting: await queue.getWaitingCount(),
                active: await queue.getActiveCount(),
                completed: await queue.getCompletedCount(),
                failed: await queue.getFailedCount(),
            }
        }
        checks.services.queues = queueStatus
    } catch (e) {
        checks.services.queues = { status: "error", message: e.message }
        checks.status = "degraded"
    }

    // 4. Firebase Admin (opcional)
    try {
        if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
            const admin = (await import("firebase-admin")).default
            if (!admin.apps.length) {
                admin.initializeApp({
                    credential: admin.credential.cert({
                        projectId: process.env.FIREBASE_PROJECT_ID,
                        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
                    }),
                })
            }
            checks.services.firebase = { status: "initialized" }
        } else {
            checks.services.firebase = { status: "not_configured" }
        }
    } catch (e) {
        checks.services.firebase = { status: "error", message: e.message }
        checks.status = "degraded"
    }

    const statusCode = checks.status === "ok" ? 200 : 503
    res.status(statusCode).json(checks)
})

const PORT = process.env.PORT || 10000

app.listen(PORT, async () => {
  await ConnectDB()
  console.log(`Server running on http://localhost:${PORT}`)
})
