import { useEffect, useRef, useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { buildClientFromForm } from '../../utils/ibbhCalculator';
import { generateClientNarrativeWithAi } from '../../services/aiService';

// ── Processing steps ──────────────────────────────────────────
const STEPS = [
  {
    msg: 'Analizando tu relación con el espacio...',
    pct: 12,
    fact: 'Las personas que pasan más de 10 horas en casa son especialmente sensibles a la calidad ambiental interior (IEQ). Organización Mundial de la Salud, 2009.',
  },
  {
    msg: 'Evaluando calidad ambiental interior (IEQ)...',
    pct: 28,
    fact: 'La iluminación natural contribuye a reducir el cansancio visual y mejora el estado de alerta durante el día (Ulrich, R., 1984).',
  },
  {
    msg: 'Calculando el Índice IBBH...',
    pct: 45,
    fact: 'El desorden visual genera sobrecarga sensorial que dificulta el descanso y la concentración. Un espacio organizado se asocia con una mejor calidad del sueño (Princeton Neuroscience Institute).',
  },
  {
    msg: 'Procesando biofilia y naturaleza...',
    pct: 62,
    fact: 'La exposición a plantas de interior y visuales verdes contribuye a reducir indicadores de estrés percibido en entornos residenciales (Kaplan, S., 1995).',
  },
  {
    msg: 'Mapeando ambientes y generando plano...',
    pct: 78,
    fact: 'La temperatura de color de la luz artificial puede interferir con el ciclo de descanso natural. Luz cálida en dormitorios favorece la transición al sueño (CIE, 2009).',
  },
  {
    msg: 'Generando hipótesis de neuroarquitectura...',
    pct: 92,
    fact: 'Los entornos con orden, naturaleza y refugio reducen la fatiga mental y promueven la restauración atencional (Kaplan & Kaplan, 1989).',
  },
  {
    msg: 'Redactando tu plan de acción personalizado...',
    pct: 100,
    fact: '',
  },
];

// ── Keyframe injection (once) ─────────────────────────────────
let stylesInjected = false;
function ensureStyles() {
  if (stylesInjected) return;
  stylesInjected = true;
  const style = document.createElement('style');
  style.textContent = `
    @keyframes pulseCore {
      0%, 100% { transform: scale(1); opacity: 1; }
      50% { transform: scale(0.85); opacity: 0.7; }
    }
    @keyframes pulseRing {
      0% { transform: scale(0.6); opacity: 0.8; }
      100% { transform: scale(1.8); opacity: 0; }
    }
  `;
  document.head.appendChild(style);
}

export default function ProcessingScreen() {
  const form = useAppStore((s) => s.form);
  const setCurrentClient = useAppStore((s) => s.setCurrentClient);
  const setClientScreen = useAppStore((s) => s.setClientScreen);

  const [stepIndex, setStepIndex] = useState(0);
  const [msgOpacity, setMsgOpacity] = useState(1);
  const doneRef = useRef(false);

  // Gemini API background fetch states
  const [aiResult, setAiResult] = useState<any>(null);
  const [aiLoading, setAiLoading] = useState(false);

  ensureStyles();

  // 1. Trigger background Gemini call immediately when mounting
  useEffect(() => {
    let isMounted = true;
    async function fetchAiDiagnostic() {
      setAiLoading(true);
      try {
        const result = await generateClientNarrativeWithAi(form, form.scannedRooms || {});
        if (isMounted && result) {
          setAiResult(result);
        }
      } catch (err) {
        console.error('Failed fetching Gemini AI results:', err);
      } finally {
        if (isMounted) {
          setAiLoading(false);
        }
      }
    }
    fetchAiDiagnostic();
    return () => {
      isMounted = false;
    };
  }, [form]);

  // 2. Advance step indices on an interval for facts display
  useEffect(() => {
    const interval = setInterval(() => {
      setStepIndex((prev) => {
        const next = prev + 1;
        if (next >= STEPS.length) {
          clearInterval(interval);
          return prev;
        }
        // Fade out → in for message
        setMsgOpacity(0);
        setTimeout(() => setMsgOpacity(1), 200);
        return next;
      });
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  // 3. When progress bar finishes, build client and navigate (waiting for AI if loading)
  useEffect(() => {
    if (stepIndex === STEPS.length - 1 && !doneRef.current) {
      if (aiLoading) {
        // Wait for AI to finish loading
        return;
      }
      doneRef.current = true;
      setTimeout(() => {
        const client = buildClientFromForm(form);
        if (aiResult) {
          // Merge real AI narrative and actions into the generated client object!
          if (aiResult.narrativeText) {
            client.narrativeText = aiResult.narrativeText;
          }
          if (aiResult.actionItems && aiResult.actionItems.length > 0) {
            client.actionItems = aiResult.actionItems;
          }
        }
        setCurrentClient(client);
        setClientScreen('results');
      }, 1000);
    }
  }, [stepIndex, form, setCurrentClient, setClientScreen, aiLoading, aiResult]);

  const currentStep = STEPS[stepIndex];

  return (
    <div className="min-h-[calc(100vh-180px)] flex items-start sm:items-center justify-center px-4 sm:px-8 py-8 sm:py-12 bg-[#F0EEE9] dark:bg-[#1A1714]">
      {/* Glass card */}
      <div
        style={{
          maxWidth: '560px',
          width: '100%',
          background: 'rgba(255,255,255,0.5)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.5)',
          borderRadius: '12px',
          boxShadow: '0 2px 32px rgba(0,0,0,0.07)',
          padding: 'clamp(1.5rem, 6vw, 3.75rem)',
          textAlign: 'center',
        }}
      >
        {/* Pulse loader */}
        <div style={{ position: 'relative', width: '72px', height: '72px', margin: '0 auto' }}>
          {/* Ring 1 */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              border: '1px solid #987557',
              animation: 'pulseRing 2s ease-out infinite',
              animationDelay: '0s',
            }}
          />
          {/* Ring 2 */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              border: '1px solid #987557',
              animation: 'pulseRing 2s ease-out infinite',
              animationDelay: '0.8s',
            }}
          />
          {/* Core */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              background: '#987557',
              animation: 'pulseCore 2s ease-in-out infinite',
            }}
          />
        </div>

        {/* Title */}
        <h2
          style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: '2.2rem',
            color: '#1C1917',
            marginTop: '2rem',
            marginBottom: '0.75rem',
            lineHeight: 1.2,
          }}
        >
          Analizando tu Hábitat
        </h2>

        {/* Processing message */}
        <div
          style={{
            color: '#878179',
            fontSize: '0.875rem',
            letterSpacing: '0.03em',
            minHeight: '22px',
            transition: 'opacity 0.2s ease',
            opacity: msgOpacity,
          }}
        >
          {currentStep.msg}
        </div>

        {/* Progress bar */}
        <div
          style={{
            width: '100%',
            height: '2px',
            background: '#D6D2CA',
            borderRadius: '999px',
            marginTop: '2rem',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              background: '#987557',
              height: '100%',
              width: `${currentStep.pct}%`,
              transition: 'width 1200ms ease-in-out',
              borderRadius: '999px',
            }}
          />
        </div>

        {/* Percentage label */}
        <p
          style={{
            color: '#987557',
            fontSize: '0.75rem',
            fontWeight: 600,
            marginTop: '0.6rem',
            letterSpacing: '0.05em',
          }}
        >
          {currentStep.pct}%
        </p>

        {/* Science fact card */}
        {currentStep.fact && (
          <div
            style={{
              marginTop: '2.5rem',
              padding: '1.25rem',
              background: 'rgba(152,117,87,0.05)',
              border: '1px solid rgba(152,117,87,0.15)',
              borderRadius: '10px',
              textAlign: 'left',
              transition: 'opacity 0.4s ease',
              opacity: msgOpacity,
            }}
          >
            <p
              style={{
                color: '#987557',
                fontSize: '0.65rem',
                textTransform: 'uppercase',
                letterSpacing: '0.2em',
                fontWeight: 600,
                marginBottom: '0.6rem',
              }}
            >
              Sabías que...
            </p>
            <p
              style={{
                fontFamily: 'Cormorant Garamond, serif',
                fontStyle: 'italic',
                fontSize: '1rem',
                color: '#44403C',
                lineHeight: 1.65,
              }}
            >
              {currentStep.fact}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
