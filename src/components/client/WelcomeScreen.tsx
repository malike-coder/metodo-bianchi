import { useAppStore } from '../../store/useAppStore';
import { mockClients } from '../../data/mockClients';
import { CicloBianchi } from './CicloBianchi';

const testimonials = [
  {
    quote: 'El diagnóstico me abrió los ojos sobre cómo mi dormitorio afectaba mi descanso diario.',
    name: 'Valentina M.',
    city: 'Buenos Aires',
    beforeScore: 52,
    afterScore: 84,
  },
  {
    quote: 'El plan de acción fue tan concreto y simple que la diferencia se notó en semanas.',
    name: 'Carolina R.',
    city: 'Mendoza',
    beforeScore: 48,
    afterScore: 76,
  },
  {
    quote: 'Dejé de ver mi casa como una lista de problemas y empecé a verla como un refugio.',
    name: 'Lucía F.',
    city: 'Rosario',
    beforeScore: 55,
    afterScore: 81,
  },
];

const dimensions = [
  {
    icon: '🖼️',
    title: 'Identidad y Pertenencia',
    desc: 'Cómo tu espacio cuenta tu historia y te da arraigo.',
  },
  {
    icon: '🧘',
    title: 'Sentirte más tranquila',
    desc: 'Zonas libres de estrés que te ayudan a bajar un cambio.',
  },
  {
    icon: '☀️',
    title: 'Confort y luz',
    desc: 'Iluminación y comodidad física para proteger tu energía diaria.',
  },
  {
    icon: '🏡',
    title: 'Orden Visual',
    desc: 'Organización simple para disminuir el cansancio de tu mente.',
  },
  {
    icon: '🌿',
    title: 'Conexión con la naturaleza',
    desc: 'Plantas y vistas exteriores que restauran tu calma.',
  },
  {
    icon: '🌙',
    title: 'Tu calidad de descanso',
    desc: 'Un santuario nocturno diseñado para descansar profundamente.',
  },
  {
    icon: '🚶',
    title: 'Fluidez al moverte',
    desc: 'Recorridos cómodos y sin obstáculos en tu casa.',
  },
  {
    icon: '👥',
    title: 'Espacios de encuentro',
    desc: 'Distribución pensada para conversar y compartir cara a cara.',
  },
];

