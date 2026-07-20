// ============================================================
// MÉTODO BIANCHI® — TYPE DEFINITIONS
// ============================================================
// These types are designed to be Supabase-ready.
// Each interface maps 1:1 to a future database table.

export type IbbhStatus =
  | 'regenerativo'
  | 'saludable'
  | 'funcional'
  | 'vulnerable'
  | 'exigente';

export type LifeTransition =
  | 'Separacion'
  | 'Duelo'
  | 'Mudanza'
  | 'NuevaEtapa'
  | 'Ninguno';

export type AppView = 'client' | 'professional';

export type ClientScreen =
  | 'welcome'
  | 'consent'
  | 'wizard'
  | 'processing'
  | 'results';

// ── Room ────────────────────────────────────────────────────
export interface RoomPhoto {
  id: string;
  room: string;
  url: string; // local preview URL (ObjectURL) or remote CDN URL
  pins: PhotoPin[];
  /** AI vision analysis — populated after Gemini Vision call */
  aiAnalysis?: RoomAiAnalysis;
}

export interface PhotoPin {
  x: number;
  y: number;
  note: string;
}

/** Future AI Vision response shape */
export interface RoomAiAnalysis {
  lightQuality: number;      // 0–100
  orderScore: number;        // 0–100
  biophiliaScore: number;    // 0–100
  colorHarmony: number;      // 0–100
  spatialBalance: number;    // 0–100
  summary: string;           // Narrative summary from Gemini
  recommendations: string[]; // Specific action items
}

// ── Dimensions ──────────────────────────────────────────────
export type DimensionKey =
  | 'Identidad y Pertenencia'
  | 'Regulación emocional'
  | 'Calidad Ambiental'
  | 'Orden'
  | 'Biofilia'
  | 'Descanso'
  | 'Funcionalidad'
  | 'Vínculos';

export type DimensionScores = Record<DimensionKey, number>;

// ── Action Plan ─────────────────────────────────────────────
export type ActionTimeframe = 'today' | 'week' | 'month' | 'project';

export interface ActionItem {
  id: string;
  room: string;
  title: string;
  description: string;
  timeframe: ActionTimeframe;
  estimatedMinutes?: number;
  expectedImpact: string[];
  impactPercent?: number;
  isKeyAction?: boolean;
}

// ── Hypothesis (AI) ─────────────────────────────────────────
export type HypothesisApproval = 'approved' | 'rejected' | null;

export interface Hypothesis {
  id: string;
  title: string;
  description: string;
  confidence: number; // 0–100
  approved: HypothesisApproval;
  /** AI-generated flag */
  fromAi: boolean;
}

// ── Client / User ────────────────────────────────────────────
export interface BianchClient {
  id: string;
  name: string;
  email?: string;
  age?: number;
  city?: string;
  housingType?: string;
  squareMeters?: number;
  occupants?: number;
  hoursAtHome?: string; // e.g. '8-12' | '+12'
  transition?: string;
  hasPets?: string;
  desiredFeeling?: string;
  selectedRooms: string[];
  photos: RoomPhoto[];
  dimensions: DimensionScores;
  ibbh: number;
  status: IbbhStatus;
  hypotheses: Hypothesis[];
  actionItems: ActionItem[];
  narrativeText?: string;
  createdAt?: string;
}

// ── Wizard Form State ────────────────────────────────────────
export interface RoomEvaluation {
  feel: number; // 1-5 scale (from Muy incómodo to Muy bien)
  mainActivity: string;
  supportsActivity: string; // Siempre, Casi siempre, A veces, Pocas veces, Nunca
  light: string; // Muy abundante, Suficiente, Escasa, Casi no hay
  ventilation: string; // Excelente, Aceptable, Mala, No tiene
  temperature: string; // Agradable, Caluroso, Frío
  noise: string; // Silencioso, Moderado, Ruidoso
  moisture: string; // No, Sí
  order: string; // Fácil de sostener, Se desorganiza fácil, Caótico
  storage: string; // Suficiente, Falta espacio, Poco accesible
  circulation: string; // Fluida y libre, Con obstáculos, Estrecha
  easeOfUse: string; // Fácil, Incómodo, Pesado
  plants: string; // Muchas, Pocas, Ninguna
  views: string; // Visual al verde, Visual edificada, Sin vistas
  exteriorRelation: string; // Directa, Indirecta, Ninguna
  specificAnswer1: string;
  specificAnswer2: string;
}

