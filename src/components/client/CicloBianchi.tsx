

interface Step {
  number: number;
  emoji: string;
  title: string;
  objective: string;
  description: string;
  result: string;
  color: string;
}

const steps: Step[] = [
  {
    number: 1,
    emoji: '👀',
    title: 'Observar',
    objective: 'Comprender antes de intervenir.',
    description: 'Aprender a mirar el hogar con atención para identificar fortalezas, dificultades y oportunidades de mejora real.',
    result: 'Diagnóstico inicial del espacio',
    color: '#987557',
  },
  {
    number: 2,
    emoji: '🍃',
    title: 'Liberar',
    objective: 'Conservar lo que acompaña la vida actual.',
    description: 'No se trata de tener menos, sino de dejar espacio para vivir mejor. Retirar exceso visual y objetos sin uso.',
    result: 'Más espacio físico y mental',
    color: '#7C8A79',
  },
  {
    number: 3,
    emoji: '🏡',
    title: 'Organizar',
    objective: 'Diseñar un hogar fácil de usar.',
    description: 'Definir el orden basado en el diseño: cada objeto debe ser fácil de encontrar, fácil de usar y fácil de guardar.',
    result: 'Mayor funcionalidad y menor esfuerzo',
    color: '#B28E6B',
  },
  {
    number: 4,
    emoji: '🌿',
    title: 'Cuidar',
    objective: 'Mantener el hogar saludable.',
    description: 'Revisar de forma constante la iluminación, ventilación, confort térmico, acústica, plantas y pequeños detalles.',
    result: 'Una casa que acompaña y sostiene',
    color: '#5C7A63',
  },
  {
    number: 5,
    emoji: '❤️',
    title: 'Habitar',
    objective: 'Transformar mejoras en hábitos.',
    description: 'El bienestar se construye con pequeñas acciones repetidas: ventilar, despejar superficies, ordenar 5 min al día.',
    result: 'El hogar como fuente de bienestar',
    color: '#B05B5B',
  },
];

export function CicloBianchi() {
  return (
    <section style={{
      background: '#EAE7E1',
      borderTop: '1px solid #D6D2CA',
      padding: 'clamp(2.5rem, 5vw, 5rem) clamp(1rem, 4vw, 4rem)',
    }}>
      <div className="container">
        
        {/* Header de la sección */}
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <p style={{
            color: '#987557',
            fontSize: '0.65rem',
            letterSpacing: '0.3em',
            textTransform: 'uppercase',
            fontWeight: 600,
            marginBottom: '0.75rem',
          }}>
            Metodología del Habitar
          </p>
          <h2 style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: 'clamp(2rem, 3.5vw, 3rem)',
            color: '#1C1917',
            fontWeight: 300,
            marginBottom: '1rem',
          }}>
            El Ciclo Bianchi® del Bienestar Habitacional
          </h2>
          <p style={{
            color: '#878179',
            fontSize: '0.95rem',
            maxWidth: '650px',
            margin: '0 auto',
            lineHeight: 1.6,
          }}>
            Inspirado en la filosofía japonesa de las 5S, rediseñado exclusivamente para mejorar la calidad de vida y la salud de las personas a través de su entorno cotidiano.
          </p>
        </div>

        {/* Stepper / Timeline Grid */}
        <div className="ciclo-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '20px',
          marginBottom: '4rem',
        }}>
          {steps.map((step, idx) => (
            <div 
              key={step.title} 
              className="glass-card"
              style={{
                background: '#fff',
                border: '1px solid #D6D2CA',
                borderRadius: '12px',
                padding: '2rem 1.5rem 1.75rem',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                transition: 'transform 0.3s ease, border-color 0.3s ease',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.borderColor = '#987557';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = '#D6D2CA';
              }}
            >
              {/* Conector visual (flecha) excepto para el último */}
              {idx < steps.length - 1 && (
                <div className="ciclo-connector" style={{
                  position: 'absolute',
                  right: '-16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  zIndex: 2,
                  fontSize: '1.2rem',
                  color: '#987557',
                  opacity: 0.5,
                }}>
                  →
                </div>
              )}

              {/* Número e ícono */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                <span style={{
                  background: 'rgba(152,117,87,0.08)',
                  color: '#987557',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  {step.number}
                </span>
                <span style={{ fontSize: '1.75rem' }}>{step.emoji}</span>
              </div>

              {/* Título de la etapa */}
              <h3 style={{
                fontFamily: 'Cormorant Garamond, serif',
                fontSize: '1.5rem',
                fontWeight: 600,
                color: '#1C1917',
                marginBottom: '0.5rem',
              }}>
                {step.title}
              </h3>

              {/* Objetivo */}
              <p style={{
                fontSize: '0.8rem',
                fontWeight: 500,
                color: '#987557',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '0.75rem',
                lineHeight: 1.3,
              }}>
                {step.objective}
              </p>

              {/* Descripción */}
              <p style={{
                fontSize: '0.85rem',
                color: '#878179',
                lineHeight: 1.5,
                marginBottom: '1.5rem',
                flex: 1,
              }}>
                {step.description}
              </p>

              {/* Separador */}
              <div style={{ height: '1px', background: '#F0EEE9', marginBottom: '1rem' }} />

              {/* Resultado */}
              <div>
                <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: '#878179', letterSpacing: '0.1em', display: 'block', marginBottom: '0.2rem' }}>
                  Resultado esperado:
                </span>
                <span style={{
                  fontSize: '0.8rem',
                  color: '#44403C',
                  fontWeight: 500,
                  lineHeight: 1.3,
                  display: 'block',
                }}>
                  {step.result}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Filosofía del Diferencial Bianchi */}
        <div style={{
          background: 'rgba(152,117,87,0.03)',
          border: '1px solid #D6D2CA',
          borderRadius: '12px',
          padding: '2.5rem',
          maxWidth: '850px',
          margin: '0 auto',
          textAlign: 'center',
        }}>
          <p style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontStyle: 'italic',
            fontSize: '1.35rem',
            color: '#44403C',
            lineHeight: 1.6,
            marginBottom: '1.25rem',
          }}>
            "El orden no es el objetivo final, sino una herramienta para reducir el estrés cotidiano, favorecer un habitar consciente y sostener tu equilibrio emocional. El verdadero éxito no es una casa impecable, sino un hogar que te ayude a vivir mejor."
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap', fontSize: '0.8rem', fontWeight: 500, color: '#987557', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            <span>• Comprender antes de cambiar</span>
            <span>• Liberar antes de incorporar</span>
            <span>• Diseñar para facilitar</span>
            <span>• Cuidar como un sistema vivo</span>
          </div>
        </div>

      </div>
      
      {/* Estilo responsive inline para ocultar conectores en pantallas pequeñas */}
      <style>{`
        @media (max-width: 1024px) {
          .ciclo-connector { display: none !important; }
        }
      `}</style>
    </section>
  );
}

export default CicloBianchi;
