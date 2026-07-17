import { useState } from 'react';

interface StudyRef {
  area: string;
  title: string;
  authors: string;
  year: string;
  evidence: 'fuerte' | 'moderada' | 'preliminar';
  findings: string;
  translation: string;
  citation: string;
}

const studies: StudyRef[] = [
  {
    area: 'Neuroarquitectura',
    title: 'Brain Landscape: The Coexistence of Active Minds and Creative Places',
    authors: 'John Paul Eberhard',
    year: '2009',
    evidence: 'preliminar',
    findings: 'El entorno construido moldea la estructura neuronal y la plasticidad sináptica. Los espacios con iluminación variable y elementos de misterio estimulan la neurogénesis.',
    translation: 'Diseñar rincones con diferentes intenciones de iluminación para modular los estados cerebrales de alerta y relajación.',
    citation: 'Eberhard, J.P. (2009). Oxford University Press.',
  },
  {
    area: 'Neuroarquitectura',
    title: 'The Architect’s Brain: Humanity and the New Sciences of Writing',
    authors: 'Harry Francis Mallgrave',
    year: '2013',
    evidence: 'preliminar',
    findings: 'Propone una base neurológica para la empatía estética. Nuestro cerebro simula las líneas y texturas del espacio a través del sistema de neuronas espejo.',
    translation: 'Priorizar contornos curvos en mobiliario para reducir la respuesta de alarma en la amígdala.',
    citation: 'Mallgrave, H.F. (2013). Wiley-Blackwell.',
  },
  {
    area: 'Psicología Ambiental',
    title: 'View Through a Window May Influence Recovery from Surgery',
    authors: 'Roger S. Ulrich',
    year: '1984',
    evidence: 'fuerte',
    findings: 'Pacientes con vistas a árboles redujeron el dolor postoperatorio, el consumo de analgésicos fuertes y la estancia hospitalaria en comparación con quienes miraban a una pared.',
    translation: 'Garantizar que las áreas de descanso y escritorios tengan visuales despejadas hacia el exterior.',
    citation: 'Ulrich, R.S. (1984). Science, 224(4647).',
  },
  {
    area: 'Psicología Ambiental',
    title: 'The Built Environment and Mental Health',
    authors: 'Gary W. Evans',
    year: '2003',
    evidence: 'moderada',
    findings: 'El hacinamiento doméstico, el ruido crónico y la mala calidad de luz aumentan la reactividad al estrés fisiológico y desgastan la resiliencia familiar.',
    translation: 'Crear zonas de escape acústico y privacidad física incluso en viviendas compartidas pequeñas.',
    citation: 'Evans, G.W. (2003). Journal of Urban Health, 80(4).',
  },
  {
    area: 'Biofilia',
    title: 'Biophilia and the Conservation Ethic',
    authors: 'Edward O. Wilson',
    year: '1984',
    evidence: 'fuerte',
    findings: 'Existe una tendencia innata en los seres humanos a buscar conexiones con la naturaleza y otros sistemas vivos debido a nuestra evolución filogenética.',
    translation: 'Incorporar elementos biofílicos reales (plantas, agua, madera) para inducir estados de calma parasimpática.',
    citation: 'Wilson, E.O. (1984). Harvard University Press.',
  },
  {
    area: 'Biofilia',
    title: '14 Patterns of Biophilic Design',
    authors: 'William D. Browning, Catherine O. Ryan, Joseph O. Clancy',
    year: '2014',
    evidence: 'fuerte',
    findings: 'Clasifica 14 patrones empíricos de biofilia en el espacio, demostrando que la presencia de naturaleza no visual (sonidos, texturas) reduce la presión arterial.',
    translation: 'Diseñar usando texturas táctiles naturales (madera, lino) y sonidos naturales sutiles.',
    citation: 'Browning, W.D. et al. (2014). Terrapin Bright Green.',
  },
  {
    area: 'Calidad Ambiental (IEQ)',
    title: 'Indoor Environmental Quality and Human Performance',
    authors: 'William J. Fisk',
    year: '2000',
    evidence: 'fuerte',
    findings: 'La ventilación deficiente incrementa el CO2 interior, disminuyendo el rendimiento cognitivo hasta un 15% y aumentando las tasas de fatiga mental diaria.',
    translation: 'Establecer el hábito diario de ventilar al despertar y favorecer la ventilación cruzada en áreas comunes.',
    citation: 'Fisk, W.J. (2000). Annual Review of Energy and the Environment.',
  },
  {
    area: 'Cronobiología y Luz',
    title: 'Circadian Photoreception in Humans',
    authors: 'Russell G. Foster',
    year: '2002',
    evidence: 'fuerte',
    findings: 'El ojo humano tiene fotorreceptores no visuales (células ganglionares ipRGC) sensibles a la luz azul. Su estimulación regula la melatonina y el ciclo de sueño.',
    translation: 'Evitar luces frías brillantes en el dormitorio a partir del atardecer para favorecer el sueño profundo.',
    citation: 'Foster, R.G. (2002). Current Biology, 12(9).',
  },
  {
    area: 'Ergonomía',
    title: 'The Interior Design Handbook',
    authors: 'Frida Ramstedt',
    year: '2020',
    evidence: 'moderada',
    findings: 'El diseño del espacio influye en la ergonomía muscular y la facilidad de uso. Las circulaciones obstruidas generan fricción y fatiga inconsciente en las tareas cotidianas.',
    translation: 'Asegurar un paso mínimo de 70 cm libre de obstáculos en pasillos y zonas de alto tránsito del hogar.',
    citation: 'Ramstedt, F. (2020). Particular Books.',
  },
  {
    area: 'Color y Percepción',
    title: 'Wie Farben auf Gefühl und Verstand wirken (Psicología del Color)',
    authors: 'Eva Heller',
    year: '2004',
    evidence: 'moderada',
    findings: 'Los colores no actúan de forma aislada, sino según su contexto cultural y biológico. El azul baja el pulso cardíaco, mientras que el rojo activa el sistema simpático.',
    translation: 'Priorizar tonalidades cálidas neutras en comedores y tonos apagados de baja saturación en dormitorios.',
    citation: 'Heller, E. (2004). Gustavo Gili.',
  },
  {
    area: 'Orden y Apego',
    title: 'No Place Like Home: Home Tours Correlate With Daily Patterns of Mood and Cortisol',
    authors: 'Darby E. Saxbe & Rena Repetti',
    year: '2010',
    evidence: 'fuerte',
    findings: 'El estudio midió el lenguaje que mujeres usan para describir sus hogares y lo correlacionó con niveles de cortisol salivar durante el día. Las participantes que describieron sus casas como desordenadas o como trabajo inacabado mostraron niveles de cortisol significativamente más altos a lo largo de la jornada, en comparación con quienes describieron sus hogares como restauradores.',
    translation: 'Reducir el desorden visible y los objetos "pendientes" en zonas de paso y descanso contribuye directamente a la regulación del nivel de estrés percibido.',
    citation: 'Saxbe, D.E. & Repetti, R. (2010). Personality and Social Psychology Bulletin, 36(1), 71–81. DOI: 10.1177/0146167209352864',
  },
  {
    area: 'Fenomenología del Habitar',
    title: 'Genius Loci: Towards a Phenomenology of Architecture',
    authors: 'Christian Norberg-Schulz',
    year: '1979',
    evidence: 'moderada',
    findings: 'Habitar no es solo estar bajo un techo; requiere identificarse y orientarse en el espacio. El Genius Loci es el alma del lugar que brinda arraigo existencial.',
    translation: 'Personalizar el ingreso al hogar para crear un rito espacial de "llegada" y corte con el exterior.',
    citation: 'Norberg-Schulz, C. (1979). Rizzoli.',
  },
];

