import { BatchRecord, BatchReport, InspectionRecord, GradingRuleConfig, HumanReviewData } from '../models/types';
import { DEFAULT_GRADING_RULES } from '../services/grading/GradingEngine';

class AgriGradeDatabase {
  private batches: Map<string, BatchRecord> = new Map();
  private inspections: Map<string, InspectionRecord> = new Map();
  private reports: Map<string, BatchReport> = new Map();
  private activeBatchId: string | null = null;
  private gradingRules: GradingRuleConfig = { ...DEFAULT_GRADING_RULES };

  constructor() {
    this.seedInitialData();
  }

  private seedInitialData() {
    const batchesData: BatchRecord[] = [
      {
        id: 'BATCH-2026-10-A',
        name: 'Lot #810 - Roma Vine Harvest',
        product: 'tomato',
        operatorName: 'Marcus Vance (AgriTech QA)',
        targetQuantity: 150,
        notes: 'Vine-ripened harvest from Greenhouse Block B. Checked for firmness & blossom rot.',
        createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
        status: 'active',
        totalInspected: 0,
        gradeACount: 0,
        gradeBCount: 0,
        rejectCount: 0,
        reviewCount: 0,
        averageConfidence: 0,
      },
      {
        id: 'BATCH-2026-10-B',
        name: 'Lot #520 - Sweet Bell Peppers',
        product: 'bell_pepper',
        operatorName: 'Elena Rostova (Lead Inspector)',
        targetQuantity: 120,
        notes: 'Field Sector 4. Checking 4-lobe shape symmetry and sunscald.',
        createdAt: new Date(Date.now() - 3600000 * 6).toISOString(),
        status: 'active',
        totalInspected: 0,
        gradeACount: 0,
        gradeBCount: 0,
        rejectCount: 0,
        reviewCount: 0,
        averageConfidence: 0,
      },
      {
        id: 'BATCH-2026-10-C',
        name: 'Lot #402 - Russet Burbank Tuber Lot',
        product: 'potato',
        operatorName: 'Marcus Vance (AgriTech QA)',
        targetQuantity: 200,
        notes: 'Morning harvest from Field Sector 3-North. Optimal curing condition.',
        createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
        status: 'active',
        totalInspected: 0,
        gradeACount: 0,
        gradeBCount: 0,
        rejectCount: 0,
        reviewCount: 0,
        averageConfidence: 0,
      },
      {
        id: 'BATCH-2026-10-D',
        name: 'Lot #312 - Nantes Crisp Carrots',
        product: 'carrot',
        operatorName: 'Sarah Jenkins (Field QA)',
        targetQuantity: 180,
        notes: 'Washed and topped cello carrot lot. Checked for crown greening & straightness.',
        createdAt: new Date(Date.now() - 3600000 * 18).toISOString(),
        status: 'active',
        totalInspected: 0,
        gradeACount: 0,
        gradeBCount: 0,
        rejectCount: 0,
        reviewCount: 0,
        averageConfidence: 0,
      },
      {
        id: 'BATCH-2026-10-E',
        name: 'Lot #605 - Sweet Spanish Onions',
        product: 'onion',
        operatorName: 'Marcus Vance (AgriTech QA)',
        targetQuantity: 100,
        notes: 'Cured dry onion sacks. Inspecting neck tightness and tunic scales.',
        createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
        status: 'active',
        totalInspected: 0,
        gradeACount: 0,
        gradeBCount: 0,
        rejectCount: 0,
        reviewCount: 0,
        averageConfidence: 0,
      },
      {
        id: 'BATCH-2026-10-F',
        name: 'Lot #144 - Slicing Cucumbers',
        product: 'cucumber',
        operatorName: 'Elena Rostova (Lead Inspector)',
        targetQuantity: 100,
        notes: 'Hydroponic tunnel harvest. Checking curvature arc and yellowing.',
        createdAt: new Date(Date.now() - 3600000 * 30).toISOString(),
        status: 'active',
        totalInspected: 0,
        gradeACount: 0,
        gradeBCount: 0,
        rejectCount: 0,
        reviewCount: 0,
        averageConfidence: 0,
      },
    ];

    batchesData.forEach((b) => this.batches.set(b.id, b));
    this.activeBatchId = 'BATCH-2026-10-A';
  }

