import { Router, Request, Response } from 'express';
import { GeminiAIService } from '../services/ai/GeminiAIService';
import { GradingEngine } from '../services/grading/GradingEngine';
import { ReportService } from '../services/reports/ReportService';
import { DEMO_SAMPLES } from '../services/demo/DemoDataService';
import { db } from '../db/storage';
import { InspectionRecord } from '../models/types';

export const apiRouter = Router();
const aiService = new GeminiAIService();

// 1. Health & Config
apiRouter.get('/status', (req: Request, res: Response) => {
  res.json({
    status: 'online',
    system: 'AgriGrade Vision Core',
    version: '1.0.0',
    vegetablesSupported: ['tomato', 'bell_pepper', 'carrot', 'onion', 'cucumber', 'potato'],
    activeBatch: db.getActiveBatch(),
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString(),
  });
});

// 2. Agricultural Produce Quality Inspection Endpoint
apiRouter.post('/inspect', async (req: Request, res: Response) => {
  try {
    const {
      imageBase64,
      mimeType = 'image/jpeg',
      batchId,
      vegetableType = 'potato',
      isDemo = false,
      demoSampleId,
      operatorName = 'Field Inspector',
    } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: 'Missing imageBase64 payload.' });
    }

    // Clean base64 string if data URL prefix was sent
    const cleanBase64 = imageBase64.includes(';base64,')
      ? imageBase64.split(';base64,').pop()!
      : imageBase64;

    let aiAnalysis;

    // Check if matching a demo test target
    const matchedDemo = demoSampleId
      ? DEMO_SAMPLES.find((s) => s.id === demoSampleId)
      : DEMO_SAMPLES.find((s) => s.base64Data === cleanBase64);

    if (matchedDemo && isDemo) {
      aiAnalysis = matchedDemo.groundTruthObservations;
    } else {
      // Step 1: Vision Inference via Gemini (Produce detection, defects, shape, size, surface, confidence)
      aiAnalysis = await aiService.analyzeProduce(
        {
          base64Data: cleanBase64,
          mimeType,
        },
        vegetableType
      );
    }

    // Step 2: Separate Deterministic Grading Engine (Configurable rules)
    const currentRules = db.getGradingRules();
    const gradingResult = GradingEngine.evaluate(aiAnalysis, currentRules);

    // Step 3: Determine batch
    const targetBatchId = batchId || db.getActiveBatch()?.id;
    const targetBatch = targetBatchId ? db.getBatchById(targetBatchId) : undefined;

    // Step 4: Create Inspection Record
    const inspectionId = `INSP-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const fullImageDataUrl = imageBase64.startsWith('data:')
      ? imageBase64
      : `data:${mimeType};base64,${cleanBase64}`;

    const inspectionRecord: InspectionRecord = {
      id: inspectionId,
      batchId: targetBatch?.id,
      batchName: targetBatch?.name,
      timestamp: new Date().toISOString(),
      imageDataUrl: fullImageDataUrl,
      vegetableType: vegetableType,
      isDetected: aiAnalysis.detected,
      isPotato: aiAnalysis.detected,
      aiAnalysis,
      gradingResult,
      humanReview: {
        required: gradingResult.needsHumanReview,
        reviewed: false,
        originalGrade: gradingResult.grade,
      },
      operatorName,
      isDemo: Boolean(isDemo),
    };

    db.saveInspection(inspectionRecord);

    return res.json({
      success: true,
      inspection: inspectionRecord,
    });
  } catch (error: any) {
    console.error('Inspection error:', error);
    return res.status(500).json({
      error: 'Inspection processing failed: ' + (error?.message || 'Internal server error'),
    });
  }
});

// 3. Batches Endpoints
apiRouter.get('/batches', (req: Request, res: Response) => {
  res.json({
    batches: db.getAllBatches(),
    activeBatch: db.getActiveBatch(),
  });
});

apiRouter.post('/batches', (req: Request, res: Response) => {
  const { name, product, operatorName, targetQuantity, notes } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Batch name is required.' });
  }

  const batch = db.createBatch({
    name,
    product: (product as any) || 'tomato',
    operatorName: operatorName || 'Default Field Operator',
    targetQuantity: targetQuantity ? Number(targetQuantity) : undefined,
    notes: notes || '',
  });

  res.json({ success: true, batch });
});

apiRouter.get('/batches/active', (req: Request, res: Response) => {
  const activeBatch = db.getActiveBatch();
  res.json({ activeBatch });
});

apiRouter.post('/batches/:id/activate', (req: Request, res: Response) => {
  const success = db.setActiveBatch(req.params.id);
  if (!success) {
    return res.status(404).json({ error: 'Batch not found.' });
  }
  res.json({ success: true, activeBatch: db.getActiveBatch() });
});

apiRouter.post('/batches/:id/close', (req: Request, res: Response) => {
  const batch = db.closeBatch(req.params.id);
  if (!batch) {
    return res.status(404).json({ error: 'Batch not found.' });
  }
  res.json({ success: true, batch });
});

// 4. Inspections Endpoints
apiRouter.get('/inspections', (req: Request, res: Response) => {
  const { batchId, needsReview } = req.query;

  let list = db.getAllInspections();
  if (batchId) {
    list = list.filter((i) => i.batchId === batchId);
  }
  if (needsReview === 'true') {
    list = list.filter((i) => i.gradingResult.needsHumanReview && !i.humanReview?.reviewed);
  }

  res.json({ inspections: list });
});

apiRouter.get('/inspections/:id', (req: Request, res: Response) => {
  const inspection = db.getInspectionById(req.params.id);
  if (!inspection) {
    return res.status(404).json({ error: 'Inspection not found.' });
  }
  res.json({ inspection });
});

// 5. Human Review Workflow
apiRouter.post('/reviews/:inspectionId', (req: Request, res: Response) => {
  const { finalGrade, reviewerName, notes } = req.body;
  if (!finalGrade) {
    return res.status(400).json({ error: 'finalGrade is required (GRADE_A, GRADE_B, REJECT).' });
  }

  const updated = db.submitHumanReview(req.params.inspectionId, {
    reviewerName: reviewerName || 'Verified Inspector',
    finalGrade,
    notes: notes || 'Reviewed and approved by operator.',
  });

  if (!updated) {
    return res.status(404).json({ error: 'Inspection not found.' });
  }

  res.json({ success: true, inspection: updated });
});

// 6. Analytics Endpoint
apiRouter.get('/analytics', (req: Request, res: Response) => {
  const inspections = db.getAllInspections();
  const batches = db.getAllBatches();

  const totalInspections = inspections.length;
  let gradeA = 0;
  let gradeB = 0;
  let reject = 0;
  let totalConfidence = 0;
  let humanReviewNeededCount = 0;
  let humanReviewedCount = 0;
  const defectCounts: Record<string, number> = {};
  const shapeCounts: Record<string, number> = {};
  const sizeCounts: Record<string, number> = {};

  inspections.forEach((insp) => {
    const effectiveGrade = insp.humanReview?.reviewed && insp.humanReview.finalGrade
      ? insp.humanReview.finalGrade
      : insp.gradingResult.grade;

    if (effectiveGrade === 'GRADE_A') gradeA++;
    else if (effectiveGrade === 'GRADE_B') gradeB++;
    else reject++;

    totalConfidence += insp.aiAnalysis.overallConfidence;

    if (insp.gradingResult.needsHumanReview) {
      humanReviewNeededCount++;
      if (insp.humanReview?.reviewed) humanReviewedCount++;
    }

    insp.aiAnalysis.defects.forEach((d) => {
      defectCounts[d.type] = (defectCounts[d.type] || 0) + 1;
    });

    const shape = insp.aiAnalysis.shape.category;
    shapeCounts[shape] = (shapeCounts[shape] || 0) + 1;

    const size = insp.aiAnalysis.size.category;
    sizeCounts[size] = (sizeCounts[size] || 0) + 1;
  });

  const avgConfidence = totalInspections > 0 ? Number((totalConfidence / totalInspections).toFixed(3)) : 0;
  const reviewRate = totalInspections > 0 ? Number(((humanReviewNeededCount / totalInspections) * 100).toFixed(1)) : 0;

  res.json({
    totalInspections,
    totalBatches: batches.length,
    gradeDistribution: {
      gradeA,
      gradeB,
      reject,
    },
    averageConfidence: avgConfidence,
    humanReviewStats: {
      needed: humanReviewNeededCount,
      completed: humanReviewedCount,
      pending: humanReviewNeededCount - humanReviewedCount,
      reviewRatePercent: reviewRate,
    },
    defectDistribution: defectCounts,
    shapeDistribution: shapeCounts,
    sizeDistribution: sizeCounts,
    batchComparison: batches.map((b) => ({
      id: b.id,
      name: b.name,
      total: b.totalInspected,
      gradeA: b.gradeACount,
      gradeB: b.gradeBCount,
      reject: b.rejectCount,
      avgConfidence: b.averageConfidence,
      status: b.status,
    })),
  });
});

// 7. Reports & QR Verification
apiRouter.post('/reports/generate', async (req: Request, res: Response) => {
  try {
    const { batchId, operatorName } = req.body;
    const batch = db.getBatchById(batchId);
    if (!batch) {
      return res.status(404).json({ error: 'Batch not found.' });
    }

    const inspections = db.getInspectionsByBatch(batchId);
    const appUrl = process.env.APP_URL || `${req.protocol}://${req.get('host')}`;

    const report = await ReportService.generateBatchReport(
      batch,
      inspections,
      appUrl,
      operatorName || batch.operatorName
    );

    db.saveReport(report);

    res.json({ success: true, report });
  } catch (error: any) {
    console.error('Report generation error:', error);
    res.status(500).json({ error: 'Report generation failed: ' + error.message });
  }
});

