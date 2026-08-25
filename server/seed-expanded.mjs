import { MongoClient } from "mongodb"

// ─── CONFIG ─────────────────────────────────────────────────────
const MONGO_URI = "mongodb://localhost:27017/condove_local"
const BASE_URL = "http://localhost:5173/images"

// Imágenes disponibles en client/public/images
const IMAGES = [
  "HOME-Modo-claro.png",
  "HOME-Modo-oscuro.png",
  "LOGIN.png",
  "SIGNUP.png",
  "FOTOS-Modo-oscuro.png",
  "HORARIOS-Modo-oscuro.png",
  "DASHBOARDCoordinacion-Modo-oscuro.png",
  "INICIOEmpleados-Modo-claro.png",
  "MI-HORARIO-Modo-claro.png",
  "MI-PERFIL-Modo-claro.png",
  "Movil-HOME-Modo-claro.jpeg",
  "Movil-HOME-Modo-oscuro.jpeg",
  "Movil-INICIO-Modo-oscuro.jpeg",
  "Movil-FOTOS-Modo-claro.jpeg",
  "Movil-HORARIO-Modo-oscuro.jpeg",
  "Movil-PERFIL-Modo-oscuro.jpeg",
  "Movil-SIGNUP-Modo-oscuro.jpeg",
  "Movil-LOGIN-Modo-claro.jpeg",
  "Movil-DASHBOARD-Modo-claro.jpeg",
  "Movil-SIDEBAR-Modo-claro.jpeg",
]

const img = (name) => `${BASE_URL}/${name}`

// ─── DÍAS DE LA SEMANA ──────────────────────────────────────────
const WEEKDAYS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"]

// ─── TEMPLATES: TAREAS POR HORARIO ──────────────────────────────
const TASK_TEMPLATES = [
  { title: "Revisión de áreas comunes", description: "Inspeccionar estado de pasillos, lobby y zonas recreativas" },
  { title: "Supervisión de limpieza", description: "Verificar cumplimiento del protocolo de limpieza diaria" },
  { title: "Control de acceso", description: "Monitorear registro de visitantes y proveedores" },
  { title: "Reunión de coordinación", description: "Alineación de actividades del día con el equipo" },
  { title: "Revisión de reportes", description: "Análisis de reportes pendientes y asignación de tareas" },
  { title: "Inspección de bombas y tanques", description: "Verificar presión y estado de sistemas hidráulicos" },
  { title: "Mantenimiento de áreas verdes", description: "Supervisar jardinería y poda de zonas comunes" },
  { title: "Auditoría de inventario", description: "Conteo y verificación de materiales de almacén" },
  { title: "Atención a residentes", description: "Gestionar solicitudes y quejas pendientes" },
  { title: "Verificación de cámaras CCTV", description: "Revisar funcionamiento de sistema de seguridad" },
  { title: "Control de proveedores", description: "Verificar entregas de insumos y servicios contratados" },
  { title: "Revisión de contratos", description: "Análisis de vigencia y condiciones de contratos activos" },
  { title: "Inspección de estacionamiento", description: "Verificar estado de zonas, señalización y Iluminación" },
  { title: "Reporte financiero semanal", description: "Compilación de ingresos, egresos y balance del período" },
  { title: "Capacitación al personal", description: "Sesión de entrenamiento en protocolos de seguridad" },
  { title: "Verificación de ascensores", description: "Revisionar estado mecánico y certificados de mantenimiento" },
  { title: "Control de residuos", description: "Supervisar separación y recolección de desechos" },
  { title: "Revisión de iluminación", description: "Inspeccionar bombillos y lámparas de áreas comunes" },
]

