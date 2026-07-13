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
  feel: number;
  light: number;
  order: number;
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
  photoFiles: Record<string, File | null>;
  photosUploaded: boolean;

  // Contextual Layers additions
  housingStatus: string; // 'Propio' | 'Alquiler'
  budget: string; // 'Bajo' | 'Medio' | 'Alto'
}

export const DEFAULT_WIZARD_FORM: WizardFormData = {
  name: '',
  age: '',
  city: '',
  transition: 'Ninguno',
  hoursAtHome: '6 a 12',
  hasPets: 'Si',
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
  housingStatus: 'Alquiler',
  budget: 'Medio',
};
