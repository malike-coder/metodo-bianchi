import { useState, useEffect, useRef } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { buildClientFromForm } from '../../utils/ibbhCalculator';
import { analyzeRoomPhotoWithAi } from '../../services/aiService';
import { ChevronRight, ChevronLeft, CheckCircle2, Upload, Plus, Trash2, Camera, Check } from 'lucide-react';
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

const ADDITIONAL_ROOMS = [
  { name: 'Vestidor', icon: '👗' },
  { name: 'Jardín', icon: '🌳' },
  { name: 'Terraza', icon: '🌇' },
  { name: 'Galería', icon: '🌞' },
  { name: 'Quincho', icon: '🍖' },
  { name: 'Playroom', icon: '🎮' },
  { name: 'Sala de estar', icon: '📺' },
  { name: 'Habitación de huéspedes', icon: '🛌' },
  { name: 'Gimnasio', icon: '🏋️' },
  { name: 'Biblioteca', icon: '📚' },
  { name: 'Taller', icon: '🛠️' },
  { name: 'Depósito', icon: '📦' },
  { name: 'Local comercial', icon: '🏪' },
  { name: 'Consultorio', icon: '🩺' },
  { name: 'Oficina', icon: '🏢' },
  { name: 'Lavadero exterior', icon: '🧺' },
];

const STEPS = [
  { id: 1, label: 'Conocerte' },
  { id: 2, label: 'Vínculo Emocional' },
  { id: 3, label: 'Tus Ambientes' },
  { id: 4, label: 'Recorremos tu hogar' },
];

const ROOM_ACTIVITIES: Record<string, string[]> = {
  'Entrada': ['Ingresar y descompresión', 'Dejar abrigos y calzado', 'Paso de tránsito', 'Recibir entregas', 'Guardar llaves y bolsos'],
  'Living': ['Descansar', 'Compartir en familia o con amigos', 'Leer o escuchar música', 'Mirar televisión', 'Recibir visitas', 'Trabajar o estudiar'],
  'Comedor': ['Comer en el día a día', 'Reuniones familiares', 'Trabajar o estudiar', 'Tareas de los niños', 'Juegos de mesa'],
  'Cocina': ['Cocinar', 'Comer rápido o desayunar', 'Lavar vajilla', 'Espacio de charla / reunión', 'Almacenar provisiones'],
  'Dormitorio Principal': ['Dormir y descansar', 'Vestirse', 'Leer', 'Mirar televisión', 'Intimidad y desconexión', 'Trabajar'],
  'Dormitorio Secundario': ['Dormir y descansar', 'Jugar', 'Estudiar o hacer tareas', 'Vestirse', 'Estar con amigos', 'Guardar juguetes'],
  'Baño': ['Aseo diario y ducha', 'Baño de inmersión / relax', 'Maquillaje / Cuidado personal', 'Vestirse'],
  'Escritorio': ['Trabajar', 'Estudiar', 'Trámites y lectura', 'Hobbys / Costura', 'Jugar videojuegos'],
  'Lavadero': ['Lavar y secar ropa', 'Planchar', 'Guardar artículos de limpieza', 'Cuidado de mascotas'],
  'Patio / Balcón': ['Relajarse al aire libre', 'Cuidar plantas y jardinería', 'Reuniones / Asados', 'Desayunar / Tomar mate', 'Jugar', 'Trabajar'],
  'Cochera': ['Guardar vehículo', 'Taller / Bricolaje', 'Depósito / Almacenamiento', 'Acceso a la vivienda'],
};

