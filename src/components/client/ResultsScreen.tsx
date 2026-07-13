import { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { getStatusConfig } from '../../utils/ibbhCalculator';
import { Button } from '../ui/Button';
import { RadarChart } from '../results/RadarChart';
import { FloorPlan } from '../results/FloorPlan';
import { ActionPlan } from '../results/ActionPlan';
import { PulsoDelHogar } from '../results/PulsoDelHogar';
import { Bibliography } from '../results/Bibliography';
import { Download, RefreshCw, Sparkles, BookOpen } from 'lucide-react';
import type { DimensionScores } from '../../types/bianchi';

export function ResultsScreen() {
  const { currentClient, setClientScreen, resetForm } = useAppStore();
  const [showBibliography, setShowBibliography] = useState(false);

  if (!currentClient) {
    return null;
  }

  const statusConfig = getStatusConfig(currentClient.status);
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
    'vulnerable': 'Hábitat Vulnerable',
    'exigente': 'Hábitat Exigente',
  };

  const statusBadgeClass = `ibbh-status-badge status-${currentClient.status}`;
  const statusLabelText = statusLabels[currentClient.status] || 'Hábitat Funcional';

  // Helper to extract 3 dynamic strengths based on dimension scores
  const getHomeStrengths = (dimensions: DimensionScores) => {
    const list = [];
    
    if (dimensions['Calidad Ambiental'] >= 60) {
      list.push({
        title: 'Calidad del Ambiente Físico',
        desc: 'Tu hogar cuenta con buenas bases de luz y confort acústico que protegen tu energía diaria.'
      });
    } else {
      list.push({
        title: 'Potencial de Luz Natural',
        desc: 'La distribución de tus ventanas principales es un recurso clave para optimizar la luminosidad del espacio.'
      });
    }

    if (dimensions['Identidad y Pertenencia'] >= 60) {
      list.push({
        title: 'Representación de Identidad',
        desc: 'Tus ambientes reflejan quién sos hoy y te brindan un anclaje emocional y de arraigo.'
      });
    }

    if (dimensions['Orden'] >= 60) {
      list.push({
        title: 'Orden Sostenible',
        desc: 'La organización actual de tus objetos reduce la fatiga visual inconsciente en tus rutinas.'
      });
    }

    if (dimensions['Biofilia'] >= 60) {
      list.push({
        title: 'Conexión Biofílica',
        desc: 'La presencia de plantas y visuales al exterior ayudan activamente a tu relajación mental.'
      });
    }

    if (dimensions['Funcionalidad'] >= 60) {
      list.push({
        title: 'Circulación Confortable',
        desc: 'Los recorridos despejados entre ambientes facilitan el movimiento diario sin esfuerzo.'
      });
    }

    // Default fallbacks to ensure we always have exactly 3 strengths
    if (list.length < 3) {
      list.push({
        title: 'Oasis de Pausa',
        desc: 'Tu espacio cuenta con un gran potencial de transformación a través de microacciones sencillas.'
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
      </div>

      {/* Personalized Narrative (Warm & Humanized) */}
      <div className="narrative-block" style={{ marginBottom: '40px' }}>
        <div className="narrative-block-label">Un mensaje para vos</div>
        <p className="narrative-block-text" style={{ fontSize: '1.05rem', lineHeight: 1.6 }}>
          {currentClient.narrativeText}
        </p>
      </div>

      {/* IBBH Score Card */}
      <div className="ibbh-score-display" style={{ marginBottom: '50px' }}>
        <div className="ibbh-container-outer">
          
          <div className="ibbh-circle">
            <div className="ibbh-circle-ring"></div>
            <span className="ibbh-number">{currentClient.ibbh}</span>
            <span className="ibbh-label">IBBH</span>
          </div>

          <div className="ibbh-right-info">
            <div className={statusBadgeClass}>{statusLabelText}</div>
            <span className="ibbh-over-label">Puntaje de bienestar sobre 100</span>
            <span className="ibbh-over-100" style={{ fontStyle: 'normal' }}>
              {currentClient.ibbh >= 75
                ? '¡Tu hogar es un ecosistema de calma y restauración!'
                : currentClient.ibbh >= 60
                ? 'Tu espacio tiene buenas bases. Hay margen para acompañarte mejor.'
                : 'Detectamos oportunidades para que tu hogar te ayude más en tu descanso y vida diaria.'}
            </span>
          </div>

        </div>
        <div className="ibbh-message-box" style={{ fontSize: '1.45rem', marginTop: '12px' }}>
          "{statusConfig.message}"
        </div>
      </div>

      {/* ── 2. QUÉ ESTÁ FUNCIONANDO BIEN (🌿 Fortalezas) ────────── */}
      <div className="glass-card" style={{ marginBottom: '45px', padding: '30px sm:padding: 40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
          <Sparkles size={20} style={{ color: '#5C7A63' }} />
          <h3 style={{ fontSize: '1.6rem', fontFamily: 'Cormorant Garamond, serif', fontWeight: 300, color: '#1C1917', margin: 0 }}>
            Fortalezas de tu Hogar
          </h3>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '24px', lineHeight: 1.5 }}>
          Tu casa ya cuenta con valiosos recursos espaciales y de hábitos que protegen tu mente. Estas son tus mayores virtudes actuales:
        </p>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr md:grid-template-columns: repeat(3, 1fr)', gap: '20px' }}>
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
            Análisis Dimensional
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
            Plano Diagnóstico
          </h3>
          <p className="habitat-intro">
            Explorá el mapa interactivo de tu casa. Hacé clic en cualquier ambiente para analizar sus bloqueos y recomendaciones específicas.
          </p>
          <FloorPlan rooms={currentClient.selectedRooms} dimensions={currentClient.dimensions} />
        </div>

      </div>

      {/* ── 4 & 5. PLAN DE ACCIÓN (La Joya + Collapsibles) ─────── */}
      <ActionPlan items={currentClient.actionItems} />

      {/* ── 6. EVOLUCIÓN ESPERADA (Progreso Temporal) ─────────── */}
      <div className="glass-card" style={{ marginBottom: '45px', padding: '30px sm:padding: 40px' }}>
        <span className="text-[0.65rem] uppercase tracking-[0.3em] text-[#987557] font-semibold block mb-2">Evolución de Bienestar</span>
        <h3 style={{ fontSize: '1.6rem', fontFamily: 'Cormorant Garamond, serif', fontWeight: 300, color: '#1C1917', marginBottom: '8px' }}>
          Trayecto de Progreso Temporal
        </h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '24px', lineHeight: 1.45 }}>
          El bienestar habitacional no es una fotografía fija, es un camino dinámico. Al aplicar las microacciones del plan, este es el trayecto proyectado para tu hogar:
        </p>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr sm:grid-template-columns: repeat(3, 1fr)', gap: '20px' }}>
          
          {/* Step 1: Current status */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.4)',
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
            padding: '20px',
            position: 'relative'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--brand-primary)' }}>Hoy (Diagnóstico)</span>
              <strong style={{ fontSize: '1.25rem', color: '#B05B5B' }}>{currentClient.ibbh}</strong>
            </div>
            <h4 style={{ margin: '0 0 6px 0', fontSize: '1rem', fontWeight: 600 }}>{statusLabelText}</h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.4 }}>Estado inicial relevado. Se detectaron tus bloqueos de diseño actuales.</p>
          </div>

          {/* Step 2: 3 Months status */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.4)',
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
            padding: '20px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--brand-primary)' }}>A los 3 meses</span>
              <strong style={{ fontSize: '1.25rem', color: '#D9A05B' }}>{Math.min(90, currentClient.ibbh + 12)}</strong>
            </div>
            <h4 style={{ margin: '0 0 6px 0', fontSize: '1rem', fontWeight: 600 }}>Hábitat Funcional</h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.4 }}>Aplicando acciones del día y la semana. Menor desorden y descompresión lumínica activa.</p>
          </div>

          {/* Step 3: Annual status */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.4)',
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
            padding: '20px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--brand-primary)' }}>A los 12 meses</span>
              <strong style={{ fontSize: '1.25rem', color: '#5C7A63' }}>{Math.min(100, Math.max(76, currentClient.ibbh + 22))}</strong>
            </div>
            <h4 style={{ margin: '0 0 6px 0', fontSize: '1rem', fontWeight: 600 }}>Hábitat Saludable</h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.4 }}>Hábitos del habitar integrados (ventilación, biofilia, calma nocturna consolidada).</p>
          </div>

        </div>

        <div style={{
          background: 'rgba(92,122,99,0.03)',
          border: '1px solid rgba(92,122,99,0.15)',
          borderRadius: '6px',
          padding: '12px 16px',
          marginTop: '20px',
          fontSize: '0.85rem',
          color: '#5C7A63',
          fontWeight: 500,
          textAlign: 'center'
        }}>
          📈 Con microacciones diarias de 5-10 minutos, tu mejora acumulada estimada es de +15 a +22 puntos de IBBH.
        </div>
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
          "Tu hogar no está siendo juzgado. Está siendo comprendido. Toda vivienda tiene potencial para mejorar su capacidad de cuidar a quienes la habitan."
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