export default function WelcomeScreen() {
  const setClientScreen = useAppStore((s) => s.setClientScreen);
  const setCurrentClient = useAppStore((s) => s.setCurrentClient);

  return (
    <div style={{ background: '#F0EEE9', overflowX: 'hidden' }}>

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section style={{ padding: 'clamp(2.5rem, 5vw, 6rem) clamp(1rem, 4vw, 4rem)' }}>
        <div className="hero-grid" style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr', gap: '3rem', alignItems: 'center' }}>
          
          {/* LEFT — text */}
          <div style={{ textAlign: 'left' }}>
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
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(2.4rem, 4.5vw, 4rem)',
              lineHeight: 1.15,
              color: '#1C1917',
              marginBottom: '1.5rem',
              fontWeight: 300,
            }}>
              Descubrí cómo tu hogar está influyendo en tu bienestar.
            </h1>

            <p style={{
              color: '#878179',
              fontSize: 'clamp(1rem, 1.6vw, 1.15rem)',
              maxWidth: '580px',
              marginBottom: '2.5rem',
              lineHeight: 1.7,
              fontWeight: 300,
            }}>
              En pocos minutos vas a descubrir qué aspectos de tu hogar hoy te ayudan, cuáles pueden estar afectando tu bienestar y por dónde empezar a mejorarlo.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'flex-start', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <button
                  onClick={() => setClientScreen('consent')}
                  style={{
                    background: '#987557', color: '#fff', border: 'none',
                    borderRadius: '8px', padding: '1rem 2.5rem',
                    fontSize: '0.95rem', fontWeight: 600, letterSpacing: '0.04em',
                    cursor: 'pointer', fontFamily: 'Jost, sans-serif',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 4px 14px -4px rgba(152, 117, 87, 0.4)'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background = '#7d5f44';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = '#987557';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  Comenzar evaluación
                </button>
                
                <button
                  onClick={() => { setCurrentClient(mockClients[0]); setClientScreen('results'); }}
                  style={{
                    background: 'transparent', color: '#878179',
                    border: '1px solid #D6D2CA', borderRadius: '8px',
                    padding: '1rem 2rem', fontSize: '0.95rem', fontWeight: 500,
                    cursor: 'pointer', fontFamily: 'Jost, sans-serif',
                    transition: 'all 0.3s ease',
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background = 'rgba(152,117,87,0.05)';
                    e.currentTarget.style.borderColor = '#987557';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.borderColor = '#D6D2CA';
                  }}
                >
                  Ver Resultados Demo
                </button>
              </div>

              {/* Sub-cta metadata details */}
              <div style={{ 
                display: 'flex', 
                gap: '1.5rem', 
                fontSize: '0.78rem', 
                color: '#878179',
                marginTop: '0.5rem',
                flexWrap: 'wrap',
              }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>⏱️ Duración: 7–10 minutos</span>
                <span>•</span>
                <span>🔒 Sin registro previo</span>
                <span>•</span>
                <span>💡 Sin conocimientos requeridos</span>
              </div>
            </div>
          </div>

          {/* RIGHT — image */}
          <div style={{
            height: 'clamp(280px, 45vw, 480px)',
            borderRadius: '16px',
            overflow: 'hidden',
            border: '1px solid #D6D2CA',
            position: 'relative',
            boxShadow: '0 20px 40px -20px rgba(0, 0, 0, 0.1)',
          }}>
            <img
              src="/bianchi_interior.png"
              alt="Interior de diseño Método Bianchi"
              style={{
                width: '100%', height: '100%', objectFit: 'cover',
                display: 'block', transition: 'transform 1.5s var(--ease-bianchi)',
              }}
              onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.025)')}
              onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            />
            <div style={{
              position: 'absolute', bottom: 0, left: 0, right: 0,
              background: 'linear-gradient(to top, rgba(28,25,23,0.9) 0%, rgba(28,25,23,0.3) 70%, rgba(28,25,23,0) 100%)',
              padding: '2.5rem 2rem 2rem 2rem',
              color: '#fff',
              textAlign: 'left'
            }}>
              <p style={{ color: '#C4B5A5', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.25em', marginBottom: '0.5rem', fontWeight: 600 }}>
                El Arte de Habitar
              </p>
              <p style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: '1.45rem', color: '#F0EEE9', lineHeight: 1.3, fontWeight: 300 }}>
                "Tu casa no está siendo juzgada. Está siendo comprendida."
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* ── 2. SECCIÓN: ¿QUÉ VAS A RECIBIR? ────────────────── */}
      <section style={{ 
        padding: '5rem clamp(1rem, 4vw, 4rem)',
        background: '#fff',
        borderTop: '1px solid #D6D2CA'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
          
          <p style={{
            color: '#987557',
            fontSize: '0.65rem',
            letterSpacing: '0.3em',
            textTransform: 'uppercase',
            fontWeight: 600,
            marginBottom: '0.875rem'
          }}>
            La Devolución del Diagnóstico
          </p>
          <h2 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(2.1rem, 3.5vw, 3rem)',
            color: '#1C1917',
            fontWeight: 300,
            marginBottom: '3.5rem'
          }}>
            ¿Qué vas a recibir al finalizar?
          </h2>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
            gap: '2.5rem' 
          }}>
            
            {/* Card 1 */}
            <div style={{
              padding: '2.5rem 2rem',
              background: '#F0EEE9',
              borderRadius: '12px',
              border: '1px solid #E5E1D8',
              transition: 'all 0.3s ease',
              textAlign: 'center'
            }} className="card-hover">
              <svg viewBox="0 0 100 100" fill="none" stroke="#987557" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '64px', height: '64px', margin: '0 auto 1.5rem auto' }}>
                <rect x="25" y="45" width="50" height="40" rx="3" strokeDasharray="3 3" />
                <path d="M20,48 L50,22 L80,48" />
                <line x1="50" y1="22" x2="50" y2="40" />
                <path d="M45,40 L55,40 L50,35 Z" fill="#987557" />
                <path d="M32,80 L32,68 Q32,64 36,64 L42,64 Q46,64 46,68 L46,80" />
                <path d="M65,80 C65,70 70,68 72,62 M72,62 C74,65 72,70 65,80" />
              </svg>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', fontWeight: 500, color: '#1C1917', marginBottom: '0.75rem' }}>
                Diagnóstico personalizado
              </h3>
              <p style={{ color: '#878179', fontSize: '0.9rem', lineHeight: 1.6, margin: 0 }}>
                Analizamos cómo tu hogar acompaña tu vida cotidiana y responde a tus necesidades emocionales.
              </p>
            </div>

            {/* Card 2 */}
            <div style={{
              padding: '2.5rem 2rem',
              background: '#F0EEE9',
              borderRadius: '12px',
              border: '1px solid #E5E1D8',
              transition: 'all 0.3s ease',
              textAlign: 'center'
            }} className="card-hover">
              <svg viewBox="0 0 100 100" fill="none" stroke="#987557" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '64px', height: '64px', margin: '0 auto 1.5rem auto' }}>
                <circle cx="50" cy="50" r="35" />
                <path d="M25,50 Q37.5,25 50,50 T75,50" />
                <circle cx="75" cy="50" r="3.5" fill="#987557" />
              </svg>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', fontWeight: 500, color: '#1C1917', marginBottom: '0.75rem' }}>
                Índice IBBH®
              </h3>
              <p style={{ color: '#878179', fontSize: '0.9rem', lineHeight: 1.6, margin: 0 }}>
                Una medición clara, empática y objetiva de la capacidad regeneradora y el bienestar de tus espacios.
              </p>
            </div>

            {/* Card 3 */}
            <div style={{
              padding: '2.5rem 2rem',
              background: '#F0EEE9',
              borderRadius: '12px',
              border: '1px solid #E5E1D8',
              transition: 'all 0.3s ease',
              textAlign: 'center'
            }} className="card-hover">
              <svg viewBox="0 0 100 100" fill="none" stroke="#987557" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '64px', height: '64px', margin: '0 auto 1.5rem auto' }}>
                <rect x="20" y="20" width="60" height="60" rx="4" />
                <line x1="50" y1="20" x2="50" y2="80" strokeDasharray="3 3" />
                <line x1="20" y1="55" x2="50" y2="55" strokeDasharray="3 3" />
                <line x1="50" y1="45" x2="80" y2="45" strokeDasharray="3 3" />
                <circle cx="35" cy="35" r="4" fill="#987557" />
                <circle cx="65" cy="65" r="4" fill="#987557" />
                <path d="M35,35 Q50,45 65,65" strokeDasharray="4 4" />
              </svg>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', fontWeight: 500, color: '#1C1917', marginBottom: '0.75rem' }}>
                Mapa de oportunidades
              </h3>
              <p style={{ color: '#878179', fontSize: '0.9rem', lineHeight: 1.6, margin: 0 }}>
                Identificamos las fortalezas de tu vivienda y visualizamos aquellos rincones que hoy te piden energía de más.
              </p>
            </div>

            {/* Card 4 */}
            <div style={{
              padding: '2.5rem 2rem',
              background: '#F0EEE9',
              borderRadius: '12px',
              border: '1px solid #E5E1D8',
              transition: 'all 0.3s ease',
              textAlign: 'center'
            }} className="card-hover">
              <svg viewBox="0 0 100 100" fill="none" stroke="#987557" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '64px', height: '64px', margin: '0 auto 1.5rem auto' }}>
                <circle cx="50" cy="50" r="35" />
                <path d="M50,80 C50,60 50,30 50,22" />
                <path d="M50,55 C40,50 35,42 40,38 C45,34 50,42 50,55" />
                <path d="M50,45 C60,40 65,32 60,28 C55,24 50,32 50,45" />
              </svg>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', fontWeight: 500, color: '#1C1917', marginBottom: '0.75rem' }}>
                Plan de acción
              </h3>
              <p style={{ color: '#878179', fontSize: '0.9rem', lineHeight: 1.6, margin: 0 }}>
                Recomendaciones concretas y microacciones simples de 5–15 minutos para empezar a transformar tus rutinas.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* ── 3. SECCIÓN: CÓMO FUNCIONA ──────────────────────── */}
      <section style={{ 
        padding: '5rem clamp(1rem, 4vw, 4rem)',
        background: '#F0EEE9',
        borderTop: '1px solid #D6D2CA'
      }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
          
          <p style={{
            color: '#987557',
            fontSize: '0.65rem',
            letterSpacing: '0.3em',
            textTransform: 'uppercase',
            fontWeight: 600,
            marginBottom: '0.875rem'
          }}>
            Paso a Paso
          </p>
          <h2 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(2.1rem, 3.5vw, 3rem)',
            color: '#1C1917',
            fontWeight: 300,
            marginBottom: '4rem'
          }}>
            ¿Cómo funciona la experiencia?
          </h2>

          {/* Timeline steps */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem',
            position: 'relative',
            textAlign: 'left'
          }}>
            {/* Steps loop */}
            {[
              { num: '1', title: 'Respondés algunas preguntas', desc: 'Evaluamos de forma intuitiva cómo te sentís hoy al entrar, descansar y transitar por tu casa.' },
              { num: '2', title: 'Analizamos tu hogar', desc: 'Subís fotos de los ambientes que elijas. Analizamos la iluminación, el orden visual y la conexión biofílica.' },
              { num: '3', title: 'Calculamos tu Índice IBBH®', desc: 'Generamos tu puntaje científico agregando el peso de tus hábitos cotidianos y características espaciales.' },
              { num: '4', title: 'Generamos tu diagnóstico', desc: 'Creamos una narrativa empática y personalizada de tu hogar, sin jerga médica y enfocada en lo que vivís.' },
              { num: '5', title: 'Recibís un plan personalizado', desc: 'Obtenés una hoja de ruta con microacciones ordenadas por plazos, con explicaciones claras de sus beneficios.' }
            ].map((s, idx, arr) => (
              <div key={s.num} style={{
                display: 'flex',
                gap: '1.5rem',
                alignItems: 'start',
                position: 'relative'
              }}>
                {/* Visual Line */}
                {idx < arr.length - 1 && (
                  <div style={{
                    position: 'absolute',
                    left: '20px',
                    top: '40px',
                    bottom: '-25px',
                    width: '1px',
                    background: '#D6D2CA',
                    zIndex: 1
                  }} />
                )}

                <div style={{
                  background: '#987557',
                  color: '#fff',
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 600,
                  fontSize: '1rem',
                  flexShrink: 0,
                  zIndex: 2,
                  boxShadow: '0 2px 8px rgba(152, 117, 87, 0.2)'
                }}>
                  {s.num}
                </div>

                <div style={{ paddingTop: '4px' }}>
                  <h4 style={{ fontSize: '1.15rem', fontWeight: 600, color: '#1C1917', marginBottom: '0.25rem', fontFamily: 'Jost, sans-serif' }}>
                    {s.title}
                  </h4>
                  <p style={{ color: '#878179', fontSize: '0.9rem', lineHeight: 1.5, margin: 0 }}>
                    {s.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ── 4. SECCIÓN: OCHO DIMENSIONES DEL BIENESTAR ────────── */}
      <section style={{ 
        padding: '5rem clamp(1rem, 4vw, 4rem)',
        background: '#fff',
        borderTop: '1px solid #D6D2CA'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
          
          <p style={{
            color: '#987557',
            fontSize: '0.65rem',
            letterSpacing: '0.3em',
            textTransform: 'uppercase',
            fontWeight: 600,
            marginBottom: '0.875rem'
          }}>
            Pilares Habitacionales
          </p>
          <h2 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(2.1rem, 3.5vw, 3rem)',
            color: '#1C1917',
            fontWeight: 300,
            marginBottom: '1rem'
          }}>
            Las 8 Dimensiones del Bienestar
          </h2>
          <p style={{
            color: '#878179',
            fontSize: '0.95rem',
            maxWidth: '620px',
            margin: '0 auto 4rem auto',
            lineHeight: 1.6
          }}>
            Analizamos la vivienda a través de factores científicos y de percepción emocional para trazar un mapa fiel de tu habitar.
          </p>

          {/* Grid Layout of Dimensions */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', 
            gap: '2rem' 
          }}>
            {dimensions.map((d, index) => (
              <div key={index} style={{
                background: '#F0EEE9',
                borderRadius: '12px',
                padding: '2rem 1.5rem',
                border: '1px solid #E5E1D8',
                textAlign: 'left',
                transition: 'all 0.3s ease',
              }} className="card-hover">
                <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>{d.icon}</div>
                <h4 style={{
                  fontSize: '1.15rem',
                  fontWeight: 600,
                  color: '#1C1917',
                  marginBottom: '0.5rem',
                  fontFamily: 'Jost, sans-serif'
                }}>
                  {d.title}
                </h4>
                <p style={{
                  color: '#878179',
                  fontSize: '0.85rem',
                  lineHeight: 1.5,
                  margin: 0
                }}>
                  {d.desc}
                </p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ── 5. SECCIÓN: CICLO BIANCHI® (5 ETAPAS) ───────────── */}
      <CicloBianchi />

      {/* ── 6. SECCIÓN: TARJETAS DE ESTADÍSTICAS E IMPACTO ────── */}
      <section style={{
        padding: '5rem clamp(1rem, 4vw, 4rem)',
        background: '#fff',
        borderTop: '1px solid #D6D2CA',
        borderBottom: '1px solid #D6D2CA'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
            gap: '2.5rem',
            textAlign: 'center'
          }}>
            
            {/* Card 1 */}
            <div style={{
              background: '#F0EEE9',
              padding: '3rem 2rem',
              borderRadius: '16px',
              border: '1px solid #E5E1D8',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 20px rgba(0,0,0,0.015)'
            }}>
              <span style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '4.5rem',
                fontWeight: 300,
                color: '#987557',
                lineHeight: 1,
                marginBottom: '0.75rem'
              }}>
                8
              </span>
              <h4 style={{ fontFamily: 'Jost, sans-serif', fontWeight: 650, fontSize: '1.05rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#1C1917', marginBottom: '0.5rem' }}>
                Dimensiones Clave
              </h4>
              <p style={{ color: '#878179', fontSize: '0.85rem', lineHeight: 1.5, maxWidth: '240px', margin: 0 }}>
                Un análisis detallado de cada factor que conforma el bienestar habitacional.
              </p>
            </div>

            {/* Card 2 */}
            <div style={{
              background: '#F0EEE9',
              padding: '3rem 2rem',
              borderRadius: '16px',
              border: '1px solid #E5E1D8',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 20px rgba(0,0,0,0.015)'
            }}>
              <span style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '4.5rem',
                fontWeight: 300,
                color: '#987557',
                lineHeight: 1,
                marginBottom: '0.75rem'
              }}>
                IBBH®
              </span>
              <h4 style={{ fontFamily: 'Jost, sans-serif', fontWeight: 650, fontSize: '1.05rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#1C1917', marginBottom: '0.5rem' }}>
                Índice Científico
              </h4>
              <p style={{ color: '#878179', fontSize: '0.85rem', lineHeight: 1.5, maxWidth: '240px', margin: 0 }}>
                Una métrica confiable que traduce la salud de tus ambientes a un número objetivo.
              </p>
            </div>

            {/* Card 3 */}
            <div style={{
              background: '#F0EEE9',
              padding: '3rem 2rem',
              borderRadius: '16px',
              border: '1px solid #E5E1D8',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 20px rgba(0,0,0,0.015)'
            }}>
              <span style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '4.5rem',
                fontWeight: 300,
                color: '#987557',
                lineHeight: 1,
                marginBottom: '0.75rem'
              }}>
                100%
              </span>
              <h4 style={{ fontFamily: 'Jost, sans-serif', fontWeight: 650, fontSize: '1.05rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#1C1917', marginBottom: '0.5rem' }}>
                Plan a Medida
              </h4>
              <p style={{ color: '#878179', fontSize: '0.85rem', lineHeight: 1.5, maxWidth: '240px', margin: 0 }}>
                Microacciones secuenciales diseñadas exclusivamente para tu realidad cotidiana.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* ── 7. SECCIÓN: FRASE EDITORIAL ──────────────────────── */}
      <section style={{ 
        padding: '7rem clamp(1rem, 4vw, 4rem)',
        background: '#F0EEE9',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <p style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)',
            fontStyle: 'italic',
            fontWeight: 300,
            color: '#878179',
            lineHeight: 1.5,
            margin: 0
          }}>
            "Una casa no necesita ser perfecta para ayudarte a vivir mejor."
          </p>
        </div>
      </section>

      {/* ── 8. SECCIÓN: TESTIMONIALS (VISUAL SCORE BEFORE/AFTER) ── */}
      <section style={{
        background: 'rgba(152,117,87,0.04)',
        borderTop: '1px solid #D6D2CA',
        borderBottom: '1px solid #D6D2CA',
        padding: '5rem clamp(1rem, 4vw, 4rem)',
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
          
          <p style={{
            color: '#987557', fontSize: '0.65rem', letterSpacing: '0.3em',
            textTransform: 'uppercase', fontWeight: 600, marginBottom: '0.875rem',
          }}>
            Transformaciones Reales
          </p>
          <h2 style={{ 
            fontFamily: 'var(--font-serif)', 
            fontSize: 'clamp(2.1rem, 3.5vw, 3rem)', 
            color: '#1C1917', 
            fontWeight: 300, 
            marginBottom: '3.5rem' 
          }}>
            El impacto de habitar con consciencia
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '2.5rem'
          }}>
            {testimonials.map((t, idx) => (
              <div key={idx} style={{
                background: '#fff', border: '1px solid #D6D2CA',
                borderRadius: '12px', padding: '2.5rem',
                display: 'flex', flexDirection: 'column', gap: '1.5rem',
                textAlign: 'left',
                boxShadow: '0 4px 15px rgba(0,0,0,0.01)'
              }}>
                <p style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: '1.15rem', color: '#44403C', lineHeight: 1.6, flex: 1, margin: 0 }}>
                  "{t.quote}"
                </p>
                
                <div style={{ height: '1px', background: '#F0EEE9' }} />
                
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: '0.9rem', color: '#1C1917', marginBottom: '0.15rem', fontFamily: 'Jost, sans-serif' }}>
                      {t.name}
                    </p>
                    <p style={{ color: '#878179', fontSize: '0.78rem', margin: 0 }}>
                      {t.city}
                    </p>
                  </div>
                  
                  {/* Before / After visualization badge */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ textAlign: 'center' }}>
                      <span style={{ fontSize: '0.55rem', textTransform: 'uppercase', color: '#878179', display: 'block', fontWeight: 600 }}>Antes</span>
                      <strong style={{ fontSize: '0.95rem', color: '#B05B5B', fontWeight: 600 }}>{t.beforeScore}</strong>
                    </div>
                    <span style={{ color: '#987557', fontSize: '0.8rem' }}>→</span>
                    <div style={{ textAlign: 'center', background: 'rgba(110, 142, 117, 0.1)', padding: '2px 8px', borderRadius: '6px' }}>
                      <span style={{ fontSize: '0.55rem', textTransform: 'uppercase', color: '#6E8E75', display: 'block', fontWeight: 600 }}>Después</span>
                      <strong style={{ fontSize: '1.05rem', color: '#6E8E75', fontWeight: 700 }}>{t.afterScore}</strong>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ── 9. SECCIÓN: CTA FINAL ────────────────────────────── */}
      <section style={{ 
        padding: '6rem clamp(1rem, 4vw, 4rem)',
        background: '#fff',
        textAlign: 'center',
        borderBottom: '1px solid #D6D2CA'
      }}>
        <div style={{ maxWidth: '650px', margin: '0 auto' }}>
          
          <h2 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(2.2rem, 4vw, 3.2rem)',
            color: '#1C1917',
            fontWeight: 300,
            marginBottom: '1rem',
            lineHeight: 1.2
          }}>
            Tu hogar cuenta una historia.
          </h2>
          <p style={{
            color: '#878179',
            fontSize: '1.1rem',
            marginBottom: '2.5rem',
            fontWeight: 300,
            lineHeight: 1.5
          }}>
            Descubramos juntos qué está necesitando.
          </p>

          <button
            onClick={() => setClientScreen('consent')}
            style={{
              background: '#987557', color: '#fff', border: 'none',
              borderRadius: '8px', padding: '1.15rem 3rem',
              fontSize: '1rem', fontWeight: 600, letterSpacing: '0.05em',
              cursor: 'pointer', fontFamily: 'Jost, sans-serif',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 18px -4px rgba(152, 117, 87, 0.4)'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = '#7d5f44';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = '#987557';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            Comenzar evaluación
          </button>

          <div style={{ 
            display: 'flex', 
            justifyContent: 'center',
            gap: '1.5rem', 
            fontSize: '0.78rem', 
            color: '#878179',
            marginTop: '1.5rem',
          }}>
            <span>⏱️ 7–10 minutos</span>
            <span>•</span>
            <span>🔒 Sin registro previo</span>
          </div>

        </div>
      </section>

    </div>
  );
}