export interface WizardFormData {
  // Step 0 — Personal info & Context
  name: string;
  age: string;
  city: string;
  transition: string;
  hoursAtHome: string;
  hasPets: string; // 'Si' | 'No' | ''

  // Step 1 — Emotional relationship
  slideEmotional1: number; // Representación Personal
  slideEmotional2: number; // Regulación y Calma
  predominantEmotion: string;
  desiredFeeling: string;

  // Step 2 — Rooms selection
  selectedRooms: string[];

  // Step 3 — Dynamic Room Evaluations
  roomEvaluations: Record<string, RoomEvaluation>;

  // Step 4 — Physical quality
  slidePhys1: number; // Iluminación Natural
  slidePhys2: number; // Confort Acústico
  hasMoisture: string; // 'Si' | 'No' | ''
  hasSyntheticMaterials: string; // 'Si' | 'No' | ''

  // Step 5 — Biophilia
  slideBio1: number; // Vegetación y Plantas
  slideBio2: number; // Visuales hacia la Naturaleza
  hasPauseSpace: string; // 'Si' | 'No' | ''

  // Step 6 — Order & Circulation
  slideOrd1: number; // Orden Sostenible
  slideOrd2: number; // Circulación Física
  hasInheritedObjects: string; // 'Si' | 'No' | ''

  // Step 7 — Photos
  photoFiles: Record<string, File[]>;
  photosUploaded: boolean;
  scannedRooms?: Record<string, RoomAiAnalysis>;

  // Contextual Layers additions
  housingStatus: string; // 'Propio' | 'Alquiler' | 'Familiar' | 'Temporal'
  budget: string; // 'Bajo' | 'Medio' | 'Alto'

  // New Conversational Fields (Phase 2 Redesign)
  interventionType: string; // 'Pequeños cambios' | 'Mejoras progresivas' | 'Reforma integral'
  transitions: string[]; // Multiple choice transitions
  sharedWith: string[]; // Multiple choice occupants
  petTypes: string[]; // Multiple choice pets
  petCount: string; // '1' | '2' | '3 o más'
  desiredFeelings: string[]; // Selection of up to 3 feelings

  // New Conversation 2 Emotional Fields
  arrivalFeeling: string;
  homeRepresentation: string;
  predominantSensations: string[];
  favoriteRoom: string;
  avoidedRoom: string; // 'Si' | 'No'
  avoidedRoomName: string;
  desiredDailyFeeling: string;
  relationshipPhrase: string;
}

export const DEFAULT_WIZARD_FORM: WizardFormData = {
  name: '',
  age: '',
  city: '',
  transition: 'Ninguno',
  hoursAtHome: 'Entre 6 y 12 horas',
  hasPets: 'No',
  slideEmotional1: 3,
  slideEmotional2: 3,
  predominantEmotion: 'Calma',
  desiredFeeling: '',
  selectedRooms: ['Entrada', 'Living', 'Cocina', 'Dormitorio Principal', 'Baño', 'Escritorio', 'Patio / Balcón'],
  roomEvaluations: {},
  slidePhys1: 3,
  slidePhys2: 3,
  hasMoisture: 'No',
  hasSyntheticMaterials: 'No',
  slideBio1: 3,
  slideBio2: 3,
  hasPauseSpace: 'No',
  slideOrd1: 3,
  slideOrd2: 3,
  hasInheritedObjects: 'No',
  photoFiles: {},
  photosUploaded: false,
  scannedRooms: {},
  housingStatus: 'Alquiler',
  budget: 'Medio',

  // New default conversational states
  interventionType: '🌿 Pequeños cambios',
  transitions: [],
  sharedWith: [],
  petTypes: [],
  petCount: '1',
  desiredFeelings: [],
  arrivalFeeling: '🌿 Siento que puedo bajar un cambio.',
  homeRepresentation: '🌱 Te representa en parte.',
  predominantSensations: [],
  favoriteRoom: 'Living',
  avoidedRoom: 'No',
  avoidedRoomName: '',
  desiredDailyFeeling: '🌿 Más calma.',
  relationshipPhrase: '',
};
