import QRCode from 'qrcode';
import crypto from 'crypto';
import { BatchRecord, BatchReport, InspectionRecord, VerificationRecord } from '../../models/types';

export class ReportService {
  /**
   * Generates a tamper-evident cryptographic hash for public verification.
   */
  public static generateSignature(payload: object): string {
    const serialized = JSON.stringify(payload);
    return crypto.createHash('sha256').update(serialized).digest('hex').substring(0, 32);
  }

  /**
   * Creates a formal batch report and corresponding public verification record.
   */
  public static async generateBatchReport(
    batch: BatchRecord,
    inspections: InspectionRecord[],
    appUrl: string,
    operatorName = 'Field Inspector'
  ): Promise<BatchReport> {
    const reportId = `REP-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
    const generatedAt = new Date().toISOString();

    const totalInspected = inspections.length;
    let gradeA = 0;
    let gradeB = 0;
    let reject = 0;
    let totalConfidence = 0;
    let humanReviewedCount = 0;
    const defectMap: Record<string, number> = {};

    inspections.forEach((insp) => {
      // Determine final grade (human-reviewed takes precedence over AI grade)
      const effectiveGrade = insp.humanReview?.reviewed && insp.humanReview.finalGrade
        ? insp.humanReview.finalGrade
        : insp.gradingResult.grade;

      if (effectiveGrade === 'GRADE_A') gradeA++;
      else if (effectiveGrade === 'GRADE_B') gradeB++;
      else reject++;

      totalConfidence += insp.aiAnalysis.overallConfidence;
      if (insp.humanReview?.reviewed) humanReviewedCount++;

      insp.aiAnalysis.defects.forEach((d) => {
        defectMap[d.type] = (defectMap[d.type] || 0) + 1;
      });
    });

    const averageConfidence = totalInspected > 0 ? Number((totalConfidence / totalInspected).toFixed(3)) : 0;
    const automaticGradeRate = totalInspected > 0 ? Number(((totalInspected - humanReviewedCount) / totalInspected).toFixed(3)) : 0;

    const defectsSummary = Object.entries(defectMap).map(([type, count]) => ({
      defectType: type,
      count,
      frequencyPercent: totalInspected > 0 ? Math.round((count / totalInspected) * 100) : 0,
    })).sort((a, b) => b.count - a.count);

    // Build the public verification payload (Strictly NO private inspector details or image URLs)
    const verificationPayload = {
      reportId,
      batchId: batch.id,
      batchName: batch.name,
      product: batch.product,
      inspectionCount: totalInspected,
      gradeDistribution: { gradeA, gradeB, reject },
      defectBreakdown: defectMap,
      averageConfidence,
      humanReviewedCount,
      reportCreationDate: generatedAt,
    };

    const signature = this.generateSignature(verificationPayload);

    const verificationRecord: VerificationRecord = {
      ...verificationPayload,
      verificationStatus: 'VERIFIED',
      digitalSignature: signature,
    };

    // Construct the public verification URL
    const baseUrl = appUrl.replace(/\/$/, '');
    const publicVerifyUrl = `${baseUrl}/#verify/${reportId}`;

    // Generate high-resolution QR code
    const qrCodeUrl = await QRCode.toDataURL(publicVerifyUrl, {
      errorCorrectionLevel: 'H',
      margin: 1,
      width: 256,
      color: {
        dark: '#1b4332',
        light: '#ffffff',
      },
    });

    return {
      id: reportId,
      batchId: batch.id,
      batchName: batch.name,
      generatedAt,
      generatedBy: operatorName,
      product: batch.product,
      summary: {
        totalInspected,
        gradeA,
        gradeB,
        reject,
        averageConfidence,
        humanReviewedCount,
        automaticGradeRate,
      },
      defectsSummary,
      verificationRecord,
      qrCodeUrl,
      publicVerifyUrl,
    };
  }
}
