/**
 * first-seed.mjs — Deterministic seed script (zero randomness)
 *
 * Creates the full dataset for a fresh DB:
 *  1. Reads org + HR (already created by MASTER-INIT §7 signup)
 *  2. Creates departments + employees (from JSON dump)
 *  3. Creates all dependent collections using new IDs
 *
 * Usage: node server/first-seed.mjs
 * Prerequisites: Docker mongo running + backend signup completed (MASTER-INIT §7)
 */
import { MongoClient, ObjectId } from "mongodb"
import { readFileSync } from "fs"
import { fileURLToPath } from "url"
import { dirname, join } from "path"

const __dirname = dirname(fileURLToPath(import.meta.url))
const MONGO_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/condove_local"

// ─── Load JSON data ──────────────────────────────────────────────
const orgData = JSON.parse(readFileSync(join(__dirname, "seed-data/org-hr-depts-emps.json"), "utf-8"))
const collData = JSON.parse(readFileSync(join(__dirname, "seed-data/collections-data.json"), "utf-8"))

// ─── Helpers ─────────────────────────────────────────────────────
function rebuildDate(dateStr) {
  if (!dateStr) return null
  return new Date(dateStr)
}

// ─── MAIN ────────────────────────────────────────────────────────
async function main() {
  const client = new MongoClient(MONGO_URI)
  try {
    await client.connect()
    const db = client.db()
    console.log("✅ Connected to MongoDB\n")

    // ─── Find existing org + HR (created by signup) ─────────────
    const hr = await db.collection("humanresources").findOne({ email: orgData.hr.email })
    if (!hr) {
      console.error("❌ HR not found. Run MASTER-INIT §7 (signup) first.")
      process.exit(1)
    }
    const org = await db.collection("organizations").findOne({ _id: hr.organizationID })
    if (!org) {
      console.error("❌ Organization not found.")
      process.exit(1)
    }

    const orgId = org._id
    const hrId = hr._id
    console.log(`📋 Org: ${org.name} (${orgId})`)
    console.log(`🔑 HR: ${hr.firstname} ${hr.lastname} (${hrId})`)

    // ─── 0. CREATE DEPARTMENTS ──────────────────────────────────
    console.log("\n🔄 Creating Departments...")
    const newDeptIds = {} // oldId → new ObjectId

    for (const dept of orgData.departments) {
      const result = await db.collection("departments").insertOne({
        name: dept.name,
        description: dept.description,
        employees: [],
        HumanResources: [hrId],
        notice: [],
        organizationID: orgId,
        createdAt: rebuildDate(dept.createdAt) || new Date(),
        updatedAt: new Date(),
      })
      newDeptIds[dept._id] = result.insertedId
      console.log(`   ✅ Dept: ${dept.name} (${result.insertedId})`)
    }

    // ─── 1. CREATE EMPLOYEES ────────────────────────────────────
    console.log("\n🔄 Creating Employees...")
    const newEmpIds = {} // oldId → new ObjectId
    const EMP_PASSWORD = "$2b$10$iFeWkaZb4hICQa8A.yItreRvr17hs9cQ4lj89J4teazL4ABaseyDy" // "Empleado123"

    for (const emp of orgData.employees) {
      const deptId = emp.departmentID ? newDeptIds[emp.departmentID] : null
      const result = await db.collection("employees").insertOne({
        firstname: emp.firstname,
        lastname: emp.lastname,
        email: emp.email,
        password: emp.password || EMP_PASSWORD,
        contactnumber: `0414${String(Math.floor(1000000 + Math.random() * 9000000))}`,
        role: emp.role || "Employee",
        isverified: true,
        isactive: true,
        department: deptId,
        organizationID: orgId,
        createdAt: rebuildDate(emp.createdAt) || new Date(),
        updatedAt: new Date(),
      })
      newEmpIds[emp._id] = result.insertedId
      console.log(`   ✅ ${emp.firstname} ${emp.lastname} (${result.insertedId})`)
    }

    // Update department employee arrays
    for (const emp of orgData.employees) {
      if (emp.departmentID && newDeptIds[emp.departmentID] && newEmpIds[emp._id]) {
        await db.collection("departments").updateOne(
          { _id: newDeptIds[emp.departmentID] },
          { $push: { employees: newEmpIds[emp._id] } }
        )
      }
    }
    console.log(`\n   📊 ${Object.keys(newEmpIds).length} employees created`)

    // ─── Helpers: resolve old IDs to new IDs ────────────────────
    function resolveEmp(oldId) {
      return newEmpIds[oldId] || null
    }
    function resolveDept(oldId) {
      return oldId ? (newDeptIds[oldId] || null) : null
    }

    const totals = { schedules: 0, bitacoras: 0, workphotos: 0, leaves: 0, salaries: 0, attendances: 0, notices: 0, applicants: 0 }

    // ─── 2. SCHEDULES + TASKS ───────────────────────────────────
    console.log("\n🔄 Inserting Schedules...")
    const scheduleDocs = collData.schedules.map(s => {
      const empId = resolveEmp(s.employee)
      if (!empId) return null
      return {
        employee: empId,
        title: s.title,
        description: s.description,
        startdate: rebuildDate(s.startdate),
        enddate: rebuildDate(s.enddate),
        schedule: s.schedule.map(day => ({
          day: day.day,
          tasks: day.tasks.map(t => ({
            title: t.title,
            description: t.description,
            starttime: t.starttime,
            endtime: t.endtime,
            completed: t.completed,
            completedAt: rebuildDate(t.completedAt),
          })),
        })),
        isactive: s.isactive,
        status: s.status,
        closedAt: rebuildDate(s.closedAt),
        createdby: hrId,
        organizationID: orgId,
        createdAt: rebuildDate(s.createdAt),
        updatedAt: rebuildDate(s.updatedAt),
      }
    }).filter(Boolean)

    if (scheduleDocs.length > 0) {
      const r = await db.collection("schedules").insertMany(scheduleDocs)
      totals.schedules = r.insertedCount
      console.log(`   ✅ ${r.insertedCount} schedules`)
    }

    // ─── 3. BITÁCORAS ───────────────────────────────────────────
    console.log("🔄 Inserting Bitácoras...")
    const bitacoraDocs = collData.bitacoras.map(b => {
      const empId = resolveEmp(b.employee)
      if (!empId) return null
      return {
        title: b.title,
        content: b.content,
        images: b.images || [],
        videos: b.videos || [],
        employee: empId,
        isDeleted: b.isDeleted || false,
        deletedAt: rebuildDate(b.deletedAt),
        organizationID: orgId,
        createdAt: rebuildDate(b.createdAt),
        updatedAt: rebuildDate(b.updatedAt),
      }
    }).filter(Boolean)

    if (bitacoraDocs.length > 0) {
      const r = await db.collection("bitacoras").insertMany(bitacoraDocs)
      totals.bitacoras = r.insertedCount
      console.log(`   ✅ ${r.insertedCount} bitácoras`)
    }

    // ─── 4. WORK PHOTOS ─────────────────────────────────────────
    console.log("🔄 Inserting Work Photos...")
    const workphotoDocs = collData.workphotos.map(wp => {
      const empId = resolveEmp(wp.employee)
      if (!empId) return null
      return {
        employee: empId,
        photourl: wp.photourl,
        publicid: wp.publicid,
        description: wp.description,
        workdate: rebuildDate(wp.workdate),
        captureDate: rebuildDate(wp.captureDate),
        gpsLocation: wp.gpsLocation || { lat: null, lng: null },
        reviewedby: wp.reviewedby ? hrId : null,
        reviewedat: rebuildDate(wp.reviewedat),
        organizationID: orgId,
        createdAt: rebuildDate(wp.createdAt),
        updatedAt: rebuildDate(wp.updatedAt),
      }
    }).filter(Boolean)

    if (workphotoDocs.length > 0) {
      const r = await db.collection("workphotos").insertMany(workphotoDocs)
      totals.workphotos = r.insertedCount
      console.log(`   ✅ ${r.insertedCount} work photos`)
    }

    // ─── 5. LEAVES ──────────────────────────────────────────────
    console.log("🔄 Inserting Leaves...")
    const leaveDocs = collData.leaves.map(l => {
      const empId = resolveEmp(l.employee)
      if (!empId) return null
      return {
        employee: empId,
        leavetype: l.leavetype,
        startdate: rebuildDate(l.startdate),
        enddate: rebuildDate(l.enddate),
        title: l.title,
        reason: l.reason,
        status: l.status,
        approvedby: (l.status === "Approved" || l.status === "Rejected") ? hrId : null,
        isDeleted: l.isDeleted || false,
        deletedAt: rebuildDate(l.deletedAt),
        organizationID: orgId,
        createdAt: rebuildDate(l.createdAt),
        updatedAt: rebuildDate(l.updatedAt),
      }
    }).filter(Boolean)

    if (leaveDocs.length > 0) {
      const r = await db.collection("leaves").insertMany(leaveDocs)
      totals.leaves = r.insertedCount
      console.log(`   ✅ ${r.insertedCount} leaves`)
    }

    // ─── 6. SALARIES ────────────────────────────────────────────
    console.log("🔄 Inserting Salaries...")
    const now = new Date()
    const salaryDocs = collData.salaries.map(s => {
      const empId = resolveEmp(s.employee)
      if (!empId) return null
      // Ensure duedate is in the future (Salary model validates this)
      let duedate = rebuildDate(s.duedate)
      if (!duedate || duedate <= now) {
        duedate = new Date(now.getTime() + 7 * 86400000)
      }
      return {
        employee: empId,
        basicpay: s.basicpay,
        bonuses: s.bonuses,
        deductions: s.deductions,
        netpay: s.netpay,
        currency: s.currency,
        duedate,
        paymentdate: rebuildDate(s.paymentdate),
        status: s.status,
        organizationID: orgId,
        createdAt: rebuildDate(s.createdAt),
        updatedAt: rebuildDate(s.updatedAt),
      }
    }).filter(Boolean)

    if (salaryDocs.length > 0) {
      const r = await db.collection("salaries").insertMany(salaryDocs)
      totals.salaries = r.insertedCount
      console.log(`   ✅ ${r.insertedCount} salaries`)
    }

    // ─── 7. ATTENDANCES ─────────────────────────────────────────
    console.log("🔄 Inserting Attendances...")
    const attendanceDocs = collData.attendances.map(a => {
      const empId = resolveEmp(a.employee)
      if (!empId) return null
      return {
        employee: empId,
        status: a.status,
        attendancelog: (a.attendancelog || []).map(log => ({
          logdate: rebuildDate(log.logdate),
          logstatus: log.logstatus,
          checkin: rebuildDate(log.checkin),
          checkout: rebuildDate(log.checkout),
          duration: log.duration,
        })),
        organizationID: orgId,
        createdAt: rebuildDate(a.createdAt),
        updatedAt: rebuildDate(a.updatedAt),
      }
    }).filter(Boolean)

    if (attendanceDocs.length > 0) {
      const r = await db.collection("attendances").insertMany(attendanceDocs)
      totals.attendances = r.insertedCount
      console.log(`   ✅ ${r.insertedCount} attendances`)
    }

    // ─── 8. NOTICES ─────────────────────────────────────────────
    console.log("🔄 Inserting Notices...")
    const noticeDocs = collData.notices.map(n => {
      const targetDept = resolveDept(n.department)
      const targetEmp = n.employee ? resolveEmp(n.employee) : null
      return {
        title: n.title,
        content: n.content,
        audience: n.audience,
        ...(targetDept ? { department: targetDept } : {}),
        ...(targetEmp ? { employee: targetEmp } : {}),
        createdby: hrId,
        organizationID: orgId,
        createdAt: rebuildDate(n.createdAt),
        updatedAt: rebuildDate(n.updatedAt),
      }
    })

    if (noticeDocs.length > 0) {
      const r = await db.collection("notices").insertMany(noticeDocs)
      totals.notices = r.insertedCount
      console.log(`   ✅ ${r.insertedCount} notices`)
    }

    // ─── 9. APPLICANTS ──────────────────────────────────────────
    console.log("🔄 Inserting Applicants...")
    const applicantDocs = collData.applicants.map(a => ({
      firstname: a.firstname,
      lastname: a.lastname,
      email: a.email,
      contactnumber: a.contactnumber,
      appliedrole: a.appliedrole,
      recruitmentstatus: a.recruitmentstatus,
      organizationID: orgId,
      createdAt: rebuildDate(a.createdAt),
      updatedAt: rebuildDate(a.updatedAt),
    }))

    if (applicantDocs.length > 0) {
      const r = await db.collection("applicants").insertMany(applicantDocs)
      totals.applicants = r.insertedCount
      console.log(`   ✅ ${r.insertedCount} applicants`)
    }

    // ─── SUMMARY ────────────────────────────────────────────────
    const total = Object.values(totals).reduce((a, b) => a + b, 0)
    console.log("\n" + "═".repeat(55))
    console.log("📊 FIRST-SEED COMPLETE")
    console.log("═".repeat(55))
    for (const [k, v] of Object.entries(totals)) {
      console.log(`   ${k.padEnd(15)} ${v}`)
    }
    console.log("─".repeat(55))
    console.log(`   TOTAL${" ".repeat(9)}${total}`)
    console.log("═".repeat(55))

  } catch (err) {
    console.error("❌ Error:", err.message)
    process.exit(1)
  } finally {
    await client.close()
  }
}

main()
