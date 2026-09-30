import {
  AIAnalysisResult,
  GradingEvaluationResult,
  GradingRuleConfig,
  QualityGrade,
} from '../../models/types';

export const DEFAULT_GRADING_RULES: GradingRuleConfig = {
  version: '1.2.0',
  name: 'Standard Commercial Produce Specification (USDA / Global)',
  minConfidenceThreshold: 0.80, // Inspections with confidence < 0.80 get flagged for human review
  gradeA: {
    allowedDefectSeverities: ['minor'],
    maxMinorDefects: 1,
    allowedShapes: ['regular', 'slightly_irregular'],
    disallowedDefectTypes: ['rot', 'blight', 'cracks', 'insect_damage', 'greening'],
  },
  gradeB: {
    allowedDefectSeverities: ['minor', 'moderate'],
    maxMinorDefects: 3,
    maxModerateDefects: 1,
    allowedShapes: ['regular', 'slightly_irregular', 'irregular'],
    disallowedDefectTypes: ['rot', 'blight'],
  },
  rejectConditions: {
    anySevereDefectTriggersReject: true,
    bannedDefects: ['rot', 'blight'],
  },
};

let currentGradingRules: GradingRuleConfig = { ...DEFAULT_GRADING_RULES };

export function getCurrentGradingRules(): GradingRuleConfig {
  return currentGradingRules;
}

export function updateGradingRules(newRules: Partial<GradingRuleConfig>): GradingRuleConfig {
  currentGradingRules = {
    ...currentGradingRules,
    ...newRules,
  };
  return currentGradingRules;
}

export function resetGradingRules(): GradingRuleConfig {
  currentGradingRules = { ...DEFAULT_GRADING_RULES };
  return currentGradingRules;
}

