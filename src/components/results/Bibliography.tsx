import { useState } from 'react';
import { ChevronDown, ChevronUp, Star } from 'lucide-react';

interface Study {
  title: string;
  authors: string;
  year: string;
  findings: string;
  translation: string;
  citation: string;
}

interface Discipline {
  id: string;
  name: string;
  emoji: string;
  level: 1 | 2 | 3;
  levelName: string;
  levelDesc: string;
  authors: string[];
  concepts: string[];
  explanation: string;
  studies: Study[];
}

const disciplines: Discipline[] = [
  {
    id: 'psicologia-ambiental',
    name: 'Psicología Ambiental',
    emoji: '🧠',
    level: 1,
    levelName: 'Nivel 1 – Evidencia científica sólida',
    levelDesc: 'Metaanálisis, revisiones sistemáticas, ensayos y estudios replicados.',
    authors: ['Stephen Kaplan', 'Rachel Kaplan', 'Robert Gifford', 'Susan Clayton'],
    concepts: ['Attention Restoration Theory', 'Soft Fascination', 'Fatiga atencional', 'Restauración cognitiva', 'Apego al lugar', 'Identidad del lugar'],
    explanation: 'Analiza de qué manera el entorno construido influye en nuestras emociones, comportamiento y capacidades cognitivas, guiándonos para crear espacios que actúen como verdaderos reguladores de estrés.',
    studies: [
      {
        title: 'No Place Like Home: Home Tours Correlate With Daily Patterns of Mood and Cortisol',
        authors: 'Darby E. Saxbe & Rena Repetti',
        year: '2010',
        findings: 'Las participantes que describieron sus hogares como desordenados o con trabajo pendiente mostraron niveles de cortisol salivar significativamente más altos a lo largo de la jornada, indicando estrés crónico.',
        translation: 'Reducir la sobrecarga de objetos visibles en áreas comunes ayuda directamente a que tu cerebro baje sus niveles de alerta.',
        citation: 'Saxbe, D.E. & Repetti, R. (2010). Personality and Social Psychology Bulletin, 36(1).'
      },
      {
        title: 'The Built Environment and Mental Health',
        authors: 'Gary W. Evans',
        year: '2003',
        findings: 'Establece que el hacinamiento doméstico, el ruido y la mala iluminación desgastan silenciosamente la resiliencia mental.',
        translation: 'Diseñar zonas de escape acústico y rincones personales para preservar la privacidad.',
        citation: 'Evans, G.W. (2003). Journal of Urban Health, 80(4).'
      }
    ]
  },
  {
    id: 'neuroarquitectura',
    name: 'Neuroarquitectura',
    emoji: '👁️',
    level: 1,
    levelName: 'Nivel 1 – Evidencia científica sólida',
    levelDesc: 'Metaanálisis, revisiones sistemáticas, ensayos y estudios replicados.',
    authors: ['John P. Eberhard', 'Colin Ellard', 'Esther Sternberg', 'Ann Sussman', 'Justin Hollander'],
    concepts: ['Percepción espacial', 'Cerebro predictivo', 'Carga cognitiva', 'Emoción', 'Orientación', 'Seguridad espacial'],
    explanation: 'Combina la neurociencia con el diseño espacial para estudiar cómo reacciona el sistema nervioso ante los techos, las curvas, las formas y las simetrías de los ambientes.',
    studies: [
      {
        title: 'Brain Landscape: The Coexistence of Active Minds and Creative Places',
        authors: 'John Paul Eberhard',
        year: '2009',
        findings: 'El entorno construido moldea la estructura neuronal. Espacios con iluminación dinámica y misterio estimulan la plasticidad cerebral.',
        translation: 'Crear diferentes climas lumínicos en el hogar para activar estados de alerta o descanso según la hora.',
        citation: 'Eberhard, J.P. (2009). Oxford University Press.'
      },
      {
        title: 'The Architect’s Brain: Humanity and the New Sciences of Writing',
        authors: 'Harry Francis Mallgrave',
        year: '2013',
        findings: 'El cerebro simula las líneas del entorno mediante neuronas espejo; los contornos fluidos y curvos bajan la respuesta de amenaza en la amígdala.',
        translation: 'Priorizar mobiliario con bordes redondeados y formas orgánicas en zonas de descanso.',
        citation: 'Mallgrave, H.F. (2013). Wiley-Blackwell.'
      }
    ]
  },
  {
    id: 'biofilia',
    name: 'Biofilia',
    emoji: '🌿',
    level: 1,
    levelName: 'Nivel 1 – Evidencia científica sólida',
    levelDesc: 'Metaanálisis, revisiones sistemáticas, ensayos y estudios replicados.',
    authors: ['Edward O. Wilson', 'Stephen Kellert', 'William Browning', 'Terrapin Bright Green'],
    concepts: ['Biofilia', '14 patrones biofílicos', 'Naturaleza', 'Vegetación', 'Agua', 'Refugio', 'Prospecto'],
    explanation: 'Sostiene que los seres humanos tenemos una necesidad evolutiva de conectarnos con la naturaleza. Diseñar con plantas, texturas naturales y luz reduce el estrés fisiológico de forma medible.',
    studies: [
      {
        title: 'Biophilia and the Conservation Ethic',
        authors: 'Edward O. Wilson',
        year: '1984',
        findings: 'Demuestra la preferencia innata del ser humano por asociarse con los procesos de la vida, traduciéndose en calma parasimpática ante estímulos orgánicos.',
        translation: 'Integrar madera, fibras naturales y plantas reales en la línea de visión del usuario.',
        citation: 'Wilson, E.O. (1984). Harvard University Press.'
      },
      {
        title: '14 Patterns of Biophilic Design',
        authors: 'William D. Browning, Catherine O. Ryan, Joseph O. Clancy',
        year: '2014',
        findings: 'Clasifica los patrones de naturaleza en el espacio y demuestra que estímulos sensoriales no visuales (aromas, tacto) disminuyen la frecuencia cardíaca.',
        translation: 'Favorecer la ventilación natural y texturas rugosas agradables al tacto.',
        citation: 'Browning, W.D. et al. (2014). Terrapin Bright Green.'
      }
    ]
  },
  {
    id: 'salud-hospitalaria',
    name: 'Evidencia Hospitalaria y Salud',
    emoji: '🏥',
    level: 1,
    levelName: 'Nivel 1 – Evidencia científica sólida',
    levelDesc: 'Metaanálisis, revisiones sistemáticas, ensayos y estudios replicados.',
    authors: ['Roger Ulrich'],
    concepts: ['Recuperación', 'Estrés', 'Vistas naturales', 'Diseño basado en evidencia'],
    explanation: 'Estudios clínicos en entornos de salud que demuestran de qué manera el diseño físico incide directamente en la curación, la reducción de analgésicos y la regulación del dolor.',
    studies: [
      {
        title: 'View Through a Window May Influence Recovery from Surgery',
        authors: 'Roger S. Ulrich',
        year: '1984',
        findings: 'Pacientes quirúrgicos con vistas a árboles tuvieron hospitalizaciones más cortas y requirieron menos dosis de analgésicos fuertes en comparación con quienes miraban a una pared de ladrillos.',
        translation: 'Asegurar que los escritorios y cabeceras de camas miren hacia el exterior o a imágenes de naturaleza.',
        citation: 'Ulrich, R.S. (1984). Science, 224(4647).'
      }
    ]
  },
  {
    id: 'calidad-ambiental-interior',
    name: 'Calidad Ambiental Interior (IEQ)',
    emoji: '💨',
    level: 1,
    levelName: 'Nivel 1 – Evidencia científica sólida',
    levelDesc: 'Metaanálisis, revisiones sistemáticas, ensayos y estudios replicados.',
    authors: ['Joseph Allen', 'Harvard Healthy Buildings'],
    concepts: ['Aire', 'Ventilación', 'Humedad', 'CO₂', 'Confort térmico', 'Luz'],
    explanation: 'Analiza el impacto del ambiente físico de una habitación (humedad, temperatura, renovación de aire y niveles de CO₂) sobre nuestro rendimiento cognitivo y bienestar respiratorio.',
    studies: [
      {
        title: 'Indoor Environmental Quality and Human Performance',
        authors: 'William J. Fisk',
        year: '2000',
        findings: 'La acumulación de CO₂ por falta de ventilación disminuye la concentración e incrementa la sensación de fatiga mental en más de un 15%.',
        translation: 'Ventilar los ambientes de 5 a 10 minutos al día para renovar el aire y bajar el nivel de CO₂.',
        citation: 'Fisk, W.J. (2000). Annual Review of Energy and the Environment.'
      }
    ]
  },
  {
    id: 'arquitectura-fenomenologica',
    name: 'Arquitectura Fenomenológica',
    emoji: '🧘',
    level: 2,
    levelName: 'Nivel 2 – Evidencia emergente',
    levelDesc: 'Investigaciones prometedoras y desarrollos teóricos sólidos con observación empírica.',
    authors: ['Christian Norberg-Schulz', 'Juhani Pallasmaa', 'Martin Heidegger'],
    concepts: ['Habitar', 'Genius loci', 'Experiencia', 'Cuerpo', 'Percepción'],
    explanation: 'Enfoca la arquitectura como una experiencia sensorial completa (háptica, acústica y espacial). Defiende que la casa es el centro existencial donde el ser humano "aprende a habitar".',
    studies: [
      {
        title: 'Genius Loci: Towards a Phenomenology of Architecture',
        authors: 'Christian Norberg-Schulz',
        year: '1979',
        findings: 'Define que habitar requiere orientación e identificación existencial en el espacio. El hogar actúa como anclaje espacial de la persona.',
        translation: 'Crear ritos de llegada en la entrada (perchero, descalzado) para delimitar el afuera del adentro.',
        citation: 'Norberg-Schulz, C. (1979). Rizzoli.'
      }
    ]
  },
  {
    id: 'diseno-personas',
    name: 'Diseño Centrado en las Personas',
    emoji: '👤',
    level: 1,
    levelName: 'Nivel 1 – Evidencia científica sólida',
    levelDesc: 'Metaanálisis, revisiones sistemáticas, ensayos y estudios replicados.',
    authors: ['Don Norman'],
    concepts: ['Experiencia', 'Diseño intuitivo', 'Emoción', 'Usabilidad'],
    explanation: 'Traslada los conceptos de usabilidad y diseño cognitivo a la vivienda cotidiana. El mobiliario y las circulaciones deben acompañar las acciones intuitivas sin generar tropiezos.',
    studies: [
      {
        title: 'The Design of Everyday Things',
        authors: 'Don Norman',
        year: '2013',
        findings: 'El diseño deficiente de objetos y recorridos genera frustración acumulativa, induciendo pequeños niveles de estrés constante en las tareas diarias.',
        translation: 'Eliminar cables colgantes, cajones difíciles de abrir y pasillos bloqueados para suavizar las tareas.',
        citation: 'Norman, D. (2013). Basic Books.'
      }
    ]
  },
  {
    id: 'urbanismo-comportamiento',
    name: 'Urbanismo y Comportamiento',
    emoji: '🚶',
    level: 2,
    levelName: 'Nivel 2 – Evidencia emergente',
    levelDesc: 'Investigaciones prometedoras y desarrollos teóricos sólidos con observación empírica.',
    authors: ['Jan Gehl'],
    concepts: ['Escala humana', 'Comportamiento', 'Interacción social', 'Ciudad saludable'],
    explanation: 'Analiza cómo la escala y la apertura visual de los espacios influyen en la cohesión social, la interacción con otros y la disposición a caminar u estar en reposo.',
    studies: [
      {
        title: 'Life Between Buildings',
        authors: 'Jan Gehl',
        year: '1971',
        findings: 'La calidad de los bordes y las vistas de transición regula el comportamiento social y la sensación de seguridad y pertenencia en el barrio.',
        translation: 'Abrir las visuales de tu hogar al exterior (ventanas limpias) para sentirte conectado a tu entorno sin perder privacidad.',
        citation: 'Gehl, J. (1971). Island Press.'
      }
    ]
  },
  {
    id: 'geografia-paisaje',
    name: 'Geografía y Paisaje',
    emoji: '🌍',
    level: 2,
    levelName: 'Nivel 2 – Evidencia emergente',
    levelDesc: 'Investigaciones prometedoras y desarrollos teóricos sólidos con observación empírica.',
    authors: ['Yi-Fu Tuan', 'Ian McHarg'],
    concepts: ['Paisaje', 'Topografía', 'Relación con el lugar', 'Diseño ecológico'],
    explanation: 'Estudia el concepto de Topofilia (el lazo afectivo entre la persona y el entorno físico) y cómo el paisaje circundante define la identidad cultural y la paz mental.',
    studies: [
      {
        title: 'Topophilia: A Study of Environmental Perception, Attitudes, and Values',
        authors: 'Yi-Fu Tuan',
        year: '1974',
        findings: 'La percepción humana del entorno está cargada de valores simbólicos y lazos emocionales que determinan el apego al lugar.',
        translation: 'Utilizar materiales locales del paisaje cercano para generar una mayor coherencia existencial con la zona donde vivís.',
        citation: 'Tuan, Y.F. (1974). Prentice-Hall.'
      }
    ]
  },
  {
    id: 'feng-shui',
    name: 'Feng Shui Tradicional',
    emoji: '☯️',
    level: 3,
    levelName: 'Nivel 3 – Sabidurías tradicionales',
    levelDesc: 'Sabiduría ancestral y sistemas de observación cultural del entorno.',
    authors: ['Guo Pu (Zang Shu - Libro del Entierro)'],
    concepts: ['Escuela de las Formas', 'Escuela de la Brújula', 'Cinco Elementos', 'Yin y Yang', 'Bagua', 'Qi tradicional'],
    explanation: 'Sostiene que la distribución de la vivienda debe orientarse de acuerdo a las corrientes invisibles de viento (Feng) y agua (Shui) para conservar la armonía. En el Método Bianchi® se valora como una sabiduría tradicional de lectura del entorno que promueve el equilibrio de materiales, presentándola como un sistema cultural y no como hechos científicos experimentales.',
    studies: [
      {
        title: 'Zang Shu (El Libro del Entierro)',
        authors: 'Guo Pu',
        year: 'Dinastía Jin (276–324 d.C.)',
        findings: 'Establece los principios clásicos de la acumulación del Qi y la dispersión del viento. Describe el equilibrio del entorno físico en relación a la topografía.',
        translation: 'Buscar el equilibrio del Ying y el Yang (zonas de luz y de sombra; zonas activas y de silencio) para regular la energía de tu día.',
        citation: 'Texto fundacional de la Escuela de las Formas tradicionales.'
      }
    ]
  },
  {
    id: 'cronobiologia',
    name: 'Cronobiología',
    emoji: '⏰',
    level: 1,
    levelName: 'Nivel 1 – Evidencia científica sólida',
    levelDesc: 'Metaanálisis, revisiones sistemáticas, ensayos y estudios replicados.',
    authors: ['Russell Foster', 'Satchin Panda'],
    concepts: ['Luz', 'Sueño', 'Ritmos circadianos', 'Melatonina', 'Cortisol'],
    explanation: 'Analiza cómo la iluminación artificial y natural sincroniza nuestros relojes biológicos y regula la secreción de melatonina y cortisol, siendo vital para evitar el insomnio.',
    studies: [
      {
        title: 'Circadian Photoreception in Humans',
        authors: 'Russell G. Foster',
        year: '2002',
        findings: 'Identifica fotorreceptores ipRGC en la retina humana sensibles a la luz azul que regulan de manera directa el núcleo supraquiasmático del hipotálamo.',
        translation: 'Bloquear las pantallas y luces intensas una hora antes de dormir para permitir que el cerebro secrete melatonina.',
        citation: 'Foster, R.G. (2002). Current Biology, 12(9).'
      }
    ]
  },
  {
    id: 'color',
    name: 'Color',
    emoji: '🎨',
    level: 1,
    levelName: 'Nivel 1 – Evidencia científica sólida',
    levelDesc: 'Metaanálisis, revisiones sistemáticas, ensayos y estudios replicados.',
    authors: ['Faber Birren', 'Angela Wright', 'Josef Albers'],
    concepts: ['Percepción', 'Contraste', 'Armonía', 'Emoción', 'Adaptación visual'],
    explanation: 'Estudia la respuesta biológica y la decodificación cerebral del espectro visible. Determinadas longitudes de onda modulan el pulso cardíaco y la predisposición a la calma o la actividad.',
    studies: [
      {
        title: 'Color Psychology and Color Therapy',
        authors: 'Faber Birren',
        year: '1961',
        findings: 'La estimulación con colores de alta saturación activa el sistema nervous simpático, aumentando el estado de alerta general, mientras que tonos suaves inducen relajación cortical.',
        translation: 'Usar tonos mate y de baja saturación en habitaciones destinadas al sueño y la desconexión.',
        citation: 'Birren, F. (1961). University Books.'
      }
    ]
  }
];

