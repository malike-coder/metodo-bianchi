import { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';

// ── Consent items ─────────────────────────────────────────────
const consentItems = [
  {
    id: 'privacy',
    required: true,
    title: '1. Uso de datos personales',
    text: 'Los datos que proporciones (nombre, correo electrónico, ciudad, descripción de tu hogar y fotografías) serán utilizados exclusivamente para generar tu diagnóstico personalizado de bienestar habitacional según el Método Bianchi®. Tus datos no serán compartidos con terceros sin tu consentimiento explícito y serán tratados con estricta confidencialidad conforme a las leyes de protección de datos aplicables.',
  },
  {
    id: 'photos',
    required: true,
    title: '2. Fotografías del hogar',
    text: 'Las fotografías que compartas de los ambientes de tu hogar serán procesadas en tu sesión activa mediante algoritmos de inteligencia artificial (Gemini de Google) para evaluar parámetros como calidad lumínica, orden, biofilia y armonía de color. En esta versión del Método Bianchi®, las imágenes se analizan localmente en tu dispositivo y no son almacenadas de forma permanente en servidores externos. Podés cerrar la sesión en cualquier momento para eliminarlas de tu entorno.',
  },
  {
    id: 'results',
    required: true,
    title: '3. Naturaleza del diagnóstico',
    text: 'El diagnóstico generado por el Método Bianchi® es una herramienta de bienestar habitacional basada en evidencia científica en neuroarquitectura, psicología ambiental y diseño biofílico. No constituye diagnóstico médico, psicológico ni terapéutico. Los resultados son orientativos y no reemplazan la consulta con profesionales de la salud.',
  },
  {
    id: 'updates',
    required: false,
    title: '4. Comunicaciones (opcional)',
    text: 'Acepto recibir comunicaciones ocasionales sobre novedades del Método Bianchi®, contenido sobre bienestar habitacional y actualizaciones de la plataforma. Podés darte de baja en cualquier momento desde el correo electrónico que recibas.',
  },
];

export default function ConsentScreen() {
  const setClientScreen = useAppStore((s) => s.setClientScreen);

  const [checked, setChecked] = useState<Record<string, boolean>>({
    privacy: false,
    photos: false,
    results: false,
    updates: false,
  });

  const requiredChecked = consentItems
    .filter((c) => c.required)
    .every((c) => checked[c.id]);

  const toggle = (id: string) =>
    setChecked((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <div className="min-h-[calc(100vh-180px)] flex items-start sm:items-center justify-center px-4 sm:px-8 py-8 sm:py-12 bg-[#F0EEE9] dark:bg-[#1A1714]">
      {/* Glass card */}
      <div
        style={{
          maxWidth: '750px',
          width: '100%',
          background: 'rgba(255,255,255,0.6)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.5)',
          borderRadius: '12px',
          boxShadow: '0 2px 24px rgba(0,0,0,0.06)',
          padding: '3rem',
        }}
      >
        {/* Eyebrow */}
        <p
          style={{
            color: '#987557',
            fontSize: '0.65rem',
            letterSpacing: '0.3em',
            textTransform: 'uppercase',
            fontWeight: 600,
            textAlign: 'center',
            marginBottom: '0.75rem',
          }}
        >
          Paso 1 de 8
        </p>

        {/* Title */}
        <h2
          style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: '2.4rem',
            textAlign: 'center',
            color: '#1C1917',
            marginBottom: '0.5rem',
            lineHeight: 1.2,
          }}
        >
          Consentimiento Informado
        </h2>
        <p
          style={{
            textAlign: 'center',
            color: '#878179',
            fontSize: '0.875rem',
            marginBottom: '2rem',
          }}
        >
          Leé con atención antes de continuar con tu diagnóstico.
        </p>

        {/* Scrollable text area */}
        <div
          style={{
            height: '280px',
            overflowY: 'auto',
            border: '1px solid #D6D2CA',
            borderRadius: '10px',
            padding: '1.5rem',
            marginBottom: '2rem',
            background: 'rgba(255,255,255,0.3)',
            fontSize: '0.875rem',
            color: '#44403C',
            lineHeight: 1.7,
          }}
        >
          {consentItems.map((item) => (
            <div key={item.id} style={{ marginBottom: '1.5rem' }}>
              <p style={{ fontWeight: 700, marginBottom: '0.4rem', color: '#44403C' }}>
                {item.title}
                {item.required && (
                  <span style={{ color: '#987557', marginLeft: '0.4rem', fontWeight: 400 }}>
                    *
                  </span>
                )}
              </p>
              <p style={{ color: '#44403C' }}>{item.text}</p>
            </div>
          ))}
          <p
            style={{
              fontSize: '0.78rem',
              color: '#878179',
              borderTop: '1px solid #D6D2CA',
              paddingTop: '1rem',
              marginTop: '0.5rem',
            }}
          >
            * Los ítems marcados con asterisco son obligatorios para continuar.
          </p>
        </div>

        {/* Checkboxes */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2.5rem' }}>
          {consentItems.map((item) => (
            <label
              key={item.id}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.75rem',
                cursor: 'pointer',
              }}
            >
              <input
                type="checkbox"
                checked={checked[item.id]}
                onChange={() => toggle(item.id)}
                style={{
                  width: '18px',
                  height: '18px',
                  marginTop: '2px',
                  flexShrink: 0,
                  accentColor: '#987557',
                  cursor: 'pointer',
                }}
              />
              <span style={{ fontSize: '0.875rem', color: '#44403C', lineHeight: 1.5 }}>
                {item.id === 'privacy' &&
                  'Leí y acepto el uso de mis datos personales para el diagnóstico de bienestar habitacional.'}
                {item.id === 'photos' &&
                  'Autorizo el análisis de las fotografías de mi hogar mediante inteligencia artificial para fines diagnósticos.'}
                {item.id === 'results' &&
                  'Entiendo que el diagnóstico es una herramienta de bienestar y no un diagnóstico médico o psicológico.'}
                {item.id === 'updates' &&
                  'Acepto recibir comunicaciones ocasionales sobre el Método Bianchi® (opcional).'}
                {item.required && (
                  <span style={{ color: '#987557' }}> *</span>
                )}
              </span>
            </label>
          ))}
        </div>

        {/* Action row */}
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
          <button
            onClick={() => setClientScreen('welcome')}
            style={{
              background: 'transparent',
              color: '#878179',
              border: '1px solid #D6D2CA',
              borderRadius: '8px',
              padding: '0.75rem 1.75rem',
              fontSize: '0.875rem',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'border-color 0.2s',
            }}
            onMouseOver={(e) =>
              ((e.currentTarget as HTMLButtonElement).style.borderColor = '#987557')
            }
            onMouseOut={(e) =>
              ((e.currentTarget as HTMLButtonElement).style.borderColor = '#D6D2CA')
            }
          >
            ← Volver
          </button>
          <button
            onClick={() => {
              if (requiredChecked) setClientScreen('wizard');
            }}
            disabled={!requiredChecked}
            style={{
              background: requiredChecked ? '#987557' : '#D6D2CA',
              color: requiredChecked ? '#fff' : '#a0998f',
              border: 'none',
              borderRadius: '8px',
              padding: '0.75rem 2rem',
              fontSize: '0.875rem',
              fontWeight: 600,
              letterSpacing: '0.03em',
              cursor: requiredChecked ? 'pointer' : 'not-allowed',
              transition: 'background 0.25s, opacity 0.2s',
              opacity: requiredChecked ? 1 : 0.7,
            }}
          >
            Continuar con mi diagnóstico →
          </button>
        </div>
      </div>
    </div>
  );
}
