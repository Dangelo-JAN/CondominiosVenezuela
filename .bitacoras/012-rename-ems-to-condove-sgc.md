# 🛠️ TAREA: Rebranding EMS → CondoVE SGC
**ID:** #012 | **Estado:** ✅ COMPLETADO| **Fecha:** 2026-05-04

---

## 🎯 OBJETIVO FINAL
> Cambiar TODOS los textos "EMS" a "CondoVE SGC" en todo el proyecto, con tamaño diferenciado para "SGC" respecto a "CondoVE". Actualizaciones específicas en EntryPage.jsx.

---

## 🚦 PUNTO DE CONTROL
*Usa esto para "despertar" a la IA si el chat se cierre:*

- **Último estado:** ✅ COMPLETADO - Merge exitoso a dev
- **Branch:** feat/merge-a-dev (ya no necesaria)
- **PR:** #3 (MERGEADO)
- **Último commit:** 8807c05 - fix: invert Footer text colors

---

## 📝 RESUMEN COMPLETO

| Aspecto | Detalle |
|:---|:---|
| **Cambios** | EMS → CondoVE SGC |
| **Archivos modificados** | 16 archivos |
| **PR** | #3 |
| **Rama base** | dev |

### Cambios específicos aplicados
| Ubicación | Cambio |
|:---|:---|
| EntryPage.jsx (logo) | `CondoVE` + `SGC` (font-size: 0.65em) |
| EntryPage.jsx (badge) | `Sistema de Gestión Condominial` |
| EntryPage.jsx (descripción) | `para condominios modernos` |
| EntryPage.jsx (banner) | `Instala SGC en tu móvil` |
| EntryPage.jsx (footer) | `appName="SGC"`, `appSubtitle="Sistema de Gestión Condominial"` |
| Footer.jsx | Props dinámicas `appName`, `appSubtitle` |
| index.html | `CondoVE SGC — Sistema de Gestión Condominial` |

---

## 🔄 LISTA DE EJECUCIÓN (COMPLETADA)

- [x] 1. Reemplazar "EMS" → "CondoVE SGC" en EntryPage.jsx (logo + banner)
- [x] 2. Actualizar texto "Sistema de Gestión Empresarial N°1" 
- [x] 3. Actualizar descripción con "condominios modernos"
- [x] 4. Modificar Footer.jsx con props dinámicas
- [x] 5. Modificar sign-up.jsx + sign-in.jsx
- [x] 6. Modificar DashboardSidebar.jsx + DashboardLayout.jsx
- [x] 7. Modificar ContactSalesDialog.jsx
- [x] 8. Modificar AcceptInvitationPage.jsx (HR + Employee)
- [x] 9. Modificar sidebars (Employee + HR)
- [x] 10. Modificar server/ emails + templates + controller + config
- [x] 11. Modificar index.html
- [x] 12. Commit y push
- [x] 13. Crear PR hacia dev

---

## ⚠️ NOTAS DE MEMORIA
- *Footer del EntryPage usa "SGC" + "Sistema de Gestión Condominial"*
- *Otros componentes usan "CondoVE SGC" completo*
- *PR #3 esperando merge*

---

## 🔧 AJUSTES ADICIONALES (2026-04-30)
> Detalles pendientes completados el 30/04/2026

### Cambios aplicados
| Archivo | Cambio |
|:---|:---|
| EntryPage.jsx (logo) | Separado CondoVE de SGC con `marginLeft: "0.15em"` |
| EntryPage.jsx (título) | Color de "inteligente" cambiado a `#003DA5` (azul principal) |
| ContactSalesDialog.jsx | Separado CondoVE de SGC con `fontSize: 0.7em` + `marginLeft: 0.1em` |
| DashboardLayout.jsx | Separado CondoVE de SGC con `fontSize: 0.7em` + `marginLeft: 0.1em` |
| EmployeeAcceptInvitationPage.jsx | Cambiado a azul + separado con `fontSize: 0.7em` + `marginLeft: 0.1em` |
| HumanResources/AcceptInvitationPage.jsx | Separado CondoVE de SGC con `fontSize: 0.7em` + `marginLeft: 0.1em` |
| sign-in.jsx | Separado CondoVE de SGC con `fontSize: 0.75em` + `marginLeft: 0.1em` |
| sign-up.jsx | Separado CondoVE de SGC con `fontSize: 0.75em` + `marginLeft: 0.1em` |

### Commit
```
feat: separate CondoVE from SGC visually + blue color for inteligente
7 files changed, 8 insertions(+), 8 deletions(-)
```

---

## 📌 CAMBIOS PENDIENTES (2026-04-30)
> Detalles de branding por completar

