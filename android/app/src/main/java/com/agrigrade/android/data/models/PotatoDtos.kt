package com.agrigrade.android.data.models

import com.google.gson.annotations.SerializedName

data class InspectRequest(
    @SerializedName("imageBase64") val imageBase64: String,
    @SerializedName("mimeType") val mimeType: String = "image/jpeg",
    @SerializedName("batchId") val batchId: String? = null,
    @SerializedName("isDemo") val isDemo: Boolean = false,
    @SerializedName("operatorName") val operatorName: String? = null
)

data class InspectResponse(
    @SerializedName("success") val success: Boolean,
    @SerializedName("inspection") val inspection: InspectionDto
)

data class InspectionDto(
    @SerializedName("id") val id: String,
    @SerializedName("batchId") val batchId: String?,
    @SerializedName("batchName") val batchName: String?,
    @SerializedName("timestamp") val timestamp: String,
    @SerializedName("imageDataUrl") val imageDataUrl: String,
    @SerializedName("vegetableType") val vegetableType: String,
    @SerializedName("isPotato") val isPotato: Boolean,
    @SerializedName("aiAnalysis") val aiAnalysis: AIAnalysisDto,
    @SerializedName("gradingResult") val gradingResult: GradingResultDto,
    @SerializedName("humanReview") val humanReview: HumanReviewDto,
    @SerializedName("operatorName") val operatorName: String?,
    @SerializedName("isDemo") val isDemo: Boolean
)

data class AIAnalysisDto(
    @SerializedName("vegetableType") val vegetableType: String,
    @SerializedName("detected") val detected: Boolean,
    @SerializedName("detectionConfidence") val detectionConfidence: Float,
    @SerializedName("detectionMessage") val detectionMessage: String?,
    @SerializedName("defects") val defects: List<DefectObservationDto>,
    @SerializedName("shape") val shape: ShapeDto,
    @SerializedName("size") val size: SizeDto,
    @SerializedName("surface") val surface: SurfaceDto,
    @SerializedName("overallConfidence") val overallConfidence: Float,
    @SerializedName("imageQualityOk") val imageQualityOk: Boolean,
    @SerializedName("imageQualityIssues") val imageQualityIssues: List<String>,
    @SerializedName("rawObservationsSummary") val rawObservationsSummary: String
)

data class DefectObservationDto(
    @SerializedName("id") val id: String,
    @SerializedName("type") val type: String,
    @SerializedName("label") val label: String,
    @SerializedName("severity") val severity: String,
    @SerializedName("confidence") val confidence: Float,
    @SerializedName("locationDescription") val locationDescription: String?,
    @SerializedName("visibleEvidence") val visibleEvidence: String
)

data class ShapeDto(
    @SerializedName("category") val category: String,
    @SerializedName("confidence") val confidence: Float,
    @SerializedName("description") val description: String?
)

data class SizeDto(
    @SerializedName("category") val category: String,
    @SerializedName("confidence") val confidence: Float,
    @SerializedName("qualitativeNotes") val qualitativeNotes: String
)

data class SurfaceDto(
    @SerializedName("condition") val condition: String,
    @SerializedName("confidence") val confidence: Float
)

data class GradingResultDto(
    @SerializedName("grade") val grade: String, // GRADE_A, GRADE_B, REJECT
    @SerializedName("isAutomatic") val isAutomatic: Boolean,
    @SerializedName("needsHumanReview") val needsHumanReview: Boolean,
    @SerializedName("reviewReasons") val reviewReasons: List<String>,
    @SerializedName("appliedRuleConfigName") val appliedRuleConfigName: String,
    @SerializedName("criteriaBreakdown") val criteriaBreakdown: List<CriterionBreakdownDto>
)

data class CriterionBreakdownDto(
    @SerializedName("criterion") val criterion: String,
    @SerializedName("passed") val passed: Boolean,
    @SerializedName("details") val details: String
)

data class HumanReviewDto(
    @SerializedName("required") val required: Boolean,
    @SerializedName("reviewed") val reviewed: Boolean,
    @SerializedName("reviewerId") val reviewerId: String?,
    @SerializedName("reviewerName") val reviewerName: String?,
    @SerializedName("originalGrade") val originalGrade: String,
    @SerializedName("finalGrade") val finalGrade: String?,
    @SerializedName("reviewNotes") val reviewNotes: String?,
    @SerializedName("reviewTimestamp") val reviewTimestamp: String?
)

data class BatchDto(
    @SerializedName("id") val id: String,
    @SerializedName("name") val name: String,
    @SerializedName("product") val product: String,
    @SerializedName("operatorName") val operatorName: String,
    @SerializedName("targetQuantity") val targetQuantity: Int?,
    @SerializedName("notes") val notes: String?,
    @SerializedName("createdAt") val createdAt: String,
    @SerializedName("status") val status: String,
    @SerializedName("totalInspected") val totalInspected: Int,
    @SerializedName("gradeACount") val gradeACount: Int,
    @SerializedName("gradeBCount") val gradeBCount: Int,
    @SerializedName("rejectCount") val rejectCount: Int,
    @SerializedName("reviewCount") val reviewCount: Int,
    @SerializedName("averageConfidence") val averageConfidence: Float
)
