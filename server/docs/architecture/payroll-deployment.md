# Despliegue del Módulo de Nómina - Producción

## Resumen de Arquitectura de Deploy

```
┌─────────────────────────────────────────────────────────────────┐
│                        PRODUCCIÓN                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────────┐  │
│  │   Vercel     │    │    Render    │    │   MongoDB Atlas  │  │
│  │  (Frontend)  │◄───│  (Backend)   │◄──►│   (Database)     │  │
│  │              │    │              │    │                  │  │
│  │ React + Vite │    │ Node.js/Exp  │    │ 25+ modelos      │  │
│  │ Static Build │    │ Bull Worker  │    │ Índices optimiz. │  │
│  └──────────────┘    └──────┬───────┘    └──────────────────┘  │
│                             │                                    │
│                    ┌────────┴────────┐                           │
│                    │     Redis       │                           │
│                    │  (Bull Queues)  │                           │
│                    └─────────────────┘                           │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Variables de Entorno Requeridas

### Backend (Render)
```bash
# Base de Datos
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/condove?retryWrites=true&w=majority

# JWT
JWT_SECRET=super-secret-min-32-chars
JWT_EXPIRES_IN=24h

# Redis (Bull Queues)
REDIS_HOST=redis-xxxxx.render.com
REDIS_PORT=6379
REDIS_PASSWORD=xxxxxxxx

# SendGrid (Emails)
SENDGRID_API_KEY=SG.xxxxx
SENDGRID_SENDER_EMAIL=noreply@condove.com
CLIENT_URL=https://app.condove.com

# Firebase Admin (Push Notifications)
FIREBASE_PROJECT_ID=condove-xxxxx
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@condove.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Nómina
BCV_API_URL=https://www.bcv.org.ve
BCV_API_KEY=xxxxx
EXCHANGE_RATE_PROVIDER=bcv
MANUAL_EXCHANGE_RATE_VES=36.0
PAYROLL_WORKER_CONCURRENCY=5
PAYROLL_BATCH_SIZE=50

# CORS
CORS_ORIGIN_REGEX="^https://.*\\.vercel\\.app$|^https://app\\.condove\\.com$|^https://app\\.condominiosvenezuela\\.com$"

# Server
PORT=10000
NODE_ENV=production
LOG_LEVEL=info
```

### Frontend (Vercel)
```bash
# Firebase Client (Push Notifications)
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_PROJECT_ID=condove-xxxxx
VITE_FIREBASE_APP_ID=1:xxxxx:web:xxxxx
VITE_FIREBASE_MESSAGING_SENDER_ID=xxxxx

# API
VITE_API_URL=https://api.condove.com
```

---

## Checklist Pre-Deploy

### Backend
- [ ] `npm run test` → 127 passing
- [ ] `npm run build` (no build script en server, solo test)
- [ ] `npm run create:indexes` ejecutado en Atlas
- [ ] Variables de entorno configuradas en Render
- [ ] Redis conectado y accesible
- [ ] MongoDB Atlas IP whitelist incluye Render IPs
- [ ] SendGrid domain verificado (`condove.com`)
- [ ] Firebase Admin SDK configurado

### Frontend
- [ ] `npm run build` → 0 errores
- [ ] Variables Firebase configuradas en Vercel
- [ ] `VITE_API_URL` apunta a backend Render
- [ ] Build output en `dist/` correcto
- [ ] Service Worker generado (`firebase-messaging-sw.js`)

### Base de Datos
- [ ] Índices creados (`npm run create:indexes`)
- [ ] Seeds ejecutados (`npm run seed:payroll`)
- [ ] Backup automático habilitado en Atlas
- [ ] TTL indexes para tokens temporales

---

## Scripts de Deploy

### Render (Backend) - `render.yaml`
```yaml
services:
  - type: web
    name: condove-api
    env: node
    plan: standard
    buildCommand: npm install
    startCommand: npm run server
    envVars:
      - key: NODE_ENV
        value: production
      - key: MONGODB_URI
        sync: false
      # ... resto de variables
    healthCheckPath: /api/health
    autoDeploy: true

  - type: worker
    name: condove-payroll-worker
    env: node
    plan: starter
    buildCommand: npm install
    startCommand: node server/workers/payrollWorker.js
    envVars:
      - key: NODE_ENV
        value: production
      # mismas variables que web
