/**
 * first-seed.mjs — Dynamic seed script (fechas relativas a new Date())
 *
 * Genera el dataset completo de desarrollo con fechas FRESCAS (hoy / semana
 * actual / mes actual) para poder probar TODAS las funcionalidades que
 * dependen del "ahora" (asistencia de hoy, horarios activos, reporte diario/
 * semanal, "Este mes", snapshots históricos recientes, etc.).
 *
 * Contrato preservado (MASTER-INIT §7): org + HR son creados por el signup;
 * este script localiza al HR por email y genera el resto.
 *
 * Uso:
 *   node server/first-seed.mjs              # Solo sobre DB vacía (aborta si ya hay empleados)
 *   node server/first-seed.mjs --force      # Borra colecciones generadas y regenera (preserva org+HR)
 *
 * Prerequisitos: Docker mongo corriendo + signup HR completado.
 */
import { MongoClient, ObjectId } from "mongodb"
import { fileURLToPath } from "url"
import { dirname } from "path"

const __dirname = dirname(fileURLToPath(import.meta.url))
const MONGO_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/condove_local"

// ─── Colecciones gestionadas por el seed (las que regenera --force) ─────────
const GENERATED_COLLECTIONS = [
  "departments", "employees", "schedules", "bitacoras", "workphotos",
  "leaves", "salaries", "attendances", "notices", "applicants",
  "weeklyreportsnapshots",
]

// ─── Identidades embebidas (credenciales documentadas, estables) ────────────
const DEPARTMENTS = [
  { name: "Administración", description: "Gestión financiera y administrativa" },
  { name: "Recursos Humanos", description: "Talento y bienestar del personal" },
  { name: "Operaciones", description: "Operación de condominios e instalaciones" },
  { name: "Ventas", description: "Comercialización y atención a clientes" },
  { name: "Tecnología", description: "Desarrollo y soporte de sistemas" },
  { name: "Mantenimiento", description: "Mantenimiento preventivo y correctivo" },
]

const EMPLOYEES_EMBEDDED = [
  { firstname: "María", lastname: "Pérez", email: "maría.pérez0@test.local" },
  { firstname: "Carlos", lastname: "Gómez", email: "carlos.gómez1@test.local" },
  { firstname: "Ana", lastname: "Rodríguez", email: "ana.rodríguez2@test.local" },
  { firstname: "José", lastname: "Fernández", email: "josé.fernández3@test.local" },
  { firstname: "Luisa", lastname: "López", email: "luisa.lópez4@test.local" },
  { firstname: "Pedro", lastname: "Martínez", email: "pedro.martínez5@test.local" },
  { firstname: "Carmen", lastname: "García", email: "carmen.garcía6@test.local" },
  { firstname: "Miguel", lastname: "Sánchez", email: "miguel.sánchez7@test.local" },
  { firstname: "Rosa", lastname: "Romero", email: "rosa.romero8@test.local" },
  { firstname: "Andrés", lastname: "Díaz", email: "andrés.díaz9@test.local" },
  { firstname: "Elena", lastname: "Pérez", email: "elena.pérez10@test.local" },
  { firstname: "Jorge", lastname: "Gómez", email: "jorge.gómez11@test.local" },
  { firstname: "Paula", lastname: "Rodríguez", email: "paula.rodríguez12@test.local" },
  { firstname: "Raúl", lastname: "Fernández", email: "raúl.fernández13@test.local" },
  { firstname: "Sofía", lastname: "López", email: "sofía.lópez14@test.local" },
  { firstname: "Diego", lastname: "Martínez", email: "diego.martínez15@test.local" },
  { firstname: "Valeria", lastname: "García", email: "valeria.garcía16@test.local" },
  { firstname: "Oscar", lastname: "Sánchez", email: "oscar.sánchez17@test.local" },
  { firstname: "Gabriela", lastname: "Romero", email: "gabriela.romero18@test.local" },
  { firstname: "Félix", lastname: "Díaz", email: "félix.díaz19@test.local" },
  { firstname: "Irene", lastname: "Pérez", email: "irene.pérez20@test.local" },
  { firstname: "Tomás", lastname: "Gómez", email: "tomás.gómez21@test.local" },
  { firstname: "Lucía", lastname: "Rodríguez", email: "lucía.rodríguez22@test.local" },
  { firstname: "Víctor", lastname: "Fernández", email: "víctor.fernández23@test.local" },
]