apiRouter.get('/reports', (req: Request, res: Response) => {
  res.json({ reports: db.getAllReports() });
});

apiRouter.get('/reports/:id', (req: Request, res: Response) => {
  const report = db.getReportById(req.params.id);
  if (!report) {
    return res.status(404).json({ error: 'Report not found.' });
  }
  res.json({ report });
});

// 8. Public Verification Endpoint (Safe, no private PII or inspector details)
apiRouter.get('/verify/:reportId', (req: Request, res: Response) => {
  const report = db.getReportById(req.params.reportId);
  if (!report) {
    return res.status(404).json({
      verificationStatus: 'INVALID',
      error: 'Certificate record not found or revoked.',
    });
  }

  res.json({
    verification: report.verificationRecord,
  });
});

// 9. Configurable Grading Criteria
apiRouter.get('/grading-rules', (req: Request, res: Response) => {
  res.json({ rules: db.getGradingRules() });
});

apiRouter.put('/grading-rules', (req: Request, res: Response) => {
  const updated = db.updateGradingRules(req.body);
  res.json({ success: true, rules: updated });
});

apiRouter.post('/grading-rules/reset', (req: Request, res: Response) => {
  const reset = db.resetGradingRules();
  res.json({ success: true, rules: reset });
});

// 10. Demo Samples
apiRouter.get('/demo/samples', (req: Request, res: Response) => {
  res.json({ samples: DEMO_SAMPLES });
});
