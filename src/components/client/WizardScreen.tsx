import { useState, useEffect, useRef } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { buildClientFromForm } from '../../utils/ibbhCalculator';
import { analyzeRoomPhotoWithAi } from '../../services/aiService';
import { ChevronRight, ChevronLeft, CheckCircle2, Scan, AlertCircle, Upload, Plus, Trash2 } from 'lucide-react';
import type { RoomAiAnalysis } from '../../types/bianchi';

const DEFAULT_ROOM_ICONS: Record<string, string> = {
  'Entrada': '🚪',
  'Living': '🛋️',
  'Comedor': '🍽️',
  'Cocina': '🍳',
  'Dormitorio Principal': '🛏️',
  'Dormitorio Secundario': '🧸',
  'Baño': '🛁',
  'Escritorio': '💻',
  'Lavadero': '🧺',
  'Patio / Balcón': '🌿',
  'Cochera': '🚗',
};

const STEPS = [
  { id: 1, label: 'Datos y Contexto' },
  { id: 2, label: 'Vínculo Emocional' },
  { id: 3, label: 'Tus Ambientes' },
  { id: 4, label: 'Cómo vivís cada uno' },
  { id: 5, label: 'Tu espacio en detalle' },
  { id: 6, label: 'Fotografías' },
];

const TRANSITIONS = [
  { value: 'Ninguno', label: 'Ninguno', desc: 'Sin cambios mayores.' },
  { value: 'Mudanza', label: 'Mudanza', desc: 'Nuevo espacio.' },
  { value: 'Separacion', label: 'Separación', desc: 'Reorganización vital.' },
  { value: 'Duelo', label: 'Proceso de Duelo', desc: 'Buscando contención.' },
  { value: 'NuevaEtapa', label: 'Nueva Etapa', desc: 'Renovando hábitos.' },
];

