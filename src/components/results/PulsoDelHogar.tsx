import { useState } from 'react';
import type { DimensionScores } from '../../types/bianchi';

interface PulsoDimension {
  key: string;
  name: string;
  emoji: string;
  score: number;
  description: string;
  interpretation: string;
  nextAction: string;
}

interface PulsoDelHogarProps {
  dimensions: DimensionScores;
  userName: string;
}

export function PulsoDelHogar({ dimensions, userName }: PulsoDelHogarProps) {
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  const nameShort = userName.split(' ')[0];

  // Helper to map 8 dimensions to the 9 pulso dimensions
  const getPulsoData = (): PulsoDimension[] => {
    const d = dimensions || {
      'Identidad y Pertenencia': 50,
      'Regulación emocional': 50,
      'Calidad Ambiental': 50,
      'Orden': 50,
      'Biofilia': 50,
      'Descanso': 50,
      'Funcionalidad': 50,
      'Vínculos': 50,
    };

    const mapScore = (val: number) => Math.min(100, Math.max(10, Math.round(val)));

    return [
      {
        key: 'armonia',
        name: 'Armonía Habitacional',
        emoji: '⚖️',
        score: mapScore((d['Funcionalidad'] + d['Vínculos']) / 2),
        description: 'Equilibrio entre las distintas áreas, funcionalidad y coherencia social.',
        interpretation: (d['Funcionalidad'] + d['Vínculos']) / 2 >= 70
          ? 'Tus ambientes logran un diálogo fluido, facilitando el encuentro y la calma cotidiana.'
          : 'Tus espacios tienen un gran potencial para redistribuirse y convertirse en zonas de encuentro.',
        nextAction: 'Reordená la disposición del sillón principal para favorecer la conversación cara a cara.',
      },
      {
        key: 'orden',
        name: 'Orden y organización',
        emoji: '🏡',
        score: mapScore(d['Orden']),
        description: 'Facilidad para encontrar y guardar objetos, reducción del desorden visual.',
        interpretation: d['Orden'] >= 70
          ? 'Tu organización actual despeja tu mente y disminuye significativamente la fricción cotidiana.'
          : 'Percibimos que algunos ingresos o zonas comunes necesitan mayor orden visual para recibirte con más calma.',
        nextAction: 'Despejá por completo la superficie de la mesada o el escritorio de trabajo al terminar tu jornada.',
      },
      {
        key: 'luz',
        name: 'Luz y Confort Visual',
        emoji: '☀️',
        score: mapScore(d['Calidad Ambiental'] * 1.05),
        description: 'Cantidad de luz natural, calidad de la iluminación artificial.',
        interpretation: d['Calidad Ambiental'] >= 70
          ? 'La iluminación de tu hogar acompaña excelentemente tus ritmos circadianos de actividad y descanso.'
          : 'La luz artificial actual podría ser muy fría. Incorporar luz cálida te ayudará a relajarte por la tarde.',
        nextAction: 'Reemplazá la dicroica fría del dormitorio por una bombilla cálida (2700K) en una lámpara baja.',
      },
      {
        key: 'naturaleza',
        name: 'Naturaleza y Biofilia',
        emoji: '🌿',
        score: mapScore(d['Biofilia']),
        description: 'Presencia de plantas, vistas al exterior y conexión con materiales naturales.',
        interpretation: d['Biofilia'] >= 70
          ? 'La conexión biofílica en tu hogar estimula tu restauración cognitiva diaria.'
          : 'Sumar verde y texturas orgánicas ayudará a reducir los niveles de cortisol en tu sistema.',
        nextAction: 'Colocá una planta de hojas grandes (como un Potus o Sansevieria) cerca de tu ventana principal.',
      },
      {
        key: 'confort',
        name: 'Confort Ambiental',
        emoji: '🌡️',
        score: mapScore((d['Calidad Ambiental'] + d['Funcionalidad']) / 2),
        description: 'Temperatura percibida, acústica, circulación del aire y ergonomía.',
        interpretation: (d['Calidad Ambiental'] + d['Funcionalidad']) / 2 >= 70
          ? 'Tu hogar sostiene adecuadamente tu bienestar fisiológico con buenas condiciones térmicas y acústicas.'
          : 'Hay algunas interferencias sonoras o de temperatura que podrían estar desgastando tu energía diaria.',
        nextAction: 'Instalá burletes en la ventana del ambiente donde más trabajás para atenuar ruidos y corrientes de aire.',
      },
      {
        key: 'descanso',
        name: 'Calidad de Descanso',
        emoji: '🌙',
        score: mapScore(d['Descanso']),
        description: 'Higiene del sueño, calma del dormitorio, preparación para dormir.',
        interpretation: d['Descanso'] >= 70
          ? 'Tu dormitorio actúa como un verdadero santuario regenerativo durante la noche.'
          : 'Tu espacio nocturno actual conserva estímulos que dificultan que tu cerebro entre en sueño profundo.',
        nextAction: 'Retirá del campo visual de la cama todo cargador, cable o dispositivo electrónico una hora antes de dormir.',
      },
      {
        key: 'identidad',
        name: 'Identidad y Pertenencia',
        emoji: '🖼️',
        score: mapScore(d['Identidad y Pertenencia']),
        description: 'Representación personal, objetos significativos, sensación de pertenencia.',
        interpretation: d['Identidad y Pertenencia'] >= 70
          ? 'Cada rincón habla de quién sos, reflejando tu historia y dándote arraigo emocional.'
          : 'Tu casa aún se siente neutra; falta poblarla con objetos que evoquen memorias felices y pertenencia.',
        nextAction: 'Elegí y enmarcá una fotografía o un recuerdo que te genere alegría y colocalo en un espacio visible.',
      },
      {
        key: 'mantenimiento',
        name: 'Mantenimiento del Espacio',
        emoji: '🔧',
        score: mapScore((d['Funcionalidad'] * 0.95) + 5),
        description: 'Funcionamiento general de instalaciones, estado edilicio y cuidado cotidiano.',
        interpretation: d['Funcionalidad'] >= 70
          ? 'El cuidado constante mantiene la vivienda en un ritmo de funcionamiento óptimo.'
          : 'Recomendamos resolver esos pequeños pendientes de reparación que generan micro-ansiedad acumulada.',
        nextAction: 'Hacé una lista de 3 arreglos rápidos (una canilla que gotea, un cajón trabado) y resolvelos este fin de semana.',
      },
      {
        key: 'bienestar',
        name: 'Bienestar Percibido',
        emoji: '🧠',
        score: mapScore(d['Regulación emocional']),
        description: 'Regulación del estrés, calma declarada y recarga de energía en el espacio.',
        interpretation: d['Regulación emocional'] >= 70
          ? 'Tu vivienda actual funciona como un cargador biológico: te devuelve energía en vez de exigírtela.'
          : 'El espacio actual drena tu reserva emocional. Pequeñas pausas conscientes y orden te ayudarán.',
        nextAction: 'Creá un "rincón de calma" exclusivo: un sillón con almohadón cómodo y luz suave libre de pantallas.',
      },
    ];
  };

  const pulsoList = getPulsoData();

  return (
    <div className="glass-card" style={{ marginBottom: '40px', padding: '30px sm:padding: 40px' }}>
      <div style={{ marginBottom: '24px' }}>
        <span className="text-[0.65rem] uppercase tracking-[0.3em] text-[#987557] font-semibold block mb-2">
          El Pulso del Hogar®
        </span>
        <h3 style={{ fontSize: '1.8rem', fontFamily: 'Cormorant Garamond, serif', fontWeight: 300, color: '#1C1917' }}>
          Chequeo Vital de tu Vivienda
        </h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '6px', lineHeight: 1.5 }}>
          El pulso dinámico mide cómo tu entorno físico interactúa con tus niveles de energía, descanso e identidad. <strong>Hacé clic en cualquier dimensión</strong> para ver el análisis de {nameShort} y la microacción recomendada.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }} className="pulso-layout">
        {pulsoList.map((item) => {
          const isSelected = selectedKey === item.key;
          
          // Bar color logic
          let barColor = '#B05B5B'; // Critico
          if (item.score >= 75) barColor = '#5C7A63'; // Fuerte
          else if (item.score >= 50) barColor = '#B28E6B'; // Moderado

          return (
            <div key={item.key} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {/* Row Selector Header */}
              <div 
                onClick={() => setSelectedKey(isSelected ? null : item.key)}
                style={{
                  background: isSelected ? 'rgba(152,117,87,0.06)' : 'rgba(255,255,255,0.4)',
                  border: isSelected ? '1px solid #987557' : '1px solid #D6D2CA',
                  borderRadius: '8px',
                  padding: '16px 20px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  userSelect: 'none',
                }}
                className="pulso-item"
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '1.2rem' }}>{item.emoji}</span>
                    <span style={{ fontWeight: 500, fontSize: '0.95rem', color: '#44403C' }}>{item.name}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#987557' }}>
                      {item.score}/100
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', transform: isSelected ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.25s ease' }}>
                      ▼
                    </span>
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div style={{ height: '6px', background: '#EAE7E1', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{
                    width: `${item.score}%`,
                    height: '100%',
                    background: barColor,
                    borderRadius: '3px',
                    transition: 'width 1s ease-in-out',
                  }} />
                </div>
              </div>

              {/* Accordion Detail Drawer */}
              {isSelected && (
                <div style={{
                  background: 'rgba(152,117,87,0.04)',
                  border: '1px dashed #987557',
                  borderRadius: '8px',
                  padding: '20px 24px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                  animation: 'fadeIn 0.25s ease-out',
                  textAlign: 'left'
                }}>
                  <div>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px', fontWeight: 500 }}>
                      {item.description}
                    </span>
                    <p style={{ fontSize: '0.95rem', color: '#44403C', lineHeight: 1.5, margin: 0, fontStyle: 'italic' }}>
                      "{item.interpretation}"
                    </p>
                  </div>

                  <div style={{
                    background: '#fff',
                    border: '1px solid #D6D2CA',
                    borderRadius: '6px',
                    padding: '14px 16px',
                  }}>
                    <span style={{
                      fontSize: '0.65rem',
                      color: '#987557',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                      display: 'block',
                      marginBottom: '4px',
                    }}>
                      ✨ Próxima Microacción (5-10 min)
                    </span>
                    <p style={{ fontSize: '0.88rem', color: '#1C1917', fontWeight: 500, lineHeight: 1.4, margin: 0 }}>
                      {item.nextAction}
                    </p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