export function WizardScreen() {
  const { form, updateForm, wizardStep, setWizardStep, setClientScreen, setCurrentClient } = useAppStore();
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [slideClass, setSlideClass] = useState('slide-in-right');

  // Room carousel state for Step 4
  const [currentRoomIdx, setCurrentRoomIdx] = useState(0);
  const [roomSubStep, setRoomSubStep] = useState(0); // 0: Fotos, 1: Experiencia, 2: Confort, 3: Org, 4: Naturaleza, 5: Detalles

  // Transitions
  const [showStep3Transition, setShowStep3Transition] = useState(false);
  const [showRoomTransition, setShowRoomTransition] = useState(false);
  const [showFinalTransition, setShowFinalTransition] = useState(false);

  // Scanning state for Step 4 AI Vision
  const [scanningRooms, setScanningRooms] = useState<Record<string, boolean>>({});
  const [scannedRooms, setScannedRooms] = useState<Record<string, RoomAiAnalysis>>(form.scannedRooms || {});

  // Local photo previews URL state
  const [photoPreviews, setPhotoPreviews] = useState<Record<string, string[]>>({});

  // Ref for scroll-to-wizard
  const wizardCardRef = useRef<HTMLDivElement>(null);

  // Custom environments lists
  const [showCustomListDrawer, setShowCustomListDrawer] = useState(false);
  const [customRoomNameInput, setCustomRoomNameInput] = useState('');
  const [customRooms, setCustomRooms] = useState<string[]>([]);

  // Cleanup blob URLs on unmount
  useEffect(() => {
    return () => {
      Object.values(photoPreviews).forEach((urls) =>
        urls.forEach((url) => URL.revokeObjectURL(url))
      );
    };
  }, []);

  // Initialize room evaluations when room selection changes
  useEffect(() => {
    const updatedEvals = { ...form.roomEvaluations };
    let changed = false;
    form.selectedRooms.forEach((room) => {
      if (!updatedEvals[room]) {
        updatedEvals[room] = {
          feel: 3,
          mainActivity: '',
          supportsActivity: 'A veces',
          light: 'Suficiente',
          ventilation: 'Aceptable',
          temperature: 'Agradable',
          noise: 'Moderado',
          moisture: 'No',
          order: 'Se desorganiza fácil',
          storage: 'Suficiente',
          circulation: 'Con obstáculos',
          easeOfUse: 'Fácil',
          plants: 'Pocas',
          views: 'Visual edificada',
          exteriorRelation: 'Ninguna',
          specificAnswer1: '',
          specificAnswer2: '',
        };
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

  const getRoomIcon = (room: string): string => {
    const matched = ADDITIONAL_ROOMS.find(r => r.name === room);
    if (matched) return matched.icon;
    return DEFAULT_ROOM_ICONS[room] || '🏠';
  };

  const activeRoom = form.selectedRooms[currentRoomIdx] || 'Living';
  const roomFiles = form.photoFiles[activeRoom] || [];
  const roomEval = form.roomEvaluations[activeRoom] || {
    feel: 3,
    mainActivity: '',
    supportsActivity: 'A veces',
    light: 'Suficiente',
    ventilation: 'Aceptable',
    temperature: 'Agradable',
    noise: 'Moderado',
    moisture: 'No',
    order: 'Se desorganiza fácil',
    storage: 'Suficiente',
    circulation: 'Con obstáculos',
    easeOfUse: 'Fácil',
    plants: 'Pocas',
    views: 'Visual edificada',
    exteriorRelation: 'Ninguna',
    specificAnswer1: '',
    specificAnswer2: '',
  };

  const updateActiveRoomEval = (updates: Partial<typeof roomEval>) => {
    const updated = { ...form.roomEvaluations };
    updated[activeRoom] = { ...roomEval, ...updates };
    updateForm({ roomEvaluations: updated });
  };

  const toggleRoom = (roomName: string) => {
    const isSelected = form.selectedRooms.includes(roomName);
    const newRooms = isSelected
      ? form.selectedRooms.filter((r) => r !== roomName)
      : [...form.selectedRooms, roomName];
    updateForm({ selectedRooms: newRooms });
    setCurrentRoomIdx(0);
  };

  const addCustomRoom = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    if (form.selectedRooms.includes(trimmed)) {
      alert('Este ambiente ya está en tu lista.');
      return;
    }
    if (!customRooms.includes(trimmed)) {
      setCustomRooms(prev => [...prev, trimmed]);
    }
    toggleRoom(trimmed);
  };

  const handlePhotoUpload = (file: File | undefined) => {
    if (!file) return;
    const currentFiles = [...(form.photoFiles[activeRoom] || [])];
    if (currentFiles.length >= 6) {
      alert('Podés subir hasta 6 fotografías por ambiente.');
      return;
    }
    const newFiles = [...currentFiles, file];
    const allFiles = { ...form.photoFiles };
    allFiles[activeRoom] = newFiles;
    updateForm({ photoFiles: allFiles, photosUploaded: true });

    // Update previews
    const previews = newFiles.map(f => URL.createObjectURL(f));
    setPhotoPreviews(prev => ({ ...prev, [activeRoom]: previews }));
  };

  const handlePhotoRemove = (idx: number) => {
    const currentFiles = [...(form.photoFiles[activeRoom] || [])];
    currentFiles.splice(idx, 1);
    const allFiles = { ...form.photoFiles };
    allFiles[activeRoom] = currentFiles;
    updateForm({ photoFiles: allFiles, photosUploaded: allFiles[activeRoom].length > 0 });

    const previews = currentFiles.map(f => URL.createObjectURL(f));
    setPhotoPreviews(prev => ({ ...prev, [activeRoom]: previews }));
  };

  const triggerBackgroundAiScan = async (roomName: string, files: File[]) => {
    if (scannedRooms[roomName] || scanningRooms[roomName]) return;
    setScanningRooms(prev => ({ ...prev, [roomName]: true }));
    try {
      const aiAnalysis = await analyzeRoomPhotoWithAi(files, roomName);
      setScanningRooms(prev => ({ ...prev, [roomName]: false }));
      if (aiAnalysis) {
        const result: RoomAiAnalysis = {
          lightQuality: aiAnalysis.lightQuality,
          orderScore: aiAnalysis.orderScore,
          biophiliaScore: aiAnalysis.biophiliaScore,
          colorHarmony: aiAnalysis.colorHarmony,
          spatialBalance: aiAnalysis.spatialBalance,
          summary: aiAnalysis.summary,
          recommendations: aiAnalysis.recommendations,
        };
        setScannedRooms(prev => ({ ...prev, [roomName]: result }));
        updateForm({ scannedRooms: { ...form.scannedRooms, [roomName]: result } });
      }
    } catch (e) {
      setScanningRooms(prev => ({ ...prev, [roomName]: false }));
      console.error('Error analyzing photo', e);
    }
  };

  const goNext = () => {
    // Validations
    if (wizardStep === 1) {
      if (!form.name.trim()) {
        alert('Por favor, ingresá tu nombre para personalizar el diagnóstico.');
        return;
      }
      setSlideClass('slide-in-right');
      setWizardStep(2);
      scrollToCard();
      return;
    }

    if (wizardStep === 2) {
      setSlideClass('slide-in-right');
      setWizardStep(3);
      scrollToCard();
      return;
    }

    if (wizardStep === 3) {
      if (form.selectedRooms.length === 0) {
        alert('Por favor, seleccioná al menos un ambiente de tu casa.');
        return;
      }
      if (!showStep3Transition) {
        setShowStep3Transition(true);
        scrollToCard();
      } else {
        setShowStep3Transition(false);
        setSlideClass('slide-in-right');
        setWizardStep(4);
        setCurrentRoomIdx(0);
        setRoomSubStep(0);
        scrollToCard();
      }
      return;
    }

    if (wizardStep === 4) {
      if (showRoomTransition) {
        setShowRoomTransition(false);
        setCurrentRoomIdx(prev => prev + 1);
        setRoomSubStep(0);
        scrollToCard();
        return;
      }

      if (showFinalTransition) {
        const processedClient = buildClientFromForm(form);
        setCurrentClient(processedClient);
        setClientScreen('processing');
        return;
      }

      // Step 4 Substeps
      if (roomSubStep === 0) {
        // Enforce mandatory photos
        if (roomFiles.length < 2) {
          alert('Por favor, cargá al menos 2 fotos del ambiente. Esto nos permite hacer una observación real del espacio.');
          return;
        }
        // Trigger simulation or real AI vision call in background
        triggerBackgroundAiScan(activeRoom, roomFiles);
      }

      if (roomSubStep < 5) {
        setRoomSubStep(prev => prev + 1);
        scrollToCard();
      } else {
        // Last sub step of active room
        if (currentRoomIdx < form.selectedRooms.length - 1) {
          setShowRoomTransition(true);
          scrollToCard();
        } else {
          setShowFinalTransition(true);
          scrollToCard();
        }
      }
    }
  };

  const goPrev = () => {
    if (wizardStep === 1) {
      setClientScreen('welcome');
      return;
    }

    if (wizardStep === 2) {
      setSlideClass('slide-in-left');
      setWizardStep(1);
      scrollToCard();
      return;
    }

    if (wizardStep === 3) {
      if (showStep3Transition) {
        setShowStep3Transition(false);
      } else {
        setSlideClass('slide-in-left');
        setWizardStep(2);
      }
      scrollToCard();
      return;
    }

    if (wizardStep === 4) {
      if (showRoomTransition) {
        setShowRoomTransition(false);
        setRoomSubStep(5);
        scrollToCard();
        return;
      }

      if (showFinalTransition) {
        setShowFinalTransition(false);
        setRoomSubStep(5);
        scrollToCard();
        return;
      }

      if (roomSubStep > 0) {
        setRoomSubStep(prev => prev - 1);
        scrollToCard();
      } else {
        if (currentRoomIdx > 0) {
          setCurrentRoomIdx(prev => prev - 1);
          setRoomSubStep(5);
          scrollToCard();
        } else {
          setSlideClass('slide-in-left');
          setWizardStep(3);
          scrollToCard();
        }
      }
    }
  };

  const toggleMultiSelect = (field: 'transitions' | 'sharedWith' | 'petTypes' | 'desiredFeelings' | 'predominantSensations', val: string, maxSelection?: number) => {
    const list = [...(form[field] || [])];
    const isSelected = list.includes(val);
    let updated: string[];

    if (isSelected) {
      updated = list.filter(item => item !== val);
    } else {
      if (maxSelection && list.length >= maxSelection) {
        return; // Exceeded limit
      }
      updated = [...list, val];
    }
    updateForm({ [field]: updated });
  };

  const autoFillDemoData = () => {
    const filledForm = {
      name: 'María Eugenia Guerbi',
      age: '38',
      city: 'Buenos Aires',
      transition: 'Separacion',
      hoursAtHome: 'Más de 12 horas',
      hasPets: 'Si',
      slideEmotional1: 2,
      slideEmotional2: 2,
      predominantEmotion: 'Incomodidad',
      desiredFeeling: 'Liviandad, contención, orden y calma',
      selectedRooms: ['Entrada', 'Living', 'Cocina', 'Dormitorio Principal', 'Baño', 'Escritorio', 'Patio / Balcón'],
      roomEvaluations: {
        'Entrada': { feel: 4, mainActivity: 'Ingresar y descompresión', supportsActivity: 'Siempre', light: 'Suficiente', ventilation: 'Aceptable', temperature: 'Agradable', noise: 'Moderado', moisture: 'No', order: 'Se desorganiza fácil', storage: 'Suficiente', circulation: 'Con obstáculos', easeOfUse: 'Fácil', plants: 'Ninguna', views: 'Sin vistas', exteriorRelation: 'Ninguna', specificAnswer1: '', specificAnswer2: '' },
        'Living': { feel: 3, mainActivity: 'Descansar', supportsActivity: 'A veces', light: 'Suficiente', ventilation: 'Aceptable', temperature: 'Agradable', noise: 'Moderado', moisture: 'No', order: 'Se desorganiza fácil', storage: 'Suficiente', circulation: 'Con obstáculos', easeOfUse: 'Fácil', plants: 'Pocas', views: 'Visual edificada', exteriorRelation: 'Ninguna', specificAnswer1: 'A veces', specificAnswer2: 'Sí, une a la casa' },
        'Cocina': { feel: 4, mainActivity: 'Cocinar', supportsActivity: 'Casi siempre', light: 'Muy abundante', ventilation: 'Excelente', temperature: 'Agradable', noise: 'Moderado', moisture: 'No', order: 'Fácil de sostener', storage: 'Suficiente', circulation: 'Fluida y libre', easeOfUse: 'Fácil', plants: 'Ninguna', views: 'Sin vistas', exteriorRelation: 'Ninguna', specificAnswer1: 'Mucho', specificAnswer2: 'Suficiente' },
        'Dormitorio Principal': { feel: 1, mainActivity: 'Dormir y descansar', supportsActivity: 'Pocas veces', light: 'Escasa', ventilation: 'Aceptable', temperature: 'Agradable', noise: 'Moderado', moisture: 'No', order: 'Caótico', storage: 'Falta espacio', circulation: 'Estrecha', easeOfUse: 'Incómodo', plants: 'Ninguna', views: 'Sin vistas', exteriorRelation: 'Ninguna', specificAnswer1: 'Suelo despertarme', specificAnswer2: 'Casi nunca' },
        'Baño': { feel: 2, mainActivity: 'Aseo diario y ducha', supportsActivity: 'A veces', light: 'Escasa', ventilation: 'Mala', temperature: 'Frío', noise: 'Moderado', moisture: 'Sí', order: 'Se desorganiza fácil', storage: 'Poco accesible', circulation: 'Con obstáculos', easeOfUse: 'Incómodo', plants: 'Ninguna', views: 'Sin vistas', exteriorRelation: 'Ninguna', specificAnswer1: 'Es puramente funcional', specificAnswer2: 'Falta espacio de guardado' },
        'Escritorio': { feel: 2, mainActivity: 'Trabajar', supportsActivity: 'A veces', light: 'Escasa', ventilation: 'Aceptable', temperature: 'Agradable', noise: 'Moderado', moisture: 'No', order: 'Se desorganiza fácil', storage: 'Suficiente', circulation: 'Con obstáculos', easeOfUse: 'Fácil', plants: 'Ninguna', views: 'Sin vistas', exteriorRelation: 'Ninguna', specificAnswer1: 'Con dificultad', specificAnswer2: 'Aceptable' },
        'Patio / Balcón': { feel: 5, mainActivity: 'Relajarse al aire libre', supportsActivity: 'Siempre', light: 'Muy abundante', ventilation: 'Excelente', temperature: 'Agradable', noise: 'Silencioso', moisture: 'No', order: 'Fácil de sostener', storage: 'Suficiente', circulation: 'Fluida y libre', easeOfUse: 'Fácil', plants: 'Muchas', views: 'Visual al verde', exteriorRelation: 'Directa', specificAnswer1: 'Mucho', specificAnswer2: 'Sí, fluye muy bien' },
      },
      slidePhys1: 3, slidePhys2: 2, hasMoisture: 'No', hasSyntheticMaterials: 'No',
      slideBio1: 2, slideBio2: 2, hasPauseSpace: 'No',
      slideOrd1: 3, slideOrd2: 3, hasInheritedObjects: 'No',
      photosUploaded: true, photoFiles: {}, housingStatus: 'Alquiler', budget: 'Medio',
      interventionType: '🌿 Pequeños cambios',
      transitions: ['Separación'],
      sharedWith: ['Vivo solo/a'],
      petTypes: ['Gatos'],
      petCount: '1',
      desiredFeelings: ['🌿 Más tranquilo', '😴 Descansar mejor', '📦 Vivir con más orden'],
      arrivalFeeling: '😐 Entro y sigo con mi día.',
      homeRepresentation: '🏡 Cumple su función, pero ya no acompaña tu momento actual.',
      predominantSensations: ['Desorden', 'Estrés'],
      favoriteRoom: 'Patio / Balcón',
      avoidedRoom: 'Si',
      avoidedRoomName: 'Dormitorio Principal',
      desiredDailyFeeling: '🌿 Más calma.',
      relationshipPhrase: 'Siento que mi casa quedó en otra etapa de mi vida.',
    };

    updateForm(filledForm);
    const mockScans: Record<string, RoomAiAnalysis> = {};
    filledForm.selectedRooms.forEach(r => {
      mockScans[r] = {
        lightQuality: r === 'Dormitorio Principal' || r === 'Baño' ? 30 : 80,
        orderScore: r === 'Dormitorio Principal' ? 25 : 75,
        biophiliaScore: r === 'Patio / Balcón' ? 95 : 35,
        colorHarmony: 80,
        spatialBalance: 85,
        summary: `Análisis simulado para ${r}. Mapeo estructural estable con potencial de mejora ambiental.`,
        recommendations: [`Mejorar orden en ${r}`, `Establecer puntos de luz cálida`],
      };
    });
    setScannedRooms(mockScans);
    setCompletedSteps([1, 2, 3]);
    setWizardStep(4);
    setCurrentRoomIdx(0);
    setRoomSubStep(0);
  };

  return (
    <div className="container" style={{ paddingTop: '0', paddingBottom: '60px' }}>
      
      {/* Dynamic CSS Styling for visual card grids and responsive elements */}
      <style>{`
        .choice-card {
          padding: 16px;
          border: 1px solid #D6D2CA;
          border-radius: 8px;
          background: #fff;
          cursor: pointer;
          text-align: left;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .choice-card:hover {
          border-color: #987557;
          background: rgba(152, 117, 87, 0.01);
        }
        .choice-card.selected {
          border-color: #987557;
          background: rgba(152, 117, 87, 0.04);
          box-shadow: 0 0 0 1px #987557;
        }
        .choice-card-title {
          font-weight: 550;
          font-size: 0.92rem;
          color: #1C1917;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .choice-card-desc {
          font-size: 0.78rem;
          color: #878179;
          font-weight: 400;
          line-height: 1.35;
        }
        .choices-grid-layout {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 12px;
          margin-top: 10px;
        }
        .choices-grid-layout-small {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
          gap: 10px;
          margin-top: 10px;
        }
        .choice-pill-btn {
          padding: 10px 14px;
          border: 1px solid #D6D2CA;
          border-radius: 20px;
          background: #fff;
          cursor: pointer;
          font-size: 0.84rem;
          font-weight: 500;
          color: #44403C;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          text-align: center;
        }
        .choice-pill-btn:hover {
          border-color: #987557;
          background: rgba(152, 117, 87, 0.02);
        }
        .choice-pill-btn.selected {
          border-color: #987557;
          background: #987557;
          color: #fff;
        }
        .limit-indicator {
          font-size: 0.72rem;
          color: #987557;
          font-style: italic;
          margin-top: 6px;
          display: block;
          font-weight: 500;
        }
        .guide-checklist-box {
          background: #FAF9F6;
          padding: 16px 20px;
          border-radius: 8px;
          border: 1px solid #EAE7E1;
          margin-top: 20px;
          text-align: left;
        }
        .guide-checklist-box ul {
          list-style: none;
          padding: 0;
          margin: 10px 0 0 0;
        }
        .guide-checklist-box li {
          font-size: 0.8rem;
          color: #5C5852;
          margin-bottom: 6px;
          display: flex;
          align-items: flex-start;
          gap: 8px;
        }
        .sub-step-stepper-dots {
          display: flex;
          justify-content: center;
          gap: 6px;
          margin: 12px 0 24px;
        }
        .sub-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #D6D2CA;
          transition: all 0.3s;
        }
        .sub-dot.active {
          background: #987557;
          transform: scale(1.3);
        }
        .sub-dot.completed {
          background: #5C7A63;
        }
        .activity-card-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
          gap: 8px;
          margin-top: 10px;
        }
        .drawer-overlay {
          background: rgba(28, 25, 23, 0.2);
          backdrop-filter: blur(2px);
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 100;
          display: flex;
          align-items: flex-end;
          justify-content: center;
        }
        .drawer-content {
          background: #FFF;
          width: 100%;
          max-width: 500px;
          border-top-left-radius: 16px;
          border-top-right-radius: 16px;
          padding: 24px;
          max-height: 80vh;
          overflow-y: auto;
          box-shadow: 0 -8px 30px rgba(0,0,0,0.08);
          animation: slideUp 0.3s ease-out;
        }
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}</style>

      {/* ── Sticky Progress Bar (Mobile only) ── */}
      <div className="wizard-progress-sticky no-print">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
          <span style={{ fontSize: '0.7rem', fontFamily: 'Jost, sans-serif', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600, color: 'var(--brand-primary)' }}>
            {STEPS[wizardStep - 1].label}
          </span>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Paso {wizardStep} de 4</span>
        </div>
        <div style={{ width: '100%', height: '3px', background: 'var(--border-color)', borderRadius: '2px', overflow: 'hidden' }}>
          <div style={{ height: '100%', background: 'var(--brand-primary)', transition: 'width 0.5s ease', width: `${(wizardStep / 4) * 100}%` }} />
        </div>
      </div>

      <div className="wizard-layout" style={{ paddingTop: '24px' }}>

        {/* Sidebar (Desktop only) */}
        <aside className="wizard-sidebar hidden lg:flex">
          <div className="wizard-sidebar-title">Mapa de Habitar</div>
          {STEPS.map((step) => {
            const isActive = wizardStep === step.id;
            const isCompleted = completedSteps.includes(step.id) || wizardStep > step.id;
            return (
              <button
                key={step.id}
                onClick={() => (isCompleted || isActive ? setWizardStep(step.id) : null)}
                className={`wizard-nav-item ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
                style={{ textAlign: 'left' }}
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
          <div className="wizard-header" style={{ marginBottom: '24px' }}>
            <div>
              <p style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.2em', color: 'var(--brand-primary)', fontWeight: 600, marginBottom: '4px' }}>
                Paso {wizardStep} de 4
              </p>
              <h2 className="text-3xl font-light" style={{ fontFamily: 'Cormorant Garamond, serif', margin: 0 }}>
                {wizardStep === 1 && '🤍 Conversación 1 · Conocerte'}
                {wizardStep === 2 && '🤍 Conversación 2 · ¿Cómo vivís tu hogar?'}
                {wizardStep === 3 && '🏡 Conversación 3 · Conozcamos tu hogar'}
                {wizardStep === 4 && '🛋️ Conversación 4 · Recorremos tu hogar'}
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

            {/* ── CONVERSACIÓN 1: Datos y Contexto ── */}
            {wizardStep === 1 && (
              <div className="animate-[fadeIn_0.4s_ease-out]" style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                
                <p style={{ fontSize: '0.86rem', color: '#878179', margin: '0 0 -10px 0', lineHeight: 1.5 }}>
                  Antes de observar tu hogar, queremos comprender un poco más sobre vos y el momento de vida que estás atravesando. Cada respuesta nos ayudará a elaborar un diagnóstico adaptado a tu realidad.<br/>
                  <span style={{ fontWeight: 550, marginTop: '4px', display: 'inline-block' }}>⏱️ Duración aproximada: 2 minutos.</span>
                </p>

                {/* Datos básicos */}
                <div style={{ background: '#FAF9F6', padding: '20px', borderRadius: '8px', border: '1px solid #EAE7E1' }}>
                  <p style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600, color: '#987557', marginBottom: '14px', marginTop: 0 }}>
                    Datos básicos
                  </p>
                  <div className="form-group" style={{ marginBottom: '16px' }}>
                    <label className="form-label" htmlFor="user-name">Nombre completo</label>
                    <input type="text" id="user-name" className="form-input"
                      placeholder="Tu nombre completo" value={form.name}
                      onChange={(e) => updateForm({ name: e.target.value })} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" htmlFor="user-age">Edad</label>
                      <input type="number" id="user-age" className="form-input" placeholder="Tu edad"
                        value={form.age} onChange={(e) => updateForm({ age: e.target.value })} />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" htmlFor="user-city">Ciudad</label>
                      <input type="text" id="user-city" className="form-input" placeholder="Buenos Aires"
                        value={form.city} onChange={(e) => updateForm({ city: e.target.value })} />
                    </div>
                  </div>
                </div>

                {/* Tipo de vivienda */}
                <div className="form-group">
                  <label className="form-label">¿Cómo es tu vivienda?</label>
                  <div className="choices-grid-layout-small">
                    {['Propia', 'Alquilada', 'Familiar', 'Temporal'].map((opt) => (
                      <button key={opt} type="button"
                        onClick={() => updateForm({ housingStatus: opt })}
                        className={`choice-pill-btn ${form.housingStatus === opt ? 'selected' : ''}`}>
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Posibilidad de intervención */}
                <div className="form-group">
                  <label className="form-label">¿Qué tipo de cambios imaginás realizar?</label>
                  <div className="choices-grid-layout" style={{ gridTemplateColumns: '1fr' }}>
                    {[
                      { val: '🌿 Pequeños cambios', title: '🌿 Pequeños cambios', desc: 'Reorganización, orden, decoración y mejoras simples.' },
                      { val: '🪑 Mejoras progresivas', title: '🪑 Mejoras progresivas', desc: 'Renovación de algunos ambientes, muebles e iluminación.' },
                      { val: '🏡 Reforma integral', title: '🏡 Reforma integral', desc: 'Cambios importantes o remodelación completa.' },
                    ].map((opt) => (
                      <div key={opt.val}
                        onClick={() => updateForm({ interventionType: opt.val })}
                        className={`choice-card ${form.interventionType === opt.val ? 'selected' : ''}`}>
                        <span className="choice-card-title">{opt.title}</span>
                        <span className="choice-card-desc">{opt.desc}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Momento de vida */}
                <div className="form-group">
                  <label className="form-label">¿Estás atravesando algún cambio importante?</label>
                  <div className="choices-grid-layout-small">
                    {['Ninguno', 'Mudanza', 'Separación', 'Duelo', 'Nueva etapa', 'Nacimiento', 'Hijos que se fueron de casa', 'Trabajo desde casa', 'Jubilación', 'Otro'].map((opt) => {
                      const isSel = (form.transitions || []).includes(opt);
                      return (
                        <button key={opt} type="button"
                          onClick={() => toggleMultiSelect('transitions', opt)}
                          className={`choice-pill-btn ${isSel ? 'selected' : ''}`}>
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Tiempo de uso */}
                <div className="form-group">
                  <label className="form-label">¿Cuánto tiempo pasás en tu hogar durante un día habitual?</label>
                  <div className="choices-grid-layout" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                    {['Menos de 6 horas', 'Entre 6 y 12 horas', 'Más de 12 horas'].map((opt) => (
                      <button key={opt} type="button"
                        onClick={() => updateForm({ hoursAtHome: opt })}
                        className={`choice-pill-btn ${form.hoursAtHome === opt ? 'selected' : ''}`}
                        style={{ padding: '12px' }}>
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Personas que habitan */}
                <div className="form-group">
                  <label className="form-label">¿Quiénes comparten tu hogar?</label>
                  <div className="choices-grid-layout-small">
                    {['Vivo solo/a', 'Pareja', 'Hijos', 'Adultos mayores', 'Familiares', 'Compañeros de vivienda'].map((opt) => {
                      const isSel = (form.sharedWith || []).includes(opt);
                      return (
                        <button key={opt} type="button"
                          onClick={() => toggleMultiSelect('sharedWith', opt)}
                          className={`choice-pill-btn ${isSel ? 'selected' : ''}`}>
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Mascotas */}
                <div className="form-group">
                  <label className="form-label">¿Convivís con mascotas?</label>
                  <div style={{ display: 'flex', gap: '12px', marginTop: '6px' }}>
                    {['Si', 'No'].map((opt) => (
                      <button key={opt} type="button"
                        onClick={() => updateForm({ hasPets: opt })}
                        className={`choice-pill-btn ${form.hasPets === opt ? 'selected' : ''}`}
                        style={{ flex: 1, padding: '12px' }}>
                        {opt === 'Si' ? 'Sí' : 'No'}
                      </button>
                    ))}
                  </div>

                  {form.hasPets === 'Si' && (
                    <div className="animate-[fadeIn_0.3s_ease-out]" style={{ marginTop: '20px', padding: '16px', background: '#FAF9F6', borderRadius: '8px', border: '1px solid #EAE7E1', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <div>
                        <label className="form-label" style={{ fontSize: '0.78rem' }}>¿Qué mascotas viven con vos?</label>
                        <div className="choices-grid-layout-small" style={{ marginTop: '6px' }}>
                          {['Perros', 'Gatos', 'Aves', 'Peces', 'Tortugas', 'Otras'].map((pet) => {
                            const isSel = (form.petTypes || []).includes(pet);
                            return (
                              <button key={pet} type="button"
                                onClick={() => toggleMultiSelect('petTypes', pet)}
                                className={`choice-pill-btn ${isSel ? 'selected' : ''}`}
                                style={{ padding: '8px 12px', fontSize: '0.78rem' }}>
                                {pet}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                      <div>
                        <label className="form-label" style={{ fontSize: '0.78rem' }}>¿Cuántas mascotas viven con vos?</label>
                        <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                          {['1', '2', '3 o más'].map((num) => (
                            <button key={num} type="button"
                              onClick={() => updateForm({ petCount: num })}
                              className={`choice-pill-btn ${form.petCount === num ? 'selected' : ''}`}
                              style={{ flex: 1, padding: '8px 10px', fontSize: '0.78rem' }}>
                              {num}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* La pregunta más importante */}
                <div className="form-group" style={{ borderTop: '1px solid #EAE7E1', paddingTop: '24px' }}>
                  <label className="form-label" style={{ color: '#1C1917' }}>¿Cómo te gustaría sentirte en tu hogar?</label>
                  <span style={{ fontSize: '0.76rem', color: '#878179', display: 'block', marginBottom: '8px' }}>
                    Elegí hasta tres opciones. Esta respuesta define los objetivos principales de tu diagnóstico.
                  </span>
                  <div className="choices-grid-layout-small">
                    {[
                      '🌿 Más tranquilo',
                      '😴 Descansar mejor',
                      '😊 Más feliz',
                      '💪 Tener más energía',
                      '👨👩👧 Compartir más tiempo con mi familia',
                      '🎨 Sentirme inspirado',
                      '📦 Vivir con más orden',
                      '🏡 Sentirme realmente en casa',
                      '💼 Trabajar más cómodo',
                      '✨ Otro'
                    ].map((feel) => {
                      const isSel = (form.desiredFeelings || []).includes(feel);
                      const isLimit = !isSel && (form.desiredFeelings || []).length >= 3;
                      return (
                        <button key={feel} type="button"
                          disabled={isLimit}
                          onClick={() => toggleMultiSelect('desiredFeelings', feel, 3)}
                          className={`choice-pill-btn ${isSel ? 'selected' : ''}`}
                          style={{ opacity: isLimit ? 0.5 : 1, padding: '10px', fontSize: '0.8rem' }}>
                          {feel}
                        </button>
                      );
                    })}
                  </div>
                  <span className="limit-indicator">
                    Selected: {(form.desiredFeelings || []).length} / 3
                  </span>
                </div>

              </div>
            )}

            {/* ── CONVERSACIÓN 2: ¿Cómo vivís tu hogar? ── */}
            {wizardStep === 2 && (
              <div className="animate-[fadeIn_0.4s_ease-out]" style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                
                <p style={{ fontSize: '0.86rem', color: '#878179', margin: '0 0 -10px 0', lineHeight: 1.5 }}>
                  Cada persona vive su hogar de una manera diferente. No existen respuestas correctas o incorrectas. Solo queremos comprender cómo se siente tu experiencia cotidiana para elaborar un diagnóstico realmente personalizado.<br/>
                  <span style={{ fontWeight: 550, marginTop: '4px', display: 'inline-block' }}>⏱️ Duración aproximada: 2 minutos.</span>
                </p>

                {/* Pregunta 1 */}
                <div className="form-group">
                  <label className="form-label">Cuando llegás a tu casa… ¿Cuál de estas frases se parece más a vos?</label>
                  <div className="choices-grid-layout" style={{ gridTemplateColumns: '1fr' }}>
                    {[
                      '🌿 Siento que puedo bajar un cambio.',
                      '😊 Me gusta volver.',
                      '😐 Entro y sigo con mi día.',
                      '😓 Empiezo a pensar en todo lo que tengo que hacer.',
                      '😣 Me siento sobrepasado.'
                    ].map((option) => (
                      <div key={option}
                        onClick={() => updateForm({ arrivalFeeling: option })}
                        className={`choice-card ${form.arrivalFeeling === option ? 'selected' : ''}`}>
                        <span className="choice-card-title">{option}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pregunta 2 */}
                <div className="form-group">
                  <label className="form-label">Hoy sentís que tu casa…</label>
                  <div className="choices-grid-layout" style={{ gridTemplateColumns: '1fr' }}>
                    {[
                      '🤍 Refleja quién sos.',
                      '🌱 Te representa en parte.',
                      '🏡 Cumple su función, pero ya no acompaña tu momento actual.',
                      '🌪 Sentís que dejó de representar tu vida.'
                    ].map((option) => (
                      <div key={option}
                        onClick={() => updateForm({ homeRepresentation: option })}
                        className={`choice-card ${form.homeRepresentation === option ? 'selected' : ''}`}>
                        <span className="choice-card-title">{option}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pregunta 3 */}
                <div className="form-group">
                  <label className="form-label">¿Qué palabra describe mejor la sensación que predomina cuando estás en tu hogar?</label>
                  <span style={{ fontSize: '0.76rem', color: '#878179', display: 'block', marginBottom: '8px' }}>
                    Elegí hasta tres.
                  </span>
                  <div className="choices-grid-layout-small">
                    {[
                      '🌿 Calma',
                      '🤍 Refugio',
                      '😊 Bienestar',
                      '💪 Energía',
                      '🎨 Inspiración',
                      '😴 Descanso',
                      '📦 Desorden',
                      '😓 Estrés',
                      '😣 Agobio',
                      '😐 Indiferencia',
                      '🏠 Seguridad',
                      '✨ Alegría'
                    ].map((sens) => {
                      const isSel = (form.predominantSensations || []).includes(sens);
                      const isLimit = !isSel && (form.predominantSensations || []).length >= 3;
                      return (
                        <button key={sens} type="button"
                          disabled={isLimit}
                          onClick={() => toggleMultiSelect('predominantSensations', sens, 3)}
                          className={`choice-pill-btn ${isSel ? 'selected' : ''}`}
                          style={{ opacity: isLimit ? 0.5 : 1, padding: '10px 12px' }}>
                          {sens}
                        </button>
                      );
                    })}
                  </div>
                  <span className="limit-indicator">
                    Selected: {(form.predominantSensations || []).length} / 3
                  </span>
                </div>

                {/* Pregunta 4 */}
                <div className="form-group">
                  <label className="form-label">¿Qué espacio disfrutás más?</label>
                  <div className="choices-grid-layout-small">
                    {['Living', 'Dormitorio', 'Cocina', 'Comedor', 'Baño', 'Patio', 'Balcón', 'Otro'].map((space) => (
                      <button key={space} type="button"
                        onClick={() => updateForm({ favoriteRoom: space })}
                        className={`choice-pill-btn ${form.favoriteRoom === space ? 'selected' : ''}`}>
                        {space}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Pregunta 5 */}
                <div className="form-group">
                  <label className="form-label">¿Hay algún ambiente que hoy evitás?</label>
                  <div style={{ display: 'flex', gap: '12px', marginTop: '6px' }}>
                    {['No', 'Si'].map((opt) => (
                      <button key={opt} type="button"
                        onClick={() => updateForm({ avoidedRoom: opt })}
                        className={`choice-pill-btn ${form.avoidedRoom === opt ? 'selected' : ''}`}
                        style={{ flex: 1, padding: '12px' }}>
                        {opt === 'Si' ? 'Sí' : 'No'}
                      </button>
                    ))}
                  </div>

                  {form.avoidedRoom === 'Si' && (
                    <div className="animate-[fadeIn_0.3s_ease-out]" style={{ marginTop: '14px' }}>
                      <label className="form-label" style={{ fontSize: '0.78rem' }}>¿Cuál es el ambiente que evitás?</label>
                      <input type="text" className="form-input" placeholder="Ej: Dormitorio secundario, sótano..."
                        value={form.avoidedRoomName} onChange={(e) => updateForm({ avoidedRoomName: e.target.value })} />
                    </div>
                  )}
                </div>

                {/* Pregunta 6 */}
                <div className="form-group">
                  <label className="form-label">Si tu hogar pudiera regalarte una sensación todos los días… ¿Cuál elegirías?</label>
                  <div className="choices-grid-layout" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
                    {[
                      '🌿 Más calma.',
                      '😴 Descansar mejor.',
                      '💪 Más energía.',
                      '😊 Más alegría.',
                      '🏡 Sentirme realmente en casa.',
                      '👨👩👧 Compartir más tiempo.',
                      '🎨 Inspirarme.',
                      '✨ Disfrutar más mi vida cotidiana.'
                    ].map((opt) => (
                      <button key={opt} type="button"
                        onClick={() => updateForm({ desiredDailyFeeling: opt })}
                        className={`choice-pill-btn ${form.desiredDailyFeeling === opt ? 'selected' : ''}`}
                        style={{ padding: '12px', textAlign: 'left', justifyContent: 'flex-start' }}>
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Pregunta 7 */}
                <div className="form-group">
                  <label className="form-label">Si pudieras describir hoy la relación con tu hogar en una frase… (Opcional)</label>
                  <textarea className="form-input" rows={3}
                    placeholder='Ej: "Me gustaría sentir que mi casa me abraza" o "Siento que mi casa quedó en otra etapa de mi vida."'
                    value={form.relationshipPhrase} onChange={(e) => updateForm({ relationshipPhrase: e.target.value })}
                    style={{ resize: 'vertical', minHeight: '80px', padding: '12px' }} />
                </div>

              </div>
            )}

            {/* ── CONVERSACIÓN 3: Conozcamos tu hogar ── */}
            {wizardStep === 3 && !showStep3Transition && (
              <div className="animate-[fadeIn_0.4s_ease-out]">
                
                <p style={{ fontSize: '0.86rem', color: '#878179', margin: '0 0 20px 0', lineHeight: 1.5 }}>
                  Cada hogar es único. Seleccioná únicamente los ambientes que forman parte de tu casa. En el siguiente paso recorreremos solo esos espacios para comprender cómo influyen en tu bienestar cotidiano.<br/>
                  <span style={{ fontWeight: 550, marginTop: '4px', display: 'inline-block' }}>⏱️ Duración aproximada: 1 minuto.</span>
                </p>

                <div className="room-selector-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '10px' }}>
                  {Object.keys(DEFAULT_ROOM_ICONS).map((roomKey) => {
                    const isSelected = form.selectedRooms.includes(roomKey);
                    return (
                      <button key={roomKey} type="button"
                        onClick={() => toggleRoom(roomKey)}
                        className={`room-card-option ${isSelected ? 'selected' : ''}`}>
                        <div className="room-icon-placeholder" style={{ fontSize: '1.4rem' }}>{DEFAULT_ROOM_ICONS[roomKey]}</div>
                        <span style={{ fontSize: '0.78rem', fontWeight: 500 }}>
                          {roomKey === 'Dormitorio Principal' ? 'Dorm. Principal' : roomKey === 'Dormitorio Secundario' ? 'Dorm. Secund.' : roomKey}
                        </span>
                      </button>
                    );
                  })}

                  {/* Added custom rooms */}
                  {customRooms.map((roomKey) => {
                    const isSelected = form.selectedRooms.includes(roomKey);
                    return (
                      <button key={roomKey} type="button"
                        onClick={() => toggleRoom(roomKey)}
                        className={`room-card-option ${isSelected ? 'selected' : ''}`}>
                        <div className="room-icon-placeholder" style={{ fontSize: '1.4rem' }}>🏠</div>
                        <span style={{ fontSize: '0.78rem', fontWeight: 500 }}>{roomKey}</span>
                      </button>
                    );
                  })}

                  {/* Add environment button */}
                  <button type="button" onClick={() => setShowCustomListDrawer(true)}
                    className="room-card-option"
                    style={{ borderStyle: 'dashed', borderColor: 'var(--brand-primary)', background: 'transparent' }}>
                    <div className="room-icon-placeholder" style={{ color: 'var(--brand-primary)', fontSize: '1.4rem' }}>
                      <Plus size={20} />
                    </div>
                    <span style={{ color: 'var(--brand-primary)', fontWeight: 600, fontSize: '0.78rem' }}>Agregar ambiente</span>
                  </button>
                </div>

                {form.selectedRooms.length > 0 && (
                  <p style={{ marginTop: '20px', fontSize: '0.82rem', color: '#5C7A63', fontWeight: 550, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CheckCircle2 size={14} /> {form.selectedRooms.length} ambiente{form.selectedRooms.length > 1 ? 's' : ''} seleccionado{form.selectedRooms.length > 1 ? 's' : ''}
                  </p>
                )}

                {/* Additional Room Drawer */}
                {showCustomListDrawer && (
                  <div className="drawer-overlay" onClick={() => setShowCustomListDrawer(false)}>
                    <div className="drawer-content" onClick={(e) => e.stopPropagation()}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.4rem', margin: 0, fontWeight: 500 }}>Ambientes adicionales</h3>
                        <button type="button" className="choice-pill-btn" onClick={() => setShowCustomListDrawer(false)} style={{ padding: '4px 8px', borderRadius: '4px' }}>✕</button>
                      </div>

                      <div className="choices-grid-layout-small" style={{ maxHeight: '250px', overflowY: 'auto', paddingRight: '4px' }}>
                        {ADDITIONAL_ROOMS.map((add) => {
                          const isSel = form.selectedRooms.includes(add.name);
                          return (
                            <button key={add.name} type="button"
                              onClick={() => {
                                toggleRoom(add.name);
                              }}
                              className={`choice-pill-btn ${isSel ? 'selected' : ''}`}
                              style={{ justifyContent: 'flex-start', padding: '10px' }}>
                              <span>{add.icon}</span> {add.name}
                            </button>
                          );
                        })}
                      </div>

                      <div style={{ borderTop: '1px solid #EAE7E1', marginTop: '18px', paddingTop: '16px' }}>
                        <label className="form-label" style={{ fontSize: '0.78rem' }}>Otro ambiente personalizado</label>
                        <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                          <input type="text" className="form-input" placeholder="Ej: Ático, Invernadero..."
                            value={customRoomNameInput} onChange={(e) => setCustomRoomNameInput(e.target.value)}
                            style={{ flex: 1, padding: '8px 12px' }} />
                          <button type="button" className="btn btn-primary"
                            onClick={() => {
                              addCustomRoom(customRoomNameInput);
                              setCustomRoomNameInput('');
                            }}
                            style={{ padding: '8px 16px', borderRadius: '6px', fontSize: '0.78rem' }}>
                            Agregar
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            )}

            {/* ── CONVERSACIÓN 3 TRANSICIÓN: Estructura Completa ── */}
            {wizardStep === 3 && showStep3Transition && (
              <div className="animate-[fadeIn_0.4s_ease-out] text-center" style={{ padding: '40px 20px' }}>
                <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🏡</div>
                <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.8rem', fontWeight: 300, color: 'var(--text-charcoal)', margin: '0 0 16px 0' }}>
                  Perfecto. Ya conocemos la estructura de tu hogar.
                </h3>
                <p style={{ fontSize: '0.9rem', color: '#878179', lineHeight: 1.6, maxWidth: '440px', margin: '0 auto 28px auto' }}>
                  Ahora vamos a recorrer cada uno de los ambientes que elegiste para comprender cómo los vivís y detectar oportunidades para mejorar tu bienestar.
                </p>
                <button type="button" onClick={goNext} className="btn btn-primary" style={{ padding: '12px 28px', fontSize: '0.9rem', margin: '0 auto' }}>
                  Comenzar el recorrido →
                </button>
              </div>
            )}

            {/* ── CONVERSACIÓN 4: Recorremos tu hogar ── */}
            {wizardStep === 4 && !showRoomTransition && !showFinalTransition && (
              <div className="animate-[fadeIn_0.4s_ease-out]">
                
                {/* Header Humano */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: '20px', borderBottom: '1px solid #EAE7E1', paddingBottom: '16px' }}>
                  <div style={{ fontSize: '2rem' }}>{getRoomIcon(activeRoom)}</div>
                  <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.6rem', fontWeight: 400, color: '#1C1917', margin: '4px 0 2px' }}>
                    {activeRoom === 'Entrada' ? 'Entrada / Hall' : activeRoom}
                  </h3>
                  <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#987557', fontWeight: 550 }}>
                    {currentRoomIdx === 0 ? 'Primer' : currentRoomIdx === form.selectedRooms.length - 1 ? 'Último' : `${currentRoomIdx + 1}°`} ambiente de {form.selectedRooms.length}
                  </span>

                  {/* Sub Step Stepper Dots */}
                  <div className="sub-step-stepper-dots">
                    {[0, 1, 2, 3, 4, 5].map((s) => (
                      <div key={s} className={`sub-dot ${s === roomSubStep ? 'active' : s < roomSubStep ? 'completed' : ''}`} />
                    ))}
                  </div>
                  <span style={{ fontSize: '0.7rem', color: '#878179', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {roomSubStep === 0 && '📷 Fotografías'}
                    {roomSubStep === 1 && '😊 Experiencia'}
                    {roomSubStep === 2 && '☀️ Confort ambiental'}
                    {roomSubStep === 3 && '📦 Organización'}
                    {roomSubStep === 4 && '🌿 Naturaleza'}
                    {roomSubStep === 5 && '✨ Detalles específicos'}
                  </span>
                </div>

                {/* SUBSTEP 0: FOTOGRAFÍAS */}
                {roomSubStep === 0 && (
                  <div className="animate-[fadeIn_0.3s_ease-out]">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                      <Camera size={18} style={{ color: '#987557' }} />
                      <h4 style={{ margin: 0, fontSize: '0.94rem', fontWeight: 600 }}>Conozcamos este ambiente</h4>
                    </div>
                    <p style={{ fontSize: '0.8rem', color: '#878179', lineHeight: 1.4, margin: '0 0 16px 0' }}>
                      Las fotografías forman parte del Método Bianchi®. Nos permiten observar aspectos del espacio que no siempre pueden describirse con palabras y construir un diagnóstico mucho más preciso.
                    </p>

                    {/* Photo upload grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))', gap: '10px', marginBottom: '16px' }}>
                      {roomFiles.map((_file, idx) => {
                        const url = photoPreviews[activeRoom]?.[idx] || '/bianchi_interior.png';
                        return (
                          <div key={idx} className="polaroid-card" style={{ padding: '4px', position: 'relative' }}>
                            <div style={{ height: '80px', borderRadius: '4px', overflow: 'hidden' }}>
                              <img src={url} alt={`${activeRoom}-${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </div>
                            <button type="button" onClick={() => handlePhotoRemove(idx)}
                              style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(239,68,68,0.9)', color: '#fff', border: 'none', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                              <Trash2 size={10} />
                            </button>
                          </div>
                        );
                      })}

                      {roomFiles.length < 6 && (
                        <div>
                          <input type="file" accept="image/*" id={`photo-file-${activeRoom}`} style={{ display: 'none' }}
                            onChange={(e) => handlePhotoUpload(e.target.files?.[0])} />
                          <button type="button" onClick={() => document.getElementById(`photo-file-${activeRoom}`)?.click()}
                            className="room-card-option" style={{ borderStyle: 'dashed', height: '88px', width: '100%', padding: 0 }}>
                            <Upload size={14} style={{ color: '#987557' }} />
                            <span style={{ fontSize: '0.62rem', fontWeight: 600, color: '#987557' }}>Subir foto</span>
                          </button>
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#878179', marginBottom: '10px' }}>
                      <span>Mínimo: 2 fotos · Subidas: {roomFiles.length}</span>
                      <span>Ideal: 2 a 4 fotos</span>
                    </div>

                    {roomFiles.length >= 2 && (
                      <div className="animate-[fadeIn_0.3s_ease-out]" style={{ background: 'rgba(92,122,99,0.06)', border: '1px solid rgba(92,122,99,0.2)', padding: '12px', borderRadius: '6px', marginBottom: '16px', fontSize: '0.8rem', color: '#3A4F3F', fontWeight: 550 }}>
                        ✨ Perfecto. Ya conocemos este espacio. Ahora queremos comprender cómo lo vivís.
                      </div>
                    )}

                    {/* Small Guide Checklist */}
                    <div className="guide-checklist-box">
                      <span style={{ fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#987557' }}>Pequeña guía</span>
                      <ul>
                        <li><Check size={12} style={{ color: '#5C7A63', flexShrink: 0, marginTop: '2px' }} /> Mostrá el ambiente completo.</li>
                        <li><Check size={12} style={{ color: '#5C7A63', flexShrink: 0, marginTop: '2px' }} /> Sacá fotos desde distintos ángulos.</li>
                        <li><Check size={12} style={{ color: '#5C7A63', flexShrink: 0, marginTop: '2px' }} /> Aprovechá la luz natural.</li>
                        <li><Check size={12} style={{ color: '#5C7A63', flexShrink: 0, marginTop: '2px' }} /> No hace falta ordenar. Queremos conocer cómo se vive realmente.</li>
                      </ul>
                    </div>

                  </div>
                )}

                {/* SUBSTEP 1: EXPERIENCIA */}
                {roomSubStep === 1 && (
                  <div className="animate-[fadeIn_0.3s_ease-out]" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    
                    <div className="form-group">
                      <label className="form-label">¿Cómo te sentís habitualmente cuando estás en este ambiente?</label>
                      <div className="choices-grid-layout" style={{ gridTemplateColumns: '1fr' }}>
                        {[
                          { val: 5, label: '😊 Muy bien' },
                          { val: 4, label: '🙂 Bien' },
                          { val: 3, label: '😐 Indiferente' },
                          { val: 2, label: '😕 Incómodo' },
                          { val: 1, label: '😣 Muy incómodo' }
                        ].map((opt) => (
                          <button key={opt.val} type="button"
                            onClick={() => updateActiveRoomEval({ feel: opt.val })}
                            className={`choice-pill-btn ${roomEval.feel === opt.val ? 'selected' : ''}`}
                            style={{ padding: '12px', justifyContent: 'flex-start' }}>
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">¿Qué actividad realizás principalmente en este ambiente?</label>
                      <div className="choices-grid-layout-small">
                        {(ROOM_ACTIVITIES[activeRoom] || ['Estar', 'Trabajar', 'Guardar', 'Recreación', 'Descansar']).map((act) => (
                          <button key={act} type="button"
                            onClick={() => updateActiveRoomEval({ mainActivity: act })}
                            className={`choice-pill-btn ${roomEval.mainActivity === act ? 'selected' : ''}`}
                            style={{ fontSize: '0.74rem', padding: '8px 10px' }}>
                            {act}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">¿Sentís que este ambiente acompaña bien esa actividad?</label>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '6px' }}>
                        {['Siempre', 'Casi siempre', 'A veces', 'Pocas veces', 'Nunca'].map((opt) => (
                          <button key={opt} type="button"
                            onClick={() => updateActiveRoomEval({ supportsActivity: opt })}
                            className={`choice-pill-btn ${roomEval.supportsActivity === opt ? 'selected' : ''}`}
                            style={{ flex: '1 1 auto', padding: '10px', fontSize: '0.78rem' }}>
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>

                  </div>
                )}

                {/* SUBSTEP 2: CONFORT AMBIENTAL */}
                {roomSubStep === 2 && (
                  <div className="animate-[fadeIn_0.3s_ease-out]" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    
                    <div className="form-group">
                      <label className="form-label">¿Cómo percibís la luz natural durante el día?</label>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '6px' }}>
                        {['Muy abundante', 'Suficiente', 'Escasa', 'Casi no hay'].map((opt) => (
                          <button key={opt} type="button"
                            onClick={() => updateActiveRoomEval({ light: opt })}
                            className={`choice-pill-btn ${roomEval.light === opt ? 'selected' : ''}`}
                            style={{ flex: '1 1 45%', padding: '10px', fontSize: '0.78rem' }}>
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">¿Cómo es la ventilación de este espacio?</label>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '6px' }}>
                        {['Excelente', 'Aceptable', 'Mala', 'No tiene'].map((opt) => (
                          <button key={opt} type="button"
                            onClick={() => updateActiveRoomEval({ ventilation: opt })}
                            className={`choice-pill-btn ${roomEval.ventilation === opt ? 'selected' : ''}`}
                            style={{ flex: '1 1 45%', padding: '10px', fontSize: '0.78rem' }}>
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div className="form-group">
                        <label className="form-label" style={{ fontSize: '0.78rem' }}>Temperatura habitual</label>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '4px' }}>
                          {['Agradable', 'Caluroso', 'Frío'].map((opt) => (
                            <button key={opt} type="button"
                              onClick={() => updateActiveRoomEval({ temperature: opt })}
                              className={`choice-pill-btn ${roomEval.temperature === opt ? 'selected' : ''}`}
                              style={{ padding: '8px', fontSize: '0.75rem' }}>
                              {opt}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="form-group">
                        <label className="form-label" style={{ fontSize: '0.78rem' }}>Nivel de ruido habitual</label>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '4px' }}>
                          {['Silencioso', 'Moderado', 'Ruidoso'].map((opt) => (
                            <button key={opt} type="button"
                              onClick={() => updateActiveRoomEval({ noise: opt })}
                              className={`choice-pill-btn ${roomEval.noise === opt ? 'selected' : ''}`}
                              style={{ padding: '8px', fontSize: '0.75rem' }}>
                              {opt}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">¿Hay presencia de humedad o moho?</label>
                      <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                        {['No', 'Sí'].map((opt) => (
                          <button key={opt} type="button"
                            onClick={() => updateActiveRoomEval({ moisture: opt })}
                            className={`choice-pill-btn ${roomEval.moisture === opt ? 'selected' : ''}`}
                            style={{ flex: 1, padding: '10px' }}>
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>

                  </div>
                )}

                {/* SUBSTEP 3: ORGANIZACIÓN Y FUNCIONALIDAD */}
                {roomSubStep === 3 && (
                  <div className="animate-[fadeIn_0.3s_ease-out]" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    
                    <div className="form-group">
                      <label className="form-label">¿Cómo definirías el orden en el día a día?</label>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '6px' }}>
                        {['Fácil de sostener', 'Se desorganiza fácil', 'Caótico'].map((opt) => (
                          <button key={opt} type="button"
                            onClick={() => updateActiveRoomEval({ order: opt })}
                            className={`choice-pill-btn ${roomEval.order === opt ? 'selected' : ''}`}
                            style={{ padding: '12px', justifyContent: 'flex-start' }}>
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">¿Qué tal es la capacidad de guardado?</label>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '6px' }}>
                        {['Suficiente', 'Falta espacio', 'Poco accesible'].map((opt) => (
                          <button key={opt} type="button"
                            onClick={() => updateActiveRoomEval({ storage: opt })}
                            className={`choice-pill-btn ${roomEval.storage === opt ? 'selected' : ''}`}
                            style={{ padding: '12px', justifyContent: 'flex-start' }}>
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">¿Cómo sentís la circulación física?</label>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '6px' }}>
                        {['Fluida y libre', 'Con obstáculos', 'Estrecha'].map((opt) => (
                          <button key={opt} type="button"
                            onClick={() => updateActiveRoomEval({ circulation: opt })}
                            className={`choice-pill-btn ${roomEval.circulation === opt ? 'selected' : ''}`}
                            style={{ padding: '12px', justifyContent: 'flex-start' }}>
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">¿Cómo sentís la facilidad de uso diario?</label>
                      <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                        {['Fácil', 'Incómodo', 'Pesado'].map((opt) => (
                          <button key={opt} type="button"
                            onClick={() => updateActiveRoomEval({ easeOfUse: opt })}
                            className={`choice-pill-btn ${roomEval.easeOfUse === opt ? 'selected' : ''}`}
                            style={{ flex: 1, padding: '12px', fontSize: '0.8rem' }}>
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>

                  </div>
                )}

                {/* SUBSTEP 4: NATURALEZA */}
                {roomSubStep === 4 && (
                  <div className="animate-[fadeIn_0.3s_ease-out]" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    
                    <div className="form-group">
                      <label className="form-label">¿Tenés plantas de interior o vegetación?</label>
                      <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                        {['Muchas', 'Pocas', 'Ninguna'].map((opt) => (
                          <button key={opt} type="button"
                            onClick={() => updateActiveRoomEval({ plants: opt })}
                            className={`choice-pill-btn ${roomEval.plants === opt ? 'selected' : ''}`}
                            style={{ flex: 1, padding: '12px' }}>
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">¿Cómo son las vistas hacia el exterior?</label>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '6px' }}>
                        {['Visual al verde', 'Visual edificada', 'Sin vistas'].map((opt) => (
                          <button key={opt} type="button"
                            onClick={() => updateActiveRoomEval({ views: opt })}
                            className={`choice-pill-btn ${roomEval.views === opt ? 'selected' : ''}`}
                            style={{ padding: '12px', justifyContent: 'flex-start' }}>
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">¿Qué tan directa es su relación con el exterior?</label>
                      <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                        {['Directa', 'Indirecta', 'Ninguna'].map((opt) => (
                          <button key={opt} type="button"
                            onClick={() => updateActiveRoomEval({ exteriorRelation: opt })}
                            className={`choice-pill-btn ${roomEval.exteriorRelation === opt ? 'selected' : ''}`}
                            style={{ flex: 1, padding: '12px', fontSize: '0.8rem' }}>
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>

                  </div>
                )}

                {/* SUBSTEP 5: DETALLES PROPIOS DEL AMBIENTE */}
                {roomSubStep === 5 && (
                  <div className="animate-[fadeIn_0.3s_ease-out]" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    
                    {/* Dormitorios */}
                    {(activeRoom === 'Dormitorio Principal' || activeRoom === 'Dormitorio Secundario') ? (
                      <>
                        <div className="form-group">
                          <label className="form-label">¿Cómo es la calidad de tu descanso en este dormitorio?</label>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '6px' }}>
                            {['Sí, descanso excelente', 'Aceptable', 'Suelo despertarme', 'No, duermo mal'].map((opt) => (
                              <button key={opt} type="button"
                                onClick={() => updateActiveRoomEval({ specificAnswer1: opt })}
                                className={`choice-pill-btn ${roomEval.specificAnswer1 === opt ? 'selected' : ''}`}
                                style={{ padding: '12px', justifyContent: 'flex-start' }}>
                                {opt}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="form-group">
                          <label className="form-label">¿Lográs desconectarte antes de dormir?</label>
                          <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                            {['Siempre', 'A veces', 'Casi nunca'].map((opt) => (
                              <button key={opt} type="button"
                                onClick={() => updateActiveRoomEval({ specificAnswer2: opt })}
                                className={`choice-pill-btn ${roomEval.specificAnswer2 === opt ? 'selected' : ''}`}
                                style={{ flex: 1, padding: '12px', fontSize: '0.8rem' }}>
                                {opt}
                              </button>
                            ))}
                          </div>
                        </div>
                      </>
                    ) : activeRoom === 'Cocina' ? (
                      <>
                        <div className="form-group">
                          <label className="form-label">¿Disfrutás cocinar en este espacio?</label>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '6px' }}>
                            {['Mucho', 'A veces', 'Me resulta un trámite', 'Lo evito'].map((opt) => (
                              <button key={opt} type="button"
                                onClick={() => updateActiveRoomEval({ specificAnswer1: opt })}
                                className={`choice-pill-btn ${roomEval.specificAnswer1 === opt ? 'selected' : ''}`}
                                style={{ padding: '12px', justifyContent: 'flex-start' }}>
                                {opt}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="form-group">
                          <label className="form-label">¿Sentís que tenés espacio cómodo para preparar los alimentos?</label>
                          <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                            {['Suficiente', 'Justo', 'Muy incómodo'].map((opt) => (
                              <button key={opt} type="button"
                                onClick={() => updateActiveRoomEval({ specificAnswer2: opt })}
                                className={`choice-pill-btn ${roomEval.specificAnswer2 === opt ? 'selected' : ''}`}
                                style={{ flex: 1, padding: '12px', fontSize: '0.8rem' }}>
                                {opt}
                              </button>
                            ))}
                          </div>
                        </div>
                      </>
                    ) : (activeRoom === 'Living' || activeRoom === 'Comedor' || activeRoom === 'Sala de estar') ? (
                      <>
                        <div className="form-group">
                          <label className="form-label">¿Es un espacio donde disfrutás pasar tu tiempo libre?</label>
                          <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                            {['Mucho', 'A veces', 'Poco'].map((opt) => (
                              <button key={opt} type="button"
                                onClick={() => updateActiveRoomEval({ specificAnswer1: opt })}
                                className={`choice-pill-btn ${roomEval.specificAnswer1 === opt ? 'selected' : ''}`}
                                style={{ flex: 1, padding: '12px' }}>
                                {opt}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="form-group">
                          <label className="form-label">¿Sentís que favorece el encuentro con otras personas?</label>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '6px' }}>
                            {['Sí, une a la casa', 'A veces', 'No, suele estar vacío'].map((opt) => (
                              <button key={opt} type="button"
                                onClick={() => updateActiveRoomEval({ specificAnswer2: opt })}
                                className={`choice-pill-btn ${roomEval.specificAnswer2 === opt ? 'selected' : ''}`}
                                style={{ padding: '12px', justifyContent: 'flex-start' }}>
                                {opt}
                              </button>
                            ))}
                          </div>
                        </div>
                      </>
                    ) : (activeRoom === 'Escritorio' || activeRoom === 'Oficina') ? (
                      <>
                        <div className="form-group">
                          <label className="form-label">¿Lográs concentrarte y enfocarte con facilidad aquí?</label>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '6px' }}>
                            {['Sí, totalmente', 'Con dificultad', 'Me distraigo mucho'].map((opt) => (
                              <button key={opt} type="button"
                                onClick={() => updateActiveRoomEval({ specificAnswer1: opt })}
                                className={`choice-pill-btn ${roomEval.specificAnswer1 === opt ? 'selected' : ''}`}
                                style={{ padding: '12px', justifyContent: 'flex-start' }}>
                                {opt}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="form-group">
                          <label className="form-label">¿El mobiliario (silla y escritorio) te resulta ergonómico?</label>
                          <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                            {['Muy cómodo', 'Aceptable', 'Me genera dolores'].map((opt) => (
                              <button key={opt} type="button"
                                onClick={() => updateActiveRoomEval({ specificAnswer2: opt })}
                                className={`choice-pill-btn ${roomEval.specificAnswer2 === opt ? 'selected' : ''}`}
                                style={{ flex: 1, padding: '12px', fontSize: '0.8rem' }}>
                                {opt}
                              </button>
                            ))}
                          </div>
                        </div>
                      </>
                    ) : activeRoom === 'Baño' ? (
                      <>
                        <div className="form-group">
                          <label className="form-label">¿Sentís que este baño funciona como un espacio de relax?</label>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '6px' }}>
                            {['Sí, es un oasis', 'Es puramente funcional', 'Me genera incomodidad'].map((opt) => (
                              <button key={opt} type="button"
                                onClick={() => updateActiveRoomEval({ specificAnswer1: opt })}
                                className={`choice-pill-btn ${roomEval.specificAnswer1 === opt ? 'selected' : ''}`}
                                style={{ padding: '12px', justifyContent: 'flex-start' }}>
                                {opt}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="form-group">
                          <label className="form-label">¿Qué tan cómodo te resulta el orden de tus artículos personales?</label>
                          <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                            {['Muy cómodo', 'Falta espacio de guardado'].map((opt) => (
                              <button key={opt} type="button"
                                onClick={() => updateActiveRoomEval({ specificAnswer2: opt })}
                                className={`choice-pill-btn ${roomEval.specificAnswer2 === opt ? 'selected' : ''}`}
                                style={{ flex: 1, padding: '12px', fontSize: '0.8rem' }}>
                                {opt}
                              </button>
                            ))}
                          </div>
                        </div>
                      </>
                    ) : (activeRoom === 'Patio / Balcón' || activeRoom === 'Jardín' || activeRoom === 'Terraza' || activeRoom === 'Galería') ? (
                      <>
                        <div className="form-group">
                          <label className="form-label">¿Qué tanto tiempo pasás aquí cuando el clima lo permite?</label>
                          <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                            {['Mucho', 'Moderado', 'Casi nada'].map((opt) => (
                              <button key={opt} type="button"
                                onClick={() => updateActiveRoomEval({ specificAnswer1: opt })}
                                className={`choice-pill-btn ${roomEval.specificAnswer1 === opt ? 'selected' : ''}`}
                                style={{ flex: 1, padding: '12px' }}>
                                {opt}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="form-group">
                          <label className="form-label">¿Sentís que este espacio exterior está integrado con el interior?</label>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '6px' }}>
                            {['Sí, fluye muy bien', 'Desconectado'].map((opt) => (
                              <button key={opt} type="button"
                                onClick={() => updateActiveRoomEval({ specificAnswer2: opt })}
                                className={`choice-pill-btn ${roomEval.specificAnswer2 === opt ? 'selected' : ''}`}
                                style={{ padding: '12px', justifyContent: 'flex-start' }}>
                                {opt}
                              </button>
                            ))}
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="form-group">
                          <label className="form-label">¿Sentís que este espacio está aprovechado al máximo?</label>
                          <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                            {['Sí, totalmente', 'Aceptable', 'Podría usarse mucho mejor'].map((opt) => (
                              <button key={opt} type="button"
                                onClick={() => updateActiveRoomEval({ specificAnswer1: opt })}
                                className={`choice-pill-btn ${roomEval.specificAnswer1 === opt ? 'selected' : ''}`}
                                style={{ flex: 1, padding: '12px' }}>
                                {opt}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="form-group">
                          <label className="form-label">¿La decoración e iluminación te resultan acogedoras?</label>
                          <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                            {['Sí', 'Neutras', 'Frías'].map((opt) => (
                              <button key={opt} type="button"
                                onClick={() => updateActiveRoomEval({ specificAnswer2: opt })}
                                className={`choice-pill-btn ${roomEval.specificAnswer2 === opt ? 'selected' : ''}`}
                                style={{ flex: 1, padding: '12px' }}>
                                {opt}
                              </button>
                            ))}
                          </div>
                        </div>
                      </>
                    )}

                  </div>
                )}

              </div>
            )}

            {/* ── CONVERSACIÓN 4 TRANSICIÓN: Cambio de Ambiente ── */}
            {wizardStep === 4 && showRoomTransition && (
              <div className="animate-[fadeIn_0.4s_ease-out] text-center" style={{ padding: '40px 20px' }}>
                <div style={{ fontSize: '3rem', marginBottom: '16px' }}>✨</div>
                <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.8rem', fontWeight: 300, color: 'var(--text-charcoal)', margin: '0 0 16px 0' }}>
                  Excelente. Ya comprendimos cómo vivís este ambiente.
                </h3>
                <p style={{ fontSize: '0.9rem', color: '#878179', lineHeight: 1.6, maxWidth: '440px', margin: '0 auto 28px auto' }}>
                  Continuemos con el siguiente espacio para seguir construyendo tu Mapa de Habitar.
                </p>
                <button type="button" onClick={goNext} className="btn btn-primary" style={{ padding: '12px 28px', fontSize: '0.9rem', margin: '0 auto' }}>
                  Continuar al siguiente ambiente
                </button>
              </div>
            )}

            {/* ── CONVERSACIÓN 4 TRANSICIÓN: Cierre Final ── */}
            {wizardStep === 4 && showFinalTransition && (
              <div className="animate-[fadeIn_0.4s_ease-out] text-center" style={{ padding: '40px 20px' }}>
                <div style={{ fontSize: '3.5rem', marginBottom: '16px' }}>🌿</div>
                <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2rem', fontWeight: 300, color: 'var(--text-charcoal)', margin: '0 0 16px 0' }}>
                  ¡Terminamos de recorrer tu hogar!
                </h3>
                <p style={{ fontSize: '0.95rem', color: '#878179', lineHeight: 1.6, maxWidth: '460px', margin: '0 auto 28px auto' }}>
                  Ya conocemos tus espacios y cómo los vivís. Ahora el Método Bianchi® integrará toda esta información para construir tu Mapa de Habitar y elaborar un diagnóstico personalizado.
                </p>
                <button type="button" onClick={goNext} className="btn btn-primary" style={{ padding: '14px 36px', fontSize: '0.95rem', fontWeight: 600, margin: '0 auto' }}>
                  Obtener mi diagnóstico →
                </button>
              </div>
            )}

            {/* ── Bottom Actions ── */}
            {(!showRoomTransition && !showFinalTransition) && (
              <div className="wizard-actions" style={{ display: 'flex', justifyContent: 'space-between', marginTop: '36px', borderTop: '1px solid var(--border-color)', paddingTop: '18px' }}>
                <button type="button" onClick={goPrev} className="btn btn-secondary">
                  <ChevronLeft size={14} style={{ marginRight: '4px' }} />
                  {wizardStep === 4 && roomSubStep > 0 ? 'Atrás' : 'Anterior'}
                </button>
                <button type="button" onClick={goNext} className="btn btn-primary">
                  {wizardStep === 3 && showStep3Transition
                    ? 'Comenzar recorrido'
                    : (wizardStep === 4 && roomSubStep < 5)
                    ? 'Siguiente paso'
                    : (wizardStep === 4 && currentRoomIdx < form.selectedRooms.length - 1)
                    ? 'Terminar ambiente'
                    : 'Siguiente'}{' '}
                  <ChevronRight size={14} style={{ marginLeft: '4px' }} />
                </button>
              </div>
            )}

          </form>
        </div>
      </div>
    </div>
  );
}

export default WizardScreen;
