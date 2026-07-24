// Cloudflare Pages Function — Formulario de cotización
// NOTA: el logo del correo apunta al dominio de preview (pages.dev) porque
// el sitio real aún no está publicado en transportemahe.com. Cuando se
// fusione sitio-completo -> main, cambiar la URL del <img> a
// https://transportemahe.com/assets/img/logo/logo_mahe_horizontal_blanco.png
// Variables de entorno requeridas en Cloudflare Dashboard (Settings → Environment variables):
//   BREVO_KEY_MAHE  → tu API key de Brevo para este proyecto
//   NOTIFY_EMAIL_MAHE    → transportemahe@gmail.com

const CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
};

export async function onRequest(context) {
    const { env, request } = context;

    if (request.method === 'OPTIONS') {
        return new Response(null, { status: 204, headers: CORS });
    }

    if (request.method !== 'POST') {
        return new Response('Method not allowed', { status: 405, headers: CORS });
    }

    let data;
    try {
        data = await request.json();
    } catch {
        return new Response(JSON.stringify({ ok: false, error: 'Datos inválidos' }), {
            status: 400, headers: { ...CORS, 'Content-Type': 'application/json' }
        });
    }

    const { nombre, empresa, telefono, email, empleados, turnos, ubicaciones, mensaje } = data;

    if (!nombre || !empresa || !telefono || !email) {
        return new Response(JSON.stringify({ ok: false, error: 'Faltan campos requeridos' }), {
            status: 400, headers: { ...CORS, 'Content-Type': 'application/json' }
        });
    }

    // ── 1. NOTIFICAR AL EQUIPO ────────────────────────────────────────────
    await enviarEmail(env, {
        to: env.NOTIFY_EMAIL_MAHE || 'transportemahe@gmail.com',
        subject: `🚐 Nueva solicitud de cotización: ${empresa}`,
        html: `
            <div style="font-family:sans-serif;max-width:600px;margin:auto;">
                <h2 style="color:#8a5a2e;">Nueva solicitud de cotización — Transporte MAHE</h2>
                <table style="width:100%;border-collapse:collapse;font-size:14px;">
                    <tr><td style="padding:8px;font-weight:bold;color:#555;">Nombre</td><td style="padding:8px;">${nombre}</td></tr>
                    <tr style="background:#f8f4ef;"><td style="padding:8px;font-weight:bold;color:#555;">Empresa</td><td style="padding:8px;">${empresa}</td></tr>
                    <tr><td style="padding:8px;font-weight:bold;color:#555;">Teléfono</td><td style="padding:8px;">${telefono}</td></tr>
                    <tr style="background:#f8f4ef;"><td style="padding:8px;font-weight:bold;color:#555;">Correo</td><td style="padding:8px;">${email}</td></tr>
                    <tr><td style="padding:8px;font-weight:bold;color:#555;">N.º de empleados</td><td style="padding:8px;">${empleados || '—'}</td></tr>
                    <tr style="background:#f8f4ef;"><td style="padding:8px;font-weight:bold;color:#555;">Turnos / horarios</td><td style="padding:8px;">${turnos || '—'}</td></tr>
                    <tr><td style="padding:8px;font-weight:bold;color:#555;">Ubicaciones</td><td style="padding:8px;">${ubicaciones || '—'}</td></tr>
                    <tr style="background:#f8f4ef;"><td style="padding:8px;font-weight:bold;color:#555;">Mensaje</td><td style="padding:8px;">${mensaje || '—'}</td></tr>
                </table>
                <p style="color:#999;font-size:12px;margin-top:20px;">Transporte MAHE — Sistema automático de leads</p>
            </div>
        `
    });

    // ── 2. CONFIRMAR AL CLIENTE ───────────────────────────────────────────
    const nombreCorto = nombre.split(' ').slice(0, 2).join(' ');
    await enviarEmail(env, {
        to: email,
        subject: `${nombreCorto}, recibimos tu solicitud de cotización`,
        html: `
            <div style="font-family:sans-serif;max-width:600px;margin:auto;">
                <div style="background:linear-gradient(135deg,#2e1c10,#8a5a2e);border-radius:12px 12px 0 0;padding:24px 32px;text-align:center;">
                    <img src="https://sitio-completo.transporte-mahe.pages.dev/assets/img/logo/logo_mahe_horizontal_blanco.png" alt="Transporte MAHE" style="height:44px;width:auto;display:block;margin:0 auto;">
                </div>
                <div style="background:#fff;border-radius:0 0 12px 12px;border:1px solid #e2e8f0;border-top:none;padding:32px;">
                <h2 style="color:#8a5a2e;">¡Hola, ${nombreCorto}!</h2>
                <p style="color:#444;font-size:15px;line-height:1.6;">
                    Recibimos tu solicitud de cotización de transporte de personal para <strong>${empresa}</strong>.
                    Nuestro equipo revisará los detalles y se pondrá en contacto contigo en las próximas <strong>24 horas hábiles</strong> con una propuesta de ruta.
                </p>
                <div style="background:#f8f4ef;border-left:4px solid #8a5a2e;padding:16px;border-radius:0 8px 8px 0;margin:24px 0;">
                    <p style="margin:0;color:#8a5a2e;font-weight:bold;">¿Quieres avanzar más rápido?</p>
                    <p style="margin:8px 0 0;color:#555;font-size:14px;">Escríbenos directo por WhatsApp:</p>
                    <a href="https://wa.me/524461096696" style="color:#8a5a2e;font-weight:bold;">+52 446 109 66 96</a>
                </div>
                <hr style="border:none;border-top:1px solid #eee;margin:24px 0;">
                <p style="color:#aaa;font-size:11px;">
                    <a href="https://transportemahe.com" style="color:#8a5a2e;">transportemahe.com</a> ·
                    contacto@transportemahe.com · +52 446 109 66 96
                </p>
                </div>
            </div>
        `
    });

    return new Response(JSON.stringify({ ok: true }), {
        headers: { ...CORS, 'Content-Type': 'application/json' }
    });
}

// ── Helper: enviar email via Brevo API ────────────────────────────────────
async function enviarEmail(env, { to, subject, html }) {
    if (!env.BREVO_KEY_MAHE) {
        console.warn('BREVO_KEY_MAHE no configurada — email omitido');
        return;
    }
    await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
            'api-key': env.BREVO_KEY_MAHE,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            sender: { name: 'Transporte MAHE', email: 'contacto@transportemahe.com' },
            to: [{ email: to }],
            subject,
            htmlContent: html,
        }),
    });
}
