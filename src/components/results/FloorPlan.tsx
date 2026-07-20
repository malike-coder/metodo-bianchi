import { useState, useEffect } from 'react';
import type { DimensionScores } from '../../types/bianchi';
import { useAppStore } from '../../store/useAppStore';

interface Props {
  rooms: string[];
  dimensions: DimensionScores;
}

interface RoomData {
  score: number;
  status: 'healthy' | 'warning' | 'critical';
  label: string;
  alerts: string[];
  recs: string[];
}

const ROOM_DEFAULTS: Record<string, RoomData> = {
  'Dormitorio Principal': {
    score: 35,
    status: 'critical',
    label: 'Crítico',
    alerts: ['Carga de cables visuales', 'Ruidos externos molestos'],
    recs: [
      'Remover pantallas y televisores',
      'Instalar cortina gruesa o blackout acústico',
      'Incorporar textiles en tonos arena/tierra.',
    ],
  },
  'Escritorio': {
    score: 42,
    status: 'critical',
    label: 'Crítico',
    alerts: ['Sobrecarga visual de cajas', 'Falta de biofilia activa'],
    recs: [
      'Mover archivadores antiguos fuera de la visual',
      'Colocar una planta de hoja verde redondeada cerca del monitor.',
    ],
  },
  'Baño': {
    score: 48,
    status: 'warning',
    label: 'Oportunidad de Mejora',
    alerts: ['Humedad visible leve en techo'],
    recs: [
      'Instalar plantas que absorban humedad (Helecho)',
      'Asegurar ventilación después del uso.',
    ],
  },
  'Living': {
    score: 55,
    status: 'warning',
    label: 'Oportunidad de Mejora',
    alerts: ['Baja iluminación natural por la tarde'],
    recs: [
      'Reorientar el sofá de cara a la ventana',
      'Incorporar un espejo que refleje la luz natural.',
    ],
  },
  'Entrada': {
    score: 70,
    status: 'healthy',
    label: 'Saludable',
    alerts: [],
    recs: [
      'Mantener el flujo de paso despejado',
      'Agregar una bandeja pequeña de madera para llaves.',
    ],
  },
  'Cocina': {
    score: 72,
    status: 'healthy',
    label: 'Saludable',
    alerts: [],
    recs: [
      'Limpiar superficies de trabajo diariamente',
      'Disponer condimentos cerca de zona de cocción.',
    ],
  },
  'Patio / Balcón': {
    score: 80,
    status: 'healthy',
    label: 'Saludable',
    alerts: [],
    recs: [
      'Añadir un asiento cómodo de madera',
      'Mantener las plantas regadas.',
    ],
  },
};

const BLUEPRINT_ROOMS = [
  { key: 'Dormitorio Principal', name: 'Dormitorio Principal', slotClass: 'room-slot-dormitorio', icon: '🛏️' },
  { key: 'Baño', name: 'Baño', slotClass: 'room-slot-baño', icon: '🛁' },
  { key: 'Escritorio', name: 'Escritorio', slotClass: 'room-slot-escritorio', icon: '💻' },
  { key: 'Cocina', name: 'Cocina', slotClass: 'room-slot-cocina', icon: '🍳' },
  { key: 'Living', name: 'Living', slotClass: 'room-slot-living', icon: '🛋️' },
  { key: 'Entrada', name: 'Entrada', slotClass: 'room-slot-entrada', icon: '🚪' },
  { key: 'Patio / Balcón', name: 'Patio / Balcón', slotClass: 'room-slot-patio', icon: '🌿' },
];

import { getNumericRoomEval } from '../../utils/ibbhCalculator';

