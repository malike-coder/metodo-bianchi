import { useState, useEffect } from 'react';
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
  { id: 1, label: 'Datos Personales y Contexto' },
  { id: 2, label: 'Relación Emocional con tu Casa' },
  { id: 3, label: 'Selección de Ambientes' },
  { id: 4, label: 'Evaluación por Ambientes' },
  { id: 5, label: 'Condiciones de la Edificación y el Entorno' },
  { id: 6, label: 'Biofilia y Naturaleza' },
  { id: 7, label: 'Orden y Carga Cognitiva' },
  { id: 8, label: 'Fotografías del Hábitat' },
];

const TRANSITIONS = [
  { value: 'Ninguno', label: 'Ninguno', desc: 'Sin cambios mayores recientemente.' },
  { value: 'Mudanza', label: 'Mudanza', desc: 'Adaptándome a un nuevo espacio.' },
  { value: 'Separacion', label: 'Separación', desc: 'Refugiándome tras un quiebre.' },
  { value: 'Duelo', label: 'Proceso de Duelo', desc: 'Buscando contención en la pérdida.' },
  { value: 'NuevaEtapa', label: 'Nueva Etapa', desc: 'Renovando mi identidad y hábitos.' },
];

export function WizardScreen() {
  const { form, updateForm, wizardStep, setWizardStep, setClientScreen, setCurrentClient } = useAppStore();
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  
  // Room carousel state for Step 4
  const [currentRoomIdx, setCurrentRoomIdx] = useState(0);

  // Polaroid scanning state for Step 8
  const [scanningRooms, setScanningRooms] = useState<Record<string, boolean>>({});
  const [scannedRooms, setScannedRooms] = useState<Record<string, RoomAiAnalysis>>(form.scannedRooms || {});
  
  // Local photo previews URL state: Record<roomName, previewUrls[]>
  const [photoPreviews, setPhotoPreviews] = useState<Record<string, string[]>>({});

  // Cleanup all blob URLs on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      Object.values(photoPreviews).forEach((urls) =>
        urls.forEach((url) => URL.revokeObjectURL(url))
      );
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Custom rooms write-in states for Step 3
  const [customRoomName, setCustomRoomName] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customRooms, setCustomRooms] = useState<string[]>([]);

  // Get active icon for a room (handling custom write-in rooms)
  const getRoomIcon = (room: string): string => {
    return DEFAULT_ROOM_ICONS[room] || '🏠';
  };

  // Initialize room evaluations when rooms selection changes
  useEffect(() => {
    const updatedEvals = { ...form.roomEvaluations };
    let changed = false;

    form.selectedRooms.forEach((room) => {
      if (!updatedEvals[room]) {
        updatedEvals[room] = { feel: 3, light: 3, order: 3 };
        changed = true;
      }
    });

    if (changed) {
      updateForm({ roomEvaluations: updatedEvals });
    }
  }, [form.selectedRooms, updateForm]);

  const goNext = () => {
    // Validation before going next
    if (wizardStep === 1 && !form.name) {
      alert('Por favor, ingresá tu nombre completo para personalizar el diagnóstico.');
      return;
    }
    if (wizardStep === 3 && form.selectedRooms.length === 0) {
      alert('Por favor, seleccioná al menos un ambiente para evaluar.');
      return;
    }

    if (!completedSteps.includes(wizardStep)) {
      setCompletedSteps([...completedSteps, wizardStep]);
    }

    if (wizardStep < 8) {
      setWizardStep(wizardStep + 1);
      window.scrollTo(0, 0);
    } else {
      // Calculate and save results
      const processedClient = buildClientFromForm(form);
      setCurrentClient(processedClient);
      setClientScreen('processing');
    }
  };

  const goPrev = () => {
    if (wizardStep > 1) {
      setWizardStep(wizardStep - 1);
      window.scrollTo(0, 0);
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
    updated[roomName] = {
      ...current,
      [field]: value,
    };
    updateForm({ roomEvaluations: updated });
  };

  // Upload/replace photo at a specific slot index (0 to 3) for a room
  const handlePhotoUploadAtIdx = (room: string, file: File | undefined, index: number) => {
    if (!file) return;

    // 1. Revoke the old blob URL at this slot before replacing it
    const oldPreviews = photoPreviews[room] || [];
    if (oldPreviews[index]) {
      URL.revokeObjectURL(oldPreviews[index]);
    }

    // 2. Get current files or pad array to at least index size
    const currentFiles = [...(form.photoFiles[room] || [])];
    currentFiles[index] = file;

    // Filter out empty spaces (keep it compact)
    const updatedFiles = currentFiles.filter(Boolean);

    // Save File array in the store form state
    const allFiles = { ...form.photoFiles };
    allFiles[room] = updatedFiles;
    updateForm({ photoFiles: allFiles, photosUploaded: true });

    // 3. Generate new local object URLs for all current files
    const previews = updatedFiles.map(f => URL.createObjectURL(f));
    setPhotoPreviews((prev) => ({ ...prev, [room]: previews }));
  };

  // Remove photo at slot index
  const handlePhotoRemoveAtIdx = (room: string, index: number) => {
    // Revoke the blob URL being removed to free memory
    const oldPreviews = photoPreviews[room] || [];
    if (oldPreviews[index]) {
      URL.revokeObjectURL(oldPreviews[index]);
    }

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
    
    // 1. Call Gemini Vision with ALL files uploaded for this room
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
        
        // Calibrate step 4 evaluations based on actual vision scores (1-100 to 1-5)
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

    // 2. Local fallback if no key is configured or no files
    const roomEval = form.roomEvaluations[room] || { feel: 3, light: 3, order: 3 };
    setTimeout(() => {
      setScanningRooms(prev => ({ ...prev, [room]: false }));
      const scanResult: RoomAiAnalysis = {
        lightQuality: Math.min(100, roomEval.light * 20 + Math.floor(Math.random() * 8)),
        orderScore: Math.min(100, roomEval.order * 20 - Math.floor(Math.random() * 6)),
        biophiliaScore: Math.min(100, (form.slideBio1 + (room === 'Patio / Balcón' ? 2 : 0)) * 20 - Math.floor(Math.random() * 5)),
        colorHarmony: 75,
        spatialBalance: 80,
        summary: `Se simuló el análisis visual combinado para el ambiente ${room}. Muestra niveles estables en base a las fotos cargadas.`,
        recommendations: [
          `Optimizar el asoleamiento de rincones en ${room}`,
          `Sostener hábitos diarios de ventilación cruzada en ${room}`
        ]
      };
      setScannedRooms(prev => ({ ...prev, [room]: scanResult }));
      updateForm({ scannedRooms: { ...form.scannedRooms, [room]: scanResult } });
    }, 2000);
  };

  const autoFillDemoData = () => {
    const filledForm = {
      name: 'María Eugenia Guerbi',
      age: '38',
      city: 'Buenos Aires',
      transition: 'Separacion',
      hoursAtHome: 'Más de 12',
      hasPets: 'Si',
      slideEmotional1: 2,
      slideEmotional2: 2,
      predominantEmotion: 'Incomodidad',
      desiredFeeling: 'Me gustaría sentir liviandad, contención, orden y mucha calma',
      selectedRooms: ['Entrada', 'Living', 'Cocina', 'Dormitorio Principal', 'Baño', 'Escritorio', 'Patio / Balcón'],
      roomEvaluations: {
        'Entrada': { feel: 4, light: 3, order: 4 },
        'Living': { feel: 3, light: 2, order: 3 },
        'Cocina': { feel: 4, light: 4, order: 4 },
        'Dormitorio Principal': { feel: 1, light: 2, order: 2 },
        'Baño': { feel: 2, light: 2, order: 3 },
        'Escritorio': { feel: 2, light: 2, order: 2 },
        'Patio / Balcón': { feel: 5, light: 5, order: 5 },
      },
      slidePhys1: 3,
      slidePhys2: 2,
      hasMoisture: 'Si',
      hasSyntheticMaterials: 'Si',
      slideBio1: 2,
      slideBio2: 2,
      hasPauseSpace: 'No',
      slideOrd1: 3,
      slideOrd2: 3,
      hasInheritedObjects: 'Si',
      photosUploaded: true,
      photoFiles: {},
      housingStatus: 'Alquiler',
      budget: 'Medio',
    };
    updateForm(filledForm);
    
    // Autofill mock scan results for Step 8 demo
    const mockScans: Record<string, RoomAiAnalysis> = {};
    filledForm.selectedRooms.forEach(r => {
      mockScans[r] = {
        lightQuality: Math.min(100, filledForm.roomEvaluations[r as keyof typeof filledForm.roomEvaluations].light * 20),
        orderScore: Math.min(100, filledForm.roomEvaluations[r as keyof typeof filledForm.roomEvaluations].order * 20),
        biophiliaScore: Math.min(100, filledForm.slideBio1 * 20),
        colorHarmony: 80,
        spatialBalance: 85,
        summary: `Análisis visual simulado para el piloto de ${r}`,
        recommendations: [`Mejorar orden en ${r}`]
      };
    });
    setScannedRooms(mockScans);
    setCompletedSteps([1, 2, 3, 4, 5, 6, 7]);
    setWizardStep(8);
  };

  // Helper for Soundwave graphics
  const renderSoundwave = (value: number) => {
    const activeVal = 6 - value; 
    const baseHeights = [
      [6, 10, 4, 8, 4, 10, 6],     
      [10, 14, 8, 12, 8, 14, 10],   
      [14, 20, 12, 18, 12, 20, 14], 
      [18, 26, 16, 24, 16, 26, 18], 
      [22, 32, 20, 30, 20, 32, 22], 
    ];
    const heights = baseHeights[activeVal - 1] || baseHeights[2];
    return (
      <div className="sensory-soundwave">
        {heights.map((h, i) => (
          <div key={i} className="soundwave-bar" style={{ height: `${h}px` }} />
        ))}
      </div>
    );
  };

  // Helper for growing leaves graphics
  const renderLeaves = (value: number) => {
    return (
      <div className="sensory-leaves">
        {[1, 2, 3, 4, 5].map((lvl) => (
          <span 
            key={lvl} 
            className={`sensory-leaf ${lvl <= value ? 'active' : ''}`}
            style={{ color: lvl <= value ? 'var(--success)' : '#878179' }}
          >
            🍃
          </span>
        ))}
      </div>
    );
  };

  // Helper for solar window rays
  const renderSunRays = (value: number) => {
    const rayWidths = [
      [0, 0, 0],       
      [6, 4, 6],       
      [14, 10, 14],    
      [22, 16, 22],    
      [32, 24, 32],    
    ];
    const widths = rayWidths[value - 1] || rayWidths[2];
    return (
      <div className="sensory-sun-container">
        <span style={{ transition: 'transform 0.4s ease', transform: `scale(${0.7 + value * 0.12})` }}>
          {value <= 2 ? '☁️' : '☀️'}
        </span>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
          {widths.map((w, idx) => (
            <div key={idx} className="sensory-sun-ray" style={{ width: `${w}px`, opacity: value * 0.2 }} />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="container" style={{ paddingTop: '40px', paddingBottom: '60px' }}>
      <div className="wizard-layout">
        
        {/* Sidebar Nav (Desktop only) */}
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

        {/* Mobile progress strip */}
        <div className="lg:hidden w-full mb-6 no-print">
          <div className="flex justify-between items-center mb-2">
            <span style={{ fontSize: '0.75rem', fontFamily: 'Jost, sans-serif', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, color: 'var(--brand-primary)' }}>
              {STEPS[wizardStep - 1].label}
            </span>
            <span className="text-xs text-[#878179]">Paso {wizardStep} de 8</span>
          </div>
          <div className="w-full h-1 bg-[#D6D2CA] rounded overflow-hidden">
            <div className="h-full bg-[#987557] transition-all duration-500" style={{ width: `${(wizardStep / 8) * 100}%` }} />
          </div>
        </div>

        {/* Wizard Main Card */}
        <div className="glass-card wizard-card">
          
          {/* Header info */}
          <div className="wizard-header">
            <div>
              <p style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.2em', color: 'var(--brand-primary)', fontWeight: 600, marginBottom: '4px' }}>
                Paso {wizardStep} de 8
              </p>
              <h2 className="text-3xl font-light" style={{ fontFamily: 'Cormorant Garamond, serif', margin: 0 }}>
                {STEPS[wizardStep - 1].label}
              </h2>
            </div>
            
            {/* Autofill helper for desktop testing */}
            {wizardStep === 1 && (
              <button
                type="button"
                onClick={autoFillDemoData}
                className="btn btn-secondary"
                style={{ fontSize: '0.75rem', padding: '10px 18px', borderRadius: '4px' }}
              >
                Autocompletar Piloto
              </button>
            )}
          </div>

          <form onSubmit={(e) => e.preventDefault()}>
            
            {/* ── PASO 1: Datos Personales y Contexto ── */}
            {wizardStep === 1 && (
              <div className="animate-[fadeIn_0.4s_ease-out]">
                <div className="form-group">
                  <label className="form-label" htmlFor="user-name">Nombre Completo</label>
                  <input
                    type="text"
                    id="user-name"
                    className="form-input"
                    placeholder="Tu nombre completo"
                    value={form.name}
                    onChange={(e) => updateForm({ name: e.target.value })}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr sm:grid-template-columns: 1fr 1fr', gap: '20px' }}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="user-age">Edad</label>
                    <input
                      type="number"
                      id="user-age"
                      className="form-input"
                      placeholder="Tu edad"
                      value={form.age}
                      onChange={(e) => updateForm({ age: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="user-city">Ciudad de residencia</label>
                    <input
                      type="text"
                      id="user-city"
                      className="form-input"
                      placeholder="Ej: Buenos Aires"
                      value={form.city}
                      onChange={(e) => updateForm({ city: e.target.value })}
                    />
                  </div>
                </div>

                {/* Capa 5 Contextual: Tipo de Vivienda */}
                <div className="form-group">
                  <label className="form-label">Relación Jurídica (Tipo de tenencia)</label>
                  <div className="choice-card-grid">
                    {[
                      { val: 'Alquiler', title: 'Alquiler', desc: 'Prioriza soluciones portátiles y no estructurales sin realizar obras.' },
                      { val: 'Propio', title: 'Propio', desc: 'Habilita recomendaciones de reformas a mediano/largo plazo.' }
                    ].map((opt) => (
                      <div
                        key={opt.val}
                        onClick={() => updateForm({ housingStatus: opt.val })}
                        className={`choice-card ${form.housingStatus === opt.val ? 'selected' : ''}`}
                      >
                        <span className="choice-card-title">{opt.title}</span>
                        <span className="choice-card-desc">{opt.desc}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Capa 5 Contextual: Presupuesto aproximado */}
                <div className="form-group">
                  <label className="form-label">Presupuesto para intervenciones</label>
                  <div className="choice-card-grid">
                    {[
                      { val: 'Bajo', title: 'Bajo (Low-Cost)', desc: 'Prioridad en cambios de hábitos y redistribución de muebles.' },
                      { val: 'Medio', title: 'Medio', desc: 'Decoración biofílica, textiles e iluminación accesible.' },
                      { val: 'Alto', title: 'Completo', desc: 'Aberturas premium, pintura ecológica y mobiliario de autor.' }
                    ].map((opt) => (
                      <div
                        key={opt.val}
                        onClick={() => updateForm({ budget: opt.val })}
                        className={`choice-card ${form.budget === opt.val ? 'selected' : ''}`}
                      >
                        <span className="choice-card-title">{opt.title}</span>
                        <span className="choice-card-desc">{opt.desc}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Transiciones Vitales */}
                <div className="form-group">
                  <label className="form-label">¿Atravesás algún cambio vital importante?</label>
                  <div className="choice-card-grid">
                    {TRANSITIONS.map((opt) => (
                      <div
                        key={opt.value}
                        onClick={() => updateForm({ transition: opt.value })}
                        className={`choice-card ${form.transition === opt.value ? 'selected' : ''}`}
                      >
                        <span className="choice-card-title">{opt.label}</span>
                        <span className="choice-card-desc">{opt.desc}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">¿Cuántas horas pasás al día en tu casa?</label>
                  <div className="choice-card-grid">
                    {[
                      { val: 'Menos de 6', title: 'Menos de 6 hs', desc: 'Uso principalmente nocturno.' },
                      { val: '6 a 12', title: 'De 6 a 12 hs', desc: 'Vivienda y descanso habitual.' },
                      { val: 'Más de 12', title: 'Más de 12 hs', desc: 'Teletrabajo o permanencia continua.' }
                    ].map((opt) => (
                      <div
                        key={opt.val}
                        onClick={() => updateForm({ hoursAtHome: opt.val })}
                        className={`choice-card ${form.hoursAtHome === opt.val ? 'selected' : ''}`}
                      >
                        <span className="choice-card-title">{opt.title}</span>
                        <span className="choice-card-desc">{opt.desc}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">¿Tenés mascotas?</label>
                  <div className="choices-grid">
                    {[
                      { val: 'Si', label: 'Sí, tengo' },
                      { val: 'No', label: 'No tengo' },
                    ].map((opt) => (
                      <button
                        key={opt.val}
                        type="button"
                        onClick={() => updateForm({ hasPets: opt.val })}
                        className={`choice-pill-option ${form.hasPets === opt.val ? 'selected' : ''}`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── PASO 2: Relación Emocional con tu Casa ── */}
            {wizardStep === 2 && (
              <div className="animate-[fadeIn_0.4s_ease-out]">
                <p className="text-sm text-[#878179] mb-6">
                  El lazo psicológico con el espacio define tu estado de calma. Ajustá los sliders y responde a las preguntas emocionales:
                </p>

                <div className="slider-container">
                  <div className="slider-title">Representación Personal</div>
                  <div className="slider-desc">"¿Sentís que tu casa te representa hoy y refleja tu etapa vital?"</div>
                  <div className="slider-wrapper">
                    <span className="text-xs text-[#878179]">1 (Nada)</span>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      value={form.slideEmotional1}
                      onChange={(e) => updateForm({ slideEmotional1: parseInt(e.target.value) })}
                      className="slider-input"
                    />
                    <span className="slider-val-label">{form.slideEmotional1}</span>
                  </div>
                  {/* Visual feedback */}
                  <p style={{ fontSize: '0.78rem', color: 'var(--brand-primary)', marginTop: '8px', fontStyle: 'italic', margin: '8px 0 0 0' }}>
                    {form.slideEmotional1 <= 2 ? '⚠️ Se siente ajeno, como vivir en un espacio prestado.' : form.slideEmotional1 === 3 ? 'Neutral, cumple su rol funcional.' : '✨ Totalmente alíneado con tu identidad y valores actuales.'}
                  </p>
                </div>

                <div className="slider-container">
                  <div className="slider-title">Regulación y Calma</div>
                  <div className="slider-desc">"¿Sentís calma cuando entrás a tu casa?"</div>
                  <div className="slider-wrapper">
                    <span className="text-xs text-[#878179]">1 (Nada)</span>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      value={form.slideEmotional2}
                      onChange={(e) => updateForm({ slideEmotional2: parseInt(e.target.value) })}
                      className="slider-input"
                    />
                    <span className="slider-val-label">{form.slideEmotional2}</span>
                  </div>
                  <p style={{ fontSize: '0.78rem', color: 'var(--brand-primary)', marginTop: '8px', fontStyle: 'italic', margin: '8px 0 0 0' }}>
                    {form.slideEmotional2 <= 2 ? '⚠️ Entrar a casa activa tu alerta en lugar de relajarte.' : form.slideEmotional2 === 3 ? 'Es cómodo, pero no actúa como un cargador biológico.' : '✨ Tu casa es tu templo directo de recuperación.'}
                  </p>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="user-feeling-enter">¿Qué emoción predomina en vos cuando entrás a tu casa?</label>
                  <div className="choice-card-grid">
                    {[
                      { val: 'Calma', title: '😌 Calma / Seguridad', desc: 'Sensación de alivio y refugio.' },
                      { val: 'Incomodidad', title: '😐 Incomodidad', desc: 'Indiferencia o rechazo sutil.' },
                      { val: 'Agobio', title: '😣 Agobio / Carga', desc: 'Sobrecarga visual, desorden o pendientes.' },
                    ].map((opt) => (
                      <div
                        key={opt.val}
                        onClick={() => updateForm({ predominantEmotion: opt.val })}
                        className={`choice-card ${form.predominantEmotion === opt.val ? 'selected' : ''}`}
                        style={{ padding: '14px' }}
                      >
                        <span className="choice-card-title" style={{ fontSize: '0.85rem' }}>{opt.title}</span>
                        <span className="choice-card-desc">{opt.desc}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="user-desired-feeling">¿Cómo te gustaría sentirte en tu casa?</label>
                  <input
                    type="text"
                    id="user-desired-feeling"
                    className="form-input"
                    placeholder="Ej: Me gustaría sentir liviandad, contención, orden..."
                    value={form.desiredFeeling}
                    onChange={(e) => updateForm({ desiredFeeling: e.target.value })}
                  />
                </div>
              </div>
            )}

            {/* ── PASO 3: Selección de Ambientes (Extendida con "Otro") ── */}
            {wizardStep === 3 && (
              <div className="animate-[fadeIn_0.4s_ease-out]">
                <p className="text-sm text-[#878179] mb-6">
                  Marcá los ambientes que tiene tu casa actual. Evaluaremos de forma interactiva y focalizada cada uno para encontrar bloqueos de diseño.
                </p>
                <div className="room-selector-grid">
                  {/* Default Rooms */}
                  {Object.keys(DEFAULT_ROOM_ICONS).map((roomKey) => {
                    const isSelected = form.selectedRooms.includes(roomKey);
                    return (
                      <button
                        key={roomKey}
                        type="button"
                        onClick={() => toggleRoom(roomKey)}
                        className={`room-card-option ${isSelected ? 'selected' : ''}`}
                      >
                        <div className="room-icon-placeholder">{DEFAULT_ROOM_ICONS[roomKey]}</div>
                        <span>{roomKey === 'Entrada' ? 'Entrada / recibidor' : roomKey}</span>
                      </button>
                    );
                  })}

                  {/* Dynamically added custom rooms */}
                  {customRooms.map((roomKey) => {
                    const isSelected = form.selectedRooms.includes(roomKey);
                    return (
                      <button
                        key={roomKey}
                        type="button"
                        onClick={() => toggleRoom(roomKey)}
                        className={`room-card-option ${isSelected ? 'selected' : ''}`}
                      >
                        <div className="room-icon-placeholder">🏠</div>
                        <span>{roomKey}</span>
                      </button>
                    );
                  })}

                  {/* Add Custom Room Button */}
                  {!showCustomInput ? (
                    <button
                      type="button"
                      onClick={() => setShowCustomInput(true)}
                      className="room-card-option"
                      style={{ borderStyle: 'dashed', borderColor: 'var(--brand-primary)', background: 'transparent' }}
                    >
                      <div className="room-icon-placeholder" style={{ color: 'var(--brand-primary)' }}>
                        <Plus size={20} />
                      </div>
                      <span style={{ color: 'var(--brand-primary)', fontWeight: 600 }}>Otro ambiente...</span>
                    </button>
                  ) : (
                    <div 
                      className="room-card-option" 
                      style={{ 
                        gridColumn: 'span 2', 
                        display: 'flex', 
                        flexDirection: 'column', 
                        gap: '8px', 
                        padding: '12px',
                        background: 'rgba(255,255,255,0.8)' 
                      }}
                    >
                      <input
                        type="text"
                        placeholder="Ej: Gimnasio, Playroom, Sótano..."
                        value={customRoomName}
                        onChange={(e) => setCustomRoomName(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '6px 10px',
                          fontSize: '0.85rem',
                          border: '1px solid #D6D2CA',
                          borderRadius: '4px',
                        }}
                      />
                      <div style={{ display: 'flex', gap: '6px', width: '100%' }}>
                        <button
                          type="button"
                          onClick={addCustomRoom}
                          className="btn btn-primary"
                          style={{ flex: 1, padding: '4px 0', fontSize: '0.75rem', borderRadius: '4px' }}
                        >
                          Confirmar
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowCustomInput(false);
                            setCustomRoomName('');
                          }}
                          className="btn btn-secondary"
                          style={{ padding: '4px 8px', fontSize: '0.75rem', borderRadius: '4px' }}
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── PASO 4: Evaluación por Ambientes (Carrusel Interactivo) ── */}
            {wizardStep === 4 && (
              <div className="animate-[fadeIn_0.4s_ease-out]">
                {form.selectedRooms.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px' }}>
                    <AlertCircle size={32} style={{ color: 'var(--error)', marginBottom: '10px' }} />
                    <p style={{ color: 'var(--error)', fontSize: '0.95rem' }}>
                      ⚠️ No seleccionaste ningún ambiente en el paso anterior. Retrocedé para marcar tus salas.
                    </p>
                  </div>
                ) : (
                  (() => {
                    const activeRoom = form.selectedRooms[currentRoomIdx];
                    const activeEval = form.roomEvaluations[activeRoom] || { feel: 3, light: 3, order: 3 };

                    return (
                      <div>
                        {/* Indicador del carrusel */}
                        <div className="room-eval-carousel-header">
                          <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-charcoal)' }}>
                            Ambiente {currentRoomIdx + 1} de {form.selectedRooms.length}
                          </span>
                          <span style={{ fontSize: '1.2rem' }}>
                            {getRoomIcon(activeRoom)} <strong>{activeRoom === 'Entrada' ? 'Entrada / recibidor' : activeRoom}</strong>
                          </span>
                        </div>

                        {/* Ficha Interactiva del Ambiente */}
                        <div style={{ background: 'rgba(255,255,255,0.4)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '24px', marginBottom: '24px', textAlign: 'left' }}>
                          
                          {/* Pregunta 1: Emoción con tarjetas de reacciones */}
                          <div className="form-group">
                            <label className="form-label" style={{ fontSize: '0.85rem' }}>1. ¿Cómo te sentís al estar en este espacio?</label>
                            <div className="emotion-cards-container">
                              {[
                                { val: 5, label: '😌 Calma', className: 'selected-calma', desc: 'Paz y relajación' },
                                { val: 3, label: '😐 Neutro', className: 'selected-neutro', desc: 'Indiferencia habitual' },
                                { val: 1, label: '😣 Agobio', className: 'selected-agobio', desc: 'Estrés y malestar' },
                              ].map((option) => (
                                <div
                                  key={option.val}
                                  onClick={() => handleRoomEvalChange(activeRoom, 'feel', option.val)}
                                  className={`emotion-card-btn ${activeEval.feel === option.val ? option.className : ''}`}
                                >
                                  <span style={{ fontSize: '1.1rem', fontWeight: 600 }}>{option.label}</span>
                                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{option.desc}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Pregunta 2: Luz natural */}
                          <div className="form-group" style={{ marginTop: '30px' }}>
                            <label className="form-label" style={{ fontSize: '0.85rem' }}>2. Nivel de Luz Natural y Ventilación</label>
                            <div className="slider-wrapper">
                              <span className="text-xs text-[#878179]">Bajo / Sombrío</span>
                              <input
                                type="range"
                                min="1"
                                max="5"
                                value={activeEval.light}
                                onChange={(e) => handleRoomEvalChange(activeRoom, 'light', parseInt(e.target.value))}
                                className="slider-input"
                              />
                              <span className="slider-val-label">{activeEval.light}</span>
                            </div>
                            {/* Window light sensory indicator */}
                            <div className="sensory-display">
                              {renderSunRays(activeEval.light)}
                            </div>
                          </div>

                          {/* Pregunta 3: Orden */}
                          <div className="form-group" style={{ marginTop: '30px' }}>
                            <label className="form-label" style={{ fontSize: '0.85rem' }}>3. Nivel de Orden y Ausencia de Desorden Visual</label>
                            <div className="slider-wrapper">
                              <span className="text-xs text-[#878179]">Caótico</span>
                              <input
                                type="range"
                                min="1"
                                max="5"
                                value={activeEval.order}
                                onChange={(e) => handleRoomEvalChange(activeRoom, 'order', parseInt(e.target.value))}
                                className="slider-input"
                              />
                              <span className="slider-val-label">{activeEval.order}</span>
                            </div>
                            {/* Order scale sensory text */}
                            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '10px', fontStyle: 'italic' }}>
                              {activeEval.order <= 2 ? '⚠️ Hay ruido visual (cables, objetos dispersos) que satura tu campo de atención.' : activeEval.order === 3 ? 'Orden básico aceptable, pero se desorganiza con rapidez.' : '✨ Superficies despejadas, orden fácil de sostener.'}
                            </p>
                          </div>

                        </div>

                        {/* Botones de navegación interna */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
                          <button
                            type="button"
                            onClick={() => setCurrentRoomIdx(prev => Math.max(0, prev - 1))}
                            disabled={currentRoomIdx === 0}
                            className="btn btn-secondary"
                            style={{ padding: '8px 20px', fontSize: '0.75rem', opacity: currentRoomIdx === 0 ? 0.4 : 1 }}
                          >
                            ← Ambiente Anterior
                          </button>
                          
                          {currentRoomIdx < form.selectedRooms.length - 1 ? (
                            <button
                              type="button"
                              onClick={() => setCurrentRoomIdx(prev => Math.min(form.selectedRooms.length - 1, prev + 1))}
                              className="btn btn-primary"
                              style={{ padding: '8px 20px', fontSize: '0.75rem' }}
                            >
                              Siguiente Ambiente →
                            </button>
                          ) : (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--success)', fontSize: '0.82rem', fontWeight: 500 }}>
                              <CheckCircle2 size={16} /> ¡Todos los ambientes listos!
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })()
                )}
              </div>
            )}

            {/* ── PASO 5: Condiciones Físicas de la Edificación y el Entorno (Clarificado) ── */}
            {wizardStep === 5 && (
              <div className="animate-[fadeIn_0.4s_ease-out]">
                <p className="text-sm text-[#878179] mb-6">
                  Las condiciones estructurales de <strong>toda la edificación y el entorno</strong> (como el asoleamiento de la fachada, el aislamiento del ruido de la calle, o problemas generales de humedad) determinan la base física sobre la cual habitas.
                </p>

                <div className="slider-container">
                  <div className="slider-title">Iluminación Natural Global (Edificación)</div>
                  <div className="slider-desc">"¿La estructura general de la edificación cuenta con abundante sol durante el día?"</div>
                  <div className="slider-wrapper">
                    <span className="text-xs text-[#878179]">1 (Sombría / Mala orientación)</span>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      value={form.slidePhys1}
                      onChange={(e) => updateForm({ slidePhys1: parseInt(e.target.value) })}
                      className="slider-input"
                    />
                    <span className="slider-val-label">{form.slidePhys1}</span>
                  </div>
                  {/* Sensory Sun rays indicator */}
                  <div className="sensory-display">
                    {renderSunRays(form.slidePhys1)}
                  </div>
                </div>

                <div className="slider-container">
                  <div className="slider-title">Aislamiento Acústico (Edificación y Entorno)</div>
                  <div className="slider-desc">"¿La edificación está bien aislada de los ruidos molestos del entorno (calle, tránsito, linderos)?"</div>
                  <div className="slider-wrapper">
                    <span className="text-xs text-[#878179]">1 (Muy ruidoso / Sin aislamiento)</span>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      value={form.slidePhys2}
                      onChange={(e) => updateForm({ slidePhys2: parseInt(e.target.value) })}
                      className="slider-input"
                    />
                    <span className="slider-val-label">{form.slidePhys2}</span>
                  </div>
                  {/* Sensory soundwave indicator */}
                  <div className="sensory-display">
                    {renderSoundwave(form.slidePhys2)}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">¿Detectás olor a humedad, filtraciones o moho en algún muro del edificio?</label>
                  <div className="choices-grid">
                    {[
                      { val: 'Si', label: 'Sí, detecto humedad' },
                      { val: 'No', label: 'No detecto' },
                    ].map((opt) => (
                      <button
                        key={opt.val}
                        type="button"
                        onClick={() => updateForm({ hasMoisture: opt.val })}
                        className={`choice-pill-option ${form.hasMoisture === opt.val ? 'selected' : ''}`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">¿Predominan materiales sintéticos (melaminas, plásticos) sobre los naturales en los acabados generales?</label>
                  <div className="choices-grid">
                    {[
                      { val: 'Si', label: 'Sí, predomina plástico/melamina' },
                      { val: 'No', label: 'No, predomina material natural' },
                    ].map((opt) => (
                      <button
                        key={opt.val}
                        type="button"
                        onClick={() => updateForm({ hasSyntheticMaterials: opt.val })}
                        className={`choice-pill-option ${form.hasSyntheticMaterials === opt.val ? 'selected' : ''}`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── PASO 6: Biofilia y Naturaleza ── */}
            {wizardStep === 6 && (
              <div className="animate-[fadeIn_0.4s_ease-out]">
                <p className="text-sm text-[#878179] mb-6">
                  Nuestra biología necesita la conexión vegetal para activar el sistema parasimpático y desactivar el cortisol.
                </p>

                <div className="slider-container">
                  <div className="slider-title">Vegetación y Plantas</div>
                  <div className="slider-desc">"¿Contás con vegetación activa en los ambientes principales de tu hogar?"</div>
                  <div className="slider-wrapper">
                    <span className="text-xs text-[#878179]">1 (Ninguna)</span>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      value={form.slideBio1}
                      onChange={(e) => updateForm({ slideBio1: parseInt(e.target.value) })}
                      className="slider-input"
                    />
                    <span className="slider-val-label">{form.slideBio1}</span>
                  </div>
                  {/* Sensory leaves indicator */}
                  <div className="sensory-display">
                    {renderLeaves(form.slideBio1)}
                  </div>
                </div>

                <div className="slider-container">
                  <div className="slider-title">Visuales hacia la Naturaleza</div>
                  <div className="slider-desc">"¿Ves árboles, cielo o plantas desde tus ventanas de descanso o trabajo?"</div>
                  <div className="slider-wrapper">
                    <span className="text-xs text-[#878179]">1 (Ninguna)</span>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      value={form.slideBio2}
                      onChange={(e) => updateForm({ slideBio2: parseInt(e.target.value) })}
                      className="slider-input"
                    />
                    <span className="slider-val-label">{form.slideBio2}</span>
                  </div>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '10px', fontStyle: 'italic' }}>
                    {form.slideBio2 <= 2 ? '⚠️ Tus ventanas dan a patios de cemento o muros oscuros.' : form.slideBio2 === 3 ? 'Vistas parciales de vegetación lejana.' : '✨ Excelente. Visuales despejadas hacia árboles o cielo.'}
                  </p>
                </div>

                <div className="form-group">
                  <label className="form-label">¿Tenés algún rincón destinado de forma exclusiva a la pausa o la meditación?</label>
                  <div className="choices-grid">
                    {[
                      { val: 'Si', label: 'Sí, lo tengo' },
                      { val: 'No', label: 'No tengo' },
                    ].map((opt) => (
                      <button
                        key={opt.val}
                        type="button"
                        onClick={() => updateForm({ hasPauseSpace: opt.val })}
                        className={`choice-pill-option ${form.hasPauseSpace === opt.val ? 'selected' : ''}`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── PASO 7: Orden y Carga Cognitiva ── */}
            {wizardStep === 7 && (
              <div className="animate-[fadeIn_0.4s_ease-out]">
                <p className="text-sm text-[#878179] mb-6">
                  El desorden y los recorridos trabados son estimulantes continuos que cansan el sistema cognitivo.
                </p>

                <div className="slider-container">
                  <div className="slider-title">Orden Sostenible</div>
                  <div className="slider-desc">"¿Sentís que el orden en tu hogar se sostiene en el tiempo con facilidad?"</div>
                  <div className="slider-wrapper">
                    <span className="text-xs text-[#878179]">1 (Se desarma rápido)</span>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      value={form.slideOrd1}
                      onChange={(e) => updateForm({ slideOrd1: parseInt(e.target.value) })}
                      className="slider-input"
                    />
                    <span className="slider-val-label">{form.slideOrd1}</span>
                  </div>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '10px', fontStyle: 'italic' }}>
                    {form.slideOrd1 <= 2 ? '⚠️ Ordenar exige un gran esfuerzo de voluntad diario.' : form.slideOrd1 === 3 ? 'Se ordena, pero tiene una tendencia alta al caos.' : '✨ Diseñado para facilitar la vida: cada objeto se guarda en un segundo.'}
                  </p>
                </div>

                <div className="slider-container">
                  <div className="slider-title">Circulación Física</div>
                  <div className="slider-desc">"¿Las circulaciones entre ambientes son libres de muebles molestos o cajas acumuladas?"</div>
                  <div className="slider-wrapper">
                    <span className="text-xs text-[#878179]">1 (Obstruida)</span>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      value={form.slideOrd2}
                      onChange={(e) => updateForm({ slideOrd2: parseInt(e.target.value) })}
                      className="slider-input"
                    />
                    <span className="slider-val-label">{form.slideOrd2}</span>
                  </div>
                  {/* Sensory text for circulation */}
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '10px', fontStyle: 'italic' }}>
                    {form.slideOrd2 <= 2 ? '⚠️ Tropezás o tenés que esquivar obstáculos habitualmente.' : '✨ Circulación fluida, libre y segura entre habitaciones.'}
                  </p>
                </div>

                <div className="form-group">
                  <label className="form-label">¿Conservás muebles u objetos heredados que te generan incomodidad o culpa tirar?</label>
                  <div className="choices-grid">
                    {[
                      { val: 'Si', label: 'Sí, conservo y pesan' },
                      { val: 'No', label: 'No tengo objetos pesados' },
                    ].map((opt) => (
                      <button
                        key={opt.val}
                        type="button"
                        onClick={() => updateForm({ hasInheritedObjects: opt.val })}
                        className={`choice-pill-option ${form.hasInheritedObjects === opt.val ? 'selected' : ''}`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── PASO 8: Fotografías del Hábitat (Hasta 4 fotos por ambiente y escaneo de IA) ── */}
            {wizardStep === 8 && (
              <div className="animate-[fadeIn_0.4s_ease-out]">
                <p className="text-sm text-[#878179] mb-6">
                  Cargá <strong>hasta 4 fotografías por ambiente</strong> para habilitar el escaneo completo de IA. Cuantas más perspectivas brindes, más exacto será el diagnóstico visual de Gemini.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
                  {form.selectedRooms.map((room) => {
                    const isScanning = scanningRooms[room];
                    const results = scannedRooms[room];
                    const roomFiles = form.photoFiles[room] || [];
                    const previews = photoPreviews[room] || [];

                    return (
                      <div 
                        key={room} 
                        style={{ 
                          background: 'rgba(255, 255, 255, 0.4)', 
                          border: '1px solid var(--border-color)', 
                          borderRadius: '12px', 
                          padding: '24px' 
                        }}
                      >
                        {/* Room Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                          <span style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-charcoal)' }}>
                            {getRoomIcon(room)} {room === 'Entrada' ? 'Entrada / recibidor' : room}
                          </span>
                          
                          {results ? (
                            <span style={{ fontSize: '0.72rem', color: 'var(--success)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              ✓ Escaneado con IA ({roomFiles.length} {roomFiles.length === 1 ? 'foto' : 'fotos'})
                            </span>
                          ) : (
                            <span style={{ fontSize: '0.75rem', color: '#878179' }}>
                              Cargadas: <strong>{roomFiles.length}/4 fotos</strong>
                            </span>
                          )}
                        </div>

                        {/* Grid of 4 Upload Slots */}
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
                          gap: '12px',
                          marginBottom: '20px'
                        }}>
                          {[0, 1, 2, 3].map((idx) => {
                            const hasPhoto = !!roomFiles[idx];
                            const previewUrl = previews[idx];
                            const isInputDisabled = isScanning || !!results;

                            return (
                              <div 
                                key={idx} 
                                className="polaroid-card"
                                style={{ 
                                  padding: '8px', 
                                  boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                                  opacity: isScanning ? 0.7 : 1
                                }}
                              >
                                {/* Hidden Input File */}
                                <input
                                  type="file"
                                  accept="image/*"
                                  id={`file-input-${room}-${idx}`}
                                  disabled={isInputDisabled}
                                  onChange={(e) => handlePhotoUploadAtIdx(room, e.target.files?.[0], idx)}
                                  style={{ display: 'none' }}
                                />

                                <div 
                                  className="polaroid-img-wrapper"
                                  style={{ 
                                    height: '110px',
                                    borderRadius: '6px',
                                    background: '#fff',
                                    border: '1px dashed #D6D2CA',
                                    cursor: isInputDisabled ? 'default' : 'pointer'
                                  }}
                                  onClick={() => !isInputDisabled && document.getElementById(`file-input-${room}-${idx}`)?.click()}
                                >
                                  {isScanning && idx === 0 && <div className="laser-scanner-line" />}

                                  {hasPhoto && previewUrl ? (
                                    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                                      <img 
                                        src={previewUrl} 
                                        alt={`${room}-${idx}`} 
                                        style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '5px' }}
                                      />
                                      {/* Remove photo button */}
                                      {!results && !isScanning && (
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handlePhotoRemoveAtIdx(room, idx);
                                          }}
                                          style={{
                                            position: 'absolute',
                                            top: '4px',
                                            right: '4px',
                                            background: 'rgba(239, 68, 68, 0.9)',
                                            color: '#fff',
                                            border: 'none',
                                            borderRadius: '50%',
                                            width: '20px',
                                            height: '20px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            cursor: 'pointer',
                                          }}
                                        >
                                          <Trash2 size={10} />
                                        </button>
                                      )}
                                    </div>
                                  ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#878179', padding: '6px', textAlign: 'center' }}>
                                      <Upload size={14} style={{ marginBottom: '4px', opacity: 0.7 }} />
                                      <span style={{ fontSize: '0.65rem' }}>Subir Foto {idx + 1}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Scanner & Results block */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          {!results ? (
                            <button
                              type="button"
                              onClick={() => handleScanRoom(room)}
                              disabled={isScanning || roomFiles.length === 0}
                              className="btn btn-primary"
                              style={{
                                padding: '8px 16px',
                                fontSize: '0.78rem',
                                borderRadius: '6px',
                                width: 'fit-content',
                                gap: '6px',
                                alignSelf: 'flex-start'
                              }}
                            >
                              <Scan size={14} /> {isScanning ? 'Escaneando fotos en lote...' : 'Escanear fotos del ambiente'}
                            </button>
                          ) : (
                            <div 
                              style={{ 
                                background: 'rgba(28,25,23,0.04)', 
                                border: '1px solid #D6D2CA', 
                                borderRadius: '8px', 
                                padding: '16px', 
                                fontSize: '0.85rem' 
                              }}
                            >
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', marginBottom: '12px', borderBottom: '1px solid #D6D2CA', paddingBottom: '10px' }}>
                                <div>
                                  <span style={{ color: '#878179', fontSize: '0.75rem', display: 'block' }}>Luz Natural:</span>
                                  <strong style={{ fontSize: '1rem', color: results.lightQuality >= 70 ? 'var(--success)' : '#D9A05B' }}>{results.lightQuality}%</strong>
                                </div>
                                <div>
                                  <span style={{ color: '#878179', fontSize: '0.75rem', display: 'block' }}>Orden Visual:</span>
                                  <strong style={{ fontSize: '1rem', color: results.orderScore >= 70 ? 'var(--success)' : '#B05B5B' }}>{results.orderScore}%</strong>
                                </div>
                                <div>
                                  <span style={{ color: '#878179', fontSize: '0.75rem', display: 'block' }}>Biofilia:</span>
                                  <strong style={{ fontSize: '1rem', color: results.biophiliaScore >= 50 ? 'var(--success)' : '#878179' }}>{results.biophiliaScore}%</strong>
                                </div>
                              </div>
                              {results.summary && (
                                <p style={{ color: '#44403C', fontSize: '0.8rem', lineHeight: 1.5, margin: 0, fontStyle: 'italic' }}>
                                  💡 <strong>Resumen visual de la IA:</strong> {results.summary}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div style={{ textAlign: 'center', marginTop: '30px' }}>
                  <button
                    type="button"
                    onClick={() => {
                      // Trigger scan for all rooms that have files uploaded and aren't scanned yet
                      form.selectedRooms.forEach(room => {
                        const files = form.photoFiles[room] || [];
                        if (files.length > 0 && !scannedRooms[room]) {
                          handleScanRoom(room);
                        }
                      });
                    }}
                    className="btn btn-secondary"
                    style={{ fontSize: '0.8rem', padding: '10px 20px' }}
                  >
                    🚀 Escanear Ambientes con Fotos Cargadas
                  </button>
                </div>
              </div>
            )}

            {/* Bottom Actions Row */}
            <div className="wizard-actions" style={{ display: 'flex', justifyContent: 'space-between', marginTop: '40px', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
              <button type="button" onClick={goPrev} className="btn btn-secondary">
                <ChevronLeft size={14} style={{ marginRight: '6px' }} /> Anterior
              </button>
              <button type="button" onClick={goNext} className="btn btn-primary">
                {wizardStep === 8 ? 'Enviar Evaluación' : 'Siguiente'}{' '}
                <ChevronRight size={14} style={{ marginLeft: '6px' }} />
              </button>
            </div>

          </form>

        </div>
      </div>
    </div>
  );
}

export default WizardScreen;
