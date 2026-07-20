import { useState, useEffect } from 'react';
import type { ActionItem } from '../../types/bianchi';
import { useAppStore } from '../../store/useAppStore';

interface Props {
  items: ActionItem[];
}

const DID_YOU_KNOW_DATABASE: Record<string, string> = {
  'Entrada': '¿Sabías que los espacios ordenados al ingresar reducen inmediatamente la carga visual y bajan los niveles de alerta al llegar a casa?',
  'Living': '¿Sabías que reorientar tus muebles para mirar hacia la luz natural ayuda a regular la atención y el descanso de forma inconsciente?',
  'Cocina': '¿Sabías que despejar las mesadas de electrodomésticos que no usás reduce la fatiga mental y promueve una mejor predisposición al cocinar?',
  'Dormitorio Principal': '¿Sabías que la luz cálida y la ausencia de pantallas favorecen la preparación natural del cuerpo para dormir profundamente?',
  'Baño': '¿Sabías que incorporar plantas en el baño ayuda a filtrar la humedad del aire y estimula la descompresión sensorial en tus rutinas?',
  'Escritorio': '¿Sabías que colocar tu escritorio a 90 grados de la ventana te permite aprovechar la luz solar sin generar reflejos molestos en tu pantalla?',
  'Patio / Balcón': '¿Sabías que observar plantas de hojas anchas durante solo 40 segundos reduce los niveles de cansancio mental acumulado en el día?'
};