export function FloorPlan({ rooms }: Props) {
  const { form } = useAppStore();
  const [selectedRoomName, setSelectedRoomName] = useState<string>('Dormitorio Principal');

  // Helper to resolve room scores and status from evaluations or defaults
  const getRoomDetails = (roomKey: string): RoomData => {
    // If we have actual evaluations from step 4
    if (form.roomEvaluations && form.roomEvaluations[roomKey]) {
      const { feel, light, order } = getNumericRoomEval(form.roomEvaluations[roomKey]);
      const score = Math.round(((feel + light + order) / 15) * 80) + 20;

      let status: 'healthy' | 'warning' | 'critical' = 'healthy';
      let label = 'Saludable';
      if (score < 45) {
        status = 'critical';
        label = 'Crítico';
      } else if (score < 70) {
        status = 'warning';
        label = 'Oportunidad de Mejora';
      }

      // Generate alert/recs dynamically
      const alerts: string[] = [];
      const recs: string[] = [];

      if (feel <= 2) {
        alerts.push('Rechazo emocional o incomodidad en el espacio');
        recs.push('Revisar la distribución espacial y añadir texturas naturales/biofilia.');
      }
      if (light <= 2) {
        alerts.push('Baja iluminación o ventilación deficiente');
        recs.push('Reorientar el mobiliario hacia la ventana o instalar blackout translúcido.');
      }
      if (order <= 2) {
        alerts.push('Sobrecarga visual y desorden acumulado');
        recs.push('Despejar superficies de trabajo y rotular cajas de guardado.');
      }

      if (recs.length === 0) {
        recs.push('Mantener las condiciones actuales de orden y luminosidad.');
      }

      return { score, status, label, alerts, recs };
    }

    // Default mock data fallback
    return ROOM_DEFAULTS[roomKey] || {
      score: 60,
      status: 'warning',
      label: 'Oportunidad de Mejora',
      alerts: [],
      recs: ['Revisar condiciones de orden y luz natural.'],
    };
  };

  // Find a suitable initial room to select
  useEffect(() => {
    const evaluatedRooms = rooms.length > 0 ? rooms : Object.keys(ROOM_DEFAULTS);
    const criticalRoom = evaluatedRooms.find(r => getRoomDetails(r).status === 'critical');
    const warningRoom = evaluatedRooms.find(r => getRoomDetails(r).status === 'warning');
    const fallbackRoom = evaluatedRooms[0] || 'Dormitorio Principal';

    setSelectedRoomName(criticalRoom || warningRoom || fallbackRoom);
  }, [rooms]);

  const activeRoomData = getRoomDetails(selectedRoomName);

  return (
    <div style={{ width: '100%' }}>
      {/* Color Legend */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '12px', flexWrap: 'wrap' }}>
        {[
          { color: '#6E8E75', dot: '🟢', label: 'Fortaleza' },
          { color: '#D9A05B', dot: '🟡', label: 'Oportunidad' },
          { color: '#B05B5B', dot: '🔴', label: 'Atención prioritaria' },
          { color: '#878179', dot: '⚪', label: 'No evaluado' },
        ].map((item) => (
          <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            <span>{item.dot}</span>
            <span>{item.label}</span>
          </div>
        ))}
      </div>
      <div className="floor-plan-layout-wrapper">
        <div className="floor-plan-container" style={{ margin: 0 }}>
          {BLUEPRINT_ROOMS.map((roomDef) => {
            const isSelected = rooms.some((r) => r.startsWith(roomDef.key.split(' ')[0]));
            const roomData = getRoomDetails(roomDef.key);

            if (isSelected) {
              const isActive = selectedRoomName === roomDef.key;
              return (
                <div
                  key={roomDef.key}
                  onClick={() => setSelectedRoomName(roomDef.key)}
                  className={`floor-plan-room ${roomData.status} ${roomDef.slotClass} ${isActive ? 'active' : ''}`}
                >
                  <div className="room-header">
                    <span className="room-title">
                      {roomDef.icon} {roomDef.key === 'Entrada' ? 'Entrada / Hall' : roomDef.key}
                    </span>
                    <span className="room-score">{roomData.score}</span>
                  </div>
                  <span className={`room-status-lbl ${roomData.status}`}>{roomData.label}</span>
                </div>
              );
            } else {
              return (
                <div
                  key={roomDef.key}
                  className={`floor-plan-room unselected ${roomDef.slotClass}`}
                >
                  <div className="room-header">
                    <span className="room-title" style={{ color: 'var(--text-muted)' }}>
                      {roomDef.icon} {roomDef.key === 'Entrada' ? 'Entrada / Hall' : roomDef.key}
                    </span>
                  </div>
                  <span className="room-status-lbl unselected">No evaluado</span>
                </div>
              );
            }
          })}
        </div>

        {/* Room Detail Drawer Panel */}
        {selectedRoomName && activeRoomData && (
          <div className="room-detail-panel" style={{ marginTop: 0 }}>
            <div className="room-detail-title">
              <span>{selectedRoomName === 'Entrada' ? 'Entrada / Hall' : selectedRoomName}</span>
              <span style={{ fontSize: '1rem', color: 'var(--brand-primary)', fontWeight: 500 }}>
                Puntaje: {activeRoomData.score}
              </span>
            </div>

            {activeRoomData.alerts.length > 0 && (
              <div className="alert-box">
                <div className="alert-box-title">Alertas Detectadas</div>
                <ul style={{ listStyleType: 'none', fontSize: '0.85rem', color: 'var(--error)', paddingLeft: 0 }}>
                  {activeRoomData.alerts.map((a, i) => (
                    <li key={i}>⚠ {a}</li>
                  ))}
                </ul>
              </div>
            )}

            <div style={{ fontSize: '0.85rem', fontWeight: 500, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px' }}>
              Recomendaciones de Diseño
            </div>
            <ul className="room-rec-list" style={{ paddingLeft: '20px' }}>
              {activeRoomData.recs.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export default FloorPlan;
