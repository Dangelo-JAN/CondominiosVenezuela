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
import BitacoraRouter from './routes/Bitacora.route.js'
import NotificationRouter from './routes/Notification.route.js'
import PushNotificationRouter from './routes/PushNotification.route.js'
import { ConnectDB } from './config/connectDB.js';
import cookieParser from 'cookie-parser';
import cors from "cors"

dotenv.config()
const app = express();
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true, limit: "10mb" }))
app.use(cookieParser())

// --- CONFIGURACIÓN DE CORS CON REGEX ---
const allowedOrigins = [
  process.env.CLIENT_URL,
  /\.vercel\.app$/,
  /cron-job\.org$/,  // Para servicios de cron externos
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    const isAllowed = allowedOrigins.some((pattern) =>
      pattern instanceof RegExp ? pattern.test(origin) : pattern === origin
    );
    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error('No permitido por CORS (Regex Vercel)'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie']
}));

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
app.use("/api/v1/bitacora", BitacoraRouter)
app.use("/api/v1/notification", NotificationRouter)
app.use("/api/v1/push", PushNotificationRouter)

// ✅ Health check (MUY recomendado)
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok" })
})

const PORT = process.env.PORT || 10000

app.listen(PORT, async () => {
  await ConnectDB()
  console.log(`Server running on http://localhost:${PORT}`)
})