export function Bibliography() {
  const [evidenceFilter, setEvidenceFilter] = useState<string>('todos');
  const [areaFilter, setAreaFilter] = useState<string>('todos');

  // Gather unique areas
  const areas = ['todos', ...Array.from(new Set(studies.map(s => s.area)))];

  // Filter logic
  const filteredStudies = studies.filter((study) => {
    const matchesEvidence = evidenceFilter === 'todos' || study.evidence === evidenceFilter;
    const matchesArea = areaFilter === 'todos' || study.area === areaFilter;
    return matchesEvidence && matchesArea;
  });

  const getEvidenceBadge = (level: string) => {
    switch (level) {
      case 'fuerte':
        return <span style={{ background: 'rgba(92,122,99,0.1)', color: '#5C7A63', fontSize: '0.7rem', padding: '4px 8px', borderRadius: '4px', fontWeight: 600 }}>🟢 Evidencia Fuerte</span>;
      case 'moderada':
        return <span style={{ background: 'rgba(178,142,107,0.1)', color: '#B28E6B', fontSize: '0.7rem', padding: '4px 8px', borderRadius: '4px', fontWeight: 600 }}>🟡 Evidencia Moderada</span>;
      case 'preliminar':
        return <span style={{ background: 'rgba(176,91,91,0.1)', color: '#B05B5B', fontSize: '0.7rem', padding: '4px 8px', borderRadius: '4px', fontWeight: 600 }}>🟠 Evidencia Preliminar</span>;
      default:
        return null;
    }
  };

  return (
    <div className="glass-card no-print" style={{ marginBottom: '40px', padding: '30px sm:padding: 40px' }}>
      <span className="text-[0.65rem] uppercase tracking-[0.3em] text-[#987557] font-semibold block mb-2">
        Respaldo Científico
      </span>
      <h3 style={{ fontSize: '1.8rem', fontFamily: 'Cormorant Garamond, serif', fontWeight: 300, color: '#1C1917', marginBottom: '8px' }}>
        Biblioteca de Evidencia Viva
      </h3>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '24px', lineHeight: 1.5 }}>
        El Método Bianchi® no se basa en modas decorativas, sino en investigaciones empíricas. Utilizá los filtros para explorar las bases científicas por nivel de rigor y por disciplina.
      </p>

      {/* FILTROS INTERACTIVOS */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
        
        {/* Nivel de Evidencia */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#44403C', width: '130px' }}>Nivel de Rigor:</span>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {['todos', 'fuerte', 'moderada', 'preliminar'].map((lvl) => (
              <button
                key={lvl}
                onClick={() => setEvidenceFilter(lvl)}
                className={`btn ${evidenceFilter === lvl ? 'btn-primary' : 'btn-secondary'}`}
                style={{
                  padding: '6px 14px',
                  fontSize: '0.75rem',
                  borderRadius: '20px',
                  textTransform: 'capitalize',
                  letterSpacing: '0.05em',
                }}
              >
                {lvl === 'todos' ? 'Todos' : lvl}
              </button>
            ))}
          </div>
        </div>

        {/* Disciplina */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#44403C', width: '130px' }}>Disciplina:</span>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {areas.map((area) => (
              <button
                key={area}
                onClick={() => setAreaFilter(area)}
                className={`btn ${areaFilter === area ? 'btn-primary' : 'btn-secondary'}`}
                style={{
                  padding: '6px 14px',
                  fontSize: '0.75rem',
                  borderRadius: '20px',
                  textTransform: 'capitalize',
                  letterSpacing: '0.05em',
                }}
              >
                {area === 'todos' ? 'Todas' : area}
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* GRILLA DE FICHAS CIENTÍFICAS */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
        gap: '20px',
        animation: 'fadeInUp 0.4s ease-out',
      }}>
        {filteredStudies.map((study, index) => (
          <div
            key={index}
            style={{
              background: '#fff',
              border: '1px solid #D6D2CA',
              borderRadius: '8px',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              transition: 'box-shadow 0.3s ease',
            }}
            onMouseOver={(e) => e.currentTarget.style.boxShadow = '0 6px 18px rgba(152,117,87,0.06)'}
            onMouseOut={(e) => e.currentTarget.style.boxShadow = 'none'}
          >
            <div>
              {/* Encabezado Ficha: Disciplina + Evidencia */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '6px' }}>
                <span style={{
                  background: 'rgba(152,117,87,0.08)',
                  color: '#987557',
                  fontSize: '0.65rem',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  padding: '3px 8px',
                  borderRadius: '4px',
                }}>
                  {study.area}
                </span>
                {getEvidenceBadge(study.evidence)}
              </div>

              {/* Título de la Ficha */}
              <h4 style={{
                fontFamily: 'Cormorant Garamond, serif',
                fontSize: '1.25rem',
                fontWeight: 600,
                color: '#1C1917',
                marginBottom: '4px',
                lineHeight: 1.3,
              }}>
                {study.title}
              </h4>
              <span style={{ fontSize: '0.75rem', color: '#878179', display: 'block', marginBottom: '12px' }}>
                {study.authors} • {study.year}
              </span>

              {/* Hallazgo */}
              <div style={{ marginBottom: '14px' }}>
                <span style={{ fontSize: '0.65rem', color: '#987557', fontWeight: 600, textTransform: 'uppercase', display: 'block', marginBottom: '2px' }}>
                  Hallazgos Principales:
                </span>
                <p style={{ fontSize: '0.82rem', color: '#44403C', lineHeight: 1.4, margin: 0, fontStyle: 'italic' }}>
                  "{study.findings}"
                </p>
              </div>
            </div>

            {/* Traducción al Método */}
            <div style={{
              background: 'rgba(92,122,99,0.03)',
              borderLeft: '3px solid #5C7A63',
              padding: '10px 12px',
              borderRadius: '0 4px 4px 0',
              marginTop: 'auto',
            }}>
              <span style={{ fontSize: '0.65rem', color: '#5C7A63', fontWeight: 600, textTransform: 'uppercase', display: 'block', marginBottom: '2px' }}>
                Aplicación en el Método:
              </span>
              <p style={{ fontSize: '0.8rem', color: '#44403C', margin: 0, lineHeight: 1.3 }}>
                {study.translation}
              </p>
            </div>
          </div>
        ))}
      </div>

      {filteredStudies.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px', color: '#878179' }}>
          No hay fichas científicas para los filtros seleccionados.
        </div>
      )}

      {/* Footer explicativo */}
      <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #F0EEE9', fontSize: '0.78rem', color: '#878179', textAlign: 'left', lineHeight: 1.4 }}>
        El Método Bianchi® integra además directrices internacionales de IEQ (Indoor Environmental Quality), Biofilia (Wilson, 1984), Medicina Ambiental (WHO, 2009) y Estándares de Ergonomía Habitacional (Frida Ramstedt / ISO).
      </div>
    </div>
  );
}

export default Bibliography;