export function ActionPlan({ items }: Props) {
  const { form, completedActionIds, toggleActionComplete } = useAppStore();
  const [activeLevel, setActiveLevel] = useState<'inmediata' | 'intermedia' | 'estructural'>('inmediata');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showMotorDetails, setShowMotorDetails] = useState(false);
  const [showDisciplines, setShowDisciplines] = useState<Record<string, boolean>>({});
  
  // Celebration toast state
  const [toast, setToast] = useState<{ title: string; message: string } | null>(null);

  const handleToggleComplete = (itemId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent drawer toggle
    
    const wasCompleted = completedActionIds.includes(itemId);
    
    // Trigger toast only when checking (completing)
    if (!wasCompleted) {
      const messages = [
        { title: '✨ Acción realizada', message: '¡Muy bien! Cada pequeño cambio también transforma la forma en que habitás tu casa.' },
        { title: '🌿 Nuevo hábito creado', message: 'Excelente. Tu hogar acaba de ganar un pequeño espacio de calma.' },
        { title: '🏡 Espacio recuperado', message: '¡Paso a paso, estás construyendo una mejor relación con el lugar donde vivís!' },
        { title: '⭐ Camino de calma', message: 'Qué lindo ver cómo cuidás tu lugar. Tu casa hoy te acompaña un poco mejor.' }
      ];
      
      const randomMsg = messages[Math.floor(Math.random() * messages.length)];
      setToast(randomMsg);
    }
    
    toggleActionComplete(itemId);
  };

  // Automatically clear toast after 4.5 seconds
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 4500);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleToggleDrawer = (itemId: string) => {
    setExpandedId((prev) => (prev === itemId ? null : itemId));
  };

  const toggleDisc = (itemId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDisciplines((prev) => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  // Filter items for current active level
  const tabItems = items.filter((item) => {
    if (activeLevel === 'inmediata') return item.timeframe === 'today' || item.timeframe === 'week';
    if (activeLevel === 'intermedia') return item.timeframe === 'month';
    return item.timeframe === 'project';
  });

  // Find key action for current tab (prioritizes isKeyAction, fallback to first item)
  const keyAction = tabItems.find((item) => item.isKeyAction) || tabItems[0];

  // Calculate progress percentage over all action items
  const totalItems = items.length;
  const completedCount = items.filter((item) => completedActionIds.includes(item.id)).length;
  const progressPct = totalItems > 0 ? Math.round((completedCount / totalItems) * 100) : 0;

  // Humanized progress sentence
  let progressText = 'El primer paso siempre es el más importante. ¿Comenzamos hoy?';
  if (progressPct > 0 && progressPct < 50) {
    progressText = 'Ya comenzaste el camino. Lo más difícil ya pasó: empezar.';
  } else if (progressPct >= 50 && progressPct < 100) {
    progressText = '¡Vas a mitad de camino! Tu hogar ya se siente más liviano y protector.';
  } else if (progressPct === 100) {
    progressText = '¡Excelente! Lograste completar todas las microacciones de tu plan. Tu casa hoy te cuida de verdad.';
  }

  // Mapping level tabs
  const tabsConfig = [
    { key: 'inmediata' as const, label: 'Acción Inmediata (Bajo costo / Sin obra)' },
    { key: 'intermedia' as const, label: 'Acción Intermedia (Decoración / Luz / Muebles)' },
    { key: 'estructural' as const, label: 'Acción Estructural (Proyecto / Obra)' },
  ];

  return (
    <div className="glass-card action-plan-card" style={{ marginBottom: '40px', position: 'relative' }}>
      
      {/* Celebration Toast (Float banner) */}
      {toast && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          background: '#fff',
          border: '1.5px solid #987557',
          borderRadius: '12px',
          padding: '16px 20px',
          boxShadow: '0 10px 30px rgba(152, 117, 87, 0.2)',
          zIndex: 9999,
          maxWidth: '380px',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
          animation: 'fadeInUp 0.35s cubic-bezier(0.25, 1, 0.5, 1)',
          textAlign: 'left',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 650, color: '#987557', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {toast.title}
            </span>
            <button 
              onClick={() => setToast(null)} 
              style={{ background: 'none', border: 'none', color: '#878179', cursor: 'pointer', fontSize: '0.9rem', padding: 0 }}
            >
              ✕
            </button>
          </div>
          <p style={{ fontSize: '0.88rem', color: '#1C1917', lineHeight: 1.4, margin: 0 }}>
            {toast.message}
          </p>
        </div>
      )}

      <div className="mb-6">
        <span className="text-[0.65rem] uppercase tracking-[0.3em] text-[#987557] font-semibold block mb-2">Tu hoja de ruta</span>
        <h3 className="text-3xl font-light" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
          Plan de Acción del Hábitat
        </h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
          Acciones secuenciales diseñadas para transformar las alertas de tu hogar en factores de calma y cuidado.
        </p>
      </div>

      {/* Collapsible Motor de Coherencia Contextual Banner */}
      <div style={{
        background: 'rgba(92,122,99,0.02)',
        border: '1px solid rgba(92,122,99,0.15)',
        borderRadius: '8px',
        padding: '16px 20px',
        marginBottom: '24px',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <span style={{ fontSize: '0.85rem', color: '#5C7A63', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <span>✅</span> Estas recomendaciones fueron pensadas especialmente para vos y para la forma en que vivís tu casa.
          </span>
          <button
            type="button"
            onClick={() => setShowMotorDetails(!showMotorDetails)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#987557',
              fontSize: '0.78rem',
              fontWeight: 500,
              cursor: 'pointer',
              textDecoration: 'underline',
              padding: 0,
            }}
          >
            {showMotorDetails ? 'Ocultar detalles' : '¿Cómo elegimos estas recomendaciones?'}
          </button>
        </div>

        {showMotorDetails && (
          <div style={{
            marginTop: '12px',
            paddingTop: '12px',
            borderTop: '1px solid rgba(92,122,99,0.1)',
            fontSize: '0.8rem',
            color: 'var(--text-charcoal)',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            animation: 'fadeInUp 0.3s ease-out',
          }}>
            <div>
              <strong>🏡 Adaptado a tu vivienda:</strong> Recomendaciones pensadas exclusivamente para tus {form.selectedRooms.length} ambientes seleccionados.
            </div>
            <div>
              <strong>☀️ Considera tu entorno:</strong> Ajustado según las condiciones de luz natural y el ruido que registraste.
            </div>
            <div>
              <strong>👥 Tiene en cuenta quién vive allí:</strong> Adaptado a tus horarios de permanencia ({form.hoursAtHome.toLowerCase()}) y a la presencia de mascotas.
            </div>
            <div>
              <strong>🌱 Respeta tus posibilidades reales:</strong> Filtrado para tu situación de <strong>{form.housingStatus.toLowerCase()}</strong> y el presupuesto indicado, excluyendo intervenciones no viables.
            </div>
            <div>
              <strong>✨ Sabidurías del habitar:</strong> Nutrido interpretativamente con principios tradicionales de equilibrio ambiental, refugio y flujo de energía sin imponer reglas rígidas.
            </div>
          </div>
        )}
      </div>

      {/* Highlighted Star Weekly Action (La Joya del Método) */}
      {keyAction && (
        <div className="star-action-callout" style={{ marginBottom: '30px' }}>
          <div className="star-action-badge">✨ Acción Clave de la Semana</div>
          <div className="star-action-text" style={{ fontSize: '1.25rem', fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic', fontWeight: 400 }}>
            "{keyAction.title} en el {keyAction.room}."
          </div>
          <div className="star-action-impact" style={{ fontSize: '0.82rem', marginTop: '6px', color: 'var(--text-muted)' }}>
            Hacer esta microacción de ⏱️ {keyAction.estimatedMinutes} min podría contribuir hasta un <strong>{keyAction.impactPercent}%</strong> al bienestar de tu hogar.
          </div>
        </div>
      )}

      {/* Progress Bar & Humanized sentence */}
      <div className="action-plan-progress-wrapper" style={{ marginBottom: '24px' }}>
        <div className="ap-progress-info" style={{ marginBottom: '6px', display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
          <span style={{ fontWeight: 500, color: 'var(--text-charcoal)' }}>Progreso del Plan de Acción</span>
          <span style={{ fontWeight: 600, color: '#987557' }}>{progressPct}%</span>
        </div>
        <div className="ap-progress-bar-bg" style={{ height: '8px', background: '#EAE7E1', borderRadius: '4px', overflow: 'hidden', marginBottom: '8px' }}>
          <div
            className="ap-progress-bar-fill"
            style={{ width: `${progressPct}%`, height: '100%', background: '#5C7A63', borderRadius: '4px', transition: 'width 0.8s cubic-bezier(0.25, 1, 0.5, 1)' }}
          />
        </div>
        
        {/* 11. Humanized Progress Phrase */}
        <p style={{ fontSize: '0.82rem', color: '#5C7A63', fontWeight: 550, margin: 0, fontStyle: 'italic', textAlign: 'left' }}>
          🌿 {progressText}
        </p>
      </div>

      {/* Tab Switcher */}
      <div className="tabs-actions mb-6 overflow-x-auto whitespace-nowrap">
        {tabsConfig.map((tab) => (
          <button
            key={tab.key}
            onClick={() => {
              setActiveLevel(tab.key);
              setExpandedId(null); // Reset details drawer
            }}
            className={`tab-action-btn ${activeLevel === tab.key ? 'active' : ''}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Collapsible Checklist Items */}
      <div className="checklist-items" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {tabItems.length === 0 ? (
          <p style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            No hay tareas pendientes en este plazo.
          </p>
        ) : (
          tabItems.map((item) => {
            const isCompleted = completedActionIds.includes(item.id);
            const isExpanded = expandedId === item.id;
            const prio = item.isKeyAction ? 1 : 2;
            const prioClass = prio === 1 ? 'prio-1-badge' : 'prio-2-badge';
            const prioLbl = prio === 1 ? 'Prioridad 1' : 'Prioridad 2';

            // Clean the room name to map to the DID_YOU_KNOW database
            const cleanedRoomKey = item.room.replace(' / Hall', '');
            const didYouKnowText = DID_YOU_KNOW_DATABASE[cleanedRoomKey];
            const showDKey = !!showDisciplines[item.id];

            return (
              <div
                key={item.id}
                className={`check-item-container ${isCompleted ? 'completed' : ''} ${isExpanded ? 'expanded' : ''}`}
                style={{
                  background: isCompleted ? 'rgba(92,122,99,0.02)' : '#fff',
                  border: isExpanded ? '1px solid #987557' : '1px solid #D6D2CA',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  transition: 'all 0.3s'
                }}
              >
                <div 
                  className="check-item-header" 
                  onClick={() => handleToggleDrawer(item.id)}
                  style={{
                    padding: '16px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    cursor: 'pointer',
                    userSelect: 'none'
                  }}
                >
                  <input
                    type="checkbox"
                    checked={isCompleted}
                    onChange={() => {}} // Controlled by onClick below
                    onClick={(e) => handleToggleComplete(item.id, e)}
                    style={{
                      width: '18px',
                      height: '18px',
                      cursor: 'pointer',
                      accentColor: '#987557',
                      flexShrink: 0
                    }}
                  />

                  <div className="check-item-title-row" style={{ flex: 1, textAlign: 'left' }}>
                    <span className="check-item-title" style={{ 
                      fontWeight: 500, 
                      fontSize: '0.92rem', 
                      color: isCompleted ? 'var(--text-muted)' : '#1C1917',
                      textDecoration: isCompleted ? 'line-through' : 'none'
                    }}>
                      {item.title}
                    </span>
                    <span className="check-item-meta" style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {item.room} {item.estimatedMinutes ? `| ⏱️ ${item.estimatedMinutes} min` : ''}
                    </span>
                  </div>

                  <span className={`check-prio-badge ${prioClass}`}>{prioLbl}</span>
                </div>

                {/* Collapsible content drawer */}
                <div style={{
                  maxHeight: isExpanded ? '500px' : '0px',
                  overflow: 'hidden',
                  transition: 'all 0.35s cubic-bezier(0.25, 1, 0.5, 1)',
                  background: 'rgba(152,117,87,0.01)',
                  borderTop: isExpanded ? '1px solid #EAE7E1' : 'none'
                }}>
                  <div className="check-item-drawer-content" style={{ padding: '20px 24px', textAlign: 'left' }}>
                    
                    {/* Description */}
                    <p style={{ marginBottom: '14px', color: 'var(--text-charcoal)', fontSize: '0.9rem', lineHeight: 1.5 }}>
                      {item.description}
                    </p>
                    
                    {/* 4. Emotional Benefits format */}
                    <div style={{ marginBottom: '16px' }}>
                      <strong style={{ fontSize: '0.8rem', color: '#1C1917', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '6px' }}>
                        ¿Para qué sirve? Podría ayudarte a:
                      </strong>
                      <ul className="impact-list" style={{ margin: 0, paddingLeft: '16px', fontSize: '0.82rem', color: '#57534E', lineHeight: 1.4 }}>
                        {item.expectedImpact.map((imp, idx) => (
                          <li key={idx} style={{ marginBottom: '2px' }}>✓ {imp.toLowerCase()}</li>
                        ))}
                      </ul>
                    </div>

                    {/* 8. Small teachings bubble ("¿Sabías que...?") */}
                    {didYouKnowText && (
                      <div style={{
                        background: 'rgba(152, 117, 87, 0.05)',
                        borderLeft: '3px solid #987557',
                        borderRadius: '4px',
                        padding: '10px 14px',
                        marginBottom: '16px',
                        fontSize: '0.78rem',
                        color: '#7C5E43',
                        lineHeight: 1.45
                      }}>
                        💡 <strong>¿Sabías que...?</strong><br />
                        {didYouKnowText}
                      </div>
                    )}

                    {/* 9. Small collapsible section: Why we recommend it */}
                    <div style={{ borderTop: '1px solid #EAE7E1', paddingTop: '10px', marginTop: '4px' }}>
                      <button
                        type="button"
                        onClick={(e) => toggleDisc(item.id, e)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: '#987557',
                          fontSize: '0.7rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: 0
                        }}
                      >
                        <span>{showDKey ? '▼' : '▶'}</span> ¿Por qué recomendamos esto?
                      </button>
                      {showDKey && (
                        <div style={{
                          marginTop: '6px',
                          background: '#fff',
                          border: '1px solid #EAE7E1',
                          borderRadius: '6px',
                          padding: '10px 12px',
                          fontSize: '0.72rem',
                          color: '#57534E',
                          lineHeight: 1.4,
                        }}>
                          <p style={{ margin: '0 0 4px 0', fontWeight: 550 }}>Esta recomendación considera:</p>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2px' }}>
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

                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default ActionPlan;
