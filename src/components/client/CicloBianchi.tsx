import { useState } from 'react';

interface Step {
  number: number;
  title: string;
  objective: string;
  description: string;
  result: string;
  additionalInfo: string;
  icon: React.ReactNode;
}

export function CicloBianchi() {
  const [openSteps, setOpenSteps] = useState<Record<number, boolean>>({});

  const toggleStep = (num: number) => {
    setOpenSteps((prev) => ({
      ...prev,
      [num]: !prev[num],
    }));
  };

  const steps: Step[] = [
    {
      number: 1,
      title: 'Observar',
      objective: 'Comprender antes de intervenir.',
      description: 'Descubrimos qué partes de tu casa hoy te ayudan y cuáles necesitan mejorar.',
      result: 'Identificar los bloqueos silenciosos en tus ambientes.',
      additionalInfo: 'Aprender a mirar el hogar con atención es el primer paso esencial de todo el proceso. Nos permite ver la realidad de tus espacios con compasión y claridad, sin juzgar.',
      icon: (
        <svg viewBox="0 0 100 100" fill="none" stroke="#987557" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '48px', height: '48px' }}>
          <path d="M15,50 Q50,20 85,50 Q50,80 15,50 Z" />
          <circle cx="50" cy="50" r="12" />
          <circle cx="50" cy="50" r="4" fill="#987557" />
        </svg>
      )
    },
    {
      number: 2,
      title: 'Analizar',
      objective: 'Detectar lo que importa.',
      description: 'Comprendemos cómo cada espacio influye en tu bienestar cotidiano y tu energía.',
      result: 'Tu Índice IBBH® y mapa de bienestar habitacional.',
      additionalInfo: 'Analizamos de forma integral tus respuestas y fotos a través de la neuroarquitectura y la psicología ambiental, revelando el pulso invisible de tu casa.',
      icon: (
        <svg viewBox="0 0 100 100" fill="none" stroke="#987557" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '48px', height: '48px' }}>
          <circle cx="45" cy="45" r="20" />
          <line x1="59" y1="59" x2="80" y2="80" strokeWidth="1.5" />
        </svg>
      )
    },
    {
      number: 3,
      title: 'Priorizar',
      objective: 'Enfocar en lo que genera bienestar.',
      description: 'Identificamos el ambiente clave por el cual comenzar a realizar cambios.',
      result: 'Foco claro y sin abrumarte con mil tareas.',
      additionalInfo: 'El secreto del Método Bianchi es la dosificación. En lugar de proponerte una reforma agobiante, elegimos el espacio que tendrá el mayor impacto inmediato en tu bienestar diario.',
      icon: (
        <svg viewBox="0 0 100 100" fill="none" stroke="#987557" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '48px', height: '48px' }}>
          <circle cx="50" cy="50" r="30" />
          <circle cx="50" cy="50" r="18" />
          <circle cx="50" cy="50" r="6" fill="#987557" />
          <line x1="50" y1="10" x2="50" y2="90" strokeDasharray="3 3" />
          <line x1="10" y1="50" x2="90" y2="50" strokeDasharray="3 3" />
        </svg>
      )
    },
    {
      number: 4,
      title: 'Actuar',
      objective: 'Implementar cambios con sentido.',
      description: 'Realizamos microacciones de 5 a 15 minutos en los rincones más críticos.',
      result: 'Pequeños cambios reales que notas en el día a día.',
      additionalInfo: 'Acciones portátiles, orden visual, mejoras lumínicas y ajustes sencillos de distribución que no requieren de obras costosas ni presupuestos elevados.',
      icon: (
        <svg viewBox="0 0 100 100" fill="none" stroke="#987557" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '48px', height: '48px' }}>
          <path d="M70,15 L85,30 L40,75 L20,80 L25,60 Z" />
          <line x1="60" y1="25" x2="75" y2="40" />
          <path d="M15,85 C25,75 35,90 45,80 C55,70 65,85 75,70" strokeWidth="0.8" opacity="0.6" />
        </svg>
      )
    },
    {
      number: 5,
      title: 'Integrar',
      objective: 'Sostener y seguir mejorando.',
      description: 'Convertimos las mejoras en hábitos y tu hogar sigue evolucionando contigo.',
      result: 'Una casa que te cuida y acompaña tu ritmo de vida.',
      additionalInfo: 'El bienestar no es una meta fija, es un hábito. Acompañamos a tu cuerpo a naturalizar las pausas en casa, logrando que el orden y la calma sean sostenibles en el tiempo.',
      icon: (
        <svg viewBox="0 0 100 100" fill="none" stroke="#987557" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '48px', height: '48px' }}>
          <path d="M30,30 A28,28 0 1,1 70,30" />
          <path d="M70,70 A28,28 0 0,1 30,70" strokeDasharray="3 3" />
          <path d="M32,25 L30,30 L25,28" />
          <path d="M68,75 L70,70 L75,72" />
          <path d="M50,65 C50,55 54,48 57,44 C60,40 65,40 63,45 C61,50 56,58 50,65" fill="#987557" />
          <path d="M50,65 C50,58 46,52 43,49 C40,46 35,46 37,51 C39,56 44,61 50,65" />
        </svg>
      )
    },
  ];

  return (
    <section style={{
      background: '#EAE7E1',
      borderTop: '1px solid #D6D2CA',
      padding: 'clamp(3rem, 6vw, 6rem) clamp(1rem, 4vw, 4rem)',
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Header de la sección */}
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <p style={{
            color: '#987557',
            fontSize: '0.65rem',
            letterSpacing: '0.3em',
            textTransform: 'uppercase',
            fontWeight: 600,
            marginBottom: '0.875rem',
          }}>
            Metodología del Habitar
          </p>
          <h2 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(2.2rem, 4vw, 3.2rem)',
            color: '#1C1917',
            fontWeight: 300,
            marginBottom: '1.25rem',
            lineHeight: 1.2,
          }}>
            El Ciclo Bianchi® — 5 Etapas
          </h2>
          <p style={{
            color: '#878179',
            fontSize: '1rem',
            maxWidth: '680px',
            margin: '0 auto',
            lineHeight: 1.6,
          }}>
            Un camino guiado para transformar la relación con tu casa, integrando de forma natural el equilibrio, el confort y la calma en tus rutinas de habitar.
          </p>
        </div>

        {/* Timeline Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '24px',
          alignItems: 'start',
        }}>
          {steps.map((step) => {
            const isOpen = !!openSteps[step.number];

            return (
              <div 
                key={step.title} 
                onClick={() => toggleStep(step.number)}
                style={{
                  background: isOpen ? 'rgba(255, 255, 255, 0.9)' : '#fff',
                  border: isOpen ? '1.5px solid #987557' : '1px solid #D6D2CA',
                  borderRadius: '12px',
                  padding: '2rem 1.75rem',
                  display: 'flex',
                  flexDirection: 'column',
                  cursor: 'pointer',
                  transition: 'all 0.4s cubic-bezier(0.25, 1, 0.5, 1)',
                  boxShadow: isOpen ? '0 10px 30px -10px rgba(152, 117, 87, 0.15)' : 'none',
                  textAlign: 'left',
                }}
                className="ciclo-card-hover"
              >
                {/* Header Row: Number and Icon */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                  <span style={{
                    background: isOpen ? '#987557' : 'rgba(152,117,87,0.08)',
                    color: isOpen ? '#fff' : '#987557',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.3s ease',
                  }}>
                    {step.number}
                  </span>
                  <div style={{
                    opacity: isOpen ? 1 : 0.85,
                    transform: isOpen ? 'scale(1.05)' : 'scale(1)',
                    transition: 'all 0.3s ease',
                  }}>
                    {step.icon}
                  </div>
                </div>

                {/* Title */}
                <h3 style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '1.65rem',
                  fontWeight: 450,
                  color: '#1C1917',
                  marginBottom: '0.35rem',
                }}>
                  {step.title}
                </h3>

                {/* Subtitle / Objective */}
                <p style={{
                  fontSize: '0.82rem',
                  fontWeight: 500,
                  color: '#987557',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  marginBottom: '1rem',
                  lineHeight: 1.3,
                }}>
                  {step.objective}
                </p>

                {/* Explanatory description */}
                <p style={{
                  fontSize: '0.9rem',
                  color: '#44403C',
                  lineHeight: 1.55,
                  margin: 0,
                  transition: 'opacity 0.3s ease',
                }}>
                  {step.description}
                </p>

                {/* Accordion content */}
                <div style={{
                  maxHeight: isOpen ? '300px' : '0px',
                  opacity: isOpen ? 1 : 0,
                  overflow: 'hidden',
                  transition: 'all 0.4s cubic-bezier(0.25, 1, 0.5, 1)',
                  paddingTop: isOpen ? '1.25rem' : '0px',
                }}>
                  <div style={{ borderTop: '1px solid #EAE7E1', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                    <div>
                      <span style={{ fontSize: '0.68rem', textTransform: 'uppercase', color: '#878179', letterSpacing: '0.08em', display: 'block', marginBottom: '0.2rem' }}>
                        Resultado esperado:
                      </span>
                      <span style={{ fontSize: '0.88rem', color: '#1C1917', fontWeight: 550, lineHeight: 1.3 }}>
                        {step.result}
                      </span>
                    </div>

                    <div>
                      <span style={{ fontSize: '0.68rem', textTransform: 'uppercase', color: '#878179', letterSpacing: '0.08em', display: 'block', marginBottom: '0.2rem' }}>
                        Cómo se vive:
                      </span>
                      <span style={{ fontSize: '0.85rem', color: '#878179', lineHeight: 1.5, display: 'block' }}>
                        {step.additionalInfo}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Expand Indicator */}
                <div style={{
                  marginTop: '1.25rem',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                  <span style={{
                    fontSize: '0.72rem',
                    fontWeight: 500,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    color: '#878179',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    transition: 'color 0.2s',
                  }}>
                    {isOpen ? 'Cerrar detalle ↑' : 'Tocar para saber más ↓'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}

export default CicloBianchi;
