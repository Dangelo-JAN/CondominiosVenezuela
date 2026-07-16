---
trigger: always_on
---

# ⚙️ Invariantes del Desarrollo

Reglas que TODO desarrollo debe cumplir sin excepción.

## 1. Soporte Temático Bidireccional
Todo componente DEBE soportar Light y Dark mode, siguiendo el Design System v4.

## 2. Responsividad Absoluta & PWA
- Enfoque **Mobile-first** en toda implementación.
- Soporte para manifiesto PWA.
- Service Workers para caching (ver `client/public/sw.js`).

## 3. Seguridad End-to-End
- Validación de roles estrictamente **server-side** mediante interceptores JWT.
- Nunca confiar en datos del cliente para autorización.

## 4. Protocolo de Ejecución Obligatorio
- **PLAN FIRST:** Toda tarea debe iniciar con un plan detallado presentado y aprobado por el usuario. Sin plan aprobado → no hay código.
- **STOPS POR FASE:** Cada fase de implementación debe terminar con un STOP, build verification, commit y espera de aprobación del usuario. No avanzar sin aprobación.
- **BUILDS GATE:** Antes de cada commit, ejecutar `client: npm run build` (0 errores) y `server: npm run test` (todas pasan). Si falla → corregir, no commitear.
- **APROBACIÓN EXPLÍCITA:** Ninguna fase, commit, cambio ni tarea se da por completado sin aprobación del usuario. "Completado" = el usuario lo dice.
- **SECUENCIA FINAL:** Al terminar todas las fases: 1) esperar confirmación del usuario, 2) actualizar bitácoras, 3) auto-mantenimiento, 4) PR hacia dev.
