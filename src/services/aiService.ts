import { GoogleGenerativeAI } from '@google/generative-ai';
import { SYSTEM_PROMPT_TEMPLATE } from '../data/bianchiKnowledgeBase';
import type { WizardFormData, BianchClient, RoomAiAnalysis } from '../types/bianchi';
import { calculateIbbh, getIbbhStatus, calculateDimensions } from '../utils/ibbhCalculator';

// Helper to retrieve the API key from localStorage
export function getGeminiApiKey(): string | null {
  return localStorage.getItem('bianchi_gemini_api_key');
}

// Helper to save the API key
export function saveGeminiApiKey(key: string): void {
  localStorage.setItem('bianchi_gemini_api_key', key);
}

// Helper to remove the API key
export function removeGeminiApiKey(): void {
  localStorage.removeItem('bianchi_gemini_api_key');
}

// Maximum allowed size per photo (4 MB)
const MAX_PHOTO_BYTES = 4 * 1024 * 1024;

/**
 * Validates that a file is an image and within the size limit before sending to Gemini.
 * Throws a descriptive error if validation fails.
 */
function validatePhotoFile(file: File): void {
  if (!file.type.startsWith('image/')) {
    throw new Error(`El archivo "${file.name}" no es una imagen válida.`);
  }
  if (file.size > MAX_PHOTO_BYTES) {
    const mb = (file.size / 1024 / 1024).toFixed(1);
    throw new Error(`La foto "${file.name}" pesa ${mb} MB. El límite por imagen es 4 MB.`);
  }
}

/**
 * Safely parses the JSON returned by Gemini and validates that numeric fields
 * are in the expected [0–100] range and that arrays contain only strings.
 * Returns a safe default object if parsing or validation fails.
 */
function safeParseAiJson(raw: string): Record<string, unknown> {
  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(raw);
  } catch (e) {
    console.warn('[AI Service] JSON.parse failed on AI response:', e);
    return {};
  }

  const numericFields = ['lightQuality', 'orderScore', 'biophiliaScore', 'colorHarmony', 'spatialBalance'];
  numericFields.forEach((field) => {
    const val = Number(parsed[field]);
    if (isNaN(val) || val < 0 || val > 100) {
      console.warn(`[AI Service] Field "${field}" out of range or NaN (${parsed[field]}). Defaulting to 50.`);
      parsed[field] = 50;
    } else {
      parsed[field] = val;
    }
  });

  if (!Array.isArray(parsed.recommendations)) {
    parsed.recommendations = [];
  } else {
    parsed.recommendations = (parsed.recommendations as unknown[]).filter(
      (r) => typeof r === 'string'
    );
  }

  return parsed;
}

// Convert a File object to the format required by Gemini for inline data
async function fileToGenerativePart(file: File): Promise<{ inlineData: { data: string; mimeType: string } }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Data = (reader.result as string).split(',')[1];
      resolve({
        inlineData: {
          data: base64Data,
          mimeType: file.type,
        },
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Call Gemini Vision to analyze a room photo.
 * Falls back to null if no API key is set.
 */
export async function analyzeRoomPhotoWithAi(photoFiles: File[], roomName: string): Promise<RoomAiAnalysis | null> {
  const apiKey = getGeminiApiKey();
  if (!apiKey || photoFiles.length === 0) {
    console.log('[AI Service] No API Key set or no files provided. Falling back to local mock scan.');
    return null;
  }

  // Validate each file before sending to Gemini
  for (const file of photoFiles) {
    validatePhotoFile(file);
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: { responseMimeType: 'application/json' },
    });

    const fileParts = await Promise.all(photoFiles.map(f => fileToGenerativePart(f)));
    const prompt = `Analiza las siguientes fotografías (${photoFiles.length} imágenes) de un ambiente doméstico (${roomName}) con el ojo de un neuroarquitecto y especialista en diseño de bienestar del Método Bianchi®.

Evalúa y devuelve puntajes de 0 a 100 para las siguientes variables basándote en la evidencia visual acumulada de todas las fotos:
1. Calidad de la iluminación (luz natural indirecta, sombras duras, temperatura de color percibida).
2. Nivel de orden visual (presencia de cables acumulados, desorden de superficies, elementos amontonados).
3. Conexión biofílica (presencia de vegetación, texturas de madera/piedra natural, fibras de lino/algodón vs. melaminas sintéticas brillantes).
4. Armonía del color y proporción del mobiliario.

Devuelve un objeto JSON con el siguiente formato:
{
  "lightQuality": 0-100,
  "orderScore": 0-100,
  "biophiliaScore": 0-100,
  "colorHarmony": 0-100,
  "spatialBalance": 0-100,
  "summary": "Un párrafo descriptivo y cercano resumiendo lo que transmite el espacio visualmente sin tecnicismos excesivos.",
  "recommendations": [
    "Recomendación concreta 1 y corta",
    "Recomendación concreta 2 y corta"
  ]
}`;

    const result = await model.generateContent([prompt, ...fileParts]);
    const responseText = result.response.text();
    const parsed = safeParseAiJson(responseText);

    return {
      lightQuality: Number(parsed.lightQuality ?? 50),
      orderScore: Number(parsed.orderScore ?? 50),
      biophiliaScore: Number(parsed.biophiliaScore ?? 50),
      colorHarmony: Number(parsed.colorHarmony ?? 50),
      spatialBalance: Number(parsed.spatialBalance ?? 50),
      summary: String(parsed.summary || ''),
      recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations as string[] : [],
    };
  } catch (error) {
    console.error('[AI Service] Error analyzing photo with Gemini:', error);
    return null;
  }
}