const EMP_PASSWORD_HASH = "$2b$10$iFeWkaZb4hICQa8A.yItreRvr17hs9cQ4lj89J4teazL4ABaseyDy" // "Empleado123"

// ─── PRNG determinista (mulberry32) — volúmenes estables entre corridas ─────
let seedState = 20260921
function rng() {
  seedState |= 0; seedState = (seedState + 0x6D2B79F5) | 0
  let t = Math.imul(seedState ^ (seedState >>> 15), 1 | seedState)
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}
const randInt = (min, max) => Math.floor(rng() * (max - min + 1)) + min

// ─── Helpers de fecha (UTC — convención del proyecto) ───────────────────────
const DAY_MS = 86400000
const atUTC = (d, h = 0, m = 0, s = 0) => {
  const x = new Date(d); x.setUTCHours(h, m, s, 0); return x
}
const addDays = (d, n) => new Date(d.getTime() + n * DAY_MS)
const startOfDay = (d) => { const x = new Date(d); x.setUTCHours(0, 0, 0, 0); return x }
const todayStr = () => startOfDay(new Date()).toISOString().slice(0, 10)
const mondayOfWeek = (d) => {
  const x = startOfDay(d)
  const dow = x.getUTCDay() // 0=Dom ... 6=Sáb
  return addDays(x, dow === 0 ? -6 : 1 - dow)
}
const DAY_NAMES = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"]
const isWeekend = (d) => { const dow = d.getUTCDay(); return dow === 0 || dow === 6 }
const isoWeek = (d) => {
  const target = new Date(d.getTime() + 3 * DAY_MS)
  const monday = mondayOfWeek(target)
  return Math.round((monday - new Date(Date.UTC(monday.getUTCFullYear(), 0, 1))) / (7 * DAY_MS)) + 1
}

