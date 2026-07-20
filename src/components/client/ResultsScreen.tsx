import { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { getStatusConfig, getIbbhStatus, getNumericRoomEval } from '../../utils/ibbhCalculator';
import { Button } from '../ui/Button';
import { RadarChart } from '../results/RadarChart';
import { FloorPlan } from '../results/FloorPlan';
import { ActionPlan } from '../results/ActionPlan';
import { PulsoDelHogar } from '../results/PulsoDelHogar';
import { Bibliography } from '../results/Bibliography';
import { Download, RefreshCw, Sparkles, BookOpen } from 'lucide-react';
import type { DimensionScores } from '../../types/bianchi';

export function ResultsScreen() {
  const { currentClient, setClientScreen, resetForm, completedActionIds, form, updateForm, setWizardStep } = useAppStore();
  const [showBibliography, setShowBibliography] = useState(false);
  const [showEvolucion, setShowEvolucion] = useState(false);

  // Helper to calculate room specific score
  const getRoomSpecificScore = (roomName: string): number => {
    const roomEval = getNumericRoomEval(form.roomEvaluations[roomName]);
    return Math.round(((roomEval.feel + roomEval.light + roomEval.order) / 15) * 100);
  };

  const getRoomIcon = (room: string): string => {
    const icons: Record<string, string> = {
      'Dormitorio Principal': '🛌',
      'Cocina': '🍳',
      'Living': '🛋️',
      'Escritorio': '💻',
      'Entrada': '🚪',
      'Baño': '🚿',
      'Comedor': '🍽️',
      'Dormitorio Infantil': '🧸',
      'Playroom': '🎮',
      'Vestidor': '👗',
      'Lavadero': '🧺',
      'Pasillo / Distribuidor': '🧱',
      'Patio / Balcón': '🌿'
    };
    return icons[room] || '🏠';
  };

  const handleStartRoomAssessment = (roomName: string) => {
    const currentSelected = form.selectedRooms || [];
    const newSelected = Array.from(new Set([...currentSelected, roomName]));
    
    updateForm({ 
      targetRoom: roomName,
      selectedRooms: newSelected
    });
    setWizardStep(4);
    setClientScreen('wizard');
  };

  const ALL_CHECKLIST_ROOMS = [
    'Dormitorio Principal',
    'Cocina',
    'Living',
    'Escritorio',
    'Entrada',
    'Baño',
    'Comedor',
    'Dormitorio Infantil',
    'Playroom',
    'Vestidor',
    'Lavadero',
    'Pasillo / Distribuidor',
    'Patio / Balcón'
  ];

  if (!currentClient) {
    return null;
  }

  // Calculate dynamic IBBH score based on completed actions
  const completedItems = currentClient.actionItems.filter(item => completedActionIds.includes(item.id));
  const totalImpact = completedItems.reduce((acc, item) => acc + (item.impactPercent || 5), 0);
  const dynamicIbbh = Math.min(100, currentClient.ibbh + totalImpact);
  const dynamicStatus = getIbbhStatus(dynamicIbbh);

  const statusConfig = getStatusConfig(dynamicStatus);
  const firstName = currentClient.name.split(' ')[0];

  const handlePrint = () => window.print();

  const handleRestart = () => {
    resetForm();
    setClientScreen('welcome');
  };

  // Maps status to humanized category labels
  const statusLabels: Record<string, string> = {
    'regenerativo': 'Hábitat Regenerativo',
    'saludable': 'Hábitat Saludable',
    'funcional': 'Hábitat Funcional',
    'vulnerable': 'Hábitat en Transición',
    'exigente': 'Hábitat Exigente',
  };

  const statusBadgeClass = `ibbh-status-badge status-${dynamicStatus}`;
  const statusLabelText = statusLabels[dynamicStatus] || 'Hábitat Funcional';

  // Helper to extract 3 dynamic strengths based on dimension scores
  const getHomeStrengths = (dimensions: DimensionScores) => {
    const list = [];
    
    if (dimensions['Calidad Ambiental'] >= 60) {
      list.push({
        title: 'Tu casa tiene buena luz y condiciones que hacen más agradable el día a día',
        desc: 'Tenés buenas bases de iluminación natural y protección contra ruidos molestos, lo que ayuda a sostener tu energía diaria.'
      });
    } else {
      list.push({
        title: 'Potencial de Luz Natural',
        desc: 'La distribución de tus ventanas principales es un recurso clave para optimizar la luminosidad del espacio.'
      });
    }

    if (dimensions['Identidad y Pertenencia'] >= 60) {
      list.push({
        title: 'Tu casa refleja quién sos hoy',
        desc: 'Tus ambientes tienen detalles y objetos que te pertenecen emocionalmente, sirviendo como un anclaje de seguridad y pertenencia.'
      });
    }

    if (dimensions['Orden'] >= 60) {
      list.push({
        title: 'La organización de tu casa te ayuda a sentir mayor tranquilidad visual',
        desc: 'La disposición de las cosas reduce el desorden a la vista, dándole un respiro diario a tu atención sin sobrecargarte.'
      });
    }

    if (dimensions['Biofilia'] >= 60) {
      list.push({
        title: 'La presencia de naturaleza te ayuda a relajar la mente',
        desc: 'Las plantas de tu casa y las vistas que tenés hacia el exterior ayudan a que tu cuerpo regule el estrés de forma natural.'
      });
    }

    if (dimensions['Funcionalidad'] >= 60) {
      list.push({
        title: 'Los recorridos de tu casa son cómodos y fáciles de transitar',
        desc: 'Los pasos libres de obstáculos entre los ambientes te permiten moverte sin esfuerzo en tus rutinas cotidianas.'
      });
    }

    // Default fallbacks to ensure we always have exactly 3 strengths
    if (list.length < 3) {
      list.push({
        title: 'Un rincón de pausa con gran potencial',
        desc: 'Tu casa cuenta con espacios ideales que, mediante pequeños ajustes, pueden convertirse en verdaderos refugios de descanso.'
      });
    }

    return list.slice(0, 3);
  };

  const strengths = getHomeStrengths(currentClient.dimensions);

  // Helper for Radar AI summary text
  const getRadarSummaryText = (dimensions: DimensionScores) => {
    const sorted = Object.entries(dimensions).sort((a, b) => b[1] - a[1]);
    const highest = sorted.slice(0, 2).map(([k]) => k.split(' ')[0].toLowerCase()).join(' y ');
    const lowest = sorted.slice(-2).map(([k]) => k.split(' ')[0].toLowerCase()).join(' y ');
    return `Tus principales fortalezas en el perfil habitacional son ${highest}. Las mayores oportunidades de optimización aparecen en las áreas de ${lowest}.`;
  };

  return (
    <div style={{ 
      maxWidth: '1360px', 
      margin: '0 auto', 
      padding: '0 clamp(1rem, 5vw, 3rem)',
      paddingTop: '40px',
      paddingBottom: '60px'
    }}>

      {/* ── 1. TU RESULTADO (Score & Narrative) ────────────────── */}
      <div className="dashboard-header" style={{ marginBottom: '40px' }}>
        <span className="dashboard-intro-label" style={{ letterSpacing: '0.25em' }}>
          Tu Diagnóstico de Bienestar Habitacional
        </span>
        <h2 style={{ fontSize: 'clamp(2rem, 3.5vw, 2.8rem)', fontWeight: 300, marginBottom: '6px' }}>
          El Mapa de Habitar de {firstName}
        </h2>
        
        {/* Photo vs Answer Indicator Badge */}
        {(() => {
          const hasPhotos = currentClient.photos && currentClient.photos.some(p => p.url !== '/bianchi_interior.png' && p.url && !p.url.includes('undefined'));
          return hasPhotos ? (
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(92, 122, 99, 0.08)',
              color: '#3A4F3F',
              border: '1px solid rgba(92, 122, 99, 0.2)',
              padding: '6px 14px',
              borderRadius: '20px',
              fontSize: '0.76rem',
              fontWeight: 550,
              marginTop: '10px'
            }}>
              👁️ Diagnóstico enriquecido con observaciones visuales de tus fotos
            </div>
          ) : (
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(152, 117, 87, 0.06)',
              color: '#6E6A63',
              border: '1px solid rgba(152, 117, 87, 0.15)',
              padding: '6px 14px',
              borderRadius: '20px',
              fontSize: '0.76rem',
              fontWeight: 550,
              marginTop: '10px'
            }}>
              📝 Diagnóstico basado en tus respuestas del cuestionario
            </div>
          );
        })()}
      </div>

      {/* Personalized Narrative (Warm & Humanized) */}
      <div className="narrative-block" style={{ marginBottom: '40px' }}>
        <div className="narrative-block-label">Un mensaje para vos</div>
        <p className="narrative-block-text" style={{ fontSize: '1.05rem', lineHeight: 1.6 }}>
          {currentClient.narrativeText}
        </p>
      </div>

      {/* General and Room IBBH Scores */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '24px',
        marginBottom: '50px'
      }}>
        {/* General Home IBBH Card */}
        <div className="ibbh-score-display" style={{ margin: 0, height: '100%' }}>
          <div className="ibbh-container-outer" style={{ padding: '20px' }}>
            <div className="ibbh-circle" style={{ width: '90px', height: '90px' }}>
              <div className="ibbh-circle-ring"></div>
              <span className="ibbh-number" style={{ fontSize: '2rem' }}>{dynamicIbbh}</span>
              <span className="ibbh-label" style={{ fontSize: '0.6rem' }}>GENERAL</span>
            </div>

            <div className="ibbh-right-info" style={{ gap: '2px' }}>
              <div className={statusBadgeClass} style={{ fontSize: '0.72rem', padding: '3px 8px' }}>{statusLabelText}</div>
              <span className="ibbh-over-label" style={{ fontSize: '0.7rem' }}>IBBH General del Hogar</span>
              <span className="ibbh-over-100" style={{ fontStyle: 'normal', fontSize: '0.78rem', lineHeight: 1.3 }}>
                {dynamicIbbh >= 75
                  ? '¡Tu hogar te está cuidando bien!'
                  : dynamicIbbh >= 60
                  ? 'Tu espacio tiene una base sólida. Hay margen real de mejora.'
                  : 'Encontramos oportunidades concretas para que tu casa te cuide mejor.'}
              </span>
            </div>
          </div>
          <div className="ibbh-message-box" style={{ fontSize: '1.1rem', marginTop: '8px', padding: '10px' }}>
            "{statusConfig.message}"
          </div>
        </div>

        {/* Room Specific Scores & Key Improvements Card */}
        <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600, color: '#987557', margin: 0 }}>
            Puntajes por Ambiente Evaluado
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto', maxHeight: '140px' }}>
            {currentClient.selectedRooms.map((room) => {
              const score = getRoomSpecificScore(room);
              let rStatus = 'saludable';
              if (score >= 90) rStatus = 'regenerativo';
              else if (score >= 75) rStatus = 'saludable';
              else if (score >= 60) rStatus = 'funcional';
              else if (score >= 40) rStatus = 'vulnerable';
              else rStatus = 'exigente';
              
              const labelMap: Record<string, string> = {
                regenerativo: 'Regenerativo',
                saludable: 'Saludable',
                funcional: 'Funcional',
                vulnerable: 'En Transición',
                exigente: 'Exigente'
              };

              return (
                <div key={room} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', padding: '6px 0', borderBottom: '1px solid #FAF9F6' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 550 }}>
                    <span>{getRoomIcon(room)}</span> {room}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '0.72rem', padding: '2px 6px', borderRadius: '4px', background: rStatus === 'regenerativo' || rStatus === 'saludable' ? '#EAEFEA' : '#FDF6ED', color: rStatus === 'regenerativo' || rStatus === 'saludable' ? '#3B5943' : '#8A5C2E' }}>
                      {labelMap[rStatus]}
                    </span>
                    <strong style={{ fontSize: '0.9rem', color: '#1C1917' }}>{score}/100</strong>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Greatest Opportunity for Improvement (Lowest Room) */}
          {currentClient.selectedRooms.length > 0 && (() => {
            let lowestRoomName = '';
            let lowestScore = 101;
            currentClient.selectedRooms.forEach((r) => {
              const s = getRoomSpecificScore(r);
              if (s < lowestScore) {
                lowestScore = s;
                lowestRoomName = r;
              }
            });
            if (!lowestRoomName) return null;
            return (
              <div style={{
                background: 'rgba(180, 91, 91, 0.05)',
                border: '1px solid rgba(180, 91, 91, 0.15)',
                borderRadius: '6px',
                padding: '10px 12px',
                fontSize: '0.78rem',
                color: '#8A3232',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginTop: 'auto'
              }}>
                <span>💡</span>
                <span>
                  <strong>Mayor oportunidad de mejora:</strong> tu <strong>{lowestRoomName}</strong> ({lowestScore}/100). Es el espacio con más fricciones detectadas.
                </span>
              </div>
            );
          })()}
        </div>
      </div>

      {/* ── 2. QUÉ ESTÁ FUNCIONANDO BIEN (🌿 Fortalezas) ────────── */}
      <div className="glass-card" style={{ marginBottom: '45px', padding: '30px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
          <Sparkles size={20} style={{ color: '#5C7A63' }} />
          <h3 style={{ fontSize: '1.6rem', fontFamily: 'Cormorant Garamond, serif', fontWeight: 300, color: '#1C1917', margin: 0 }}>
            Fortalezas de tu Hogar
          </h3>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '24px', lineHeight: 1.5 }}>
          Tu casa ya cuenta con valiosos recursos espaciales y de hábitos que protegen tu mente. Estas son tus mayores virtudes actuales:
        </p>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '20px' }}>
          {strengths.map((str, idx) => (
            <div key={idx} style={{
              background: 'rgba(92, 122, 99, 0.03)',
              border: '1px solid rgba(92, 122, 99, 0.15)',
              borderRadius: '8px',
              padding: '20px',
              textAlign: 'left'
            }}>
              <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: '#5C7A63', fontWeight: 600, letterSpacing: '0.08em', display: 'block', marginBottom: '6px' }}>
                Recurso Activo
              </span>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 600, margin: '0 0 6px 0', color: 'var(--text-charcoal)' }}>
                {str.title}
              </h4>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.45 }}>
                {str.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ── 3. QUÉ PODRÍA MEJORAR (Plano + Radar + Pulso) ────────── */}
      <div className="dashboard-header" style={{ marginBottom: '24px', textAlign: 'left', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
        <h3 style={{ fontSize: '1.8rem', fontFamily: 'Cormorant Garamond, serif', fontWeight: 300, color: '#1C1917', margin: 0 }}>
          Oportunidades de Mejora y Diagnóstico
        </h3>
      </div>

      {/* Pulso del Hogar® */}
      <PulsoDelHogar dimensions={currentClient.dimensions} userName={currentClient.name} />

      {/* Main Results Grid: Radar + Architectural Map */}
      <div className="results-layout" style={{ marginBottom: '50px' }}>
        
        {/* Left Column: Radar Chart */}
        <div className="glass-card radar-card">
          <h3 style={{ fontSize: '1.4rem', marginBottom: '14px', fontWeight: 500, fontFamily: 'Jost, sans-serif', letterSpacing: '0.02em', width: '100%', textAlign: 'left' }}>
            ¿Qué encontramos?
          </h3>
          <RadarChart dimensions={currentClient.dimensions} />
          
          {/* Radar Chart Summary Text Box */}
          <div style={{
            marginTop: '20px',
            padding: '14px 16px',
            background: 'rgba(152,117,87,0.03)',
            borderRadius: '6px',
            borderLeft: '3px solid var(--brand-primary)',
            fontSize: '0.82rem',
            lineHeight: 1.45,
            color: '#44403C',
            textAlign: 'left'
          }}>
            <strong>Perfil Resumido:</strong><br />
            {getRadarSummaryText(currentClient.dimensions)}
          </div>
        </div>

        {/* Right Column: Architectural Floor Plan */}
        <div className="glass-card habitat-map-card">
          <h3 style={{ fontSize: '1.4rem', fontWeight: 500, fontFamily: 'Jost, sans-serif', letterSpacing: '0.02em', width: '100%', textAlign: 'left' }}>
            Tu mapa de la casa
          </h3>
          <p className="habitat-intro">
            Explorá el mapa interactivo de tu casa. Hacé clic en cualquier ambiente para analizar sus bloqueos y recomendaciones específicas.
          </p>
          <FloorPlan rooms={currentClient.selectedRooms} dimensions={currentClient.dimensions} />
        </div>

      </div>

      {/* ── CONSTRUÍ TU MAPA INTEGRAL (Checklist de Progreso) ── */}
      <div className="glass-card" style={{ marginBottom: '45px', padding: '30px' }}>
        <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: '#987557', fontWeight: 600, display: 'block', marginBottom: '8px', letterSpacing: '0.12em' }}>
          PASO 6 · TU PROGRESO
        </span>
        <h3 style={{ fontSize: '1.6rem', fontFamily: 'Cormorant Garamond, serif', fontWeight: 300, color: '#1C1917', margin: '0 0 12px 0' }}>
          Construí tu Mapa Integral de Bienestar Habitacional
        </h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '24px', lineHeight: 1.5 }}>
          Hoy conocimos una parte importante de tu hogar. Las casas funcionan como un sistema interconectado. Al completar el análisis de los demás ambientes, obtendrás un diagnóstico global del hogar y un mapa integral de prioridades.
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '16px',
          marginBottom: '8px'
        }}>
          {ALL_CHECKLIST_ROOMS.map((roomName) => {
            const isCompleted = currentClient.selectedRooms.includes(roomName);
            const score = isCompleted ? getRoomSpecificScore(roomName) : null;
            
            return (
              <div key={roomName} style={{
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                padding: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: isCompleted ? 'rgba(92, 122, 99, 0.03)' : '#fff',
                borderColor: isCompleted ? 'rgba(92, 122, 99, 0.2)' : 'var(--border-color)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '1.4rem' }}>
                    {getRoomIcon(roomName)}
                  </span>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 600, color: '#1C1917' }}>
                      {roomName}
                    </h4>
                    <span style={{ fontSize: '0.72rem', color: isCompleted ? '#5C7A63' : 'var(--text-muted)', fontWeight: isCompleted ? 500 : 400 }}>
                      {isCompleted 
                        ? `✅ Analizado · IBBH: ${score}/100` 
                        : '⬜ Pendiente de recorrido'}
                    </span>
                  </div>
                </div>

                {!isCompleted ? (
                  <button
                    type="button"
                    onClick={() => handleStartRoomAssessment(roomName)}
                    className="choice-pill-btn"
                    style={{
                      padding: '6px 12px',
                      fontSize: '0.76rem',
                      borderColor: 'var(--brand-primary)',
                      color: 'var(--brand-primary)',
                      background: 'transparent',
                      fontWeight: 600,
                      borderRadius: '16px',
                      cursor: 'pointer'
                    }}
                  >
                    🔍 Recorrer
                  </button>
                ) : (
                  <span style={{ fontSize: '0.74rem', color: '#5C7A63', fontWeight: 600 }}>
                    Listo
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── 4 & 5. PLAN DE ACCIÓN (La Joya + Collapsibles) ─────── */}
      <ActionPlan items={currentClient.actionItems} />
      {/* ── 6. EVOLUCIÓN ESPERADA (Colapsable) ────────────────── */}
      <div style={{ marginBottom: '45px' }}>
        <button
          type="button"
          onClick={() => setShowEvolucion(!showEvolucion)}
          style={{
            display: 'flex', alignItems: 'center', gap: '10px', background: 'none',
            border: '1px solid var(--border-color)', borderRadius: '8px', padding: '14px 20px',
            cursor: 'pointer', width: '100%', textAlign: 'left', fontFamily: 'Jost, sans-serif',
            color: 'var(--text-charcoal)', fontSize: '0.9rem', fontWeight: 500,
          }}
        >
          <span style={{ fontSize: '1rem' }}>{showEvolucion ? '▼' : '▶'}</span>
          📈 Ver tu trayecto proyectado de mejora
        </button>

        {showEvolucion && (
          <div className="glass-card" style={{ marginTop: '12px', padding: '28px' }}>
            <span className="text-[0.65rem] uppercase tracking-[0.3em] text-[#987557] font-semibold block mb-2">Proyección orientativa</span>
            <h3 style={{ fontSize: '1.5rem', fontFamily: 'Cormorant Garamond, serif', fontWeight: 300, color: '#1C1917', marginBottom: '8px' }}>
              Trayecto de Progreso
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '20px', lineHeight: 1.45 }}>
              El bienestar habitacional es un camino. Al aplicar las microacciones del plan, este es el trayecto posible para tu hogar:
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
              <div style={{ background: 'rgba(255,255,255,0.4)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.68rem', fontWeight: 600, textTransform: 'uppercase', color: 'var(--brand-primary)' }}>Hoy</span>
                  <strong style={{ fontSize: '1.2rem', color: '#B05B5B' }}>{dynamicIbbh}</strong>
                </div>
                <h4 style={{ margin: '0 0 4px 0', fontSize: '0.95rem', fontWeight: 600 }}>{statusLabelText}</h4>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.4 }}>Estado de partida relevado.</p>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.4)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.68rem', fontWeight: 600, textTransform: 'uppercase', color: 'var(--brand-primary)' }}>A los 3 meses</span>
                  <strong style={{ fontSize: '1.2rem', color: '#D9A05B' }}>{Math.min(90, dynamicIbbh + 12)}</strong>
                </div>
                <h4 style={{ margin: '0 0 4px 0', fontSize: '0.95rem', fontWeight: 600 }}>Hábitat Funcional</h4>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.4 }}>Acciones rápidas integradas. Menos desorden, más luz.</p>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.4)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.68rem', fontWeight: 600, textTransform: 'uppercase', color: 'var(--brand-primary)' }}>A los 12 meses</span>
                  <strong style={{ fontSize: '1.2rem', color: '#5C7A63' }}>{Math.min(100, Math.max(76, dynamicIbbh + 22))}</strong>
                </div>
                <h4 style={{ margin: '0 0 4px 0', fontSize: '0.95rem', fontWeight: 600 }}>Hábitat Saludable</h4>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.4 }}>Hábitos del habitar integrados y consolidados.</p>
              </div>
            </div>

            <div style={{ background: 'rgba(92,122,99,0.03)', border: '1px solid rgba(92,122,99,0.15)', borderRadius: '6px', padding: '12px 16px', marginTop: '18px', fontSize: '0.82rem', color: '#5C7A63', fontWeight: 500, textAlign: 'center' }}>
              📈 Con microacciones diarias de 5–10 minutos, tu IBBH podría mejorar entre 15 y 22 puntos.
            </div>
          </div>
        )}
      </div>

      {/* ── Call to Action Box ─────────────────────────────── */}
      <div className="glass-card report-request-panel" style={{ marginBottom: '45px' }}>
        <h3>¿Deseás profundizar en tu diagnóstico?</h3>
        <p>Podés descargar la cartilla de tu informe en PDF o agendar una consulta personalizada de neuroarquitectura y diseño con el equipo de Bianchi Estudio.</p>
        <div style={{ display: 'flex', justifySelf: 'center', gap: '16px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '16px' }}>
          <Button variant="secondary" onClick={handlePrint}>Descargar PDF</Button>
          <Button variant="primary" onClick={() => alert('Solicitud enviada a Bianchi Estudio. Se contactarán por mail para coordinar.')}>Solicitar Consulta</Button>
        </div>
      </div>

      {/* ── 7. BIBLIOGRAPHY EXPANDIBLE ─────────────────────── */}
      <div style={{ textAlign: 'center', marginTop: '30px', marginBottom: '35px' }} className="no-print">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => setShowBibliography(!showBibliography)}
          style={{ borderRadius: '30px', padding: '12px 28px', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
        >
          <BookOpen size={15} /> {showBibliography ? 'Ocultar Respaldo Científico' : '🔬 ¿Querés conocer la evidencia científica detrás de estas recomendaciones?'}
        </button>
      </div>

      {showBibliography && <Bibliography />}

      {/* ── 8. POSICIONAMIENTO EMOCIONAL FINAL ────────────────── */}
      <div style={{
        textAlign: 'center',
        maxWidth: '780px',
        margin: '60px auto 40px auto',
        padding: '30px',
        borderTop: '1px solid var(--border-color)',
        fontFamily: 'Cormorant Garamond, serif',
        fontSize: '1.3rem',
        fontStyle: 'italic',
        color: '#878179',
        lineHeight: 1.6
      }}>
        <p style={{ margin: '0 0 12px 0' }}>
          "No encontramos un problema. Encontramos una oportunidad para que tu casa te cuide mejor. No buscamos casas perfectas. Buscamos casas que acompañen mejor la vida cotidiana."
        </p>
        <strong style={{ color: 'var(--brand-primary)', fontSize: '1.05rem', fontFamily: 'Jost, sans-serif', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginTop: '14px', fontStyle: 'normal' }}>
          El objetivo no es tener una casa perfecta. El objetivo es tener una casa que te ayude a vivir mejor.
        </strong>
      </div>

      {/* Footer Actions */}
      <div className="flex flex-col sm:flex-row justify-center gap-3 mt-8 no-print">
        <Button variant="secondary" onClick={handleRestart}>
          <RefreshCw size={15} style={{ marginRight: '6px' }} /> Nueva Evaluación
        </Button>
        <Button variant="primary" onClick={handlePrint}>
          <Download size={15} style={{ marginRight: '6px' }} /> Exportar PDF
        </Button>
      </div>
    </div>
  );
}

export default ResultsScreen;
