export type VegetableType = 'potato' | 'tomato' | 'onion' | 'carrot' | 'bell_pepper' | 'cucumber';

export type DefectType = 
  | 'discoloration'
  | 'greening'
  | 'bruising'
  | 'cuts'
  | 'cracks'
  | 'rot'
  | 'blight'
  | 'scab'
  | 'insect_damage'
  | 'sprouting'
  | 'surface_blemish'
  | 'unknown';

export type DefectSeverity = 'minor' | 'moderate' | 'severe';

export interface DefectObservation {
  id: string;
  type: DefectType;
  label: string;
  severity: DefectSeverity;
  confidence: number;
  locationDescription?: string;
  visibleEvidence: string; // e.g. "Visible surface discoloration detected on upper lateral area"
}

export type ShapeCategory = 'regular' | 'slightly_irregular' | 'irregular' | 'unknown';
export type SizeCategory = 'small' | 'medium' | 'large' | 'unknown'; // Qualitative visual estimate
export type SurfaceCondition = 'clean' | 'mostly_clean' | 'soil_covered' | 'blemished' | 'unknown';

export interface AIAnalysisResult {
  vegetableType: VegetableType;
  detected: boolean;
  detectionConfidence: number;
  detectionMessage?: string;
  defects: DefectObservation[];
  shape: {
    category: ShapeCategory;
    confidence: number;
    description?: string;
  };
  size: {
    category: SizeCategory;
    confidence: number;
    qualitativeNotes: string; // explicitly not claiming exact metric dimensions without calibration
  };
  surface: {
    condition: SurfaceCondition;
    confidence: number;
  };
  overallConfidence: number;
  imageQualityOk: boolean;
  imageQualityIssues: string[];
  rawObservationsSummary: string;
}

export type QualityGrade = 'GRADE_A' | 'GRADE_B' | 'REJECT';

export interface GradingRuleConfig {
  version: string;
  name: string;
  minConfidenceThreshold: number; // e.g. 0.80 -> below this goes to Human Review
  gradeA: {
    allowedDefectSeverities: DefectSeverity[];
    maxMinorDefects: number;
    allowedShapes: ShapeCategory[];
    disallowedDefectTypes: DefectType[];
  };
  gradeB: {
    allowedDefectSeverities: DefectSeverity[];
    maxMinorDefects: number;
    maxModerateDefects: number;
    allowedShapes: ShapeCategory[];
    disallowedDefectTypes: DefectType[];
  };
  rejectConditions: {
    anySevereDefectTriggersReject: boolean;
    bannedDefects: DefectType[]; // e.g. rot, severe blight
  };
}

export interface GradingEvaluationResult {
  grade: QualityGrade;
  isAutomatic: boolean;
  needsHumanReview: boolean;
  reviewReasons: string[];
  appliedRuleConfigName: string;
  criteriaBreakdown: {
    criterion: string;
    passed: boolean;
    details: string;
  }[];
}

export interface HumanReviewData {
  required: boolean;
  reviewed: boolean;
  reviewerId?: string;
  reviewerName?: string;
  originalGrade: QualityGrade;
  finalGrade?: QualityGrade;
  reviewNotes?: string;
  reviewTimestamp?: string;
}

export interface InspectionRecord {
  id: string;
  batchId?: string;
  batchName?: string;
  timestamp: string;
  imageDataUrl: string; // Base64 or storage URL
  vegetableType: VegetableType;
  isDetected?: boolean;
  isPotato?: boolean;
  aiAnalysis: AIAnalysisResult;
  gradingResult: GradingEvaluationResult;
  humanReview: HumanReviewData;
  operatorName?: string;
  isDemo?: boolean;
}

export interface BatchRecord {
  id: string;
  name: string;
  product: VegetableType;
  operatorName: string;
  targetQuantity?: number;
  notes?: string;
  createdAt: string;
  closedAt?: string;
  status: 'active' | 'closed';
  totalInspected: number;
  gradeACount: number;
  gradeBCount: number;
  rejectCount: number;
  reviewCount: number;
  averageConfidence: number;
}

export interface VerificationRecord {
  reportId: string;
  batchId: string;
  batchName: string;
  product: VegetableType;
  inspectionCount: number;
  gradeDistribution: {
    gradeA: number;
    gradeB: number;
    reject: number;
  };
  defectBreakdown: Record<string, number>;
  averageConfidence: number;
  humanReviewedCount: number;
  reportCreationDate: string;
  verificationStatus: 'VERIFIED' | 'TAMPERED' | 'INVALID';
  digitalSignature: string;
}

export interface BatchReport {
  id: string;
  batchId: string;
  batchName: string;
  generatedAt: string;
  generatedBy: string;
  product: VegetableType;
  summary: {
    totalInspected: number;
    gradeA: number;
    gradeB: number;
    reject: number;
    averageConfidence: number;
    humanReviewedCount: number;
    automaticGradeRate: number;
  };
  defectsSummary: {
    defectType: string;
    count: number;
    frequencyPercent: number;
  }[];
  verificationRecord: VerificationRecord;
  qrCodeUrl: string; // Data URL for QR code
  publicVerifyUrl: string;
}
