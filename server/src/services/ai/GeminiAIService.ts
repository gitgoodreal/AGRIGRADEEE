import { GoogleGenAI, Type } from '@google/genai';
import {
  AIAnalysisResult,
  DefectObservation,
  DefectType,
  DefectSeverity,
  ShapeCategory,
  SizeCategory,
  SurfaceCondition,
  VegetableType,
} from '../../models/types';
import { IAIService, ImageInput, ImageValidationResult } from './AIService';

export class GeminiAIService implements IAIService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY || '',
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }

  /**
   * Fast pre-check of image quality heuristic
   */
  public async validateImageQuality(image: ImageInput): Promise<ImageValidationResult> {
    const issues: string[] = [];

    if (!image.base64Data || image.base64Data.length < 100) {
      issues.push('Image data payload is missing or too small.');
      return { isValid: false, issues };
    }

    const byteSize = (image.base64Data.length * 3) / 4;
    if (byteSize < 100) {
      issues.push('Image resolution is insufficient for defect detection.');
    }

    return {
      isValid: issues.length === 0,
      issues,
    };
  }

  /**
   * Normalize MIME type to standard IANA values accepted by Gemini Vision
   */
  private normalizeMimeType(rawMime: string): string {
    const lower = (rawMime || '').toLowerCase().trim();
    if (lower === 'image/jpg' || lower === 'image/pjpeg') return 'image/jpeg';
    if (lower === 'image/png') return 'image/png';
    if (lower === 'image/webp') return 'image/webp';
    if (lower === 'image/heic') return 'image/heic';
    if (lower === 'image/heif') return 'image/heif';
    return 'image/jpeg';
  }

  /**
   * Clean base64 string
   */
  private cleanBase64String(raw: string): string {
    return raw
      .replace(/^data:image\/[a-z0-9.+_-]+;base64,/i, '')
      .replace(/[\r\n\s]/g, '');
  }

  public async analyzePotato(image: ImageInput): Promise<AIAnalysisResult> {
    return this.analyzeProduce(image, 'potato');
  }

  /**
   * Multi-Commodity AI Vision inspection with automatic model failover
   */
  public async analyzeProduce(
    image: ImageInput,
    targetVeggie: VegetableType = 'potato'
  ): Promise<AIAnalysisResult> {
    const validation = await this.validateImageQuality(image);
    if (!validation.isValid) {
      return {
        vegetableType: targetVeggie,
        detected: false,
        detectionConfidence: 0,
        detectionMessage: 'Image quality is insufficient for reliable analysis.',
        defects: [],
        shape: { category: 'unknown', confidence: 0 },
        size: {
          category: 'unknown',
          confidence: 0,
          qualitativeNotes: 'Cannot evaluate size from unusable image.',
        },
        surface: { condition: 'unknown', confidence: 0 },
        overallConfidence: 0,
        imageQualityOk: false,
        imageQualityIssues: validation.issues,
        rawObservationsSummary: 'Rejected prior to inference due to invalid image payload.',
      };
    }

    const cleanBase64 = this.cleanBase64String(image.base64Data);
    const mimeType = this.normalizeMimeType(image.mimeType);

    const veggieDescriptions: Record<VegetableType, { name: string; scientific: string; defectsHint: string }> = {
      potato: {
        name: 'potato',
        scientific: 'Solanum tuberosum tuber',
        defectsHint: 'greening (chlorophyll/solanine), bruising, cuts, cracks, wet soft rot, late blight, scab, sprouting',
      },
      tomato: {
        name: 'tomato',
        scientific: 'Solanum lycopersicum fruit',
        defectsHint: 'blossom-end rot, radial/concentric cracks, catfacing, sunscald, bruising, soft decay',
      },
      onion: {
        name: 'onion',
        scientific: 'Allium cepa bulb',
        defectsHint: 'neck rot, black mold spores, green sprouting from neck, translucent scales, basal plate rot',
      },
      carrot: {
        name: 'carrot',
        scientific: 'Daucus carota taproot',
        defectsHint: 'forking/branching, crown greening/sunburn, cavity spots, root growth cracks, soft rot',
      },
      bell_pepper: {
        name: 'bell pepper',
        scientific: 'Capsicum annuum fruit',
        defectsHint: 'blossom-end rot, bleached sunscald, circular anthracnose spots, chilling injury pitting, soft decay',
      },
      cucumber: {
        name: 'cucumber',
        scientific: 'Cucumis sativus fruit',
        defectsHint: 'crooking/curvature > 15 deg, yellowing (over-maturity), belly rot, spongy softness, blossom shriveling',
      },
    };

    const targetInfo = veggieDescriptions[targetVeggie] || veggieDescriptions.potato;

    const systemInstruction = `
You are AgriGrade Vision, a specialized computer-vision agricultural analyzer inspecting fresh commercial produce.
Target commodity for this inspection: ${targetInfo.name.toUpperCase()} (${targetInfo.scientific}).

Follow these strict scientific constraints:
1. VEGETABLE DETECTION: First determine if the primary subject in the image is indeed a ${targetInfo.name} (${targetInfo.scientific}).
   - If it is NOT a ${targetInfo.name} (e.g. an entirely different vegetable, empty background, a human hand, a rock, a document), set detected=false, detectionConfidence=0.0 to 0.4.
   - If it IS a ${targetInfo.name}, set detected=true with realistic confidence (typically 0.85 to 0.98 depending on lighting and clarity).
2. OBSERVATION ONLY, NEVER ASSIGN A GRADE: You must ONLY observe visible physical characteristics. Do NOT output Grade A, Grade B, or Reject. A separate downstream deterministic grading engine handles all grading.
3. VISIBLE EVIDENCE ONLY: Only record visible external surface features. Distinguish "visible evidence" from "unknown/cannot determine". Never claim internal flesh quality, hollow core (unless visible through deep cut), or chemical residues.
4. DEFECTS TO DETECT FOR ${targetInfo.name.toUpperCase()}: Check for ${targetInfo.defectsHint}, and surface blemishes. For each defect, state visible evidence clearly.
5. SHAPE: Categorize into 'regular' (symmetric varietal shape), 'slightly_irregular' (slight taper or minor bump), 'irregular' (crooked, knobby, deformed), or 'unknown'.
6. SIZE: Provide a qualitative visual category ('small', 'medium', 'large', 'unknown'). Explicitly state that this is a qualitative visual estimate.
7. SURFACE CONDITION: 'clean', 'mostly_clean', 'soil_covered', 'blemished', or 'unknown'.
8. CONFIDENCES: Assign a realistic numerical confidence (0.0 to 1.0) to every observation.
9. IMAGE QUALITY: Check if the image is extremely dark, overexposed, severely blurry, or cropped too tightly.
`;

    const promptText = `
Inspect this agricultural photograph. Determine if a ${targetInfo.name} is present, evaluate image clarity, assess visible surface condition, detect defects with specific visible evidence, and estimate visual shape and size category.
Return the structured JSON conforming to the schema.
`;

    const responseSchema = {
      type: Type.OBJECT,
      properties: {
        vegetableType: { type: Type.STRING, description: `Must be "${targetVeggie}"` },
        detected: { type: Type.BOOLEAN, description: `True if a ${targetInfo.name} is clearly visible` },
        detectionConfidence: { type: Type.NUMBER, description: 'Confidence between 0.0 and 1.0' },
        detectionMessage: { type: Type.STRING, description: `Explanation if ${targetInfo.name} is not detected or uncertain` },
        imageQualityOk: { type: Type.BOOLEAN, description: 'True if lighting, focus, and framing are sufficient' },
        imageQualityIssues: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: 'List of photographic quality problems if any (e.g. severe blur, dark, glare)',
        },
        defects: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              type: {
                type: Type.STRING,
                description: 'discoloration | greening | bruising | cuts | cracks | rot | blight | scab | insect_damage | sprouting | surface_blemish | unknown',
              },
              label: { type: Type.STRING, description: 'Human readable defect name' },
              severity: { type: Type.STRING, description: 'minor | moderate | severe' },
              confidence: { type: Type.NUMBER, description: '0.0 to 1.0' },
              locationDescription: { type: Type.STRING, description: `Location on the ${targetInfo.name}` },
              visibleEvidence: { type: Type.STRING, description: 'Visible physical description' },
            },
            required: ['type', 'label', 'severity', 'confidence', 'visibleEvidence'],
          },
        },
        shape: {
          type: Type.OBJECT,
          properties: {
            category: { type: Type.STRING, description: 'regular | slightly_irregular | irregular | unknown' },
            confidence: { type: Type.NUMBER },
            description: { type: Type.STRING },
          },
          required: ['category', 'confidence'],
        },
        size: {
          type: Type.OBJECT,
          properties: {
            category: { type: Type.STRING, description: 'small | medium | large | unknown' },
            confidence: { type: Type.NUMBER },
            qualitativeNotes: { type: Type.STRING, description: 'Explicit visual disclaimer' },
          },
          required: ['category', 'confidence', 'qualitativeNotes'],
        },
        surface: {
          type: Type.OBJECT,
          properties: {
            condition: { type: Type.STRING, description: 'clean | mostly_clean | soil_covered | blemished | unknown' },
            confidence: { type: Type.NUMBER },
          },
          required: ['condition', 'confidence'],
        },
        overallConfidence: { type: Type.NUMBER, description: 'Overall AI observation confidence 0.0 to 1.0' },
        rawObservationsSummary: { type: Type.STRING, description: 'Concise scientific summary of observations' },
      },
      required: [
        'vegetableType',
        'detected',
        'detectionConfidence',
        'imageQualityOk',
        'imageQualityIssues',
        'defects',
        'shape',
        'size',
        'surface',
        'overallConfidence',
        'rawObservationsSummary',
      ],
    };

    const modelsToTry = [
      'gemini-2.5-flash',
      'gemini-2.5-flash-lite',
      'gemini-3.1-flash-lite',
      'gemini-3.8-flash',
    ];
    let lastError: any = null;

    for (const modelName of modelsToTry) {
      try {
        console.log(`[GeminiAIService] Running ${targetVeggie} inspection with ${modelName}`);
        const response = await this.ai.models.generateContent({
          model: modelName,
          contents: [
            {
              role: 'user',
              parts: [
                {
                  inlineData: {
                    mimeType,
                    data: cleanBase64,
                  },
                },
                { text: promptText },
              ],
            },
          ],
          config: {
            systemInstruction,
            temperature: 0.1,
            responseMimeType: 'application/json',
            responseSchema,
          },
        });

        const responseText = response.text?.trim() || '{}';
        const parsed = JSON.parse(responseText);

        console.log(`[GeminiAIService] Success with ${modelName}! Detected:`, parsed.detected, 'Confidence:', parsed.overallConfidence);
        return this.sanitizeAIOutput(parsed, targetVeggie);
      } catch (err: any) {
        lastError = err;
        console.warn(`[GeminiAIService] Model ${modelName} returned error:`, err?.status || err?.message || err);
        continue;
      }
    }

    const errorMsg = lastError instanceof Error ? lastError.message : 'AI Vision service is temporarily unavailable';
    throw new Error(`AI Vision service temporarily unavailable (${errorMsg}). Please tap "Retry Analysis" to re-evaluate.`);
  }

  private sanitizeAIOutput(raw: any, targetVeggie: VegetableType): AIAnalysisResult {
    const isDetected = Boolean(raw.detected);
    const detectionConf = Math.min(Math.max(Number(raw.detectionConfidence) || 0, 0), 1);

    const validSeverities: DefectSeverity[] = ['minor', 'moderate', 'severe'];
    const validShapes: ShapeCategory[] = ['regular', 'slightly_irregular', 'irregular', 'unknown'];
    const validSizes: SizeCategory[] = ['small', 'medium', 'large', 'unknown'];
    const validSurfaces: SurfaceCondition[] = ['clean', 'mostly_clean', 'soil_covered', 'blemished', 'unknown'];

    const defects: DefectObservation[] = Array.isArray(raw.defects)
      ? raw.defects.map((d: any, idx: number) => ({
          id: `defect_${Date.now()}_${idx}`,
          type: (d.type as DefectType) || 'unknown',
          label: String(d.label || d.type || 'Defect'),
          severity: validSeverities.includes(d.severity) ? d.severity : 'minor',
          confidence: Math.min(Math.max(Number(d.confidence) || 0.85, 0), 1),
          locationDescription: d.locationDescription ? String(d.locationDescription) : undefined,
          visibleEvidence: String(
            d.visibleEvidence || `Visible surface ${d.label || d.type || 'irregularity'} detected.`
          ),
        }))
      : [];

    const shapeCategory = validShapes.includes(raw.shape?.category)
      ? raw.shape.category
      : 'unknown';
    const sizeCategory = validSizes.includes(raw.size?.category)
      ? raw.size.category
      : 'unknown';
    const surfaceCondition = validSurfaces.includes(raw.surface?.condition)
      ? raw.surface.condition
      : 'unknown';

    return {
      vegetableType: targetVeggie,
      detected: isDetected,
      detectionConfidence: detectionConf,
      detectionMessage: raw.detectionMessage || (!isDetected ? `${targetVeggie.toUpperCase()} not detected in input frame.` : undefined),
      imageQualityOk: Boolean(raw.imageQualityOk ?? true),
      imageQualityIssues: Array.isArray(raw.imageQualityIssues) ? raw.imageQualityIssues.map(String) : [],
      defects,
      shape: {
        category: shapeCategory,
        confidence: Math.min(Math.max(Number(raw.shape?.confidence) || 0.88, 0), 1),
        description: raw.shape?.description ? String(raw.shape.description) : undefined,
      },
      size: {
        category: sizeCategory,
        confidence: Math.min(Math.max(Number(raw.size?.confidence) || 0.85, 0), 1),
        qualitativeNotes: String(
          raw.size?.qualitativeNotes ||
            'Visual qualitative estimate based on frame framing; no metric millimeter claim.'
        ),
      },
      surface: {
        condition: surfaceCondition,
        confidence: Math.min(Math.max(Number(raw.surface?.confidence) || 0.88, 0), 1),
      },
      overallConfidence: Math.min(Math.max(Number(raw.overallConfidence) || 0.85, 0), 1),
      rawObservationsSummary: String(
        raw.rawObservationsSummary || 'Visual inspection recorded without anomalies.'
      ),
    };
  }
}