```

### Vercel (Frontend) - `vercel.json`
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-XSS-Protection", "value": "1; mode=block" }
      ]
    }
  },
  "env": {
    "VITE_FIREBASE_API_KEY": "@firebase-api-key",
    "VITE_FIREBASE_PROJECT_ID": "@firebase-project-id",
    "VITE_FIREBASE_APP_ID": "@firebase-app-id",
    "VITE_FIREBASE_MESSAGING_SENDER_ID": "@firebase-sender-id",
    "VITE_API_URL": "https://api.condove.com"
  }
}
```

---

## Health Checks y Monitoreo

### Endpoints Críticos
```bash
# Health completo (DB + Redis + Queues + Firebase)
GET https://api.condove.com/api/health

# Solo liveness (para k8s/Render)
GET https://api.condove.com/api/health/live

# Worker health
GET https://api.condove.com/api/worker/health
```

### Alertas Recomendadas
| Métrica | Umbral | Acción |
|---------|--------|--------|
| Health check status != "ok" | Inmediato | PagerDuty/Slack |
| Queue failed jobs > 10 | 5 min | Revisar logs worker |
| Redis memory > 80% | 15 min | Scale Redis |
| MongoDB connections > 80% | 15 min | Revisar pool |
| API p95 > 2000ms | 5 min | Investigar |
| Error rate > 1% | 5 min | Alertar |

---

## Comandos de Mantenimiento

### Ejecutar Seeds (Primera vez / Re-deploy)
```bash
# En servidor o local con .env de prod
npm run seed:payroll
```

### Crear/Actualizar Índices
```bash
npm run create:indexes
```

### Worker Standalone (Si no usa worker service de Render)
```bash
# En servidor separado o background
node server/workers/payrollWorker.js
```

### Verificar Estado Colas
```bash
# Via health check
curl https://api.condove.com/api/health | jq .services.queues

# O directo en Redis
redis-cli INFO keyspace
```

### Logs Útiles
```bash
# Backend logs (Render)
# Filtrar por: [Payroll], [Worker], [Queue], [JournalGenerator]

# Worker logs
# [Payroll Worker] Activo y escuchando colas
# [Queue:bank-export] Job xxx completed
# [Queue:payslip-email] Job xxx completed
```

---

## Rollback Plan

### Backend
```bash
# Render: Rollback automático via dashboard
# O manual:
git revert <commit>
git push origin 037-payroll-venezuelan-module
# Render auto-deploy
```

### Frontend
```bash
# Vercel: Rollback automático via dashboard
# O:
vercel rollback <deployment-url>
```

### Base de Datos
```bash
# Atlas: Point-in-time recovery (últimas 24h)
# O restore desde backup automático
```

---

## Validación Post-Deploy

### Smoke Tests (Ejecutar en orden)
```bash
# 1. Health
curl -f https://api.condove.com/api/health

# 2. Auth HR
curl -X POST https://api.condove.com/api/auth/HR/login \
  -H "Content-Type: application/json" \
  -d '{"email":"hr@test.com","password":"test123"}'

# 3. Listar períodos
curl -H "Authorization: Bearer $TOKEN" \
  https://api.condove.com/api/v1/payroll/periods

# 4. Crear período prueba
curl -X POST -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"TEST-2026-01","start_date":"2026-01-01","end_date":"2026-01-15","payment_date":"2026-01-16"}' \
  https://api.condove.com/api/v1/payroll/periods

# 5. Calcular nómina (con empleados de prueba)
curl -X POST -H "Authorization: Bearer $TOKEN" \
  https://api.condove.com/api/v1/payroll/periods/$PERIOD_ID/calculate

# 6. Aprobar
curl -X POST -H "Authorization: Bearer $TOKEN" \
  https://api.condove.com/api/v1/payroll/periods/$PERIOD_ID/approve

# 7. Pagar
curl -X POST -H "Authorization: Bearer $TOKEN" \
  https://api.condove.com/api/v1/payroll/periods/$PERIOD_ID/pay

# 8. Verificar queue jobs en health
curl https://api.condove.com/api/health | jq .services.queues

# 9. Frontend carga
curl -f https://app.condove.com

# 10. Push notification test (si Firebase configurado)
# Desde frontend: registrar token → enviar test desde backend
```

---

## Contactos de Escalación

| Componente | Contacto | Slack/Email |
|------------|----------|-------------|
| Backend/Worker | @backend-team | #backend-alerts |
| Frontend | @frontend-team | #frontend-alerts |
| Database | @dba-team | #db-alerts |
| Infra/DevOps | @devops-team | #infra-alerts |
| Nómina (Business) | @payroll-team | #payroll-support |

---

*Guía de Despliegue v1.0 | 2026-11-03 | CTO Condominios Venezuela*