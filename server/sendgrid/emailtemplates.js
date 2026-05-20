const BASE_STYLE = `
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    line-height: 1.6;
    color: #1a1a2e;
    max-width: 560px;
    margin: 0 auto;
    padding: 20px;
    background-color: #f8f8fc;
`

const CARD_STYLE = `
    background: #ffffff;
    border-radius: 16px;
    padding: 32px;
    box-shadow: 0 4px 24px rgba(99,102,241,0.08);
    border: 1px solid rgba(99,102,241,0.1);
`

const HEADER = (title) => `
    <div style="text-align: center; margin-bottom: 28px;">
        <div style="
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 48px; height: 48px;
            background: linear-gradient(135deg, #6366f1, #8b5cf6);
            border-radius: 12px;
            margin-bottom: 16px;
        ">
            <span style="color: white; font-size: 22px;">⚡</span>
        </div>
        <h1 style="margin: 0; font-size: 22px; font-weight: 700; color: #1a1a2e; letter-spacing: -0.5px;">
            CondoVE SGC<span style="color: #6366f1;">.</span>
        </h1>
        <p style="margin: 6px 0 0; font-size: 13px; color: #9ca3af; font-weight: 500;">
            Sistema de Gestión Condominial
        </p>
    </div>
    <div style="
        background: linear-gradient(135deg, #6366f1, #8b5cf6);
        border-radius: 12px;
        padding: 20px 24px;
        margin-bottom: 28px;
        text-align: center;
    ">
        <h2 style="margin: 0; color: white; font-size: 18px; font-weight: 700;">${title}</h2>
    </div>
`

const FOOTER = `
    <div style="text-align: center; margin-top: 28px; padding-top: 20px; border-top: 1px solid #f0f0f8;">
        <p style="margin: 0; font-size: 12px; color: #9ca3af;">
            Este es un mensaje automático, por favor no respondas a este correo.
        </p>
        <p style="margin: 6px 0 0; font-size: 12px; color: #9ca3af;">
            © ${new Date().getFullYear()} CondoVE SGC — Sistema de Gestión Condominial
        </p>
    </div>
`

