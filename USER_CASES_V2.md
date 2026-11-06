# 📋 USER CASES V2 - Escalabilidad Multi-Perfil

## 🎯 Objetivo
Documentar la arquitectura escalable para soportar tres perfiles de usuario con rutas de acceso diferenciadas, manteniendo integridad de datos y cumplimiento legal venezolano.

---

## 👥 Perfiles de Usuario

| Perfil | Descripción | Organización | PayrollCompany |
|--------|-------------|--------------|----------------|
| **HR-Admin** | Presidente/Vicepresidente Junta Condominio | Edificio (tipo EDIFICIO) | Propia (1:1) |
| **HR-Manager** | Secretario/Coordinador | Edificio (tipo EDIFICIO) | Misma del edificio (1:1) |
| **Employee** | Personal/Residentes | Edificio (tipo EDIFICIO) | No aplica (solo lectura recibos) |
| **Admin-Admin** | Administradora de Condominios | Administradora (tipo ADMINISTRADORA) | Propia + Acceso a hijos |
| **Platform Admin** | Super Admin SaaS | Root (sin parent) | Global (todas) |

---

## 🏗️ Arquitectura: Organización Jerárquica

```mermaid
graph TD
    Platform[Platform Admin<br/>Root Organization]
    
    Admin1[Administradora "AdminCentral CA"<br/>tipo: ADMINISTRADORA<br/>RIF: J-99999999-9] -->|parentOrganizationID| Building1
    Admin1 -->|parentOrganizationID| Building2
    Admin1 -->|parentOrganizationID| Building3
    
    Building1[Edificio Las Palmas<br/>tipo: EDIFICIO<br/>RIF: J-11111111-1] --> PC1[PayrollCompany Las Palmas]
    Building2[Edificio Los Robles<br/>tipo: EDIFICIO<br/>RIF: J-22222222-2] --> PC2[PayrollCompany Los Robles]
    Building3[Edificio El Mirador<br/>tipo: EDIFICIO<br/>RIF: J-33333333-3] --> PC3[PayrollCompany El Mirador]
    
    Admin1 --> APC[PayrollCompany AdminCentral]
    
    Independent[Edificio Independiente<br/>tipo: INDEPENDIENTE<br/>RIF: J-44444444-4] --> IPC[PayrollCompany Independiente]
```

---

## 📐 Modelo de Datos Extendido

### Organization (Actualizado)
```javascript
const OrganizationSchema = new Schema({
    // ... campos existentes ...
    
    // NUEVO: Jerarquía
    parentOrganizationID: {
        type: Schema.Types.ObjectId,
        ref: 'Organization',
        default: null,
        index: true
    },
    organizationType: {
        type: String,
        enum: ['ADMINISTRADORA', 'EDIFICIO', 'INDEPENDIENTE'],
        default: 'INDEPENDIENTE'
    },
    
    // NUEVO: RIF como fuente de verdad
    rif: {
        type: String,
        trim: true,
        uppercase: true,
        sparse: true,           // Permite null para plataforma
        unique: true,           // Único cuando existe
        validate: {
            validator: v => /^[A-Z0-9]+$/.test(v),
            message: 'RIF solo debe contener letras y números'
        },
        set: v => sanitizeRif(v)  // Auto-limpia: solo alphanumeric
    }
}, { timestamps: true });

// Virtual para hijos
OrganizationSchema.virtual('children', {
    ref: 'Organization',
    localField: '_id',
    foreignField: 'parentOrganizationID'
});
```

### PayrollCompany (Invariante: 1:1 con Organization)
```javascript
// Cada Organization tipo EDIFICIO o ADMINISTRADORA tiene SU PayrollCompany
// unique index en organizationID ya existe
PayrollCompanySchema.index({ organizationID: 1 }, { unique: true });
```

---

## 🔐 Matriz de Acceso a PayrollCompany

| Actor | Organización | PayrollCompany Acceso | Operaciones |
|-------|--------------|----------------------|-------------|
| **HR-Admin (Edificio)** | EDIFICIO | Solo SU PayrollCompany | CRUD completo |
| **HR-Manager (Edificio)** | EDIFICIO | Solo SU PayrollCompany | CRUD completo |
| **Employee** | EDIFICIO | Ninguna (solo recibos propios) | READ own receipts |
| **Admin-Admin** | ADMINISTRADORA | **TODAS** de sus edificios hijos + propia | CRUD propio + READ hijos |
| **Platform Admin** | Root | **TODAS** (global) | CRUD global |

---

## 🔄 Flujos de Creación

### 1. Signup HR (Presidente Junta) → Crea Edificio + PayrollCompany
```javascript
// POST /api/auth/HR/signup
{
    organizationName: "Edificio Las Palmas",
    organizationRif: "J-11111111-1",    // ← Requerido
    email: "presidente@laspalmas.com",
    password: "...",
    firstName: "Juan",
    lastName: "Pérez",
    role: "HR-Admin"
}

// Transacción atómica:
Organization.create({ name, rif, email, organizationType: 'EDIFICIO' })
PayrollCompany.create({ 
    organizationID: org._id,
    rif: org.rif,           // ← Hereda de Organization
    email: org.email,       // ← Hereda de Organization
    name: org.name,
    ...payrollDefaults 
})
```