export class GradingEngine {
  /**
   * Evaluates AI observations against deterministic, configurable grading criteria.
   * Gemini NEVER assigns the final grade directly.
   */
  public static evaluate(
    aiAnalysis: AIAnalysisResult,
    customRules?: GradingRuleConfig
  ): GradingEvaluationResult {
    const rules = customRules || currentGradingRules;
    const reviewReasons: string[] = [];
    const criteriaBreakdown: GradingEvaluationResult['criteriaBreakdown'] = [];

    const veggieLabel = (aiAnalysis.vegetableType || 'produce').replace('_', ' ');

    // Check produce detection validity first
    if (!aiAnalysis.detected) {
      return {
        grade: 'REJECT',
        isAutomatic: false,
        needsHumanReview: true,
        reviewReasons: [`Object was not confirmed as a ${veggieLabel} with sufficient confidence.`],
        appliedRuleConfigName: `${veggieLabel.toUpperCase()} Standard Specification`,
        criteriaBreakdown: [
          {
            criterion: `${veggieLabel.toUpperCase()} Identification`,
            passed: false,
            details: `Detection confidence: ${(aiAnalysis.detectionConfidence * 100).toFixed(0)}%`,
          },
        ],
      };
    }

    // Check confidence threshold
    const isOverallConfidenceLow = aiAnalysis.overallConfidence < rules.minConfidenceThreshold;
    if (isOverallConfidenceLow) {
      reviewReasons.push(
        `Overall AI observation confidence (${(aiAnalysis.overallConfidence * 100).toFixed(
          0
        )}%) is below minimum threshold (${(rules.minConfidenceThreshold * 100).toFixed(0)}%).`
      );
    }

    const lowConfidenceDefects = aiAnalysis.defects.filter(
      (d) => d.confidence < rules.minConfidenceThreshold
    );
    if (lowConfidenceDefects.length > 0) {
      reviewReasons.push(
        `${lowConfidenceDefects.length} defect observation(s) have borderline confidence.`
      );
    }

    if (aiAnalysis.shape.confidence < rules.minConfidenceThreshold) {
      reviewReasons.push('Shape category assessment is below confidence threshold.');
    }

    // Defect categorization
    const severeDefects = aiAnalysis.defects.filter((d) => d.severity === 'severe');
    const moderateDefects = aiAnalysis.defects.filter((d) => d.severity === 'moderate');
    const minorDefects = aiAnalysis.defects.filter((d) => d.severity === 'minor');

    const bannedDefectFound = aiAnalysis.defects.find((d) =>
      rules.rejectConditions.bannedDefects.includes(d.type)
    );

    let calculatedGrade: QualityGrade = 'REJECT';

    // 1. Check REJECT conditions
    let isReject = false;
    if (rules.rejectConditions.anySevereDefectTriggersReject && severeDefects.length > 0) {
      isReject = true;
      criteriaBreakdown.push({
        criterion: 'Severe Defects Check',
        passed: false,
        details: `Found ${severeDefects.length} severe defect(s): ${severeDefects
          .map((d) => `${d.label} (${d.type})`)
          .join(', ')}.`,
      });
    } else {
      criteriaBreakdown.push({
        criterion: 'Severe Defects Check',
        passed: true,
        details: 'No severe structural or rot defects detected.',
      });
    }

    if (bannedDefectFound) {
      isReject = true;
      criteriaBreakdown.push({
        criterion: 'Banned Defects Quarantine (Rot/Blight)',
        passed: false,
        details: `Identified critical condition: ${bannedDefectFound.label} (${bannedDefectFound.type}).`,
      });
    } else {
      criteriaBreakdown.push({
        criterion: 'Banned Defects Quarantine',
        passed: true,
        details: 'Free from active rot or deep tissue pathogens.',
      });
    }

    if (isReject) {
      calculatedGrade = 'REJECT';
    } else {
      // 2. Check Grade A eligibility
      const gradeADisallowedFound = aiAnalysis.defects.find((d) =>
        rules.gradeA.disallowedDefectTypes.includes(d.type)
      );
      const gradeAShapeOk = rules.gradeA.allowedShapes.includes(aiAnalysis.shape.category);
      const gradeAMinorOk = minorDefects.length <= rules.gradeA.maxMinorDefects;
      const gradeANoModerateOrSevere = moderateDefects.length === 0 && severeDefects.length === 0;

      const passedGradeA =
        !gradeADisallowedFound && gradeAShapeOk && gradeAMinorOk && gradeANoModerateOrSevere;

      criteriaBreakdown.push({
        criterion: 'Grade A Defect Tolerance',
        passed: !gradeADisallowedFound && gradeAMinorOk && gradeANoModerateOrSevere,
        details: passedGradeA
          ? 'Meets premium defect limits (max 1 minor cosmetic surface blemish).'
          : `Defect count or types exceeded Grade A limits (minor: ${minorDefects.length}, moderate: ${moderateDefects.length}).`,
      });

      criteriaBreakdown.push({
        criterion: 'Grade A Shape Symmetry',
        passed: gradeAShapeOk,
        details: `Shape is "${aiAnalysis.shape.category}". Allowed: ${rules.gradeA.allowedShapes.join(
          ', '
        )}.`,
      });

      if (passedGradeA) {
        calculatedGrade = 'GRADE_A';
      } else {
        // 3. Check Grade B eligibility
        const gradeBDisallowedFound = aiAnalysis.defects.find((d) =>
          rules.gradeB.disallowedDefectTypes.includes(d.type)
        );
        const gradeBShapeOk = rules.gradeB.allowedShapes.includes(aiAnalysis.shape.category);
        const gradeBMinorOk = minorDefects.length <= rules.gradeB.maxMinorDefects;
        const gradeBModerateOk = moderateDefects.length <= rules.gradeB.maxModerateDefects;

        const passedGradeB =
          !gradeBDisallowedFound && gradeBShapeOk && gradeBMinorOk && gradeBModerateOk;

        criteriaBreakdown.push({
          criterion: 'Grade B Commercial Standard',
          passed: passedGradeB,
          details: passedGradeB
            ? 'Acceptable for processing or secondary commercial grade.'
            : 'Fails Grade B defect or shape thresholds; routed to Reject.',
        });

        if (passedGradeB) {
          calculatedGrade = 'GRADE_B';
        } else {
          calculatedGrade = 'REJECT';
        }
      }
    }

    const needsHumanReview = reviewReasons.length > 0;

    return {
      grade: calculatedGrade,
      isAutomatic: !needsHumanReview,
      needsHumanReview,
      reviewReasons,
      appliedRuleConfigName: rules.name,
      criteriaBreakdown,
    };
  }
}