export function WizardScreen() {
  const { form, updateForm, wizardStep, setWizardStep, setClientScreen, setCurrentClient } = useAppStore();
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [slideClass, setSlideClass] = useState('slide-in-right');

  // Room carousel state for Step 4
  const [currentRoomIdx, setCurrentRoomIdx] = useState(0);

  // Scanning state for Step 6
  const [scanningRooms, setScanningRooms] = useState<Record<string, boolean>>({});
  const [scannedRooms, setScannedRooms] = useState<Record<string, RoomAiAnalysis>>(form.scannedRooms || {});

  // Local photo previews URL state
  const [photoPreviews, setPhotoPreviews] = useState<Record<string, string[]>>({});

  // Ref for scroll-to-wizard
  const wizardCardRef = useRef<HTMLDivElement>(null);

  // Custom rooms write-in
  const [customRoomName, setCustomRoomName] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customRooms, setCustomRooms] = useState<string[]>([]);

  // Cleanup blob URLs on unmount
  useEffect(() => {
    return () => {
      Object.values(photoPreviews).forEach((urls) =>
        urls.forEach((url) => URL.revokeObjectURL(url))
      );
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Initialize room evaluations when room selection changes
  useEffect(() => {
    const updatedEvals = { ...form.roomEvaluations };
    let changed = false;
    form.selectedRooms.forEach((room) => {
      if (!updatedEvals[room]) {
        updatedEvals[room] = { feel: 3, light: 3, order: 3 };
        changed = true;
      }
    });
    if (changed) updateForm({ roomEvaluations: updatedEvals });
  }, [form.selectedRooms, updateForm]);

  const scrollToCard = () => {
    if (wizardCardRef.current) {
      const top = wizardCardRef.current.getBoundingClientRect().top + window.scrollY - 110;
      window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const getRoomIcon = (room: string): string => DEFAULT_ROOM_ICONS[room] || '🏠';

  const goNext = () => {
    if (wizardStep === 1 && !form.name) {
      alert('Por favor, ingresá tu nombre para personalizar el diagnóstico.');
      return;
    }
    if (wizardStep === 3 && form.selectedRooms.length === 0) {
      alert('Seleccioná al menos un ambiente para evaluar.');
      return;
    }
    if (!completedSteps.includes(wizardStep)) {
      setCompletedSteps([...completedSteps, wizardStep]);
    }
    if (wizardStep < 6) {
      setSlideClass('slide-in-right');
      setWizardStep(wizardStep + 1);
      scrollToCard();
    } else {
      const processedClient = buildClientFromForm(form);
      setCurrentClient(processedClient);
      setClientScreen('processing');
    }
  };

  const goPrev = () => {
    if (wizardStep > 1) {
      setSlideClass('slide-in-left');
      setWizardStep(wizardStep - 1);
      scrollToCard();
    } else {
      setClientScreen('consent');
    }
  };

  const toggleRoom = (roomName: string) => {
    const isSelected = form.selectedRooms.includes(roomName);
    const newRooms = isSelected
      ? form.selectedRooms.filter((r) => r !== roomName)
      : [...form.selectedRooms, roomName];
    updateForm({ selectedRooms: newRooms });
    setCurrentRoomIdx(0);
  };

  const addCustomRoom = () => {
    const trimmed = customRoomName.trim();
    if (!trimmed) return;
    if (form.selectedRooms.includes(trimmed)) {
      alert('Este ambiente ya está agregado.');
      return;
    }
    setCustomRooms((prev) => [...prev, trimmed]);
    toggleRoom(trimmed);
    setCustomRoomName('');
    setShowCustomInput(false);
  };

  const handleRoomEvalChange = (roomName: string, field: 'feel' | 'light' | 'order', value: number) => {
    const updated = { ...form.roomEvaluations };
    const current = updated[roomName] || { feel: 3, light: 3, order: 3 };
    updated[roomName] = { ...current, [field]: value };
    updateForm({ roomEvaluations: updated });
  };

  const handlePhotoUploadAtIdx = (room: string, file: File | undefined, index: number) => {
    if (!file) return;
    const oldPreviews = photoPreviews[room] || [];
    if (oldPreviews[index]) URL.revokeObjectURL(oldPreviews[index]);
    const currentFiles = [...(form.photoFiles[room] || [])];
    currentFiles[index] = file;
    const updatedFiles = currentFiles.filter(Boolean);
    const allFiles = { ...form.photoFiles };
    allFiles[room] = updatedFiles;
    updateForm({ photoFiles: allFiles, photosUploaded: true });
    const previews = updatedFiles.map(f => URL.createObjectURL(f));
    setPhotoPreviews((prev) => ({ ...prev, [room]: previews }));
  };

  const handlePhotoRemoveAtIdx = (room: string, index: number) => {
    const oldPreviews = photoPreviews[room] || [];
    if (oldPreviews[index]) URL.revokeObjectURL(oldPreviews[index]);
    const currentFiles = [...(form.photoFiles[room] || [])];
    currentFiles.splice(index, 1);
    const allFiles = { ...form.photoFiles };
    allFiles[room] = currentFiles;
    updateForm({ photoFiles: allFiles, photosUploaded: currentFiles.length > 0 });
    const previews = currentFiles.map(f => URL.createObjectURL(f));
    setPhotoPreviews((prev) => ({ ...prev, [room]: previews }));
  };

  const handleScanRoom = async (room: string) => {
    const files = form.photoFiles[room] || [];
    setScanningRooms(prev => ({ ...prev, [room]: true }));
    if (files.length > 0) {
      const aiAnalysis = await analyzeRoomPhotoWithAi(files, room);
      if (aiAnalysis) {
        setScanningRooms(prev => ({ ...prev, [room]: false }));
        const scanResult: RoomAiAnalysis = {
          lightQuality: aiAnalysis.lightQuality,
          orderScore: aiAnalysis.orderScore,
          biophiliaScore: aiAnalysis.biophiliaScore,
          colorHarmony: aiAnalysis.colorHarmony,
          spatialBalance: aiAnalysis.spatialBalance,
          summary: aiAnalysis.summary,
          recommendations: aiAnalysis.recommendations,
        };
        setScannedRooms(prev => ({ ...prev, [room]: scanResult }));
        updateForm({ scannedRooms: { ...form.scannedRooms, [room]: scanResult } });
        const updated = { ...form.roomEvaluations };
        const current = updated[room] || { feel: 3, light: 3, order: 3 };
        updated[room] = {
          ...current,
          light: Math.min(5, Math.max(1, Math.round(aiAnalysis.lightQuality / 20))),
          order: Math.min(5, Math.max(1, Math.round(aiAnalysis.orderScore / 20))),
        };
        updateForm({ roomEvaluations: updated });
        return;
      }
    }
    const roomEval = form.roomEvaluations[room] || { feel: 3, light: 3, order: 3 };
    setTimeout(() => {
      setScanningRooms(prev => ({ ...prev, [room]: false }));
      const scanResult: RoomAiAnalysis = {
        lightQuality: Math.min(100, roomEval.light * 20 + Math.floor(Math.random() * 8)),
        orderScore: Math.min(100, roomEval.order * 20 - Math.floor(Math.random() * 6)),
        biophiliaScore: Math.min(100, (form.slideBio1 + (room === 'Patio / Balcón' ? 2 : 0)) * 20),
        colorHarmony: 75,
        spatialBalance: 80,
        summary: `Análisis simulado para ${room}. Muestra niveles estables en base a los datos ingresados.`,
        recommendations: [`Optimizar la luz en ${room}`, `Revisar circulación en ${room}`],
      };
      setScannedRooms(prev => ({ ...prev, [room]: scanResult }));
      updateForm({ scannedRooms: { ...form.scannedRooms, [room]: scanResult } });
    }, 2000);
  };

  const autoFillDemoData = () => {
    const filledForm = {
      name: 'María Eugenia Guerbi', age: '38', city: 'Buenos Aires',
      transition: 'Separacion', hoursAtHome: 'Más de 12', hasPets: 'Si',
      slideEmotional1: 2, slideEmotional2: 2, predominantEmotion: 'Incomodidad',
      desiredFeeling: 'Liviandad, contención, orden y calma',
      selectedRooms: ['Entrada', 'Living', 'Cocina', 'Dormitorio Principal', 'Baño', 'Escritorio', 'Patio / Balcón'],
      roomEvaluations: {
        'Entrada': { feel: 4, light: 3, order: 4 }, 'Living': { feel: 3, light: 2, order: 3 },
        'Cocina': { feel: 4, light: 4, order: 4 }, 'Dormitorio Principal': { feel: 1, light: 2, order: 2 },
        'Baño': { feel: 2, light: 2, order: 3 }, 'Escritorio': { feel: 2, light: 2, order: 2 },
        'Patio / Balcón': { feel: 5, light: 5, order: 5 },
      },
      slidePhys1: 3, slidePhys2: 2, hasMoisture: 'Si', hasSyntheticMaterials: 'Si',
      slideBio1: 2, slideBio2: 2, hasPauseSpace: 'No',
      slideOrd1: 3, slideOrd2: 3, hasInheritedObjects: 'Si',
      photosUploaded: true, photoFiles: {}, housingStatus: 'Alquiler', budget: 'Medio',
    };
    updateForm(filledForm);
    const mockScans: Record<string, RoomAiAnalysis> = {};
    filledForm.selectedRooms.forEach(r => {
      const ev = filledForm.roomEvaluations[r as keyof typeof filledForm.roomEvaluations];
      mockScans[r] = {
        lightQuality: Math.min(100, ev.light * 20), orderScore: Math.min(100, ev.order * 20),
        biophiliaScore: Math.min(100, filledForm.slideBio1 * 20), colorHarmony: 80, spatialBalance: 85,
        summary: `Análisis simulado para ${r}`, recommendations: [`Mejorar orden en ${r}`],
      };
    });
    setScannedRooms(mockScans);
    setCompletedSteps([1, 2, 3, 4, 5]);
    setWizardStep(6);
  };

  return (
    <div className="container" style={{ paddingTop: '0', paddingBottom: '60px' }}>

      {/* ── Sticky Progress Bar (Mobile only) ── */}
      <div className="wizard-progress-sticky no-print">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
          <span style={{ fontSize: '0.7rem', fontFamily: 'Jost, sans-serif', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600, color: 'var(--brand-primary)' }}>
            {STEPS[wizardStep - 1].label}
          </span>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Paso {wizardStep} de 6</span>
        </div>
        <div style={{ width: '100%', height: '3px', background: 'var(--border-color)', borderRadius: '2px', overflow: 'hidden' }}>
          <div style={{ height: '100%', background: 'var(--brand-primary)', transition: 'width 0.5s ease', width: `${(wizardStep / 6) * 100}%` }} />
        </div>
      </div>

      <div className="wizard-layout" style={{ paddingTop: '24px' }}>

        {/* Sidebar (Desktop only) */}
        <aside className="wizard-sidebar hidden lg:flex">
          <div className="wizard-sidebar-title">Mapa de Habitar</div>
          {STEPS.map((step) => {
            const isActive = wizardStep === step.id;
            const isCompleted = completedSteps.includes(step.id);
            return (
              <button
                key={step.id}
                onClick={() => (isCompleted || isActive ? setWizardStep(step.id) : null)}
                className={`wizard-nav-item ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
              >
                <span className="wizard-nav-indicator">
                  {isCompleted ? <CheckCircle2 size={10} /> : step.id}
                </span>
                {step.label}
              </button>
            );
          })}
        </aside>

        {/* Wizard Main Card */}
        <div ref={wizardCardRef} className={`glass-card wizard-card ${slideClass}`}>

          {/* Card Header */}
          <div className="wizard-header">
            <div>
              <p style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.2em', color: 'var(--brand-primary)', fontWeight: 600, marginBottom: '4px' }}>
                Paso {wizardStep} de 6
              </p>
              <h2 className="text-3xl font-light" style={{ fontFamily: 'Cormorant Garamond, serif', margin: 0 }}>
                {STEPS[wizardStep - 1].label}
              </h2>
            </div>
            {wizardStep === 1 && (
              <button type="button" onClick={autoFillDemoData} className="btn btn-secondary"
                style={{ fontSize: '0.7rem', padding: '8px 14px', borderRadius: '4px' }}>
                Demo
              </button>
            )}
          </div>

          <form onSubmit={(e) => e.preventDefault()}>

            {/* ── PASO 1: Datos Personales y Contexto ── */}
            {wizardStep === 1 && (
              <div className="animate-[fadeIn_0.4s_ease-out]">
                <div className="form-group">
                  <label className="form-label" htmlFor="user-name">Nombre completo</label>
                  <input type="text" id="user-name" className="form-input"
                    placeholder="Tu nombre completo" value={form.name}
                    onChange={(e) => updateForm({ name: e.target.value })} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="user-age">Edad</label>
                    <input type="number" id="user-age" className="form-input" placeholder="Tu edad"
                      value={form.age} onChange={(e) => updateForm({ age: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="user-city">Ciudad</label>
                    <input type="text" id="user-city" className="form-input" placeholder="Buenos Aires"
                      value={form.city} onChange={(e) => updateForm({ city: e.target.value })} />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Tu vivienda es</label>
                  <div className="choices-grid">
                    {[
                      { val: 'Alquiler', label: 'Alquiler' },
                      { val: 'Propio', label: 'Propia' },
                    ].map((opt) => (
                      <button key={opt.val} type="button"
                        onClick={() => updateForm({ housingStatus: opt.val })}
                        className={`choice-pill-option ${form.housingStatus === opt.val ? 'selected' : ''}`}>
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Presupuesto para mejoras</label>
                  <div className="choices-grid">
                    {[
                      { val: 'Bajo', label: 'Bajo · Reorganización' },
                      { val: 'Medio', label: 'Medio · Decoración' },
                      { val: 'Alto', label: 'Completo · Reforma' },
                    ].map((opt) => (
                      <button key={opt.val} type="button"
                        onClick={() => updateForm({ budget: opt.val })}
                        className={`choice-pill-option ${form.budget === opt.val ? 'selected' : ''}`}>
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">¿Atravesás algún cambio importante?</label>
                  <div className="choices-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))' }}>
                    {TRANSITIONS.map((opt) => (
                      <button key={opt.value} type="button"
                        onClick={() => updateForm({ transition: opt.value })}
                        className={`choice-pill-option ${form.transition === opt.value ? 'selected' : ''}`}>
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Horas en casa por día</label>
                    <div className="choices-grid" style={{ gridTemplateColumns: '1fr' }}>
                      {[
                        { val: 'Menos de 6', label: '– de 6 hs' },
                        { val: '6 a 12', label: '6 a 12 hs' },
                        { val: 'Más de 12', label: '+ de 12 hs' },
                      ].map((opt) => (
                        <button key={opt.val} type="button"
                          onClick={() => updateForm({ hoursAtHome: opt.val })}
                          className={`choice-pill-option ${form.hoursAtHome === opt.val ? 'selected' : ''}`}
                          style={{ padding: '8px 12px' }}>
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">¿Tenés mascotas?</label>
                    <div className="choices-grid" style={{ gridTemplateColumns: '1fr' }}>
                      {[
                        { val: 'Si', label: 'Sí' },
                        { val: 'No', label: 'No' },
                      ].map((opt) => (
                        <button key={opt.val} type="button"
                          onClick={() => updateForm({ hasPets: opt.val })}
                          className={`choice-pill-option ${form.hasPets === opt.val ? 'selected' : ''}`}
                          style={{ padding: '8px 12px' }}>
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── PASO 2: Vínculo Emocional con tu Casa ── */}
            {wizardStep === 2 && (
              <div className="animate-[fadeIn_0.4s_ease-out]">
                <p className="text-sm text-[#878179] mb-6">
                  El lazo emocional con tu hogar define cómo te afecta cada día. No hay respuesta correcta.
                </p>

                <div className="slider-container">
                  <div className="slider-title">¿Tu casa te representa?</div>
                  <div className="slider-desc">"¿Sentís que el espacio donde vivís refleja quién sos hoy?"</div>
                  <div className="slider-wrapper">
                    <span className="text-xs text-[#878179]">Nada</span>
                    <input type="range" min="1" max="5" value={form.slideEmotional1} className="slider-input"
                      onChange={(e) => updateForm({ slideEmotional1: parseInt(e.target.value) })} />
                    <span className="slider-val-label">{form.slideEmotional1}</span>
                  </div>
                  <p style={{ fontSize: '0.78rem', color: 'var(--brand-primary)', marginTop: '8px', fontStyle: 'italic' }}>
                    {form.slideEmotional1 <= 2 ? '⚠️ Te sentís ajeno al espacio, como de paso.' : form.slideEmotional1 === 3 ? 'Cumple su rol, aunque no te identifica del todo.' : '✨ Tu hogar habla de vos.'}
                  </p>
                </div>

                <div className="slider-container">
                  <div className="slider-title">¿Sentís calma al llegar?</div>
                  <div className="slider-desc">"¿Tu casa te recibe o te carga?"</div>
                  <div className="slider-wrapper">
                    <span className="text-xs text-[#878179]">Nada</span>
                    <input type="range" min="1" max="5" value={form.slideEmotional2} className="slider-input"
                      onChange={(e) => updateForm({ slideEmotional2: parseInt(e.target.value) })} />
                    <span className="slider-val-label">{form.slideEmotional2}</span>
                  </div>
                  <p style={{ fontSize: '0.78rem', color: 'var(--brand-primary)', marginTop: '8px', fontStyle: 'italic' }}>
                    {form.slideEmotional2 <= 2 ? '⚠️ Entrar activa tu alerta en vez de bajarte las revoluciones.' : form.slideEmotional2 === 3 ? 'Es confortable, pero no restaura.' : '✨ Tu casa es tu punto de recarga.'}
                  </p>
                </div>

                <div className="form-group">
                  <label className="form-label">¿Qué sentís cuando entrás a tu casa?</label>
                  <div className="emotion-cards-container" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                    {[
                      { val: 'Calma', title: '😌 Calma', desc: 'Alivio y refugio' },
                      { val: 'Incomodidad', title: '😐 Incomodidad', desc: 'Indiferencia sutil' },
                      { val: 'Agobio', title: '😣 Agobio', desc: 'Sobrecarga o cansancio' },
                    ].map((opt) => (
                      <div key={opt.val}
                        onClick={() => updateForm({ predominantEmotion: opt.val })}
                        className={`emotion-card-btn ${form.predominantEmotion === opt.val ? (opt.val === 'Calma' ? 'selected-calma' : opt.val === 'Incomodidad' ? 'selected-neutro' : 'selected-agobio') : ''}`}>
                        <span style={{ fontSize: '1rem', fontWeight: 600 }}>{opt.title}</span>
                        <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{opt.desc}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="desired-feeling">¿Cómo te gustaría sentirte?</label>
                  <input type="text" id="desired-feeling" className="form-input"
                    placeholder="Ej: Liviandad, calma, orden, contención..."
                    value={form.desiredFeeling}
                    onChange={(e) => updateForm({ desiredFeeling: e.target.value })} />
                </div>
              </div>
            )}

            {/* ── PASO 3: Selección de Ambientes ── */}
            {wizardStep === 3 && (
              <div className="animate-[fadeIn_0.4s_ease-out]">
                <p className="text-sm text-[#878179] mb-4">
                  Tocá los ambientes que tiene tu casa. Evaluaremos cada uno.
                </p>
                <div className="room-selector-grid">
                  {Object.keys(DEFAULT_ROOM_ICONS).map((roomKey) => {
                    const isSelected = form.selectedRooms.includes(roomKey);
                    return (
                      <button key={roomKey} type="button"
                        onClick={() => toggleRoom(roomKey)}
                        className={`room-card-option ${isSelected ? 'selected' : ''}`}>
                        <div className="room-icon-placeholder">{DEFAULT_ROOM_ICONS[roomKey]}</div>
                        <span>{roomKey === 'Entrada' ? 'Entrada' : roomKey === 'Dormitorio Principal' ? 'Dorm. Principal' : roomKey === 'Dormitorio Secundario' ? 'Dorm. Secund.' : roomKey === 'Patio / Balcón' ? 'Patio/Balcón' : roomKey}</span>
                      </button>
                    );
                  })}

                  {customRooms.map((roomKey) => {
                    const isSelected = form.selectedRooms.includes(roomKey);
                    return (
                      <button key={roomKey} type="button"
                        onClick={() => toggleRoom(roomKey)}
                        className={`room-card-option ${isSelected ? 'selected' : ''}`}>
                        <div className="room-icon-placeholder">🏠</div>
                        <span>{roomKey}</span>
                      </button>
                    );
                  })}

                  {!showCustomInput ? (
                    <button type="button" onClick={() => setShowCustomInput(true)}
                      className="room-card-option"
                      style={{ borderStyle: 'dashed', borderColor: 'var(--brand-primary)', background: 'transparent' }}>
                      <div className="room-icon-placeholder" style={{ color: 'var(--brand-primary)' }}>
                        <Plus size={18} />
                      </div>
                      <span style={{ color: 'var(--brand-primary)', fontWeight: 600 }}>Otro</span>
                    </button>
                  ) : (
                    <div className="room-card-option" style={{ gridColumn: 'span 2', flexDirection: 'column', gap: '8px', padding: '10px', background: 'rgba(255,255,255,0.8)' }}>
                      <input type="text" placeholder="Gimnasio, Playroom..."
                        value={customRoomName} onChange={(e) => setCustomRoomName(e.target.value)}
                        style={{ width: '100%', padding: '6px 8px', fontSize: '0.8rem', border: '1px solid #D6D2CA', borderRadius: '4px' }} />
                      <div style={{ display: 'flex', gap: '6px', width: '100%' }}>
                        <button type="button" onClick={addCustomRoom} className="btn btn-primary"
                          style={{ flex: 1, padding: '4px 0', fontSize: '0.72rem', borderRadius: '4px' }}>Agregar</button>
                        <button type="button" onClick={() => { setShowCustomInput(false); setCustomRoomName(''); }}
                          className="btn btn-secondary"
                          style={{ padding: '4px 8px', fontSize: '0.72rem', borderRadius: '4px' }}>✕</button>
                      </div>
                    </div>
                  )}
                </div>

                {form.selectedRooms.length > 0 && (
                  <p style={{ marginTop: '14px', fontSize: '0.78rem', color: 'var(--success)', fontWeight: 500 }}>
                    ✓ {form.selectedRooms.length} ambiente{form.selectedRooms.length > 1 ? 's' : ''} seleccionado{form.selectedRooms.length > 1 ? 's' : ''}
                  </p>
                )}
              </div>
            )}

            {/* ── PASO 4: Cómo vivís cada ambiente (Simplificado) ── */}
            {wizardStep === 4 && (
              <div className="animate-[fadeIn_0.4s_ease-out]">
                {form.selectedRooms.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px' }}>
                    <AlertCircle size={32} style={{ color: 'var(--error)', marginBottom: '10px' }} />
                    <p style={{ color: 'var(--error)', fontSize: '0.9rem' }}>
                      No seleccionaste ningún ambiente. Volvé al paso anterior.
                    </p>
                  </div>
                ) : (
                  (() => {
                    const activeRoom = form.selectedRooms[currentRoomIdx];
                    const activeEval = form.roomEvaluations[activeRoom] || { feel: 3, light: 3, order: 3 };
                    const total = form.selectedRooms.length;

                    return (
                      <div>
                        {/* Dot stepper */}
                        <div className="room-dot-stepper">
                          {form.selectedRooms.map((_, idx) => (
                            <button key={idx} type="button"
                              onClick={() => setCurrentRoomIdx(idx)}
                              className={`room-dot ${idx === currentRoomIdx ? 'active' : idx < currentRoomIdx ? 'completed' : ''}`}
                              aria-label={`Ambiente ${idx + 1}`}
                            />
                          ))}
                        </div>

                        {/* Room header */}
                        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                          <span style={{ fontSize: '1.8rem' }}>{getRoomIcon(activeRoom)}</span>
                          <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.5rem', fontWeight: 400, color: 'var(--text-charcoal)', margin: '4px 0 2px' }}>
                            {activeRoom === 'Entrada' ? 'Entrada / Hall' : activeRoom}
                          </p>
                          <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                            {currentRoomIdx + 1} de {total}
                          </p>
                        </div>

                        {/* Pregunta 1: Emoción */}
                        <div className="form-group">
                          <label className="form-label" style={{ textAlign: 'center', display: 'block' }}>
                            😊 ¿Cómo te sentís en este ambiente?
                          </label>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginTop: '8px' }}>
                            {[
                              { val: 5, label: '😌', sub: 'Calma', cls: 'selected-calma' },
                              { val: 3, label: '😐', sub: 'Neutro', cls: 'selected-neutro' },
                              { val: 1, label: '😣', sub: 'Agobio', cls: 'selected-agobio' },
                            ].map((option) => (
                              <div key={option.val}
                                onClick={() => handleRoomEvalChange(activeRoom, 'feel', option.val)}
                                className={`emotion-card-btn ${activeEval.feel === option.val ? option.cls : ''}`}
                                style={{ padding: '14px 8px' }}>
                                <span style={{ fontSize: '1.6rem' }}>{option.label}</span>
                                <span style={{ fontSize: '0.72rem', fontWeight: 500 }}>{option.sub}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Pregunta 2: Luz */}
                        <div className="form-group" style={{ marginTop: '24px' }}>
                          <label className="form-label" style={{ textAlign: 'center', display: 'block' }}>
                            ☀️ ¿Cómo es la luz natural aquí?
                          </label>
                          <div className="slider-wrapper" style={{ marginTop: '12px' }}>
                            <span className="text-xs text-[#878179]">Sombría</span>
                            <input type="range" min="1" max="5" value={activeEval.light}
                              onChange={(e) => handleRoomEvalChange(activeRoom, 'light', parseInt(e.target.value))}
                              className="slider-input" />
                            <span className="slider-val-label">{activeEval.light}</span>
                          </div>
                          <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--brand-primary)', marginTop: '8px', fontStyle: 'italic' }}>
                            {activeEval.light <= 2 ? '⚠️ Muy poca luz natural — ambiente oscuro o con ventanas pequeñas.' : activeEval.light === 3 ? 'Luz aceptable, con margen de mejora.' : '✨ Buena luminosidad natural.'}
                          </p>
                        </div>

                        {/* Navegación interna entre ambientes */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '28px', gap: '10px' }}>
                          <button type="button"
                            onClick={() => setCurrentRoomIdx(prev => Math.max(0, prev - 1))}
                            disabled={currentRoomIdx === 0}
                            className="btn btn-secondary"
                            style={{ padding: '8px 16px', fontSize: '0.75rem', opacity: currentRoomIdx === 0 ? 0.35 : 1 }}>
                            ← Anterior
                          </button>

                          {currentRoomIdx < total - 1 ? (
                            <button type="button"
                              onClick={() => setCurrentRoomIdx(prev => Math.min(total - 1, prev + 1))}
                              className="btn btn-primary"
                              style={{ padding: '8px 16px', fontSize: '0.75rem' }}>
                              Siguiente →
                            </button>
                          ) : (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--success)', fontSize: '0.82rem', fontWeight: 600 }}>
                              <CheckCircle2 size={16} /> ¡Listo!
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })()
                )}
              </div>
            )}

            {/* ── PASO 5: Tu espacio en detalle (Fusión 5+6+7) ── */}
            {wizardStep === 5 && (
              <div className="animate-[fadeIn_0.4s_ease-out]">
                <p className="text-sm text-[#878179] mb-6">
                  Algunas preguntas sobre el espacio en general. Son rápidas — un minuto más y terminamos.
                </p>

                {/* Sección A: Edificación */}
                <div style={{ marginBottom: '28px' }}>
                  <p style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--brand-primary)', fontWeight: 600, marginBottom: '14px' }}>
                    🏢 Edificación y entorno
                  </p>

                  <div className="slider-container" style={{ marginBottom: '14px' }}>
                    <div className="slider-title">Luz solar global</div>
                    <div className="slider-wrapper">
                      <span className="text-xs text-[#878179]">Poca</span>
                      <input type="range" min="1" max="5" value={form.slidePhys1} className="slider-input"
                        onChange={(e) => updateForm({ slidePhys1: parseInt(e.target.value) })} />
                      <span className="slider-val-label">{form.slidePhys1}</span>
                    </div>
                  </div>

                  <div className="slider-container" style={{ marginBottom: '14px' }}>
                    <div className="slider-title">Aislamiento del ruido</div>
                    <div className="slider-wrapper">
                      <span className="text-xs text-[#878179]">Muy ruidoso</span>
                      <input type="range" min="1" max="5" value={form.slidePhys2} className="slider-input"
                        onChange={(e) => updateForm({ slidePhys2: parseInt(e.target.value) })} />
                      <span className="slider-val-label">{form.slidePhys2}</span>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <label className="form-label" style={{ fontSize: '0.75rem' }}>¿Hay humedad o moho?</label>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        {[{ val: 'Si', label: 'Sí' }, { val: 'No', label: 'No' }].map((opt) => (
                          <button key={opt.val} type="button"
                            onClick={() => updateForm({ hasMoisture: opt.val })}
                            className={`choice-pill-option ${form.hasMoisture === opt.val ? 'selected' : ''}`}
                            style={{ flex: 1, padding: '8px 4px', fontSize: '0.82rem' }}>
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="form-label" style={{ fontSize: '0.75rem' }}>¿Predominan materiales sintéticos?</label>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        {[{ val: 'Si', label: 'Sí' }, { val: 'No', label: 'No' }].map((opt) => (
                          <button key={opt.val} type="button"
                            onClick={() => updateForm({ hasSyntheticMaterials: opt.val })}
                            className={`choice-pill-option ${form.hasSyntheticMaterials === opt.val ? 'selected' : ''}`}
                            style={{ flex: 1, padding: '8px 4px', fontSize: '0.82rem' }}>
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sección B: Biofilia */}
                <div style={{ marginBottom: '28px', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
                  <p style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--brand-primary)', fontWeight: 600, marginBottom: '14px' }}>
                    🌿 Naturaleza y biofilia
                  </p>

                  <div className="slider-container" style={{ marginBottom: '14px' }}>
                    <div className="slider-title">Plantas en tu hogar</div>
                    <div className="slider-wrapper">
                      <span className="text-xs text-[#878179]">Ninguna</span>
                      <input type="range" min="1" max="5" value={form.slideBio1} className="slider-input"
                        onChange={(e) => updateForm({ slideBio1: parseInt(e.target.value) })} />
                      <span className="slider-val-label">{form.slideBio1}</span>
                    </div>
                  </div>

                  <div className="slider-container" style={{ marginBottom: '14px' }}>
                    <div className="slider-title">Vistas hacia la naturaleza</div>
                    <div className="slider-wrapper">
                      <span className="text-xs text-[#878179]">Ninguna</span>
                      <input type="range" min="1" max="5" value={form.slideBio2} className="slider-input"
                        onChange={(e) => updateForm({ slideBio2: parseInt(e.target.value) })} />
                      <span className="slider-val-label">{form.slideBio2}</span>
                    </div>
                  </div>

                  <div>
                    <label className="form-label" style={{ fontSize: '0.75rem' }}>¿Tenés un rincón de pausa o meditación?</label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {[{ val: 'Si', label: 'Sí, lo tengo' }, { val: 'No', label: 'No tengo' }].map((opt) => (
                        <button key={opt.val} type="button"
                          onClick={() => updateForm({ hasPauseSpace: opt.val })}
                          className={`choice-pill-option ${form.hasPauseSpace === opt.val ? 'selected' : ''}`}
                          style={{ flex: 1, padding: '8px 4px', fontSize: '0.82rem' }}>
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Sección C: Orden */}
                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
                  <p style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--brand-primary)', fontWeight: 600, marginBottom: '14px' }}>
                    📦 Orden y convivencia
                  </p>

                  <div className="slider-container" style={{ marginBottom: '14px' }}>
                    <div className="slider-title">¿El orden se sostiene?</div>
                    <div className="slider-wrapper">
                      <span className="text-xs text-[#878179]">Se desarma</span>
                      <input type="range" min="1" max="5" value={form.slideOrd1} className="slider-input"
                        onChange={(e) => updateForm({ slideOrd1: parseInt(e.target.value) })} />
                      <span className="slider-val-label">{form.slideOrd1}</span>
                    </div>
                  </div>

                  <div className="slider-container" style={{ marginBottom: '14px' }}>
                    <div className="slider-title">Circulación libre entre ambientes</div>
                    <div className="slider-wrapper">
                      <span className="text-xs text-[#878179]">Obstruida</span>
                      <input type="range" min="1" max="5" value={form.slideOrd2} className="slider-input"
                        onChange={(e) => updateForm({ slideOrd2: parseInt(e.target.value) })} />
                      <span className="slider-val-label">{form.slideOrd2}</span>
                    </div>
                  </div>

                  <div>
                    <label className="form-label" style={{ fontSize: '0.75rem' }}>¿Conservás objetos heredados que te pesan tirar?</label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {[{ val: 'Si', label: 'Sí, los tengo' }, { val: 'No', label: 'No' }].map((opt) => (
                        <button key={opt.val} type="button"
                          onClick={() => updateForm({ hasInheritedObjects: opt.val })}
                          className={`choice-pill-option ${form.hasInheritedObjects === opt.val ? 'selected' : ''}`}
                          style={{ flex: 1, padding: '8px 4px', fontSize: '0.82rem' }}>
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── PASO 6: Fotografías del Hábitat (Opcional) ── */}
            {wizardStep === 6 && (
              <div className="animate-[fadeIn_0.4s_ease-out]">
                <p className="text-sm text-[#878179] mb-2">
                  Subí hasta 4 fotos por ambiente para que la IA analice luz, orden y biofilia visualmente.
                </p>
                <p style={{ fontSize: '0.75rem', color: 'var(--brand-primary)', fontWeight: 500, marginBottom: '20px' }}>
                  Este paso es opcional — podés saltarlo y continuar.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                  {form.selectedRooms.map((room) => {
                    const isScanning = scanningRooms[room];
                    const results = scannedRooms[room];
                    const roomFiles = form.photoFiles[room] || [];
                    const previews = photoPreviews[room] || [];

                    return (
                      <div key={room} style={{ background: 'rgba(255,255,255,0.4)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '20px' }}>
                        {/* Room Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                          <span style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-charcoal)' }}>
                            {getRoomIcon(room)} {room === 'Entrada' ? 'Entrada / Hall' : room}
                          </span>
                          {results ? (
                            <span style={{ fontSize: '0.7rem', color: 'var(--success)', fontWeight: 600 }}>✓ Analizado con IA</span>
                          ) : (
                            <span style={{ fontSize: '0.72rem', color: '#878179' }}>{roomFiles.length}/4 fotos</span>
                          )}
                        </div>

                        {/* Upload Grid — 4 slots */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '14px' }}>
                          {[0, 1, 2, 3].map((idx) => {
                            const hasPhoto = !!roomFiles[idx];
                            const previewUrl = previews[idx];
                            const isDisabled = isScanning || !!results;
                            return (
                              <div key={idx} className="polaroid-card" style={{ padding: '4px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', opacity: isScanning ? 0.7 : 1 }}>
                                <input type="file" accept="image/*"
                                  id={`file-input-${room}-${idx}`}
                                  disabled={isDisabled}
                                  onChange={(e) => handlePhotoUploadAtIdx(room, e.target.files?.[0], idx)}
                                  style={{ display: 'none' }} />
                                <div className="polaroid-img-wrapper"
                                  style={{ height: '80px', borderRadius: '4px', background: '#fff', border: '1px dashed #D6D2CA', cursor: isDisabled ? 'default' : 'pointer' }}
                                  onClick={() => !isDisabled && document.getElementById(`file-input-${room}-${idx}`)?.click()}>
                                  {isScanning && idx === 0 && <div className="laser-scanner-line" />}
                                  {hasPhoto && previewUrl ? (
                                    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                                      <img src={previewUrl} alt={`${room}-${idx}`}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '3px' }} />
                                      {!results && !isScanning && (
                                        <button type="button"
                                          onClick={(e) => { e.stopPropagation(); handlePhotoRemoveAtIdx(room, idx); }}
                                          style={{ position: 'absolute', top: '3px', right: '3px', background: 'rgba(239,68,68,0.9)', color: '#fff', border: 'none', borderRadius: '50%', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                                          <Trash2 size={9} />
                                        </button>
                                      )}
                                    </div>
                                  ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#878179' }}>
                                      <Upload size={12} />
                                      <span style={{ fontSize: '0.6rem', marginTop: '3px' }}>{idx + 1}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Scan / Results */}
                        {!results ? (
                          <button type="button" onClick={() => handleScanRoom(room)}
                            disabled={isScanning || roomFiles.length === 0}
                            className="btn btn-primary"
                            style={{ padding: '8px 14px', fontSize: '0.75rem', borderRadius: '6px', width: 'fit-content', gap: '6px' }}>
                            <Scan size={13} /> {isScanning ? 'Analizando...' : 'Analizar con IA →'}
                          </button>
                        ) : (
                          <div style={{ background: 'rgba(28,25,23,0.04)', border: '1px solid #D6D2CA', borderRadius: '8px', padding: '12px', fontSize: '0.82rem' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '10px', borderBottom: '1px solid #D6D2CA', paddingBottom: '8px' }}>
                              <div>
                                <span style={{ color: '#878179', fontSize: '0.7rem', display: 'block' }}>Luz</span>
                                <strong style={{ color: results.lightQuality >= 70 ? 'var(--success)' : '#D9A05B' }}>{results.lightQuality}%</strong>
                              </div>
                              <div>
                                <span style={{ color: '#878179', fontSize: '0.7rem', display: 'block' }}>Orden</span>
                                <strong style={{ color: results.orderScore >= 70 ? 'var(--success)' : '#B05B5B' }}>{results.orderScore}%</strong>
                              </div>
                              <div>
                                <span style={{ color: '#878179', fontSize: '0.7rem', display: 'block' }}>Biofilia</span>
                                <strong style={{ color: results.biophiliaScore >= 50 ? 'var(--success)' : '#878179' }}>{results.biophiliaScore}%</strong>
                              </div>
                            </div>
                            {results.summary && (
                              <p style={{ color: '#44403C', fontSize: '0.78rem', lineHeight: 1.5, margin: 0, fontStyle: 'italic' }}>
                                💡 {results.summary}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div style={{ textAlign: 'center', marginTop: '24px' }}>
                  <button type="button"
                    onClick={() => {
                      form.selectedRooms.forEach(room => {
                        if ((form.photoFiles[room] || []).length > 0 && !scannedRooms[room]) {
                          handleScanRoom(room);
                        }
                      });
                    }}
                    className="btn btn-secondary"
                    style={{ fontSize: '0.78rem', padding: '10px 18px' }}>
                    🚀 Analizar todos los ambientes con fotos
                  </button>
                </div>
              </div>
            )}

            {/* ── Bottom Actions ── */}
            <div className="wizard-actions" style={{ display: 'flex', justifyContent: 'space-between', marginTop: '36px', borderTop: '1px solid var(--border-color)', paddingTop: '18px' }}>
              <button type="button" onClick={goPrev} className="btn btn-secondary">
                <ChevronLeft size={14} style={{ marginRight: '4px' }} /> Anterior
              </button>
              <button type="button" onClick={goNext} className="btn btn-primary">
                {wizardStep === 6 ? 'Obtener mi diagnóstico' : 'Siguiente'}{' '}
                <ChevronRight size={14} style={{ marginLeft: '4px' }} />
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}

export default WizardScreen;