### 2. Signup Administradora → Crea Org Padre (sin PayrollCompany inicial)
```javascript
// POST /api/auth/Admin/signup
{
    organizationName: "AdminCentral CA",
    organizationRif: "J-99999999-9",
    email: "admin@admincentral.com",
    password: "...",
    firstName: "María",
    lastName: "González",
    role: "Admin-Admin"
}

// Crea Organization tipo ADMINISTRADORA
// PayrollCompany se crea cuando registra su primer edificio
// O opcionalmente crea la suya propia para nómina de la administradora
```

### 3. Registro de Edificio por Administradora
```javascript
// POST /api/v1/admin/buildings (solo Admin-Admin)
{
    name: "Edificio Los Robles",
    rif: "J-22222222-2",
    email: "junta@losrobles.com",
    parentOrganizationID: "adminOrgId"  // ← Vincula a administradora
}

// Transacción:
Organization.create({ 
    name, rif, email, 
    organizationType: 'EDIFICIO',
    parentOrganizationID: adminOrgId 
})
PayrollCompany.create({ 
    organizationID: building._id,
    rif: building.rif,
    email: building.email,
    name: building.name,
    ...payrollDefaults 
})
```

---

## 🎛️ Endpoints Específicos para Administradora

### GET /api/v1/payroll/companies/managed
```javascript
// Retorna TODAS las PayrollCompany de edificios hijos
async getManagedCompanies(req, res) {
    const adminOrg = await Organization.findById(req.ORGID);
    
    if (adminOrg.organizationType !== 'ADMINISTRADORA') {
        return res.status(403).json({ success: false, message: 'No autorizado' });
    }
    
    const buildings = await Organization.find({ 
        parentOrganizationID: adminOrg._id,
        organizationType: 'EDIFICIO'
    });
    
    const companyIDs = buildings.map(b => b._id);
    const companies = await PayrollCompany.find({ 
        organizationID: { $in: companyIDs } 
    }).lean();
    
    return res.json({ success: true, data: companies });
}
```

### GET /api/v1/payroll/companies/:id (con validación de acceso)
```javascript
async getCompanyConfig(req, res) {
    const company = await PayrollCompany.findById(req.params.id).lean();
    
    if (!company) return res.status(404).json({...});
    
    // Validar acceso
    const userOrg = await Organization.findById(req.ORGID);
    const targetOrg = await Organization.findById(company.organizationID);
    
    const canAccess = 
        userOrg._id.equals(targetOrg._id) ||                    // Mismo edificio
        (userOrg.organizationType === 'ADMINISTRADORA' &&       // Es administradora
         targetOrg.parentOrganizationID?.equals(userOrg._id));  // Edificio hijo
    
    if (!canAccess) return res.status(403).json({...});
    
    return res.json({ success: true, data: company });
}
```

---

## 📋 UI/UX para Administradora

### Tab Políticas - Selector de Edificio
```jsx
// PayrollPolicyTab para Admin-Admin
{userOrg.organizationType === 'ADMINISTRADORA' && (
    <BuildingSelector
        buildings={managedBuildings}
        selected={selectedBuildingId}
        onChange={setSelectedBuilding}
        placeholder="Seleccionar edificio..."
    />
)}

// Carga PayrollCompany del edificio seleccionado
const { data: company } = usePayrollCompany(selectedBuildingId);
```

---

## ✅ Reglas de Negocio Invariantes

| Regla | Descripción |
|-------|-------------|
| **RIF Unique** | Un RIF = Una entidad legal = Una Organization = Una PayrollCompany |
| **RIF Format** | BD: solo `[A-Z0-9]` (ej: `J314188305`), UI: formateado `J-31418830-5` |
| **1 Edificio = 1 PayrollCompany** | Inmutable, regulado por ley venezolana |
| **Admin no edita PayrollCompany de edificios directamente** | Solo vía endpoint gestionado con auditoría |
| **Org sin parent = Raíz** | Puede ser ADMINISTRADORA o INDEPENDIENTE |
| **Transacción atómica** | Org + PayrollCompany o rollback total |

---

## 🚀 Roadmap de Implementación

| Fase | Entregable | Base Actual |
|------|------------|-------------|
| **F1 (Actual)** | RIF en Organization + PayrollCompany en Signup HR | ✅ Plan definido |
| **F2 (v2.1)** | Organization: `parentOrganizationID`, `organizationType` | Modelo extendido |
| **F3 (v2.1)** | Admin Signup + Building Registration | Nuevos endpoints |
| **F4 (v2.2)** | `getManagedCompanies` + validación acceso jerárquico | Controller extendido |
| **F5 (v2.2)** | UI Building Selector en Tab Políticas | Componente nuevo |
| **F6 (v2.3)** | Platform Admin global access | Role SUPER_ADMIN |

---

## 🔗 Referencias
- Plan base: `#040-payroll-policy-tab-ui` (Fase 1-5)
- Modelo actual: `Organization.model.js`, `PayrollCompany.model.js`
- Controller actual: `PayrollPolicyController.js`
- UI actual: `PayrollPolicyTab.jsx`

---

*Documento vivo - Actualizar con cada fase completada*