### Cambios por aplicar
| Archivo | Cambio |
|:---|:---|
| EntryPage.jsx | Reemplazar `<Zap />` por imagen `IsotipoMarca CondoVe 64x64 solo.png` |
| favicon-32x32.png | Reemplazar por `IsotipoMarca CondoVe logo 32x32.png` |
| icon-192x192.png | Reemplazar por `IsotipoMarca CondoVe logo 192x192.png` |
| icon-512x512.png | Reemplazar por `IsotipoMarca CondoVe logo 512x512.png` |

### Estado de ejecución
- [x] 1. Reemplazar componente Zap en EntryPage.jsx
- [x] 2. Reemplazar favicon-32x32.png
- [x] 3. Reemplazar icon-192x192.png
- [x] 4. Reemplazar icon-512x512.png
- [x] 5. Commit y push (28bb6d0)

---

## 🔧 FIX NOMBRES DE ARCHIVO (2026-05-01)
> Fix crítico: Los nombres de archivo con espacios no funcionan en Vite/navegador

### Problema
Los nombres como "IsotipoMarca CondoVe logo 192x192.png" se codifican como "%20" en las URLs, causando que las imágenes no se carguen.

### Solución aplicada
| Archivo | Cambio |
|:---|:---|
| index.html | `favicon-32x32.png` → `IsotipoMarca-CondoVe-logo-32x32.png` |
| index.html | `icon-192x192.png` → `IsotipoMarca-CondoVe-logo-192x192.png` |
| index.html | Agregado `apple-touch-icon` para 512x512 |

### Commit
```
fix: update favicon references to use hyphenated filenames
1 file changed, 3 insertions(+), 2 deletions(-)
```

---

## 🔧 FIX ADICIONALES (2026-05-01)
> Fixes adicionales aplicados el 01/05/2026

### Fix 1: Footer - Color del punto responsivo al tema
| Archivo | Cambio |
|:---|:---|
| Footer.jsx | Punto (.) ahora cambia: `#8b5cf6` (dark) / `#7c3aed` (light) |

### Fix 2: Imágenes favicon nunca commiteadas
| Problema | Solución |
|:---|:---|
| Imágenes con nombres con guiones nunca были добавлены al staging | Commitear todas las imágenes IsotipoMarca-CondoVe-logo-*.png |

### Commit
```
fix: add theme-responsive dot color in Footer + commit favicon images
7 files changed, 1 insertion(+), 1 deletion(-)
```

---

## 🔧 FIX ADICIONALES (2026-05-01) - CONTINUACIÓN
> Fixes adicionales aplicados el 01/05/2026 (segunda tanda)

### Fix 3: Footer - Visibility en modo claro
| Elemento | Color antes (light) | Color después (light) |
|:---|:---|:---|
| appSubtitle | `#9ca3af` (muy claro) | `#4b5563` (gris oscuro) |
| links | `#9ca3af` (muy claro) | `#6b7280` (gris medio) |
| copyright | `#9ca3af` (muy claro) | `#9ca3af` (se mantiene) |

### Fix 4: Reemplazar Zap icon por imagen en Footer
| Antes | Después |
|:---|:---|
| `<Zap className="text-white w-4 h-4" />` | `<img src="/icons/IsotipoMarca-CondoVe-logo-32x32.png" className="w-8 h-8 rounded-lg object-contain" />` |

### Commit
```
fix: improve Footer visibility in light mode + replace Zap icon with logo image
1 file changed, 8 insertions(+), 8 deletions(-)
```

---

## 🔧 FIX FINALES (2026-05-04)
> Fix críticos después del merge - problema de theme en Footer

### Problema identificado
El Footer no cambiaba de tema porque cada `useTheme()` crea estado independiente. El Footer tenía su propia instancia que nunca se actualizaba.

### Solución aplicada
1. **Lectura de tema desde DOM**: Footer.jsx ahora lee directamente `document.documentElement.classList.contains("dark")` en lugar de usar `useTheme()`
2. **Colores invertidos**: Los colores del texto estaban invertidos, se corrigió para que modo oscuro muestre `#4b5563` y modo claro muestre `rgba(255,255,255,0.5)`

### Commits finales
```
cd8023e fix: read theme directly from DOM class instead of using local useTheme state
8807c05 fix: invert Footer text colors (dark: #4b5563, light: rgba white)
```

---

## 📊 RESUMEN FINAL

| Aspecto | Detalle |
|:---|:---|
| **Cambios** | EMS → CondoVE SGC |
| **Archivos modificados** | 16+ archivos |
| **PR** | #3 |
| **Mergeado en** | dev |
| **Estado** | ✅ COMPLETADO |

---

*Actualizado: 2026-05-04*
*Estado: ✅ COMPLETADO - Merge exitoso a dev*