export function Bibliography() {
  const [levelFilter, setLevelFilter] = useState<number | 'todos'>('todos');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filteredDisciplines = disciplines.filter(d => {
    return levelFilter === 'todos' || d.level === levelFilter;
  });

  const getLevelBadgeStyle = (level: number) => {
    switch (level) {
      case 1:
        return { background: 'rgba(92,122,99,0.1)', color: '#5C7A63', border: '1px solid rgba(92,122,99,0.2)' };
      case 2:
        return { background: 'rgba(178,142,107,0.1)', color: '#B28E6B', border: '1px solid rgba(178,142,107,0.2)' };
      case 3:
        return { background: 'rgba(152,117,87,0.1)', color: '#987557', border: '1px solid rgba(152,117,87,0.2)' };
      default:
        return {};
    }
  };

  const getLevelDotColor = (level: number) => {
    switch (level) {
      case 1: return '#5C7A63';
      case 2: return '#B28E6B';
      case 3: return '#987557';
      default: return '#878179';
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedId(prev => (prev === id ? null : id));
  };

  return (
    <div className="glass-card no-print animate-[fadeIn_0.35s_ease-out]" style={{ marginBottom: '40px', padding: '30px' }}>
      <div style={{ marginBottom: '24px' }}>
        <span className="text-[0.65rem] uppercase tracking-[0.3em] text-[#987557] font-semibold block mb-2">
          Soporte Teórico
        </span>
        <h3 style={{ fontSize: '1.8rem', fontFamily: 'Cormorant Garamond, serif', fontWeight: 300, color: '#1C1917', margin: '0 0 6px 0' }}>
          Biblioteca Científica del Método Bianchi®
        </h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.5, margin: 0 }}>
          El Método Bianchi® une el rigor de la ciencia y el diseño con la sabiduría histórica del habitar. Explorá las 12 disciplinas fundamentales y la evidencia que las respalda.
        </p>
      </div>

      {/* FILTER BUTTONS */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        flexWrap: 'wrap',
        marginBottom: '28px',
        paddingBottom: '16px',
        borderBottom: '1px solid var(--border-color)'
      }}>
        <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', marginRight: '6px' }}>Filtrar por nivel:</span>
        {[
          { val: 'todos', label: 'Todas las áreas' },
          { val: 1, label: '🟢 Nivel 1 – Evidencia Sólida' },
          { val: 2, label: '🟡 Nivel 2 – Evidencia Emergente' },
          { val: 3, label: '🟤 Nivel 3 – Sabidurías Tradicionales' }
        ].map((btn) => (
          <button
            key={btn.val}
            onClick={() => setLevelFilter(btn.val as number | 'todos')}
            className={`btn ${levelFilter === btn.val ? 'btn-primary' : 'btn-secondary'}`}
            style={{
              padding: '6px 14px',
              fontSize: '0.74rem',
              borderRadius: '20px',
              letterSpacing: '0.03em',
            }}
          >
            {btn.label}
          </button>
        ))}
      </div>

      {/* 12 DISCIPLINAS GRID */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
        gap: '20px',
      }}>
        {filteredDisciplines.map((disc) => {
          const isExpanded = expandedId === disc.id;
          const badgeStyle = getLevelBadgeStyle(disc.level);
          const dotColor = getLevelDotColor(disc.level);

          return (
            <div
              key={disc.id}
              style={{
                background: '#fff',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                transition: 'all 0.3s ease',
                position: 'relative',
              }}
              className="discipline-card hover:shadow-md"
            >
              {/* Card Header: Emoji + Title + Level badge */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '1.4rem' }}>{disc.emoji}</span>
                    <h4 style={{ fontSize: '1.15rem', fontWeight: 600, color: 'var(--text-charcoal)', margin: 0, fontFamily: 'Jost, sans-serif' }}>
                      {disc.name}
                    </h4>
                  </div>
                </div>
                <div style={{ 
                  display: 'inline-flex',
                  alignItems: 'center',
                  alignSelf: 'flex-start',
                  gap: '5px',
                  fontSize: '0.66rem',
                  fontWeight: 650,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  padding: '3px 8px',
                  borderRadius: '4px',
                  ...badgeStyle
                }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: dotColor }}></span>
                  {disc.levelName}
                </div>
              </div>

              {/* Autores */}
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '10px' }}>
                <strong>Autores clave:</strong> {disc.authors.join(', ')}
              </div>

              {/* Conceptos clave (Tag pills) */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginBottom: '14px' }}>
                {disc.concepts.map((concept, cIdx) => (
                  <span key={cIdx} style={{
                    background: '#F5F3EE',
                    color: '#6E6A63',
                    fontSize: '0.68rem',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    border: '1px solid #EAE7E1',
                    fontWeight: 500
                  }}>
                    {concept}
                  </span>
                ))}
              </div>

              {/* Breve descripción */}
              <p style={{ fontSize: '0.82rem', color: '#57534E', lineHeight: 1.45, margin: '0 0 18px 0' }}>
                {disc.explanation}
              </p>

              {/* Expander para estudios de referencia */}
              <div style={{ marginTop: 'auto' }}>
                <button
                  type="button"
                  onClick={() => toggleExpand(disc.id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#987557',
                    fontSize: '0.76rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: 0,
                    width: '100%',
                    justifyContent: 'space-between',
                    borderTop: '1px solid #F0EEE9',
                    paddingTop: '12px'
                  }}
                >
                  <span>{isExpanded ? 'Ocultar estudios y aplicaciones' : '🔬 Ver estudios y aplicaciones'}</span>
                  {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>

                {isExpanded && (
                  <div style={{
                    marginTop: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '14px',
                    animation: 'fadeIn 0.25s ease-out'
                  }}>
                    {disc.studies.map((study, sIdx) => (
                      <div key={sIdx} style={{
                        background: 'rgba(152,117,87,0.03)',
                        borderLeft: `3px solid ${dotColor}`,
                        borderRadius: '0 6px 6px 0',
                        padding: '12px 14px',
                        fontSize: '0.78rem',
                        textAlign: 'left'
                      }}>
                        <h5 style={{ margin: '0 0 4px 0', fontSize: '0.84rem', fontWeight: 650, color: 'var(--text-charcoal)', lineHeight: 1.3 }}>
                          "{study.title}"
                        </h5>
                        <div style={{ fontSize: '0.7rem', color: '#878179', marginBottom: '8px' }}>
                          {study.authors} • {study.year}
                        </div>

                        {/* ¿Qué descubrieron estas investigaciones? */}
                        <div style={{ marginBottom: '8px' }}>
                          <span style={{ fontSize: '0.62rem', color: '#987557', fontWeight: 650, textTransform: 'uppercase', display: 'block', marginBottom: '2px', letterSpacing: '0.04em' }}>
                            ¿Qué descubrieron estas investigaciones?
                          </span>
                          <p style={{ margin: 0, color: '#44403C', fontStyle: 'italic', lineHeight: 1.35 }}>
                            "{study.findings}"
                          </p>
                        </div>

                        {/* ¿Cómo usamos este conocimiento para ayudarte a vivir mejor? */}
                        <div>
                          <span style={{ fontSize: '0.62rem', color: '#5C7A63', fontWeight: 650, textTransform: 'uppercase', display: 'block', marginBottom: '2px', letterSpacing: '0.04em' }}>
                            ¿Cómo usamos este conocimiento para ayudarte a vivir mejor?
                          </span>
                          <p style={{ margin: 0, color: '#333', fontWeight: 500, lineHeight: 1.35 }}>
                            {study.translation}
                          </p>
                        </div>

                        <div style={{ fontSize: '0.62rem', color: '#A09B93', marginTop: '6px', textAlign: 'right' }}>
                          {study.citation}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer explicativo */}
      <div style={{ 
        marginTop: '28px', 
        paddingTop: '18px', 
        borderTop: '1px solid var(--border-color)', 
        fontSize: '0.76rem', 
        color: '#878179', 
        textAlign: 'left', 
        lineHeight: 1.45 
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
          <Star size={12} style={{ color: '#987557' }} />
          <strong>Nota de transparencia del Método Bianchi®:</strong>
        </div>
        Clasificamos el sustento de nuestras recomendaciones para asegurar honestidad y rigor técnico. El <strong>Nivel 1</strong> se apoya en evidencias experimentales clínicas replicadas; el <strong>Nivel 2</strong> en modelos teóricos prometedores de análisis espacial; y el <strong>Nivel 3</strong> en valiosas sabidurías vernáculas y tradicionales que aportan interpretaciones simbólicas del hábitat, enseñando a equilibrar y sintonizar la casa con sus habitantes sin pretensiones de validación experimental.
      </div>
    </div>
  );
}

export default Bibliography;