// ─── TEMPLATES: BITÁCORAS ───────────────────────────────────────
const BITACORA_TEMPLATES = [
  { title: "Inspección de áreas comunes", content: "Se realizó inspección de pasillos, lobby y zonas recreativas. Todo en orden, sin novedades." },
  { title: "Reporte de mantenimiento preventivo", content: "Se ejecutaron tareas de mantenimiento preventivo en bombas de agua y sistema eléctrico general." },
  { title: "Control de acceso - proveedores", content: "Registro de 5 proveedores de mantenimiento. Todos con documentación en regla." },
  { title: "Supervisión de limpieza diaria", content: "Personal de limpieza cumplió protocolo. Se verificaron áreas críticas: baños, cocina, lobby." },
  { title: "Inspección de seguridad CCTV", content: "Revisión de 16 cámaras. 2 con imagen degradada, programado reemplazo de cableado." },
  { title: "Revisión de áreas verdes", content: "Jardinería completó poda de zonas comunes. Se retiraron 12 bolsas de escombros vegetales." },
  { title: "Atención a residentes - quejas", content: "Se atendieron 3 quejas por ruido. Se contactaron los apartamentos involucrados." },
  { title: "Auditoría de inventario mensual", content: "Conteo completo de almacén. 3 items con stock bajo, solicitud de reposición enviada." },
  { title: "Control de ascensores", content: "Ascensor A operativo. Ascensor B en mantenimiento programado, reparación estimada 48h." },
  { title: "Reporte de iluminación", content: "Se reemplazaron 8 bombillos LED en pasillos del piso 3, 5 y 7." },
  { title: "Inspección de estacionamiento", content: "Verificación de iluminación, señalización y limpieza. Una lámpara dañada identificada." },
  { title: "Reunión de coordinación semanal", content: "Alineación de prioridades para la semana. Se definieron tareas críticas de mantenimiento." },
  { title: "Verificación de hidrantes", content: "Inspección de 6 hidrantes. Todos accesibles y con presión adecuada." },
  { title: "Control de residuos especiales", content: "Se verificó correcta separación de residuos. 2 apartamentos con dispose incorrecto, notificados." },
  { title: "Inspección de la piscina", content: "Niveles de cloro y pH dentro de parámetros. Bomba de circulación funcionando correctamente." },
  { title: "Reporte financiero quincenal", content: "Compilación de ingresos por condominios: 95% de recaudación. 3 apartados en mora." },
  { title: "Capacitación de personal nuevo", content: "Sesión de inducción para 2 nuevos vigilantes. Protocolos de acceso y emergencia cubiertos." },
  { title: "Mantenimiento de áreas infantiles", content: "Revisión de juegos y superficies. Se reparó un columpio y se pintó zona de juegos." },
  { title: "Inspección contra incendios", content: "Verificación de extintores (12 unidades). 3 vencidos, reemplazo programado." },
  { title: "Revisión de cisternas", content: "Inspección de cisternas y bombas de pozo. Niveles adecuados, sin sedimentos significativos." },
]

// ─── TEMPLATES: PERMISOS ────────────────────────────────────────
const LEAVE_TEMPLATES = [
  { leavetype: "Vacaciones", title: "Vacaciones anuales", reason: "Solicitud de vacaciones anuales acumuladas" },
  { leavetype: "Vacaciones", title: "Vacaciones programadas", reason: "Período de descanso programado" },
  { leavetype: "Vacaciones", title: "Semana santa", reason: "Receso por Semana Santa" },
  { leavetype: "Reposo Médico", title: "Consulta médica", reason: "Cita médica especialista, requiere el día completo" },
  { leavetype: "Reposo Médico", title: "Procedimiento ambulatorio", reason: "Procedimiento médico ambulatorio" },
  { leavetype: "Reposo Médico", title: "Recuperación post-operatoria", reason: "Recuperación menor, reposo de 3 días" },
  { leavetype: "Personal", title: "Asunto personal urgente", reason: "Trámite bancario personal que requiere atención presencial" },
  { leavetype: "Personal", title: "Mudanza", reason: "Reubicación de residencia, requiere día libre" },
  { leavetype: "Personal", title: "Trámite gubernamental", reason: "Renovación de documento de identidad" },
  { leavetype: "Personal", title: "Asunto familiar", reason: "Cuidado de familiar enfermo" },
  { leavetype: "Otro", title: "Capacitación externa", reason: "Curso de actualización profesional en seguridad" },
  { leavetype: "Otro", title: "Cita consular", reason: "Trámite en consulado, día completo" },
]

// ─── HELPERS ────────────────────────────────────────────────────
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function randomPick(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

function randomPicks(arr, count) {
  const shuffled = [...arr].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, Math.min(count, arr.length))
}

