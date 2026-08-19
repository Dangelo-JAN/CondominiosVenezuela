# 🛠️ TAREA: PublicNavbar Component + Limpieza EntryPage
**ID:** #034 | **Estado:** 🟡 EN CURSO | **Fecha:** 2026-08-18

---

## 🎯 OBJETIVO FINAL
> Extraer el navbar de EntryPage.jsx a un componente reutilizable `PublicNavbar.jsx` en `components/common/`, y eliminar el stat "+10K Usuarios activos" del Hero section.

---

## 🚦 PUNTO DE CONTROL (Contexto de Reanudación)
*Usa esto para "despertar" a la IA si el chat se cierra:*

- **Lo último que funcionó:** Rama `feat/public-navbar-component` creada y push. Bitácora creada.
- **Dónde se rompió/detuvo:** Pendiente implementación.
- **Siguiente acción inmediata:** Fase 1 — crear `PublicNavbar.jsx`.

---

## 📝 CAMBIOS TÉCNICOS CLAVE
- [ ] Crear `client/src/components/common/PublicNavbar.jsx` — componente self-contained con lógica de tema + PWA
- [ ] Modificar `client/src/pages/Employees/EntryPage.jsx` — importar `<PublicNavbar />` + eliminar stat "+10K Usuarios activos"
- [ ] Build verification — `npm run build` 0 errores

---

## ⚠️ NOTAS DE MEMORIA
- *Regla:* El navbar es 100% self-contained — maneja sus propios hooks (`useIsDark`, `useTheme`) y la lógica PWA internamente.
- *Regla:* NO cambiar ni estilo ni funcionalidad del navbar. Copia exacta del JSX actual.
- *Regla:* Solo eliminar el div de "+10K Usuarios activos" (líneas 348-355). Mantener Uptime y Soporte 24/7.
- *Branch:* feat/public-navbar-component
- *Commit:* pendiente