// ─── MAIN ────────────────────────────────────────────────────────────────────
async function main() {
  const force = process.argv.includes("--force")
  const client = new MongoClient(MONGO_URI)
  const totals = { departments: 0, employees: 0, schedules: 0, bitacoras: 0, workphotos: 0, leaves: 0, salaries: 0, attendances: 0, notices: 0, applicants: 0 }

  try {
    await client.connect()
    const db = client.db()
    console.log("✅ Connected to MongoDB\n")

    // ─── Resolver org + HR (contrato MASTER-INIT §7) ────────────────
    const hrEmail = process.env.SEED_HR_EMAIL || "admin@test.local"
    const hr = await db.collection("humanresources").findOne({ email: hrEmail })
    if (!hr) {
      console.error(`❌ HR ${hrEmail} no encontrado. Ejecuta el signup (§7 MASTER-INIT) primero.`)
      process.exit(1)
    }
    const org = await db.collection("organizations").findOne({ _id: hr.organizationID })
    if (!org) {
      console.error("❌ Organization no encontrada para HR.")
      process.exit(1)
    }
    const orgId = org._id
    const hrId = hr._id
    console.log(`📋 Org: ${org.name} (${orgId})`)
    console.log(`🔑 HR: ${hr.firstname} ${hr.lastname} (${hrId})\n`)

    // ─── Guard sin --force: abortar si la DB ya tiene empleados ───────
    if (!force) {
      const empCount = await db.collection("employees").countDocuments()
      if (empCount > 0) {
        console.error(`❌ DB ya tiene ${empCount} empleados. Usa --force para regenerar (destructivo).`)
        process.exit(1)
      }
      console.log("🟢 DB sin empleados — procediendo con seed fresco.\n")
    }

    // ─── --force: limpiar SOLO colecciones generadas (preserva org+HR) ──
    if (force) {
      console.log("🧹 --force: limpiando colecciones generadas (org/HR se preservan)...")
      for (const coll of GENERATED_COLLECTIONS) {
        const r = await db.collection(coll).deleteMany({})
        console.log(`   ↳ ${coll}: ${r.deletedCount} documentos eliminados`)
      }
      console.log("")
    }

    // ─── Helpers de contexto temporal ─────────────────────────────────
    const NOW = new Date()
    const TODAY = startOfDay(NOW)
    const MONDAY = mondayOfWeek(TODAY)
    const SUNDAY = addDays(MONDAY, 6)
    const thisWeek = isoWeek(MONDAY)
    const todayDow = TODAY.getUTCDay()
    const todayIdx = todayDow === 0 ? 6 : todayDow - 1 // 0=Lun ... 6=Dom

    // ─── 1. DEPARTMENTS ───────────────────────────────────────────────
    console.log("🔄 Creating Departments...")
    const newDeptIds = []
    for (const dept of DEPARTMENTS) {
      const r = await db.collection("departments").insertOne({
        name: dept.name, description: dept.description,
        employees: [], HumanResources: [hrId], notice: [],
        organizationID: orgId, createdAt: new Date(), updatedAt: new Date(),
      })
      newDeptIds.push(r.insertedId)
      totals.departments++
      console.log(`   ✅ ${dept.name}`)
    }

    // ─── 2. EMPLOYEES (round-robin a departamentos, con asistencia) ───
    console.log("🔄 Creating Employees...")
    const newEmpIds = EMPLOYEES_EMBEDDED.map(async (emp, i) => {
      const deptId = newDeptIds[i % newDeptIds.length]
      const r = await db.collection("employees").insertOne({
        firstname: emp.firstname, lastname: emp.lastname, email: emp.email,
        password: EMP_PASSWORD_HASH,
        contactnumber: `0414${randInt(1000000, 9999999)}`,
        role: "Employee", isverified: true, isactive: true,
        department: deptId, organizationID: orgId,
        createdAt: new Date(), updatedAt: new Date(),
      })
      await db.collection("departments").updateOne(
        { _id: deptId }, { $push: { employees: r.insertedId } }
      )
      totals.employees++
      console.log(`   ✅ ${emp.firstname} ${emp.lastname} → ${DEPARTMENTS[i % DEPARTMENTS.length].name}`)
      return r.insertedId
    })
    const empIds = await Promise.all(newEmpIds)
    console.log(`   📊 ${empIds.length} employees creados\n`)

    // ─── 3. SCHEDULES (semana actual activos + 2 semanas pasadas) ─────
    console.log("🔄 Creating Schedules...")
    const TASK_TEMPLATES = [
      ["Inspección de instalaciones", "09:00", "10:30"],
      ["Reporte de avance", "11:00", "12:00"],
      ["Reunión de equipo", "14:00", "15:00"],
      ["Mantenimiento preventivo", "15:30", "17:00"],
      ["Atención a residentes", "08:30", "10:00"],
      ["Actualización de registros", "10:30", "11:30"],
      ["Coordinación logística", "13:00", "14:30"],
    ]

    // 3a. Semana actual — horarios ACTIVOS (todos los empleados, tareas por día)
    for (let i = 0; i < empIds.length; i++) {
      const empId = empIds[i]
      const dayTasks = []
      for (let dIdx = 0; dIdx < 7; dIdx++) {
        if (dIdx >= 5 && i % 3 !== 0) continue // sáb/dom solo algunos
        const tasks = []
        const n = randInt(1, 2) + (dIdx === todayIdx ? 1 : 0) // hoy tiene más tareas
        for (let t = 0; t < n; t++) {
          const [title, st, et] = TASK_TEMPLATES[(i + t) % TASK_TEMPLATES.length]
          const completed = dIdx < todayIdx || (dIdx === todayIdx && t % 2 === 0) // pasados completos, hoy una sí una no
          tasks.push({
            _id: new ObjectId(), // 🔑 obligatorio: HandleCompleteTask busca por subdoc _id
            title, description: `Tarea programada ${DAY_NAMES[dIdx]} W${thisWeek}`,
            starttime: st, endtime: et,
            completed,
            completedAt: completed ? atUTC(addDays(MONDAY, dIdx), randInt(9, 16)) : null,
          })
        }
        dayTasks.push({ _id: new ObjectId(), day: DAY_NAMES[dIdx], tasks }) // 🔑 día con _id real
      }
      await db.collection("schedules").insertOne({
        employee: empId,
        title: `Horario semanal W${thisWeek}`,
        description: "Horario activo generado por seed dinámica",
        startdate: MONDAY, enddate: SUNDAY, isactive: true, status: "active", closedAt: null,
        createdby: hrId, organizationID: orgId,
        schedule: dayTasks, createdAt: MONDAY, updatedAt: NOW,
      })
      totals.schedules++
    }

    // 3b. 2 semanas pasadas — horarios CERRADOS (histórico)
    for (let w = 1; w <= 2; w++) {
      const wMonday = addDays(MONDAY, -7 * w)
      const wSunday = addDays(wMonday, 6)
      for (let i = 0; i < 6; i++) {
        const empId = empIds[i]
        const dayTasks = [0, 1, 2, 3, 4].map((dIdx) => ({
          _id: new ObjectId(), // 🔑 día con _id real
          day: DAY_NAMES[dIdx],
          tasks: [{
            _id: new ObjectId(), // 🔑 tarea con _id real
            title: TASK_TEMPLATES[i % TASK_TEMPLATES.length][0],
            description: `Horario cerrado W${isoWeek(wMonday)}`,
            starttime: "09:00", endtime: "17:00",
            completed: true,
            completedAt: atUTC(addDays(wMonday, dIdx), 15),
          }],
        }))
        await db.collection("schedules").insertOne({
          employee: empId,
          title: `Horario semanal W${isoWeek(wMonday)}`,
          description: "Horario histórico cerrado (seed dinámica)",
          startdate: wMonday, enddate: wSunday, isactive: false, status: "closed", closedAt: wSunday,
          createdby: hrId, organizationID: orgId,
          schedule: dayTasks, createdAt: wMonday, updatedAt: wSunday,
        })
        totals.schedules++
      }
    }
    console.log(`   ✅ ${totals.schedules} schedules (activos W${thisWeek} + 2 históricos)\n`)

    // ─── 4. BITÁCORAS (ventana reporte ayer/hoy + histórico 3 semanas) ──
    console.log("🔄 Creating Bitácoras...")
    const BITACORA_CONTENT = [
      "Inspección realizada en el área común, sin novedades.",
      "Se completó la actualización de registros del departamento.",
      "Reunión de coordinación con el equipo. Pendiente seguimiento del acta.",
      "Atención a residentes: 3 solicitudes atendidas, 1 en seguimiento.",
      "Revisión de inventario y reposición de materiales.",
    ]
    const bitacoraDocs = []
    // Ventana del reporte: ayer + hoy (para DAILY/WEEKLY_LIVE)
    for (let offset = 0; offset <= 1; offset++) {
      const day = addDays(TODAY, -offset)
      for (let i = 0; i < 3; i++) {
        bitacoraDocs.push({
          title: offset === 0 ? `Bitácora diaria ${todayStr()}` : `Bitácora ${DAY_NAMES[day.getUTCDay()]} W${thisWeek}`,
          content: BITACORA_CONTENT[randInt(0, BITACORA_CONTENT.length - 1)],
          images: [], videos: [], employee: empIds[randInt(0, empIds.length - 1)],
          isDeleted: false, deletedAt: null, organizationID: orgId,
          createdAt: atUTC(day, randInt(9, 17)), updatedAt: atUTC(day, randInt(9, 17)),
        })
      }
    }
    // Histórico: 3 semanas pasadas
    for (let w = 1; w <= 3; w++) {
      for (let i = 0; i < 2; i++) {
        const day = addDays(MONDAY, -7 * w + randInt(0, 4))
        bitacoraDocs.push({
          title: `Bitácora semanal W${isoWeek(day)}`,
          content: BITACORA_CONTENT[randInt(0, BITACORA_CONTENT.length - 1)],
          images: [], videos: [], employee: empIds[randInt(0, empIds.length - 1)],
          isDeleted: false, deletedAt: null, organizationID: orgId,
          createdAt: atUTC(day, randInt(9, 17)), updatedAt: atUTC(day, randInt(9, 17)),
        })
      }
    }
    const br = await db.collection("bitacoras").insertMany(bitacoraDocs)
    totals.bitacoras = br.insertedCount
    console.log(`   ✅ ${totals.bitacoras} bitácoras (incl. ayer/hoy → ventana reporte)\n`)

    // ─── 5. WORK PHOTOS (ventana + histórico, workdate T12:00 UTC) ─────
    console.log("🔄 Creating Work Photos...")
    const wpDocs = []
    for (let offset = 0; offset <= 1; offset++) {
      for (let i = 0; i < 2; i++) {
        const day = addDays(TODAY, -offset)
        wpDocs.push({
          employee: empIds[randInt(0, empIds.length - 1)],
          photourl: `https://placehold.co/800x600?text=seed${todayStr()}-${i}`,
          publicid: `seed-${todayStr()}-${i}-${offset}`,
          description: `Foto de trabajo ${todayStr()} (${offset === 0 ? "hoy" : "ayer"})`,
          workdate: atUTC(day, 12), captureDate: atUTC(day, 12),
          gpsLocation: { lat: 10.4806, lng: -66.9036 },
          reviewedby: i % 2 === 0 ? hrId : null,
          reviewedat: i % 2 === 0 ? atUTC(day, 15) : null,
          organizationID: orgId, createdAt: atUTC(day, 12), updatedAt: atUTC(day, 12),
        })
      }
    }
    for (let w = 1; w <= 3; w++) {
      const day = addDays(MONDAY, -7 * w + randInt(0, 4))
      wpDocs.push({
        employee: empIds[randInt(0, empIds.length - 1)],
        photourl: `https://placehold.co/800x600?text=semanaW${isoWeek(day)}`,
        publicid: `seed-W${isoWeek(day)}`,
        description: `Foto semana W${isoWeek(day)}`,
        workdate: atUTC(day, 12), captureDate: atUTC(day, 12),
        gpsLocation: { lat: 10.4806, lng: -66.9036 },
        reviewedby: w % 2 === 0 ? hrId : null, reviewedat: w % 2 === 0 ? atUTC(day, 15) : null,
        organizationID: orgId, createdAt: atUTC(day, 12), updatedAt: atUTC(day, 12),
      })
    }
    const wpr = await db.collection("workphotos").insertMany(wpDocs)
    totals.workphotos = wpr.insertedCount
    console.log(`   ✅ ${totals.workphotos} work photos\n`)

    // ─── 6. LEAVES (mix: Pending futuros, Approved, Rejected, activo hoy) ─
    console.log("🔄 Creating Leaves...")
    const leaveDocs = []
    // Pending (futuros — HR puede aprobar/rechazar)
    for (let i = 0; i < 5; i++) {
      const start = addDays(TODAY, randInt(2, 12))
      leaveDocs.push({
        employee: empIds[randInt(0, empIds.length - 1)],
        leavetype: ["Vacaciones", "Personal", "Reposo Médico"][randInt(0, 2)],
        startdate: start, enddate: addDays(start, randInt(1, 3)),
        title: "Solicitud de permiso", reason: "Solicitud generada por seed dinámica",
        status: "Pending", approvedby: null, isDeleted: false, deletedAt: null,
        organizationID: orgId, createdAt: atUTC(TODAY, randInt(8, 18)), updatedAt: NOW,
      })
    }
    // Approved (pasados y futuros)
    for (let i = 0; i < 4; i++) {
      const past = i % 2 === 0
      const start = past ? addDays(TODAY, -randInt(3, 20)) : addDays(TODAY, randInt(4, 20))
      leaveDocs.push({
        employee: empIds[randInt(0, empIds.length - 1)],
        leavetype: ["Vacaciones", "Personal", "Reposo Médico", "Otro"][randInt(0, 3)],
        startdate: start, enddate: addDays(start, randInt(1, 4)),
        title: past ? "Permiso tomado" : "Permiso aprobado futuro",
        reason: past ? "Permiso histórico aprobado" : "Permiso programado",
        status: "Approved", approvedby: hrId, isDeleted: false, deletedAt: null,
        organizationID: orgId, createdAt: past ? start : NOW, updatedAt: NOW,
      })
    }
    // Rejected (pasados)
    for (let i = 0; i < 3; i++) {
      const start = addDays(TODAY, -randInt(10, 30))
      leaveDocs.push({
        employee: empIds[randInt(0, empIds.length - 1)],
        leavetype: "Personal", startdate: start, enddate: addDays(start, 1),
        title: "Permiso rechazado", reason: "Motivo no aprobado",
        status: "Rejected", approvedby: hrId, isDeleted: false, deletedAt: null,
        organizationID: orgId, createdAt: start, updatedAt: NOW,
      })
    }
    // VACACIONES ACTIVAS HOY (1-2 empleados — "de vacaciones hoy")
    for (let i = 0; i < 2; i++) {
      leaveDocs.push({
        employee: empIds[empIds.length - 1 - i],
        leavetype: "Vacaciones",
        startdate: addDays(TODAY, -2), enddate: addDays(TODAY, 4),
        title: "Vacaciones en curso", reason: "Vacaciones aprobadas en curso",
        status: "Approved", approvedby: hrId, isDeleted: false, deletedAt: null,
        organizationID: orgId, createdAt: addDays(TODAY, -10), updatedAt: NOW,
      })
    }
    const lr = await db.collection("leaves").insertMany(leaveDocs)
    totals.leaves = lr.insertedCount
    console.log(`   ✅ ${totals.leaves} leaves (Pending/Approved/Rejected/Activos hoy)\n`)

    // ─── 7. SALARIES (duedate FUTURO — respeta validación del modelo) ────
    console.log("🔄 Creating Salaries...")
    const salaryDocs = []
    for (let i = 0; i < empIds.length; i++) {
      const basic = 2000 + randInt(0, 12) * 250
      const bonuses = randInt(0, 3) * 100
      const deductions = randInt(0, 5) * 50
      salaryDocs.push({
        employee: empIds[i],
        basicpay: basic, bonuses, deductions, netpay: basic + bonuses - deductions,
        currency: "Bs",
        duedate: addDays(TODAY, 7), // futuro
        paymentdate: i % 4 === 0 ? addDays(TODAY, -8) : null,
        status: i % 4 === 0 ? "Paid" : "Pending",
        organizationID: orgId, createdAt: atUTC(TODAY, randInt(8, 18)), updatedAt: NOW,
      })
    }
    const sr = await db.collection("salaries").insertMany(salaryDocs)
    totals.salaries = sr.insertedCount
    console.log(`   ✅ ${totals.salaries} salaries (duedate futuro)\n`)

    // ─── 8. ATTENDANCES (10 días hábiles hacia atrás INCL. HOY) ─────────
    console.log("🔄 Creating Attendances...")
    // Construir lista de últimos 10 días hábiles (hoy incluido)
    const workDays = []
    let cursor = TODAY
    while (workDays.length < 10) {
      if (!isWeekend(cursor)) workDays.push(cursor)
      cursor = addDays(cursor, -1)
    }
    workDays.reverse()

    const attDocs = empIds.map((empId, eIdx) => {
      const log = workDays.map((day, dIdx) => {
        const isTodayLog = dIdx === workDays.length - 1
        let logstatus = "Present"
        const r = rng()
        if (!isTodayLog) logstatus = r < 0.12 ? "Late" : (r < 0.16 ? "Absent" : "Present")
        else logstatus = eIdx % 6 === 0 ? "Late" : "Present"

        const checkin = logstatus !== "Absent" ? atUTC(day, logstatus === "Late" ? randInt(9, 11) : randInt(8, 9), randInt(0, 59)) : null
        const checkout = logstatus === "Absent" ? null : (isTodayLog && eIdx % 3 !== 0 ? null : atUTC(day, randInt(17, 18), randInt(0, 59)))
        const duration = checkin && checkout ? Math.round((checkout - checkin) / 60000) : (isTodayLog && checkin ? null : 0)
        return {
          logdate: day,
          logstatus,
          checkin,
          checkout,
          duration,
        }
      })
      return {
        employee: empId, status: "Present", attendancelog: log,
        organizationID: orgId, createdAt: atUTC(TODAY, randInt(8, 18)), updatedAt: NOW,
      }
    })
    const ar = await db.collection("attendances").insertMany(attDocs)
    totals.attendances = ar.insertedCount
    const todayLogs = attDocs.filter(d => d.attendancelog.some(l => startOfDay(l.logdate).toISOString().slice(0, 10) === todayStr())).length
    console.log(`   ✅ ${totals.attendances} attendances — ${todayLogs} con log de HOY (${todayStr()})`)

    // Back-reference obligatoria: Employee.attendance → Attendance._id
    // (HandleGetMyAttendance hace Attendance.findById(employee.attendance))
    console.log("   🔗 Vinculando employee.attendance → attendance._id...")
    for (let i = 0; i < empIds.length; i++) {
      await db.collection("employees").updateOne(
        { _id: empIds[i] },
        { $set: { attendance: ar.insertedIds[i] } }
      )
    }
    console.log(`   ✅ ${empIds.length} employees vinculados a su attendance\n`)

    // ─── 9. NOTICES (recientes — dashboard muestra últimas 10) ──────────
    console.log("🔄 Creating Notices...")
    const noticeDocs = []
    for (let i = 0; i < 8; i++) {
      const audience = ["todos", "department", "employee"][randInt(0, 2)]
      const day = addDays(TODAY, -randInt(0, 5))
      noticeDocs.push({
        title: `Aviso ${i + 1}: ${["Mantenimiento programado", "Reunión general", "Nuevo proceso", "Recordatorio", "Fechas de pago", "Capacitación", "Política interna", "Anuncio"][i]}`,
        content: `Contenido del aviso ${i + 1} generado por seed dinámica. ${"Lorem ipsum dolor sit amet, consectetur adipiscing elit. ".repeat(2)}`,
        audience,
        ...(audience === "department" ? { department: newDeptIds[randInt(0, newDeptIds.length - 1)] } : {}),
        ...(audience === "employee" ? { employee: empIds[randInt(0, empIds.length - 1)] } : {}),
        createdby: hrId, organizationID: orgId,
        createdAt: atUTC(day, randInt(8, 18)), updatedAt: atUTC(day, randInt(8, 18)),
      })
    }
    const nr = await db.collection("notices").insertMany(noticeDocs)
    totals.notices = nr.insertedCount
    console.log(`   ✅ ${totals.notices} notices recientes\n`)

    // ─── 10. APPLICANTS (pipeline completo, creados esta semana) ────────
    console.log("🔄 Creating Applicants...")
    const STAGES = ["Nuevo", "Contactado", "Entrevistado", "Ofrecido", "Seleccionado"]
    const ROLES = ["Gerente", "Coordinador", "Analista", "Desarrollador", "Asistente", "Supervisor"]
    const appDocs = []
    for (let i = 0; i < 12; i++) {
      const day = addDays(TODAY, -randInt(0, 6))
      appDocs.push({
        firstname: `Postulante${i + 1}`, lastname: `Semilla`,
        email: `postulante${i + 1}@test.local`,
        contactnumber: `0414${randInt(1000000, 9999999)}`,
        appliedrole: ROLES[i % ROLES.length],
        recruitmentstatus: STAGES[i % STAGES.length],
        organizationID: orgId,
        createdAt: atUTC(day, randInt(8, 18)), updatedAt: atUTC(day, randInt(8, 18)),
      })
    }
    const apr = await db.collection("applicants").insertMany(appDocs)
    totals.applicants = apr.insertedCount
    console.log(`   ✅ ${totals.applicants} applicants en pipeline\n`)

    // ─── 11. SUMMARY ────────────────────────────────────────────────────
    const totalDocs = Object.values(totals).reduce((a, b) => a + b, 0)
    console.log("═".repeat(55))
    console.log("📊 DYNAMIC SEED COMPLETE")
    console.log("═".repeat(55))
    for (const [k, v] of Object.entries(totals)) {
      console.log(`   ${k.padEnd(14)} ${v}`)
    }
    console.log("─".repeat(55))
    console.log(`   TOTAL        ${totalDocs}`)
    console.log("═".repeat(55))
    console.log(`\n📅 Ventana generada: semana W${thisWeek} (${MONDAY.toISOString().slice(0, 10)} → ${SUNDAY.toISOString().slice(0, 10)})`)
    console.log(`🗓️  Hoy: ${todayStr()} | Snapshots históricos: se generan al final (seed-reports)\n`)

  } catch (err) {
    console.error("❌ Error:", err.message)
    process.exit(1)
  } finally {
    await client.close()
  }
}

// ─── Ejecución + generación de snapshots semanales (seed-reports, dinámico) ─
main()
  .then(async () => {
    console.log("\n🔄 [seed] Generando snapshots semanales históricos (5 semanas)...")
    try {
      const { seedReports } = await import("./seed-reports.mjs")
      await seedReports({ count: 5 })
      console.log("✅ [seed] Snapshots semanales generados")
    } catch (seedErr) {
      console.warn("⚠️ [seed] No se pudieron generar snapshots:", seedErr.message)
    }
  })
  .catch((err) => {
    console.error("❌ first-seed Error:", err.message)
    process.exit(1)
  })