function daysAgo(n) {
  const d = new Date()
  d.setDate(d.getDate() - n)
  d.setHours(0, 0, 0, 0)
  return d
}

function dayDate(nDaysAgo) {
  const d = daysAgo(nDaysAgo)
  // Si cae fin de semana, retroceder al viernes
  const dow = d.getDay()
  if (dow === 0) d.setDate(d.getDate() - 2)
  if (dow === 6) d.setDate(d.getDate() - 1)
  return d
}

function generateTimeSlots(numTasks) {
  const slots = []
  const startHours = [8, 9, 10, 13, 14, 15]
  const shuffled = [...startHours].sort(() => Math.random() - 0.5)
  for (let i = 0; i < numTasks; i++) {
    const h = shuffled[i % shuffled.length]
    slots.push({
      starttime: `${String(h).padStart(2, "0")}:00`,
      endtime: `${String(h + 1).padStart(2, "0")}:30`,
    })
  }
  return slots
}

// ─── MAIN ───────────────────────────────────────────────────────
async function main() {
  const client = new MongoClient(MONGO_URI)

  try {
    await client.connect()
    const db = client.db()
    console.log("✅ Conectado a MongoDB local\n")

    // ─── Leer datos existentes ──────────────────────────────────
    const org = await db.collection("organizations").findOne()
    if (!org) {
      console.error("❌ No se encontró ninguna organización. Ejecuta el setup inicial primero (MASTER-INIT §7).")
      process.exit(1)
    }
    const orgId = org._id
    console.log(`📋 Organización: ${org.name} (${orgId})`)

    const employees = await db.collection("employees")
      .find({ organizationID: orgId })
      .toArray()
    console.log(`👥 Empleados encontrados: ${employees.length}`)

    const hrs = await db.collection("humanresources")
      .find({ organizationID: orgId })
      .toArray()
    console.log(`🔑 HRs encontrados: ${hrs.length}`)

    const departments = await db.collection("departments")
      .find({ organizationID: orgId })
      .toArray()
    console.log(`🏢 Departamentos encontrados: ${departments.length}`)

    const hrCreator = hrs[0]
    if (!hrCreator) {
      console.error("❌ No se encontró ningún HR. Ejecuta el setup inicial primero.")
      process.exit(1)
    }

    // Empleados rotativos para el seed (no todos, para que sea realista)
    const seedEmployees = employees.filter(e => e.role === "Employee")
    if (seedEmployees.length === 0) {
      console.error("❌ No hay empleados tipo Employee para asignar datos.")
      process.exit(1)
    }

    // ─── Verificar duplicados ───────────────────────────────────
    const existingSchedules = await db.collection("schedules").countDocuments({ organizationID: orgId })
    const existingBitacoras = await db.collection("bitacoras").countDocuments({ organizationID: orgId })
    const existingWorkPhotos = await db.collection("workphotos").countDocuments({ organizationID: orgId })
    const existingLeaves = await db.collection("leaves").countDocuments({ organizationID: orgId })

    console.log(`\n📊 Estado actual:`)
    console.log(`   Schedules: ${existingSchedules}`)
    console.log(`   Bitácoras: ${existingBitacoras}`)
    console.log(`   WorkPhotos: ${existingWorkPhotos}`)
    console.log(`   Leaves: ${existingLeaves}`)

    let insertedTotal = { schedules: 0, bitacoras: 0, workphotos: 0, leaves: 0 }

    // ─── 1. SCHEDULES + TASKS ───────────────────────────────────
    console.log("\n🔄 Generando Schedules + Tasks...")

    const scheduleDocs = []

    // Crear 1 schedule por empleado rotativo (hasta 12 empleados)
    const scheduleEmployees = seedEmployees.slice(0, Math.min(12, seedEmployees.length))

    for (let i = 0; i < scheduleEmployees.length; i++) {
      const emp = scheduleEmployees[i]
      const weekOffset = i < 6 ? 0 : -1  // mitad esta semana, mitad la anterior
      const startD = dayDate(weekOffset * 7 + 1)
      const endD = new Date(startD)
      endD.setDate(endD.getDate() + 4) // Viernes

      const usedTasks = randomPicks(TASK_TEMPLATES, 3)
      const timeSlots = generateTimeSlots(3)

      const scheduleDays = WEEKDAYS.map((day, idx) => {
        const dayTasks = usedTasks.map((tpl, tIdx) => {
          // ~60% completadas para días pasados, ~20% para esta semana
          const isCompleted = weekOffset < 0
            ? Math.random() < 0.7
            : Math.random() < 0.3
          const taskDate = new Date(startD)
          taskDate.setDate(taskDate.getDate() + idx)

          return {
            title: tpl.title,
            description: tpl.description,
            starttime: timeSlots[tIdx].starttime,
            endtime: timeSlots[tIdx].endtime,
            completed: isCompleted,
            completedAt: isCompleted ? taskDate : null,
          }
        })
        return { day, tasks: dayTasks }
      })

      const titleTemplates = [
        `Horario ${emp.firstname} - ${randomPick(["Operaciones", "Mantenimiento", "Supervisión", "Coordinación"])}`,
        `Jornada ${emp.firstname} ${emp.lastname} - Semana ${weekOffset === 0 ? "actual" : "anterior"}`,
        `Plan de trabajo ${emp.firstname} - ${startD.toLocaleDateString("es-VE")}`,
      ]

      scheduleDocs.push({
        employee: emp._id,
        title: randomPick(titleTemplates),
        description: `Horario de trabajo asignado para ${emp.firstname} ${emp.lastname}`,
        startdate: startD,
        enddate: endD,
        schedule: scheduleDays,
        isactive: weekOffset === 0,
        status: weekOffset < 0 ? "closed" : "active",
        closedAt: weekOffset < 0 ? new Date() : null,
        createdby: hrCreator._id,
        organizationID: orgId,
        createdAt: startD,
        updatedAt: new Date(),
      })
    }

    if (scheduleDocs.length > 0) {
      const result = await db.collection("schedules").insertMany(scheduleDocs)
      insertedTotal.schedules = result.insertedCount
      console.log(`   ✅ ${result.insertedCount} schedules insertados`)
    }

    // ─── 2. BITÁCORAS ───────────────────────────────────────────
    console.log("\n🔄 Generando Bitácoras...")

    const bitacoraDocs = []

    for (let i = 0; i < 30; i++) {
      const emp = randomPick(seedEmployees)
      const tpl = randomPick(BITACORA_TEMPLATES)
      const numImages = randomInt(1, 3)
      const selectedImages = randomPicks(IMAGES, numImages)

      // Distribuir en los últimos 14 días
      const dayOffset = randomInt(0, 13)
      const createdAt = new Date(daysAgo(dayOffset))
      createdAt.setHours(randomInt(7, 17), randomInt(0, 59), randomInt(0, 59))

      bitacoraDocs.push({
        title: tpl.title,
        content: tpl.content,
        images: selectedImages.map(i => img(i)),
        videos: [],
        employee: emp._id,
        isDeleted: false,
        deletedAt: null,
        organizationID: orgId,
        createdAt,
        updatedAt: createdAt,
      })
    }

    if (bitacoraDocs.length > 0) {
      const result = await db.collection("bitacoras").insertMany(bitacoraDocs)
      insertedTotal.bitacoras = result.insertedCount
      console.log(`   ✅ ${result.insertedCount} bitácoras insertadas`)
    }

    // ─── 3. WORK PHOTOS ─────────────────────────────────────────
    console.log("\n🔄 Generando Work Photos...")

    const workPhotoDocs = []
    const photoDescriptions = [
      "Evidencia de inspección de área común",
      "Foto de supervision de limpieza",
      "Registro de estado de instalaciones",
      "Captura de zona de mantenimiento",
      "Foto de áreas verdes post-jardinería",
      "Evidencia de control de acceso",
      "Registro de entrega de proveedor",
      "Foto de estacionamiento - iluminación",
      "Captura de ascensor en mantenimiento",
      "Evidencia de reemplazo de bombillo",
      "Foto de cisternas inspeccionadas",
      "Registro de zona infantil reparada",
      "Foto de hidrantes verificados",
      "Evidencia de señalización renovada",
      "Captura de lobby principal limpio",
    ]

    for (let i = 0; i < 25; i++) {
      const emp = randomPick(seedEmployees)
      const selectedImg = randomPick(IMAGES)

      // Distribuir en los últimos 14 días
      const dayOffset = randomInt(0, 13)
      const workdate = daysAgo(dayOffset)
      workdate.setHours(0, 0, 0, 0)

      const captureDate = new Date(workdate)
      captureDate.setHours(randomInt(7, 17), randomInt(0, 59), randomInt(0, 59))

      // Fake GPS (Caracas area)
      const gps = {
        lat: 10.4806 + (Math.random() * 0.02 - 0.01),
        lng: -66.9036 + (Math.random() * 0.02 - 0.01),
      }

      workPhotoDocs.push({
        employee: emp._id,
        photourl: img(selectedImg),
        publicid: `local-seed/${selectedImg}`,
        description: randomPick(photoDescriptions),
        workdate,
        captureDate,
        gpsLocation: gps,
        reviewedby: Math.random() < 0.4 ? hrCreator._id : null,
        reviewedat: Math.random() < 0.4 ? captureDate : null,
        organizationID: orgId,
        createdAt: captureDate,
        updatedAt: captureDate,
      })
    }

    if (workPhotoDocs.length > 0) {
      const result = await db.collection("workphotos").insertMany(workPhotoDocs)
      insertedTotal.workphotos = result.insertedCount
      console.log(`   ✅ ${result.insertedCount} work photos insertadas`)
    }

    // ─── 4. LEAVES (PERMISOS) ───────────────────────────────────
    console.log("\n🔄 Generando Leaves (Permisos)...")

    const leaveDocs = []
    const leaveStatuses = [
      { status: "Approved", weight: 5 },
      { status: "Pending", weight: 3 },
      { status: "Rejected", weight: 2 },
    ]

    function pickLeaveStatus() {
      const total = leaveStatuses.reduce((s, x) => s + x.weight, 0)
      let r = Math.random() * total
      for (const ls of leaveStatuses) {
        r -= ls.weight
        if (r <= 0) return ls.status
      }
      return "Pending"
    }

    for (let i = 0; i < 12; i++) {
      const emp = randomPick(seedEmployees)
      const tpl = LEAVE_TEMPLATES[i % LEAVE_TEMPLATES.length]

      // Fechas en los próximos 30 días y últimos 14 días (mezcla)
      const isFuture = Math.random() < 0.4
      const startOffset = isFuture ? randomInt(1, 30) : -randomInt(0, 14)
      const startdate = daysAgo(-startOffset)
      const enddate = new Date(startdate)
      enddate.setDate(enddate.getDate() + randomInt(1, 3))

      const status = pickLeaveStatus()

      leaveDocs.push({
        employee: emp._id,
        leavetype: tpl.leavetype,
        startdate,
        enddate,
        title: tpl.title,
        reason: tpl.reason,
        status,
        approvedby: (status === "Approved" || status === "Rejected") ? hrCreator._id : null,
        isDeleted: false,
        deletedAt: null,
        organizationID: orgId,
        createdAt: new Date(startdate.getTime() - 3 * 86400000), // 3 días antes de la solicitud
        updatedAt: new Date(),
      })
    }

    if (leaveDocs.length > 0) {
      const result = await db.collection("leaves").insertMany(leaveDocs)
      insertedTotal.leaves = result.insertedCount
      console.log(`   ✅ ${result.insertedCount} leaves insertados`)
    }

    // ─── RESUMEN ────────────────────────────────────────────────
    console.log("\n" + "═".repeat(50))
    console.log("📊 RESUMEN DEL SEED EXPANDIDO")
    console.log("═".repeat(50))
    console.log(`   📅 Schedules:  ${insertedTotal.schedules}`)
    console.log(`   📝 Bitácoras:  ${insertedTotal.bitacoras}`)
    console.log(`   📸 WorkPhotos: ${insertedTotal.workphotos}`)
    console.log(`   🏖️  Leaves:     ${insertedTotal.leaves}`)
    console.log("═".repeat(50))
    console.log(`   Total registros: ${Object.values(insertedTotal).reduce((a, b) => a + b, 0)}`)
    console.log("\n✅ Seed completado exitosamente.")

  } catch (err) {
    console.error("❌ Error:", err.message)
    process.exit(1)
  } finally {
    await client.close()
  }
}

main()