  // Batches
  public getAllBatches(): BatchRecord[] {
    return Array.from(this.batches.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  public getBatchById(id: string): BatchRecord | undefined {
    return this.batches.get(id);
  }

  public getActiveBatch(): BatchRecord | null {
    if (!this.activeBatchId) return null;
    return this.batches.get(this.activeBatchId) || null;
  }

  public setActiveBatch(id: string): boolean {
    if (this.batches.has(id)) {
      this.activeBatchId = id;
      return true;
    }
    return false;
  }

  public createBatch(data: Omit<BatchRecord, 'id' | 'createdAt' | 'status' | 'totalInspected' | 'gradeACount' | 'gradeBCount' | 'rejectCount' | 'reviewCount' | 'averageConfidence'>): BatchRecord {
    const id = `BATCH-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(100 + Math.random() * 900)}`;
    const newBatch: BatchRecord = {
      ...data,
      id,
      createdAt: new Date().toISOString(),
      status: 'active',
      totalInspected: 0,
      gradeACount: 0,
      gradeBCount: 0,
      rejectCount: 0,
      reviewCount: 0,
      averageConfidence: 0,
    };
    this.batches.set(id, newBatch);
    this.activeBatchId = id;
    return newBatch;
  }

  public closeBatch(id: string): BatchRecord | null {
    const batch = this.batches.get(id);
    if (!batch) return null;
    batch.status = 'closed';
    batch.closedAt = new Date().toISOString();
    if (this.activeBatchId === id) {
      this.activeBatchId = null;
    }
    return batch;
  }

  // Inspections
  public getAllInspections(): InspectionRecord[] {
    return Array.from(this.inspections.values()).sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  public getInspectionById(id: string): InspectionRecord | undefined {
    return this.inspections.get(id);
  }

  public getInspectionsByBatch(batchId: string): InspectionRecord[] {
    return this.getAllInspections().filter((i) => i.batchId === batchId);
  }

  public getInspectionsNeedingReview(): InspectionRecord[] {
    return this.getAllInspections().filter(
      (i) => i.gradingResult.needsHumanReview && !i.humanReview?.reviewed
    );
  }

  public saveInspection(inspection: InspectionRecord): InspectionRecord {
    this.inspections.set(inspection.id, inspection);

    // Update batch statistics if linked to a batch
    if (inspection.batchId && this.batches.has(inspection.batchId)) {
      this.recalculateBatchStats(inspection.batchId);
    }

    return inspection;
  }

  public submitHumanReview(
    inspectionId: string,
    reviewData: {
      reviewerName: string;
      finalGrade: 'GRADE_A' | 'GRADE_B' | 'REJECT';
      notes: string;
    }
  ): InspectionRecord | null {
    const insp = this.inspections.get(inspectionId);
    if (!insp) return null;

    insp.humanReview = {
      required: true,
      reviewed: true,
      reviewerId: 'USR-OP-' + Date.now().toString().slice(-4),
      reviewerName: reviewData.reviewerName || 'Senior Quality Specialist',
      originalGrade: insp.gradingResult.grade,
      finalGrade: reviewData.finalGrade,
      reviewNotes: reviewData.notes,
      reviewTimestamp: new Date().toISOString(),
    };

    this.inspections.set(inspectionId, insp);

    if (insp.batchId && this.batches.has(insp.batchId)) {
      this.recalculateBatchStats(insp.batchId);
    }

    return insp;
  }

  private recalculateBatchStats(batchId: string) {
    const batch = this.batches.get(batchId);
    if (!batch) return;

    const list = this.getInspectionsByBatch(batchId);
    batch.totalInspected = list.length;

    let gradeA = 0;
    let gradeB = 0;
    let reject = 0;
    let reviewCount = 0;
    let totalConf = 0;

    list.forEach((i) => {
      const effectiveGrade = i.humanReview?.reviewed && i.humanReview.finalGrade
        ? i.humanReview.finalGrade
        : i.gradingResult.grade;

      if (effectiveGrade === 'GRADE_A') gradeA++;
      else if (effectiveGrade === 'GRADE_B') gradeB++;
      else reject++;

      if (i.humanReview?.reviewed) reviewCount++;
      totalConf += i.aiAnalysis.overallConfidence;
    });

    batch.gradeACount = gradeA;
    batch.gradeBCount = gradeB;
    batch.rejectCount = reject;
    batch.reviewCount = reviewCount;
    batch.averageConfidence = list.length > 0 ? Number((totalConf / list.length).toFixed(3)) : 0;

    this.batches.set(batchId, batch);
  }

  // Reports
  public saveReport(report: BatchReport): BatchReport {
    this.reports.set(report.id, report);
    return report;
  }

  public getReportById(id: string): BatchReport | undefined {
    return this.reports.get(id);
  }

  public getAllReports(): BatchReport[] {
    return Array.from(this.reports.values()).sort(
      (a, b) => new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime()
    );
  }

  // Grading Rules
  public getGradingRules(): GradingRuleConfig {
    return this.gradingRules;
  }

  public updateGradingRules(rules: Partial<GradingRuleConfig>): GradingRuleConfig {
    this.gradingRules = {
      ...this.gradingRules,
      ...rules,
    };
    return this.gradingRules;
  }

  public resetGradingRules(): GradingRuleConfig {
    this.gradingRules = { ...DEFAULT_GRADING_RULES };
    return this.gradingRules;
  }
}

export const db = new AgriGradeDatabase();