/**
 * Call Gemini Pro to generate the client narrative and personalized action items.
 * Integrates the complete Bianchi Scientific Knowledge Base.
 * Falls back to null if no API key is set.
 */
export async function generateClientNarrativeWithAi(
  formData: WizardFormData,
  photoAnalyses: Record<string, RoomAiAnalysis>
): Promise<Partial<BianchClient> | null> {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    console.log('[AI Service] No API Key set. Falling back to local calculation engine.');
    return null;
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Using gemini-2.5-pro as it handles complex instructions and JSON structure best
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-pro',
      generationConfig: { responseMimeType: 'application/json' },
    });

    // Format the prompt template with actual form data values
    let prompt = SYSTEM_PROMPT_TEMPLATE
      .replace('{name}', formData.name)
      .replace('{age}', formData.age)
      .replace('{city}', formData.city)
      .replace('{housingStatus}', formData.housingStatus)
      .replace('{budget}', formData.budget)
      .replace('{transition}', formData.transition)
      .replace('{hoursAtHome}', formData.hoursAtHome)
      .replace('{hasPets}', formData.hasPets)
      .replace('{predominantEmotion}', formData.predominantEmotion)
      .replace('{desiredFeeling}', formData.desiredFeeling || 'desconocido')
      .replace('{selectedRooms}', formData.selectedRooms.join(', '))
      .replace('{hasMoisture}', formData.hasMoisture)
      .replace('{hasSyntheticMaterials}', formData.hasSyntheticMaterials)
      .replace('{hasPauseSpace}', formData.hasPauseSpace)
      .replace('{hasInheritedObjects}', formData.hasInheritedObjects)
      .replace('{slideEmotional1}', String(formData.slideEmotional1))
      .replace('{slideEmotional2}', String(formData.slideEmotional2))
      .replace('{slidePhys1}', String(formData.slidePhys1))
      .replace('{slidePhys2}', String(formData.slidePhys2))
      .replace('{slideBio1}', String(formData.slideBio1))
      .replace('{slideBio2}', String(formData.slideBio2))
      .replace('{slideOrd1}', String(formData.slideOrd1))
      .replace('{slideOrd2}', String(formData.slideOrd2))
      .replace('{photoAiAnalyses}', JSON.stringify(photoAnalyses));

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const parsed = safeParseAiJson(responseText);

    // Calculate score & status locally to maintain mathematical reliability
    const ibbh = calculateIbbh(formData);
    const status = getIbbhStatus(ibbh);
    const dimensions = calculateDimensions(formData);

    const actionItems = Array.isArray(parsed.actionItems)
      ? parsed.actionItems.map((item: any, idx: number) => ({
          id: `ai-act-${idx}-${Date.now()}`,
          room: String(item.room || 'General'),
          title: String(item.title || 'Microacción'),
          description: String(item.description || ''),
          timeframe: (['today', 'week', 'month', 'project'].includes(item.timeframe)
            ? item.timeframe
            : 'week') as any,
          estimatedMinutes: Number(item.estimatedMinutes || 15),
          expectedImpact: Array.isArray(item.expectedImpact) ? item.expectedImpact : [],
          impactPercent: Number(item.impactPercent || 8),
          isKeyAction: idx === 0, // Mark the first item as key action
        }))
      : [];

    return {
      narrativeText: String(parsed.narrativeText || ''),
      actionItems,
      // Fallback details generated locally
      ibbh,
      status,
      dimensions,
    };
  } catch (error) {
    console.error('[AI Service] Error generating narrative with Gemini:', error);
    return null;
  }
}
