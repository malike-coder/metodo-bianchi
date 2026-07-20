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
  benefits: string[];
  whatYouWillFeel: string;
}

interface PulsoDelHogarProps {
  dimensions: DimensionScores;
  userName: string;
}

export function PulsoDelHogar({ dimensions, userName }: PulsoDelHogarProps) {
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [showDisciplines, setShowDisciplines] = useState<Record<string, boolean>>({});

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
    };    const mapScore = (val: number) => Math.min(100, Math.max(10, Math.round(val)));

    return [
      {
        key: 'armonia',
        name: 'Espacios de encuentro',
        emoji: '👥',
        score: mapScore((d['Funcionalidad'] + d['Vínculos']) / 2),
        description: 'El sentido de orientación de los asientos define si nos cerramos o nos abrimos a la comunicación. Si el sillón principal solo apunta a la televisión, es difícil que surja una conversación espontánea.',
        interpretation: (d['Funcionalidad'] + d['Vínculos']) / 2 >= 70
          ? 'Esto ya lo estás haciendo muy bien. Tus ambientes están dispuestos de una forma que hace muy fácil sentarse a charlar y compartir el día.'
          : 'Acá encontramos una oportunidad. Hoy la distribución de tu casa puede estar dificultando que los espacios se sientan conectados y fluidos para conversar.',
        nextAction: 'Reordená la disposición del sillón principal para que esté más de frente a otras sillas o butacas, favoreciendo las miradas cruzadas.',
        benefits: [
          'Más facilidad para conectar con los tuyos y visitas.',
          'Menos dependencia de las pantallas en tu tiempo libre.',
          'Una sala de estar más viva y acogedora.'
        ],
        whatYouWillFeel: ''
      },
      {
        key: 'orden',
        name: 'Orden visual',
        emoji: '🏡',
        score: mapScore(d['Orden']),
        description: 'Cuando hay muchas cosas tiradas sobre superficies planas, nuestro cerebro trabaja horas extras tratando de procesar todo ese estímulo. Despejar superficies le avisa a tu mente que ya puede relajarse.',
        interpretation: d['Orden'] >= 70
          ? 'Esto ya lo estás haciendo muy bien. Tenés un gran manejo de tus objetos; las superficies despejadas le dan un respiro a tu mente.'
          : 'Acá encontramos una oportunidad. Vimos que hay una acumulación de objetos pequeños sobre la mesa o mesadas que te quita tranquilidad.',
        nextAction: 'Guardá los electrodomésticos u objetos pequeños que no usás todos los días para liberar la vista y hacer el ambiente más cómodo.',
        benefits: [
          'Mayor sensación de orden y espacio.',
          'Menos distracciones y cansancio mental al final del día.',
          'Más comodidad al limpiar y ordenar.'
        ],
        whatYouWillFeel: ''
      },
      {
        key: 'luz',
        name: 'Confort y luz',
        emoji: '☀️',
        score: mapScore(d['Calidad Ambiental'] * 1.05),
        description: 'La luz de tu casa regula tu reloj biológico. Si usás luz fría o muy brillante por la noche, tu cerebro cree que todavía es de día y no produce la melatonina necesaria para descansar.',
        interpretation: d['Calidad Ambiental'] >= 70
          ? 'Esto ya lo estás haciendo muy bien. Tu casa tiene una luz cálida y agradable que te acompaña muy bien al final del día.'
          : 'Acá encontramos una oportunidad. Observamos que al atardecer las luces siguen siendo muy intensas o frías, lo que confunde a tu cuerpo.',
        nextAction: 'Encendé luces cálidas y bajas (lámparas de mesa o de pie) a partir del atardecer en lugar de las luces generales del techo.',
        benefits: [
          'Más calma y preparación natural para el sueño.',
          'Menos fatiga en la vista.',
          'Una atmósfera mucho más íntima y relajante.'
        ],
        whatYouWillFeel: ''
      },
      {
        key: 'naturaleza',
        name: 'Conexión con la naturaleza',
        emoji: '🌿',
        score: mapScore(d['Biofilia']),
        description: 'Ver plantas o materiales naturales como madera y lino reduce la presión arterial y el estrés. Es una respuesta biológica de calma que traemos desde hace miles de años.',
        interpretation: d['Biofilia'] >= 70
          ? 'Esto ya lo estás haciendo muy bien. Qué lindo ver cómo tu casa integra plantas y verde, conectándote con la naturaleza.'
          : 'Acá encontramos una oportunidad. Tu casa está un poco desconectada de los ciclos de la naturaleza y del verde.',
        nextAction: 'Colocá una planta de hojas verdes y redondas en el ambiente donde pases más tiempo.',
        benefits: [
          'Mayor sensación de frescura y vitalidad.',
          'Menos estrés y mayor capacidad de concentrarte.',
          'Un ambiente que se siente vivo y respirable.'
        ],
        whatYouWillFeel: ''
      },
      {
        key: 'confort',
        name: 'Confort térmico y acústico',
        emoji: '🌡️',
        score: mapScore((d['Calidad Ambiental'] + d['Funcionalidad']) / 2),
        description: 'El ruido constante y el frío exterior nos obligan a hacer un esfuerzo de adaptación física inconsciente que nos agota a lo largo del día.',
        interpretation: (d['Calidad Ambiental'] + d['Funcionalidad']) / 2 >= 70
          ? 'Esto ya lo estás haciendo muy bien. Tus ambientes protegen bien tu silencio y mantienen una temperatura agradable.'
          : 'Acá encontramos una oportunidad. Notamos que entran corrientes de aire frío o ruidos de la calle que interrumpen tu tranquilidad.',
        nextAction: 'Colocá burletes en las puertas o ventanas del ambiente que más uses para frenar el chiflete y apagar los ruidos exteriores.',
        benefits: [
          'Más comodidad y abrigo en el día a día.',
          'Menos interrupciones y mejor concentración.',
          'Un verdadero refugio silencioso.'
        ],
        whatYouWillFeel: ''
      },
      {
        key: 'descanso',
        name: 'Tu calidad de descanso',
        emoji: '🌙',
        score: mapScore(d['Descanso']),
        description: 'El dormitorio debe ser un templo de descanso. Si ves cargadores o pendientes de trabajo al acostarte, tu cerebro se mantiene en estado de alerta e interrumpe el sueño profundo.',
        interpretation: d['Descanso'] >= 70
          ? 'Esto ya lo estás haciendo muy bien. Tu dormitorio es un verdadero santuario que te invita a apagar la mente y dormir bien.'
          : 'Acá encontramos una oportunidad. Vimos que en tu dormitorio hay objetos de trabajo, cables o pantallas a la vista que te impiden desconectar.',
        nextAction: 'Retirá del campo visual de la cama los dispositivos electrónicos y cables una hora antes de ir a dormir.',
        benefits: [
          'Un descanso más profundo y reparador.',
          'Menos vueltas en la cama antes de dormir.',
          'Despertar con más energía por las mañanas.'
        ],
        whatYouWillFeel: ''
      },
      {
        key: 'identidad',
        name: 'Identidad y pertenencia',
        emoji: '🖼️',
        score: mapScore(d['Identidad y Pertenencia']),
        description: 'Sentirse en casa requiere apropiarse del espacio. Rodearnos de objetos con significado emocional y recuerdos alegres nos brinda seguridad y raíces.',
        interpretation: d['Identidad y Pertenencia'] >= 70
          ? 'Esto ya lo estás haciendo muy bien. Cada rincón de tu casa cuenta tu historia, lo que te da un gran arraigo y pertenencia.'
          : 'Acá encontramos una oportunidad. Sentimos que tus espacios se ven un poco neutros o impersonales, como si todavía estuvieras de paso.',
        nextAction: 'Elegí un objeto o foto que te traiga un recuerdo muy feliz y colocaló en un lugar destacado donde lo veas apenas entrás.',
        benefits: [
          'Mayor sensación de arraigo y pertenencia.',
          'Una sonrisa y alegría cada vez que volvés a casa.',
          'Sentir que el espacio habla verdaderamente de vos.'
        ],
        whatYouWillFeel: ''
      },
      {
        key: 'mantenimiento',
        name: 'El cuidado de tu casa',
        emoji: '🔧',
        score: mapScore((d['Funcionalidad'] * 0.95) + 5),
        description: 'Esos pequeños arreglos que postergamos (un picaporte flojo, un cajón trabado) se acumulan en nuestra mente como tareas pendientes, generando una microansiedad silenciosa.',
        interpretation: d['Funcionalidad'] >= 70
          ? 'Esto ya lo estás haciendo muy bien. Tu casa funciona muy bien en sus detalles prácticos, facilitándote la rutina diaria.'
          : 'Acá encontramos una oportunidad. Observamos que hay pequeños pendientes de reparación que te quitan tranquilidad.',
        nextAction: 'Hacé una lista de 3 reparaciones muy rápidas (de menos de 10 minutos) y resolvelas este fin de semana para sacártelas de encima.',
        benefits: [
          'Liberación de espacio mental y menos pendientes.',
          'Mayor control y orgullo sobre tu propio hogar.',
          'Una rutina diaria más fluida y sin tropiezos.'
        ],
        whatYouWillFeel: ''
      },
      {
        key: 'bienestar',
        name: 'Tu sensación de bienestar',
        emoji: '🧠',
        score: mapScore(d['Regulación emocional']),
        description: 'La casa debe ser el lugar donde recuperamos la energía que gastamos afuera. Si la casa nos exige esfuerzo constante, nunca llegamos a recargarnos del todo.',
        interpretation: d['Regulación emocional'] >= 70
          ? 'Esto ya lo estás haciendo muy bien. Tu casa funciona como un verdadero cargador de batería, devolviéndote la energía y la calma.'
          : 'Acá encontramos una oportunidad. Notamos que hoy tu hogar te está pidiendo más energía de la que te devuelve para descansar.',
        nextAction: 'Reservá un rincón exclusivo de tu casa (una silla, un sillón) solo para descansar o leer, libre de pantallas y trabajo.',
        benefits: [
          'Un refugio de calma real dentro de tu propio hogar.',
          'Mayor facilidad para desconectar del estrés del día.',
          'Sensación de contención y recarga de energía.'
        ],
        whatYouWillFeel: ''
      },
    ];
  };

  const toggleDisciplines = (key: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDisciplines((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const pulsoList = getPulsoData();

  return (
    <div className="glass-card" style={{ marginBottom: '40px', padding: '30px sm:padding: 40px' }}>
      <div style={{ marginBottom: '28px' }}>
        <span className="text-[0.65rem] uppercase tracking-[0.3em] text-[#987557] font-semibold block mb-2">
          ¿Cómo está hoy tu casa?
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
          const showDisc = !!showDisciplines[item.key];
          
          // Color logic based on score
          let barColor = '#B05B5B'; // Critico
          let statusText = 'Para cuidar';
          let statusClass = 'text-red-700 bg-red-50 border-red-200';
          
          if (item.score >= 75) {
            barColor = '#5C7A63'; // Fuerte
            statusText = 'Fuerte';
            statusClass = 'text-emerald-700 bg-emerald-50 border-emerald-200';
          } else if (item.score >= 50) {
            barColor = '#B28E6B'; // Moderado
            statusText = 'En camino';
            statusClass = 'text-amber-700 bg-amber-50 border-amber-200';
          }

          return (
            <div key={item.key} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {/* Row Selector Header */}
              <div 
                onClick={() => {
                  setSelectedKey(isSelected ? null : item.key);
                }}
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '1.2rem' }}>{item.emoji}</span>
                    <span style={{ fontWeight: 500, fontSize: '0.95rem', color: '#44403C' }}>{item.name}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {/* Replaced raw number with a status badge in header */}
                    <span style={{ 
                       fontSize: '0.72rem', 
                      fontWeight: 600, 
                      padding: '2px 8px', 
                      borderRadius: '4px',
                      border: '1px solid',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em'
                    }} className={statusClass}>
                      {statusText}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', transform: isSelected ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.25s ease' }}>
                      ▼
                    </span>
                  </div>
                </div>
              </div>

              {/* Accordion Detail Drawer */}
              {isSelected && (
                <div style={{
                  background: 'rgba(152,117,87,0.03)',
                  border: '1px dashed #987557',
                  borderRadius: '8px',
                  padding: '22px 24px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '18px',
                  animation: 'fadeIn 0.25s ease-out',
                  textAlign: 'left'
                }}>
                  {/* 1. ¿Qué observamos? */}
                  <div>
                    <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: '#987557', fontWeight: 650, letterSpacing: '0.08em', display: 'block', marginBottom: '6px' }}>
                      ¿Qué observamos?
                    </span>
                    <p style={{ fontSize: '1.15rem', color: '#1C1917', lineHeight: 1.5, margin: 0, fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic' }}>
                      "{item.interpretation}"
                    </p>
                  </div>

                  {/* 2. ¿Por qué es importante? */}
                  <div>
                    <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: '#878179', fontWeight: 600, letterSpacing: '0.08em', display: 'block', marginBottom: '4px' }}>
                      ¿Por qué es importante?
                    </span>
                    <p style={{ fontSize: '0.88rem', color: '#57534E', lineHeight: 1.5, margin: 0 }}>
                      {item.description}
                    </p>
                  </div>

                  {/* 3. ¿Qué pequeño cambio recomendamos? */}
                  <div style={{
                    background: '#fff',
                    border: '1px solid #D6D2CA',
                    borderRadius: '8px',
                    padding: '16px 20px',
                  }}>
                    <span style={{
                      fontSize: '0.65rem',
                      color: '#987557',
                      fontWeight: 650,
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                      display: 'block',
                      marginBottom: '6px',
                    }}>
                      ¿Qué pequeño cambio recomendamos?
                    </span>
                    <p style={{ fontSize: '0.92rem', color: '#1C1917', fontWeight: 550, lineHeight: 1.4, margin: '0 0 10px 0' }}>
                      {item.nextAction}
                    </p>

                    {/* 4. ¿Qué podrías sentir si hacés este cambio? */}
                    <span style={{
                      fontSize: '0.65rem',
                      color: '#878179',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      display: 'block',
                      marginBottom: '4px',
                    }}>
                      ¿Qué podrías sentir si hacés este cambio?
                    </span>
                    <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '0.82rem', color: '#57534E', lineHeight: 1.45 }}>
                      {item.benefits.map((benefit, bidx) => (
                        <li key={bidx} style={{ marginBottom: '2px' }}>{benefit}</li>
                      ))}
                    </ul>
                  </div>

                  {/* 6. Desplegable "¿Por qué recomendamos esto?" (Sello de disciplina) */}
                  <div style={{ borderTop: '1px solid #E5E1D8', paddingTop: '10px' }}>
                    <button
                      type="button"
                      onClick={(e) => toggleDisciplines(item.key, e)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#987557',
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: 0
                      }}
                    >
                      <span>{showDisc ? '▼' : '▶'}</span> ¿Por qué recomendamos esto? (Respaldos del Método)
                    </button>
                    {showDisc && (
                      <div style={{
                        marginTop: '8px',
                        background: '#fff',
                        border: '1px solid #EAE7E1',
                        borderRadius: '6px',
                        padding: '10px 14px',
                        fontSize: '0.75rem',
                        color: '#57534E',
                        lineHeight: 1.4,
                        animation: 'fadeInUp 0.25s ease-out'
                      }}>
                        <p style={{ margin: '0 0 6px 0', fontWeight: 500 }}>Esta recomendación considera variables interpretadas de:</p>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
                          <div>✓ Neuroarquitectura</div>
                          <div>✓ Psicología Ambiental</div>
                          <div>✓ Diseño Biofílico</div>
                          <div>✓ Ergonomía</div>
                          <div>✓ Sabidurías del Habitar</div>
                          <div>✓ Experiencia de Bianchi Estudio</div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 7. Puntaje (como dato secundario al fondo) */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '0.78rem',
                    color: '#878179',
                    borderTop: '1px solid #EAE7E1',
                    paddingTop: '10px',
                    marginTop: '4px'
                  }}>
                    <span>Nivel actual relevado:</span>
                    <strong style={{ color: barColor, fontWeight: 600 }}>{item.score} / 100 puntos</strong>
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

export default PulsoDelHogar;
