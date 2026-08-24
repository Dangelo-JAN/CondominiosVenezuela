# 🛠️ TAREA: Master-Init v3 — Sección Reapertura de Servicios
**ID:** #037 | **Estado:** 🟡 EN CURSO | **Fecha:** 2026-08-24

---

## 🎯 OBJETIVO FINAL
> Que cualquier actor (CTO, junior, agente IA) pueda REABRIR los servicios locales correctamente SIN recrear Docker ni repetir setup, siguiendo una única sección de MASTER-INIT.md.

---

## 🚦 PUNTO DE CONTROL (Contexto de Reanudación)
*Usa esto para "despertar" a la IA si el chat se cierra:*

- **Lo último que funcionó:** Deploy local operativo con seed completa (24 empleados). Usuario solicitó documentar flujo de reapertura.
- **Dónde se rompió/detuvo:** N/A — ejecución directa ordenada por el CTO.
- **Siguiente acción inmediata:** Ediciones a MASTER-INIT.md → STOP para aprobación de commit.

---

## 📝 CAMBIOS TÉCNICOS CLAVE
- [x] Nueva §14 "Reapertura de servicios" (14.0 regla de platino · 14.1 diagnóstico · 14.2 secuencia humana · 14.3 protocolo agente IA · 14.4 dataset vigente)
- [x] Quick-nav tras la intro + entrada 14 en índice
- [x] §2.6 corrección factual (Firebase web NO bloquea arranque — verificado en deploy real)
- [x] §2.7 nueva verificación nodemon (bug encontrado en deploy real)
- [x] §12.10 ajuste de expectativa SW (warning ≠ error bloqueante)
- [x] Apéndice: bloque REAPERTURA diaria con docker start
- [ ] Builds pre-commit + commit (pendiente aprobación CTO)

**Verificación estructural (2026-08-24):** 739 líneas (+130) · 14 secciones numeradas coherentes · ancla `#14-reapertura-de-servicios-uso-diario-y-agentes-ia` consistente en quick-nav, índice y heading · 9 menciones de `docker start mongo-local` reforzando la regla anti-`run`.

---

## ⚠️ NOTAS DE MEMORIA
- *Lección capturada:* nodemon no declarado en package.json → requiere global (documentado como requisito §2.7 hasta que exista fix trackeable)
- *Protocolo agente:* setsid+nohup+disown con logs en /tmp/opencode/logs/ (patrón validado hoy)
- *Branch:* `feat/weekly-reports` (continuidad autorizada por CTO)
- *Commit:* (pendiente)
