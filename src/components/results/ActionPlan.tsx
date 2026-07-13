import { useState } from 'react';
import type { ActionItem, ActionTimeframe } from '../../types/bianchi';
import { useAppStore } from '../../store/useAppStore';

interface Props {
  items: ActionItem[];
}

export function ActionPlan({ items }: Props) {
  const { form } = useAppStore();
  const [activeTab, setActiveTab] = useState<ActionTimeframe>('today');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const [showMotorDetails, setShowMotorDetails] = useState(false);

  const handleToggleComplete = (itemId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent drawer toggle
    setCompletedIds((prev) =>
      prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]
    );
  };

  const handleToggleDrawer = (itemId: string) => {
    setExpandedId((prev) => (prev === itemId ? null : itemId));
  };

  // Filter items for current active tab
  const tabItems = items.filter((item) => item.timeframe === activeTab);

  // Find key action for current tab (prioritizes isKeyAction, fallback to first item)
  const keyAction = tabItems.find((item) => item.isKeyAction) || tabItems[0];

  // Calculate progress percentage over all action items
  const totalItems = items.length;
  const completedCount = items.filter((item) => completedIds.includes(item.id)).length;
  const progressPct = totalItems > 0 ? Math.round((completedCount / totalItems) * 100) : 0;

  // Mapping timeframe tabs
  const tabsConfig: { key: ActionTimeframe; label: string }[] = [
    { key: 'today', label: 'Hoy (30 min)' },
    { key: 'week', label: 'Esta semana' },
    { key: 'month', label: 'Este mes' },
    { key: 'project', label: '6 meses / Reformas' },
  ];

  return (
    <div className="glass-card action-plan-card" style={{ marginBottom: '40px' }}>
      <div className="mb-6">
        <span className="text-[0.65rem] uppercase tracking-[0.3em] text-[#987557] font-semibold block mb-2">Tu hoja de ruta</span>
        <h3 className="text-3xl font-light" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
          Plan de Acción del Hábitat
        </h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
          Acciones secuenciales diseñadas para transformar las alertas de tu hogar en factores de calma.
        </p>
      </div>

      {/* Collapsible Motor de Coherencia Contextual Banner */}
      <div style={{
        background: 'rgba(92,122,99,0.03)',
        border: '1px solid rgba(92,122,99,0.15)',
        borderRadius: '8px',
        padding: '12px 16px',
        marginBottom: '24px',
        textAlign: 'left',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
          <span style={{ fontSize: '0.85rem', color: '#5C7A63', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <span>✅</span> Recomendaciones validadas para tu realidad habitacional.
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
            {showMotorDetails ? 'Ocultar capas de validación' : 'Ver capas de coherencia'}
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
              <strong>🌐 Capa Espacial:</strong> Recomendaciones generadas exclusivamente para tus {form.selectedRooms.length} ambientes seleccionados.
            </div>
            <div>
              <strong>📐 Capa Física:</strong> Calibrado según variables de luz natural y aislamiento acústico registradas.
            </div>
            <div>
              <strong>👥 Capa Humana:</strong> Adaptado para un hogar de permanencia {form.hoursAtHome.toLowerCase()} y adaptado para la presencia de mascotas.
            </div>
            <div>
              <strong>🎯 Capa de Objetivo:</strong> Priorizando tu búsqueda de calmar la emoción de {form.predominantEmotion.toLowerCase()} y sintonizar con bienestar.
            </div>
            <div>
              <strong>🔑 Capa de Restricción:</strong> Filtrado bajo tu tenencia jurídica en <strong>{form.housingStatus}</strong> (excluyendo obras estructurales no viables).
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
            Hacer esta microacción de ⏱️ {keyAction.estimatedMinutes} min podría mejorar aproximadamente un <strong>{keyAction.impactPercent}%</strong> tu bienestar habitacional global.
          </div>
        </div>
      )}

      {/* Progress Bar */}
      <div className="action-plan-progress-wrapper">
        <div className="ap-progress-info">
          <span>Progreso del Plan de Acción</span>
          <span>{progressPct}%</span>
        </div>
        <div className="ap-progress-bar-bg">
          <div
            className="ap-progress-bar-fill"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="tabs-actions mb-6 overflow-x-auto whitespace-nowrap">
        {tabsConfig.map((tab) => (
          <button
            key={tab.key}
            onClick={() => {
              setActiveTab(tab.key);
              setExpandedId(null); // Reset details drawer
            }}
            className={`tab-action-btn ${activeTab === tab.key ? 'active' : ''}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Collapsible Checklist Items */}
      <div className="checklist-items">
        {tabItems.length === 0 ? (
          <p style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            No hay tareas pendientes en este plazo.
          </p>
        ) : (
          tabItems.map((item) => {
            const isCompleted = completedIds.includes(item.id);
            const isExpanded = expandedId === item.id;
            const prio = item.isKeyAction ? 1 : 2; // Default mock prio
            const prioClass = prio === 1 ? 'prio-1-badge' : 'prio-2-badge';
            const prioLbl = prio === 1 ? 'Prioridad 1' : 'Prioridad 2';

            return (
              <div
                key={item.id}
                className={`check-item-container ${isCompleted ? 'completed' : ''} ${isExpanded ? 'expanded' : ''}`}
              >
                <div className="check-item-header" onClick={() => handleToggleDrawer(item.id)}>
                  <input
                    type="checkbox"
                    checked={isCompleted}
                    onChange={() => {}} // Controlled by onClick to prevent React double events
                    onClick={(e) => handleToggleComplete(item.id, e)}
                  />

                  <div className="check-item-title-row">
                    <span className="check-item-title">{item.title}</span>
                    <span className="check-item-meta">
                      {item.room} {item.estimatedMinutes ? `| ⏱️ ${item.estimatedMinutes} min` : ''}
                    </span>
                  </div>

                  <span className={`check-prio-badge ${prioClass}`}>{prioLbl}</span>
                </div>

                <div className="check-item-drawer">
                  <div className="check-item-drawer-content">
                    <p style={{ marginBottom: '10px', color: 'var(--text-charcoal)', fontSize: '0.9rem' }}>
                      {item.description}
                    </p>
                    <div style={{ fontSize: '0.8rem', color: '#5C7A63', fontWeight: 500, marginBottom: '6px' }}>
                      📈 Impacto estimado: Ventilar e intervenir esto mejorará aproximadamente un {item.impactPercent}% tu bienestar habitacional global.
                    </div>
                    <strong>Impacto esperado sobre tu sistema nervioso:</strong>
                    <ul className="impact-list">
                      {item.expectedImpact.map((imp, idx) => (
                        <li key={idx}>✓ {imp.toLowerCase()}</li>
                      ))}
                    </ul>
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
