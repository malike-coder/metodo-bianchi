import { useState } from 'react';
import {
  Users,
  BarChart2,
  Camera,
  Lightbulb,
  FileText,
  CheckCircle,
  XCircle,
  Pencil,
  Printer,
  Eye,
  X,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { mockClients } from '../../data/mockClients';
import { getGeminiApiKey, saveGeminiApiKey, removeGeminiApiKey } from '../../services/aiService';
import type { BianchClient, Hypothesis, IbbhStatus } from '../../types/bianchi';
import { getStatusConfig } from '../../utils/ibbhCalculator';

// ── Types ─────────────────────────────────────────────────────
type Tab = 'diagnostico' | 'fotos' | 'hipotesis' | 'informe';

// ── Status badge pill ─────────────────────────────────────────
function StatusPill({ status }: { status: IbbhStatus }) {
  const cfg = getStatusConfig(status);
  const colorMap: Record<IbbhStatus, string> = {
    regenerativo: 'rgba(16,185,129,0.12)',
    saludable: 'rgba(110,142,117,0.14)',
    funcional: 'rgba(245,158,11,0.14)',
    vulnerable: 'rgba(176,91,91,0.14)',
    exigente: 'rgba(220,38,38,0.14)',
  };
  const textMap: Record<IbbhStatus, string> = {
    regenerativo: '#065f46',
    saludable: '#3a5e41',
    funcional: '#92400e',
    vulnerable: '#7f1d1d',
    exigente: '#7f1d1d',
  };
  return (
    <span
      style={{
        background: colorMap[status],
        color: textMap[status],
        fontSize: '0.72rem',
        fontWeight: 600,
        padding: '0.25rem 0.75rem',
        borderRadius: '999px',
        whiteSpace: 'nowrap',
      }}
    >
      {cfg.label}
    </span>
  );
}

// ── Dimension progress bar ────────────────────────────────────
function DimensionBar({ label, score }: { label: string; score: number }) {
  const color =
    score >= 75 ? '#6E8E75' : score >= 55 ? '#D9A05B' : '#B05B5B';
  return (
    <div style={{ marginBottom: '0.85rem' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: '0.3rem',
        }}
      >
        <span style={{ fontSize: '0.8rem', color: '#44403C', fontWeight: 500 }}>
          {label}
        </span>
        <span style={{ fontSize: '0.78rem', color: '#878179', fontWeight: 600 }}>
          {score}
          <span style={{ color: '#D6D2CA' }}>/100</span>
        </span>
      </div>
      <div
        style={{
          height: '6px',
          background: '#E8E4DE',
          borderRadius: '999px',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${score}%`,
            height: '100%',
            background: color,
            borderRadius: '999px',
            transition: 'width 0.8s ease',
          }}
        />
      </div>
    </div>
  );
}

// ── Hypothesis card ───────────────────────────────────────────
function HypothesisCard({ hyp }: { hyp: Hypothesis }) {
  const [approval, setApproval] = useState<'approved' | 'rejected' | null>(
    hyp.approved
  );
  const [editing, setEditing] = useState(false);
  const [note, setNote] = useState('');

  return (
    <div
      style={{
        background: '#fff',
        border: '1px solid #D6D2CA',
        borderLeft: '4px solid #987557',
        borderRadius: '10px',
        padding: '1.5rem',
        marginBottom: '1rem',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: '1rem',
          marginBottom: '0.6rem',
        }}
      >
        <div style={{ flex: 1 }}>
          <div
            style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.3rem' }}
          >
            <h4
              style={{
                fontFamily: 'Cormorant Garamond, serif',
                fontSize: '1.1rem',
                color: '#1C1917',
                fontWeight: 600,
              }}
            >
              {hyp.title}
            </h4>
            {hyp.fromAi && (
              <span
                style={{
                  background: 'rgba(152,117,87,0.12)',
                  color: '#987557',
                  fontSize: '0.62rem',
                  padding: '0.15rem 0.55rem',
                  borderRadius: '999px',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                IA
              </span>
            )}
          </div>
          <p style={{ fontSize: '0.82rem', color: '#878179', lineHeight: 1.6 }}>
            {hyp.description}
          </p>
        </div>
        {/* Confidence badge */}
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <p style={{ color: '#878179', fontSize: '0.62rem', marginBottom: '0.2rem' }}>
            Confianza
          </p>
          <p
            style={{
              fontFamily: 'Cormorant Garamond, serif',
              fontSize: '1.4rem',
              color: '#987557',
              fontWeight: 700,
              lineHeight: 1,
            }}
          >
            {hyp.confidence}%
          </p>
        </div>
      </div>

      {/* Editing note */}
      {editing && (
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Añadí una nota profesional..."
          style={{
            width: '100%',
            border: '1px solid #D6D2CA',
            borderRadius: '6px',
            padding: '0.6rem 0.75rem',
            fontSize: '0.82rem',
            color: '#44403C',
            resize: 'vertical',
            minHeight: '72px',
            marginTop: '0.75rem',
            marginBottom: '0.75rem',
            fontFamily: 'inherit',
            background: 'rgba(240,238,233,0.5)',
            outline: 'none',
          }}
        />
      )}

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: '0.6rem', marginTop: '0.75rem' }}>
        <button
          onClick={() => setApproval(approval === 'approved' ? null : 'approved')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            padding: '0.4rem 0.9rem',
            borderRadius: '6px',
            fontSize: '0.78rem',
            fontWeight: 600,
            cursor: 'pointer',
            border: '1px solid',
            transition: 'all 0.15s',
            background: approval === 'approved' ? 'rgba(16,185,129,0.12)' : 'transparent',
            borderColor: approval === 'approved' ? '#6E8E75' : '#D6D2CA',
            color: approval === 'approved' ? '#3a5e41' : '#878179',
          }}
        >
          <CheckCircle size={13} /> Aprobar
        </button>
        <button
          onClick={() => setApproval(approval === 'rejected' ? null : 'rejected')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            padding: '0.4rem 0.9rem',
            borderRadius: '6px',
            fontSize: '0.78rem',
            fontWeight: 600,
            cursor: 'pointer',
            border: '1px solid',
            transition: 'all 0.15s',
            background: approval === 'rejected' ? 'rgba(176,91,91,0.1)' : 'transparent',
            borderColor: approval === 'rejected' ? '#B05B5B' : '#D6D2CA',
            color: approval === 'rejected' ? '#7f1d1d' : '#878179',
          }}
        >
          <XCircle size={13} /> Rechazar
        </button>
        <button
          onClick={() => setEditing(!editing)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            padding: '0.4rem 0.9rem',
            borderRadius: '6px',
            fontSize: '0.78rem',
            fontWeight: 600,
            cursor: 'pointer',
            border: '1px solid',
            transition: 'all 0.15s',
            background: editing ? 'rgba(152,117,87,0.08)' : 'transparent',
            borderColor: editing ? '#987557' : '#D6D2CA',
            color: editing ? '#987557' : '#878179',
          }}
        >
          <Pencil size={13} /> Editar
        </button>
      </div>
    </div>
  );
}

// ── Report preview modal ──────────────────────────────────────
function ReportModal({
  client,
  summary,
  strategy,
  onClose,
}: {
  client: BianchClient;
  summary: string;
  strategy: string;
  onClose: () => void;
}) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(28,25,23,0.55)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '2rem',
      }}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: '14px',
          width: '100%',
          maxWidth: '680px',
          maxHeight: '85vh',
          overflowY: 'auto',
          padding: '3rem',
          position: 'relative',
          boxShadow: '0 24px 80px rgba(0,0,0,0.18)',
        }}
      >
        {/* Close */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1.25rem',
            right: '1.25rem',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            color: '#878179',
            padding: '0.25rem',
          }}
        >
          <X size={20} />
        </button>

        {/* Header */}
        <p
          style={{
            color: '#987557',
            fontSize: '0.65rem',
            letterSpacing: '0.3em',
            textTransform: 'uppercase',
            fontWeight: 600,
            marginBottom: '0.6rem',
          }}
        >
          Método Bianchi® · Informe Profesional
        </p>
        <h2
          style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: '2rem',
            color: '#1C1917',
            marginBottom: '0.3rem',
          }}
        >
          {client.name}
        </h2>
        <div
          style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}
        >
          <span
            style={{
              fontFamily: 'Cormorant Garamond, serif',
              fontSize: '2.5rem',
              color: '#987557',
              fontWeight: 700,
              lineHeight: 1,
            }}
          >
            {client.ibbh}
          </span>
          <div>
            <p style={{ color: '#878179', fontSize: '0.7rem' }}>Índice IBBH</p>
            <StatusPill status={client.status} />
          </div>
        </div>

        <div style={{ height: '1px', background: '#D6D2CA', marginBottom: '1.75rem' }} />

        <h3
          style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: '1.25rem',
            color: '#1C1917',
            marginBottom: '0.6rem',
          }}
        >
          Resumen del diagnóstico
        </h3>
        <p style={{ color: '#44403C', fontSize: '0.875rem', lineHeight: 1.7, marginBottom: '2rem' }}>
          {summary || client.narrativeText || '—'}
        </p>

        <h3
          style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: '1.25rem',
            color: '#1C1917',
            marginBottom: '0.6rem',
          }}
        >
          Estrategia de intervención
        </h3>
        <p style={{ color: '#44403C', fontSize: '0.875rem', lineHeight: 1.7, marginBottom: '2rem' }}>
          {strategy || '—'}
        </p>

        {/* Print */}
        <button
          onClick={() => window.print()}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: '#987557',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            padding: '0.7rem 1.75rem',
            fontSize: '0.875rem',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          <Printer size={15} /> Imprimir / Exportar PDF
        </button>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────
export default function ProfessionalPanel() {
  const setActiveProfClient = useAppStore((s) => s.setActiveProfClient);

  const [activeTab, setActiveTab] = useState<Tab>('diagnostico');
  const [activeClientIndex, setActiveClientIndex] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [reportSummary, setReportSummary] = useState('');
  const [reportStrategy, setReportStrategy] = useState('');

  // API key configuration states
  const [apiKey, setApiKey] = useState<string | null>(getGeminiApiKey());
  const [tempKey, setTempKey] = useState('');

  const activeClient = mockClients[activeClientIndex];

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'diagnostico', label: 'Diagnóstico', icon: <BarChart2 size={14} /> },
    { id: 'fotos', label: 'Fotografías', icon: <Camera size={14} /> },
    { id: 'hipotesis', label: 'Hipótesis IA', icon: <Lightbulb size={14} /> },
    { id: 'informe', label: 'Informe', icon: <FileText size={14} /> },
  ];

  const handleClientSelect = (index: number) => {
    setActiveClientIndex(index);
    setActiveProfClient(index);
    setActiveTab('diagnostico');
  };

  return (
    <div
      style={{
        display: 'flex',
        minHeight: 'calc(100vh - 80px)',
        background: '#F0EEE9',
      }}
    >
      {/* ── SIDEBAR ──────────────────────────────────────────── */}
      <aside
        style={{
          width: '288px',
          minHeight: '100%',
          background: 'rgba(255,255,255,0.4)',
          borderRight: '1px solid #D6D2CA',
          padding: '1.75rem',
          flexShrink: 0,
        }}
      >
        {/* Studio brand */}
        <div style={{ marginBottom: '2rem' }}>
          <p
            style={{
              color: '#987557',
              fontSize: '0.65rem',
              letterSpacing: '0.3em',
              textTransform: 'uppercase',
              fontWeight: 600,
              marginBottom: '0.25rem',
            }}
          >
            Panel Profesional
          </p>
          <h2
            style={{
              fontFamily: 'Cormorant Garamond, serif',
              fontSize: '1.6rem',
              color: '#1C1917',
              lineHeight: 1.2,
            }}
          >
            Bianchi Estudio
          </h2>
        </div>

        {/* Client list header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '0.75rem',
          }}
        >
          <Users size={14} color="#878179" />
          <span
            style={{ fontSize: '0.72rem', color: '#878179', textTransform: 'uppercase', letterSpacing: '0.08em' }}
          >
            Clientes ({mockClients.length})
          </span>
        </div>

        {/* Client cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {mockClients.map((client, i) => {
            const isActive = i === activeClientIndex;
            return (
              <button
                key={client.id}
                onClick={() => handleClientSelect(i)}
                style={{
                  textAlign: 'left',
                  background: isActive ? 'rgba(152,117,87,0.08)' : '#fff',
                  border: isActive ? '1.5px solid #987557' : '1px solid #D6D2CA',
                  borderRadius: '10px',
                  padding: '0.9rem 1rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  width: '100%',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '0.35rem',
                  }}
                >
                  <span
                    style={{
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      color: isActive ? '#987557' : '#44403C',
                    }}
                  >
                    {client.name}
                  </span>
                  <span
                    style={{
                      fontFamily: 'Cormorant Garamond, serif',
                      fontSize: '1.2rem',
                      color: '#987557',
                      fontWeight: 700,
                      lineHeight: 1,
                    }}
                  >
                    {client.ibbh}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.72rem', color: '#878179' }}>
                    {client.city}
                  </span>
                  <StatusPill status={client.status} />
                </div>
              </button>
            );
          })}
        </div>

        {/* API Settings Section */}
        <div style={{ marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '1px solid #D6D2CA' }}>
          <span style={{ fontSize: '0.72rem', color: '#878179', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '0.75rem', fontWeight: 600 }}>
            ⚙️ Configuración de IA
          </span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.78rem', color: '#44403C', fontWeight: 500 }}>
              Gemini API Key:
            </label>
            <input
              type="password"
              placeholder={apiKey ? "••••••••••••••••" : "Pegar API Key aquí"}
              value={tempKey}
              onChange={(e) => setTempKey(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 10px',
                fontSize: '0.8rem',
                border: '1px solid #D6D2CA',
                borderRadius: '4px',
                background: '#fff',
                color: '#1C1917',
              }}
            />
            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                type="button"
                onClick={() => {
                  if (tempKey) {
                    saveGeminiApiKey(tempKey);
                    setApiKey(tempKey);
                    setTempKey('');
                    alert('¡API Key guardada con éxito!');
                  }
                }}
                className="btn btn-primary"
                style={{ flex: 1, padding: '8px 0', fontSize: '0.72rem', borderRadius: '4px', letterSpacing: '0.05em' }}
              >
                Guardar
              </button>
              {apiKey && (
                <button
                  type="button"
                  onClick={() => {
                    removeGeminiApiKey();
                    setApiKey(null);
                    setTempKey('');
                    alert('API Key eliminada.');
                  }}
                  className="btn btn-secondary"
                  style={{ padding: '8px 12px', fontSize: '0.72rem', borderRadius: '4px', border: '1px solid #D6D2CA' }}
                >
                  Borrar
                </button>
              )}
            </div>
            <span style={{ fontSize: '0.65rem', color: '#878179', lineHeight: 1.3, display: 'block', marginTop: '4px' }}>
              La clave se guarda localmente en tu navegador y habilita el diagnóstico con IA real en el cuestionario.
            </span>
          </div>
        </div>
      </aside>

      {/* ── MAIN CONTENT ─────────────────────────────────────── */}
      <main style={{ flex: 1, padding: '2rem 2.5rem', overflow: 'auto' }}>
        {/* Tab nav */}
        <div
          style={{
            display: 'flex',
            gap: '0.25rem',
            background: 'rgba(255,255,255,0.5)',
            border: '1px solid #D6D2CA',
            borderRadius: '10px',
            padding: '0.35rem',
            width: 'fit-content',
            marginBottom: '2rem',
          }}
        >
          {tabs.map((tab) => {
            const isActive = tab.id === activeTab;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.5rem 1.1rem',
                  borderRadius: '7px',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: 'none',
                  transition: 'all 0.15s',
                  background: isActive ? '#44403C' : 'transparent',
                  color: isActive ? '#fff' : '#878179',
                }}
              >
                {tab.icon}
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* ── TAB 1: Diagnóstico ─────────────────────────────── */}
        {activeTab === 'diagnostico' && (
          <div>
            {/* Client header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '2rem',
                marginBottom: '2rem',
                padding: '1.75rem 2rem',
                background: 'rgba(255,255,255,0.6)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: '1px solid rgba(255,255,255,0.5)',
                borderRadius: '12px',
              }}
            >
              {/* IBBH number */}
              <div style={{ textAlign: 'center', flexShrink: 0 }}>
                <p
                  style={{
                    fontFamily: 'Cormorant Garamond, serif',
                    fontSize: '4rem',
                    color: '#987557',
                    fontWeight: 300,
                    lineHeight: 1,
                    marginBottom: '0.2rem',
                  }}
                >
                  {activeClient.ibbh}
                </p>
                <p
                  style={{
                    fontSize: '0.62rem',
                    color: '#878179',
                    textTransform: 'uppercase',
                    letterSpacing: '0.15em',
                  }}
                >
                  IBBH
                </p>
              </div>

              <div style={{ flex: 1 }}>
                <h3
                  style={{
                    fontFamily: 'Cormorant Garamond, serif',
                    fontSize: '1.8rem',
                    color: '#1C1917',
                    marginBottom: '0.4rem',
                  }}
                >
                  {activeClient.name}
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <StatusPill status={activeClient.status} />
                  {activeClient.city && (
                    <span style={{ color: '#878179', fontSize: '0.8rem' }}>
                      {activeClient.city}
                    </span>
                  )}
                  {activeClient.housingType && (
                    <span style={{ color: '#878179', fontSize: '0.8rem' }}>
                      · {activeClient.housingType}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Two-column grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '1.5rem',
              }}
            >
              {/* Dimension scores */}
              <div
                style={{
                  background: 'rgba(255,255,255,0.6)',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255,255,255,0.5)',
                  borderRadius: '12px',
                  padding: '1.75rem',
                }}
              >
                <h4
                  style={{
                    fontFamily: 'Cormorant Garamond, serif',
                    fontSize: '1.2rem',
                    color: '#1C1917',
                    marginBottom: '1.25rem',
                  }}
                >
                  8 Dimensiones de Bienestar
                </h4>
                {Object.entries(activeClient.dimensions).map(([key, val]) => (
                  <DimensionBar key={key} label={key} score={val} />
                ))}
              </div>

              {/* Narrative summary */}
              <div
                style={{
                  background: 'rgba(255,255,255,0.6)',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255,255,255,0.5)',
                  borderRadius: '12px',
                  padding: '1.75rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1.25rem',
                }}
              >
                <h4
                  style={{
                    fontFamily: 'Cormorant Garamond, serif',
                    fontSize: '1.2rem',
                    color: '#1C1917',
                  }}
                >
                  Narrativa del Hábitat
                </h4>
                <p
                  style={{
                    fontFamily: 'Cormorant Garamond, serif',
                    fontStyle: 'italic',
                    fontSize: '1.05rem',
                    color: '#44403C',
                    lineHeight: 1.7,
                    flex: 1,
                  }}
                >
                  {activeClient.narrativeText ||
                    'Sin narrativa disponible para este cliente.'}
                </p>

                <div style={{ height: '1px', background: '#D6D2CA' }} />

                {/* Quick stats */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '0.75rem',
                  }}
                >
                  {[
                    { label: 'Ambientes evaluados', value: activeClient.selectedRooms.length },
                    { label: 'Acciones recomendadas', value: activeClient.actionItems.length },
                    { label: 'Hipótesis generadas', value: activeClient.hypotheses.length },
                    { label: 'Fotografías', value: activeClient.photos.length },
                  ].map((stat) => (
                    <div
                      key={stat.label}
                      style={{
                        background: 'rgba(152,117,87,0.05)',
                        border: '1px solid rgba(152,117,87,0.12)',
                        borderRadius: '8px',
                        padding: '0.75rem',
                      }}
                    >
                      <p
                        style={{
                          fontFamily: 'Cormorant Garamond, serif',
                          fontSize: '1.5rem',
                          color: '#987557',
                          fontWeight: 700,
                          lineHeight: 1,
                          marginBottom: '0.2rem',
                        }}
                      >
                        {stat.value}
                      </p>
                      <p style={{ fontSize: '0.72rem', color: '#878179' }}>{stat.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 2: Fotografías ────────────────────────────── */}
        {activeTab === 'fotos' && (
          <div>
            {/* Phase 2 notice */}
            <div
              style={{
                background: 'rgba(152,117,87,0.07)',
                border: '1px solid rgba(152,117,87,0.2)',
                borderRadius: '10px',
                padding: '1rem 1.5rem',
                marginBottom: '1.75rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
              }}
            >
              <Camera size={16} color="#987557" />
              <p style={{ fontSize: '0.82rem', color: '#987557', fontWeight: 500 }}>
                <strong>Fase 2:</strong> Aquí se conectará Gemini Vision para analizar automáticamente cada fotografía del hogar.
              </p>
            </div>

            {activeClient.photos.length === 0 ? (
              <div
                style={{
                  textAlign: 'center',
                  padding: '4rem',
                  color: '#878179',
                  fontSize: '0.9rem',
                }}
              >
                No hay fotografías cargadas para este cliente.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                {activeClient.photos.map((photo) => (
                  <div
                    key={photo.id}
                    style={{
                      background: 'rgba(255,255,255,0.6)',
                      backdropFilter: 'blur(12px)',
                      WebkitBackdropFilter: 'blur(12px)',
                      border: '1px solid rgba(255,255,255,0.5)',
                      borderRadius: '12px',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: 0,
                      }}
                    >
                      {/* Image */}
                      <div style={{ height: '260px', background: '#F0EEE9', position: 'relative' }}>
                        {photo.url ? (
                          <img
                            src={photo.url}
                            alt={photo.room}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                              display: 'block',
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              height: '100%',
                              fontSize: '2.5rem',
                              color: '#D6D2CA',
                            }}
                          >
                            📷
                          </div>
                        )}
                        {/* Room label */}
                        <div
                          style={{
                            position: 'absolute',
                            bottom: '0.75rem',
                            left: '0.75rem',
                            background: 'rgba(28,25,23,0.6)',
                            color: '#fff',
                            fontSize: '0.75rem',
                            padding: '0.25rem 0.65rem',
                            borderRadius: '999px',
                            backdropFilter: 'blur(4px)',
                          }}
                        >
                          {photo.room}
                        </div>
                      </div>

                      {/* AI Analysis */}
                      <div style={{ padding: '1.5rem' }}>
                        {photo.aiAnalysis ? (
                          <>
                            <p
                              style={{
                                color: '#987557',
                                fontSize: '0.65rem',
                                textTransform: 'uppercase',
                                letterSpacing: '0.2em',
                                fontWeight: 600,
                                marginBottom: '0.6rem',
                              }}
                            >
                              Análisis IA
                            </p>
                            <p
                              style={{
                                fontSize: '0.82rem',
                                color: '#44403C',
                                lineHeight: 1.65,
                                marginBottom: '1rem',
                              }}
                            >
                              {photo.aiAnalysis.summary}
                            </p>
                            {/* Metric badges */}
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                              {[
                                { label: 'Luz', val: photo.aiAnalysis.lightQuality },
                                { label: 'Orden', val: photo.aiAnalysis.orderScore },
                                { label: 'Biofilia', val: photo.aiAnalysis.biophiliaScore },
                                { label: 'Color', val: photo.aiAnalysis.colorHarmony },
                                { label: 'Espacial', val: photo.aiAnalysis.spatialBalance },
                              ].map((m) => (
                                <span
                                  key={m.label}
                                  style={{
                                    background: 'rgba(152,117,87,0.08)',
                                    border: '1px solid rgba(152,117,87,0.18)',
                                    borderRadius: '6px',
                                    padding: '0.25rem 0.6rem',
                                    fontSize: '0.75rem',
                                    color: '#44403C',
                                    display: 'flex',
                                    gap: '0.3rem',
                                    alignItems: 'center',
                                  }}
                                >
                                  <span style={{ color: '#878179' }}>{m.label}</span>
                                  <strong style={{ color: '#987557' }}>{m.val}</strong>
                                </span>
                              ))}
                            </div>
                          </>
                        ) : (
                          <div
                            style={{
                              height: '100%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#878179',
                              fontSize: '0.85rem',
                              textAlign: 'center',
                            }}
                          >
                            Análisis IA no disponible.
                            <br />
                            Se habilitará en Fase 2.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── TAB 3: Hipótesis IA ───────────────────────────── */}
        {activeTab === 'hipotesis' && (
          <div>
            <div style={{ marginBottom: '1.5rem' }}>
              <h3
                style={{
                  fontFamily: 'Cormorant Garamond, serif',
                  fontSize: '1.6rem',
                  color: '#1C1917',
                  marginBottom: '0.3rem',
                }}
              >
                Hipótesis de Neuroarquitectura
              </h3>
              <p style={{ color: '#878179', fontSize: '0.85rem' }}>
                Revisá, aprobá o rechazá las hipótesis generadas por el algoritmo para{' '}
                <strong style={{ color: '#44403C' }}>{activeClient.name}</strong>.
              </p>
            </div>

            {activeClient.hypotheses.length === 0 ? (
              <p style={{ color: '#878179', fontSize: '0.9rem' }}>
                No hay hipótesis generadas para este cliente.
              </p>
            ) : (
              activeClient.hypotheses.map((hyp) => (
                <HypothesisCard key={hyp.id} hyp={hyp} />
              ))
            )}
          </div>
        )}

        {/* ── TAB 4: Informe ────────────────────────────────── */}
        {activeTab === 'informe' && (
          <div>
            <div style={{ marginBottom: '1.5rem' }}>
              <h3
                style={{
                  fontFamily: 'Cormorant Garamond, serif',
                  fontSize: '1.6rem',
                  color: '#1C1917',
                  marginBottom: '0.3rem',
                }}
              >
                Generar Informe Profesional
              </h3>
              <p style={{ color: '#878179', fontSize: '0.85rem' }}>
                Redactá el informe para <strong style={{ color: '#44403C' }}>{activeClient.name}</strong>.
                Podés previsualizarlo y exportarlo a PDF.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Summary textarea */}
              <div
                style={{
                  background: 'rgba(255,255,255,0.6)',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255,255,255,0.5)',
                  borderRadius: '12px',
                  padding: '1.75rem',
                }}
              >
                <label
                  style={{
                    color: '#987557',
                    fontSize: '0.65rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.2em',
                    fontWeight: 600,
                    display: 'block',
                    marginBottom: '0.6rem',
                  }}
                >
                  Resumen del diagnóstico
                </label>
                <textarea
                  value={reportSummary}
                  onChange={(e) => setReportSummary(e.target.value)}
                  placeholder={activeClient.narrativeText || 'Escribí aquí el resumen del diagnóstico...'}
                  rows={6}
                  style={{
                    width: '100%',
                    border: '1px solid #D6D2CA',
                    borderRadius: '8px',
                    padding: '0.875rem 1rem',
                    fontSize: '0.875rem',
                    color: '#44403C',
                    lineHeight: 1.7,
                    resize: 'vertical',
                    fontFamily: 'inherit',
                    background: 'rgba(240,238,233,0.4)',
                    outline: 'none',
                  }}
                />
              </div>

              {/* Strategy textarea */}
              <div
                style={{
                  background: 'rgba(255,255,255,0.6)',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255,255,255,0.5)',
                  borderRadius: '12px',
                  padding: '1.75rem',
                }}
              >
                <label
                  style={{
                    color: '#987557',
                    fontSize: '0.65rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.2em',
                    fontWeight: 600,
                    display: 'block',
                    marginBottom: '0.6rem',
                  }}
                >
                  Estrategia de intervención
                </label>
                <textarea
                  value={reportStrategy}
                  onChange={(e) => setReportStrategy(e.target.value)}
                  placeholder="Describí la estrategia de intervención propuesta para este hábitat..."
                  rows={6}
                  style={{
                    width: '100%',
                    border: '1px solid #D6D2CA',
                    borderRadius: '8px',
                    padding: '0.875rem 1rem',
                    fontSize: '0.875rem',
                    color: '#44403C',
                    lineHeight: 1.7,
                    resize: 'vertical',
                    fontFamily: 'inherit',
                    background: 'rgba(240,238,233,0.4)',
                    outline: 'none',
                  }}
                />
              </div>

              {/* Action buttons */}
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  onClick={() => setShowModal(true)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    background: 'transparent',
                    color: '#987557',
                    border: '1.5px solid #987557',
                    borderRadius: '8px',
                    padding: '0.7rem 1.5rem',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'background 0.15s',
                  }}
                  onMouseOver={(e) =>
                    ((e.currentTarget as HTMLButtonElement).style.background = 'rgba(152,117,87,0.06)')
                  }
                  onMouseOut={(e) =>
                    ((e.currentTarget as HTMLButtonElement).style.background = 'transparent')
                  }
                >
                  <Eye size={15} /> Previsualizar informe
                </button>
                <button
                  onClick={() => window.print()}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    background: '#987557',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '0.7rem 1.5rem',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'opacity 0.15s',
                  }}
                  onMouseOver={(e) =>
                    ((e.currentTarget as HTMLButtonElement).style.opacity = '0.88')
                  }
                  onMouseOut={(e) =>
                    ((e.currentTarget as HTMLButtonElement).style.opacity = '1')
                  }
                >
                  <Printer size={15} /> Exportar PDF
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Report preview modal */}
      {showModal && (
        <ReportModal
          client={activeClient}
          summary={reportSummary}
          strategy={reportStrategy}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}
