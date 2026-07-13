import { useAppStore } from '../../store/useAppStore';
import { mockClients } from '../../data/mockClients';
import { CicloBianchi } from './CicloBianchi';

const testimonials = [
  {
    quote: 'Nunca había pensado que el desorden en mi dormitorio era la razón por la que me costaba tanto descansar. El diagnóstico me abrió los ojos.',
    name: 'Valentina M.',
    city: 'Buenos Aires',
    score: 72,
  },
  {
    quote: 'Sentí que alguien finalmente entendía por qué mi casa me generaba ansiedad. El plan de acción fue concreto y la diferencia se notó en semanas.',
    name: 'Carolina R.',
    city: 'Mendoza',
    score: 58,
  },
  {
    quote: 'Esperaba un test más. Recibí un mapa completo de mi hogar y un camino claro para transformarlo. Increíble experiencia.',
    name: 'Lucía F.',
    city: 'Rosario',
    score: 65,
  },
];

const pillars = [
  { label: '8 Dimensiones', sub: 'del bienestar habitacional' },
  { label: 'Índice IBBH', sub: 'diagnóstico científico' },
  { label: 'Plan de Acción', sub: 'personalizado y accionable' },
];

export default function WelcomeScreen() {
  const setClientScreen = useAppStore((s) => s.setClientScreen);
  const setCurrentClient = useAppStore((s) => s.setCurrentClient);

  return (
    <div style={{ background: '#F0EEE9', overflowX: 'hidden' }}>

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section style={{ padding: 'clamp(1.5rem, 4vw, 4rem) clamp(1rem, 4vw, 4rem)' }}>

        {/* Two-column grid — stacks at 768px */}
        <div className="hero-grid">
          {/* LEFT — text */}
          <div>
            <p style={{
              color: '#987557',
              fontSize: '0.65rem',
              letterSpacing: '0.3em',
              fontWeight: 600,
              textTransform: 'uppercase',
              marginBottom: '1.25rem',
            }}>
              Bienestar Habitacional · Neuroarquitectura
            </p>

            <h1 style={{
              fontFamily: 'Cormorant Garamond, serif',
              fontSize: 'clamp(2.2rem, 4vw, 3.8rem)',
              lineHeight: 1.15,
              color: '#1C1917',
              marginBottom: '1.5rem',
              fontWeight: 300,
            }}>
              Tu hogar y tu{' '}
              <em style={{ color: '#987557', fontStyle: 'italic' }}>bienestar</em>
              <br />son inseparables
            </h1>

            <p style={{
              color: '#878179',
              fontSize: 'clamp(0.95rem, 1.5vw, 1.125rem)',
              maxWidth: '560px',
              marginBottom: '2.5rem',
              lineHeight: 1.7,
            }}>
              El Método Bianchi® mide cómo cada ambiente de tu hogar impacta en tu
              sistema nervioso, tu descanso y tu estado emocional. Recibís un diagnóstico
              científico y un plan de acción personalizado.
            </p>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '3.5rem', flexWrap: 'wrap' }}>
              <button
                onClick={() => setClientScreen('consent')}
                style={{
                  background: '#987557', color: '#fff', border: 'none',
                  borderRadius: '8px', padding: '0.875rem 2rem',
                  fontSize: '0.9rem', fontWeight: 600, letterSpacing: '0.04em',
                  cursor: 'pointer', fontFamily: 'Jost, sans-serif',
                  transition: 'background 0.2s',
                }}
                onMouseOver={(e) => (e.currentTarget.style.background = '#7d5f44')}
                onMouseOut={(e) => (e.currentTarget.style.background = '#987557')}
              >
                Comenzar Evaluación
              </button>
              <button
                onClick={() => { setCurrentClient(mockClients[0]); setClientScreen('results'); }}
                style={{
                  background: 'transparent', color: '#987557',
                  border: '1.5px solid #987557', borderRadius: '8px',
                  padding: '0.875rem 2rem', fontSize: '0.9rem', fontWeight: 600,
                  letterSpacing: '0.04em', cursor: 'pointer',
                  fontFamily: 'Jost, sans-serif', transition: 'background 0.2s',
                }}
                onMouseOver={(e) => (e.currentTarget.style.background = 'rgba(152,117,87,0.07)')}
                onMouseOut={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                Ver Resultados Piloto
              </button>
            </div>

            {/* Pillars */}
            <div style={{ display: 'flex', borderTop: '1px solid #D6D2CA', paddingTop: '1.75rem' }}>
              {pillars.map((p, i) => (
                <div key={p.label} style={{
                  flex: 1,
                  paddingRight: i < pillars.length - 1 ? '1.25rem' : 0,
                  paddingLeft: i > 0 ? '1.25rem' : 0,
                  borderLeft: i > 0 ? '1px solid #D6D2CA' : 'none',
                }}>
                  <p style={{ color: '#987557', fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.2rem' }}>{p.label}</p>
                  <p style={{ color: '#878179', fontSize: '0.78rem', lineHeight: 1.4 }}>{p.sub}</p>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT — image */}
          <div style={{
            height: 'clamp(280px, 45vw, 520px)',
            borderRadius: '12px',
            overflow: 'hidden',
            border: '1px solid #D6D2CA',
            position: 'relative',
            flexShrink: 0,
          }}>
            <img
              src="/bianchi_interior.png"
              alt="Interior Método Bianchi"
              style={{
                width: '100%', height: '100%', objectFit: 'cover',
                display: 'block', transition: 'transform 1500ms ease',
              }}
              onMouseOver={(e) => ((e.currentTarget as HTMLImageElement).style.transform = 'scale(1.03)')}
              onMouseOut={(e) => ((e.currentTarget as HTMLImageElement).style.transform = 'scale(1)')}
            />
            <div style={{
              position: 'absolute', bottom: 0, left: 0, right: 0,
              background: 'rgba(255,255,255,0.85)',
              backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
              padding: '1.5rem 1.75rem',
              borderTop: '1px solid rgba(255,255,255,0.3)',
            }}>
              <p style={{ color: '#987557', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '0.35rem' }}>
                Método Bianchi®
              </p>
              <p style={{ fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic', fontSize: '1.25rem', color: '#44403C', lineHeight: 1.3 }}>
                Diagnóstico integral de bienestar habitacional
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── CICLO BIANCHI ───────────────────────────────────── */}
      <CicloBianchi />

      {/* ── TESTIMONIALS ─────────────────────────────────────── */}
      <section style={{
        background: 'rgba(152,117,87,0.04)',
        borderTop: '1px solid #D6D2CA',
        borderBottom: '1px solid #D6D2CA',
        padding: 'clamp(2.5rem, 5vw, 5rem) clamp(1rem, 4vw, 4rem)',
      }}>
        <p style={{
          color: '#987557', fontSize: '0.65rem', letterSpacing: '0.3em',
          textTransform: 'uppercase', fontWeight: 600, textAlign: 'center', marginBottom: '0.75rem',
        }}>
          Lo que dicen quienes ya lo hicieron
        </p>
        <p style={{ textAlign: 'center', color: '#878179', fontSize: '0.9rem', marginBottom: '2.5rem' }}>
          Experiencias reales de personas que transformaron su hogar
        </p>

        <div className="testimonials-grid">
          {testimonials.map((t) => (
            <div key={t.name} style={{
              background: '#fff', border: '1px solid #D6D2CA',
              borderRadius: '12px', padding: '2.25rem',
              display: 'flex', flexDirection: 'column', gap: '1.25rem',
            }}>
              <p style={{ fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic', fontSize: '1.1rem', color: '#44403C', lineHeight: 1.6, flex: 1 }}>
                "{t.quote}"
              </p>
              <div style={{ height: '1px', background: '#D6D2CA' }} />
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ fontWeight: 600, fontSize: '0.875rem', color: '#44403C', marginBottom: '0.15rem' }}>{t.name}</p>
                  <p style={{ color: '#878179', fontSize: '0.78rem' }}>{t.city}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ color: '#878179', fontSize: '0.65rem', marginBottom: '0.15rem' }}>IBBH</p>
                  <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.5rem', color: '#987557', fontWeight: 700, lineHeight: 1 }}>{t.score}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