// ── Invitación HR ─────────────────────────────────────────────────────────
export const INVITATION_HR_TEMPLATE = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invitación a CondoVE SGC</title>
</head>
<body style="${BASE_STYLE}">
  <div style="${CARD_STYLE}">
    ${HEADER("Te han invitado a CondoVE SGC")}
    <p style="margin: 0 0 12px; color: #4b5563; font-size: 15px;">Hola, <strong>{name}</strong>,</p>
    <p style="margin: 0 0 24px; color: #4b5563; font-size: 15px;">
        Has sido invitado a ocupar el cargo de <strong>{role}</strong> en CondoVE SGC.
    </p>
    <div style="text-align: center; margin: 32px 0;">
        <a href="{inviteURL}" style="
            display: inline-block;
            background: linear-gradient(135deg, #6366f1, #8b5cf6);
            color: white;
            padding: 14px 32px;
            text-decoration: none;
            border-radius: 12px;
            font-weight: 700;
            font-size: 15px;
            letter-spacing: 0.3px;
            box-shadow: 0 4px 15px rgba(99,102,241,0.3);
        ">Aceptar invitación</a>
    </div>
    <p style="margin: 0 0 8px; color: #6b7280; font-size: 14px;">
        ⏱ Este enlace expirará en <strong>48 horas</strong>.
    </p>
    <p style="margin: 0; color: #9ca3af; font-size: 13px;">
        Si no esperabas esta invitación, puedes ignorar este correo.<br>
        <span style="color: #6366f1; word-break: break-all;">{inviteURL}</span>
    </p>
    ${FOOTER}
  </div>
</body>
</html>
`

// ── Verificación de email ─────────────────────────────────────────────────
export const VERIFICATION_EMAIL_TEMPLATE = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verifica tu correo — CondoVE SGC</title>
</head>
<body style="${BASE_STYLE}">
  <div style="${CARD_STYLE}">
    ${HEADER("Verifica tu correo electrónico")}
    <p style="margin: 0 0 12px; color: #4b5563; font-size: 15px;">Hola,</p>
    <p style="margin: 0 0 24px; color: #4b5563; font-size: 15px;">
        Gracias por registrarte en CondoVE SGC. Usa el siguiente código para verificar tu correo electrónico:
    </p>
    <div style="
        text-align: center;
        background: linear-gradient(135deg, rgba(99,102,241,0.06), rgba(139,92,246,0.06));
        border: 1px solid rgba(99,102,241,0.15);
        border-radius: 12px;
        padding: 24px;
        margin: 24px 0;
    ">
        <span style="
            font-size: 38px;
            font-weight: 800;
            letter-spacing: 10px;
            color: #6366f1;
            font-variant-numeric: tabular-nums;
        ">{verificationCode}</span>
    </div>
    <p style="margin: 0 0 8px; color: #6b7280; font-size: 14px;">
        Ingresa este código en la página de verificación para completar tu registro.
    </p>
    <p style="margin: 0 0 8px; color: #6b7280; font-size: 14px;">
        ⏱ Este código expirará en <strong>5 minutos</strong> por razones de seguridad.
    </p>
    <p style="margin: 0; color: #9ca3af; font-size: 13px;">
        Si no creaste una cuenta en CondoVE SGC, puedes ignorar este correo.
    </p>
    ${FOOTER}
  </div>
</body>
</html>
`

// ── Bienvenida HR ─────────────────────────────────────────────────────────
export const WELCOME_HR_TEMPLATE = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bienvenido a CondoVE SGC</title>
</head>
<body style="${BASE_STYLE}">
  <div style="${CARD_STYLE}">
    ${HEADER("¡Bienvenido a CondoVE SGC!")}
    <p style="margin: 0 0 12px; color: #4b5563; font-size: 15px;">Hola, <strong>{name}</strong>,</p>
    <p style="margin: 0 0 24px; color: #4b5563; font-size: 15px;">
        Tu correo ha sido verificado exitosamente. Ya tienes acceso completo al panel de administración de CondoVE SGC como <strong>HR Admin</strong>.
    </p>
    <div style="
        background: linear-gradient(135deg, rgba(99,102,241,0.06), rgba(139,92,246,0.06));
        border: 1px solid rgba(99,102,241,0.15);
        border-radius: 12px;
        padding: 20px 24px;
        margin: 24px 0;
    ">
        <p style="margin: 0 0 8px; font-size: 14px; font-weight: 600; color: #6366f1;">Desde tu panel puedes:</p>
        <ul style="margin: 0; padding-left: 20px; color: #4b5563; font-size: 14px; line-height: 2;">
            <li>Gestionar empleados y departamentos</li>
            <li>Crear y asignar horarios de trabajo</li>
            <li>Revisar asistencia y fotos de trabajo</li>
            <li>Administrar nóminas y solicitudes</li>
        </ul>
    </div>
    <p style="margin: 0; color: #9ca3af; font-size: 13px;">
        Si tienes alguna duda, contacta a soporte.
    </p>
    ${FOOTER}
  </div>
</body>
</html>
`

// ── Bienvenida Empleado ───────────────────────────────────────────────────
export const WELCOME_EMPLOYEE_TEMPLATE = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bienvenido a CondoVE SGC</title>
</head>
<body style="${BASE_STYLE}">
  <div style="${CARD_STYLE}">
    ${HEADER("¡Bienvenido al equipo!")}
    <p style="margin: 0 0 12px; color: #4b5563; font-size: 15px;">Hola, <strong>{name}</strong>,</p>
    <p style="margin: 0 0 24px; color: #4b5563; font-size: 15px;">
        Tu cuenta en CondoVE SGC ha sido verificada exitosamente. Ya puedes acceder a tu panel de empleado.
    </p>
    <div style="
        background: linear-gradient(135deg, rgba(99,102,241,0.06), rgba(139,92,246,0.06));
        border: 1px solid rgba(99,102,241,0.15);
        border-radius: 12px;
        padding: 20px 24px;
        margin: 24px 0;
    ">
        <p style="margin: 0 0 8px; font-size: 14px; font-weight: 600; color: #6366f1;">Desde tu panel puedes:</p>
        <ul style="margin: 0; padding-left: 20px; color: #4b5563; font-size: 14px; line-height: 2;">
            <li>Registrar tu entrada y salida diaria</li>
            <li>Ver tus horarios y tareas asignadas</li>
            <li>Subir fotos de tus labores</li>
            <li>Consultar tus nóminas y solicitudes</li>
        </ul>
    </div>
    <p style="margin: 0; color: #9ca3af; font-size: 13px;">
        Si tienes alguna duda, contacta a tu supervisor.
    </p>
    ${FOOTER}
  </div>
</body>
</html>
`

// ── Recuperar contraseña ──────────────────────────────────────────────────
export const PASSWORD_RESET_REQUEST_TEMPLATE = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Restablecer contraseña — CondoVE SGC</title>
</head>
<body style="${BASE_STYLE}">
  <div style="${CARD_STYLE}">
    ${HEADER("Restablecer contraseña")}
    <p style="margin: 0 0 12px; color: #4b5563; font-size: 15px;">Hola,</p>
    <p style="margin: 0 0 24px; color: #4b5563; font-size: 15px;">
        Recibimos una solicitud para restablecer la contraseña de tu cuenta. Si no realizaste esta solicitud, puedes ignorar este correo.
    </p>
    <div style="text-align: center; margin: 32px 0;">
        <a href="{resetURL}" style="
            display: inline-block;
            background: linear-gradient(135deg, #6366f1, #8b5cf6);
            color: white;
            padding: 14px 32px;
            text-decoration: none;
            border-radius: 12px;
            font-weight: 700;
            font-size: 15px;
            letter-spacing: 0.3px;
            box-shadow: 0 4px 15px rgba(99,102,241,0.3);
        ">Restablecer contraseña</a>
    </div>
    <p style="margin: 0 0 8px; color: #6b7280; font-size: 14px;">
        ⏱ Este enlace expirará en <strong>1 hora</strong> por razones de seguridad.
    </p>
    <p style="margin: 0; color: #9ca3af; font-size: 13px;">
        Si el botón no funciona, copia y pega este enlace en tu navegador:<br>
        <span style="color: #6366f1; word-break: break-all;">{resetURL}</span>
    </p>
    ${FOOTER}
  </div>
</body>
</html>
`

// ── Confirmación de contraseña restablecida ───────────────────────────────
export const PASSWORD_RESET_SUCCESS_TEMPLATE = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Contraseña restablecida — CondoVE SGC</title>
</head>
<body style="${BASE_STYLE}">
  <div style="${CARD_STYLE}">
    ${HEADER("Contraseña restablecida exitosamente")}
    <p style="margin: 0 0 12px; color: #4b5563; font-size: 15px;">Hola,</p>
    <p style="margin: 0 0 24px; color: #4b5563; font-size: 15px;">
        Tu contraseña ha sido restablecida exitosamente.
    </p>
    <div style="
        text-align: center;
        background: linear-gradient(135deg, rgba(16,185,129,0.06), rgba(5,150,105,0.06));
        border: 1px solid rgba(16,185,129,0.2);
        border-radius: 12px;
        padding: 24px;
        margin: 24px 0;
    ">
        <div style="
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 52px; height: 52px;
            background: linear-gradient(135deg, #10b981, #059669);
            border-radius: 50%;
            font-size: 24px;
            color: white;
            margin-bottom: 12px;
        ">✓</div>
        <p style="margin: 0; font-size: 15px; font-weight: 600; color: #065f46;">
            Contraseña actualizada
        </p>
    </div>
    <p style="margin: 0 0 8px; color: #6b7280; font-size: 14px;">
        Si no realizaste este cambio, contacta a soporte de inmediato.
    </p>
    <p style="margin: 0 0 8px; color: #6b7280; font-size: 14px;">Por seguridad te recomendamos:</p>
    <ul style="margin: 0 0 16px; padding-left: 20px; color: #6b7280; font-size: 14px; line-height: 2;">
        <li>Usar una contraseña fuerte y única</li>
        <li>No compartir tu contraseña con nadie</li>
        <li>No usar la misma contraseña en otros sitios</li>
    </ul>
    ${FOOTER}
  </div>
</body>
</html>
`

// ── Invitación Empleado ─────────────────────────────────────────────────────────
export const INVITATION_EMPLOYEE_TEMPLATE = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invitación al equipo</title>
</head>
<body style="${BASE_STYLE}">
  <div style="${CARD_STYLE}">
    ${HEADER("Invitación al equipo")}
    <p style="margin: 0 0 12px; color: #4b5563; font-size: 15px;">Hola, <strong>{name}</strong>,</p>
    <p style="margin: 0 0 24px; color: #4b5563; font-size: 15px;">
        Has sido invitado a unirte al equipo de <strong>{companyName}</strong> en CondoVE SGC.
    </p>
    <div style="text-align: center; margin: 32px 0;">
        <a href="{inviteURL}" style="
            display: inline-block;
            background: linear-gradient(135deg, #10b981, #059669);
            color: white;
            padding: 14px 32px;
            text-decoration: none;
            border-radius: 12px;
            font-weight: 700;
            font-size: 15px;
            letter-spacing: 0.3px;
            box-shadow: 0 4px 15px rgba(16,185,129,0.3);
        ">Aceptar invitación</a>
    </div>
    <p style="margin: 0 0 8px; color: #6b7280; font-size: 14px;">
        ⏱ Este enlace expirará en <strong>48 horas</strong>.
    </p>
    <p style="margin: 0; color: #9ca3af; font-size: 13px;">
        Si no esperabas esta invitación, puedes ignorar este correo.<br>
        <span style="color: #10b981; word-break: break-all;">{inviteURL}</span>
    </p>
    ${FOOTER}
  </div>
</body>
</html>
`
