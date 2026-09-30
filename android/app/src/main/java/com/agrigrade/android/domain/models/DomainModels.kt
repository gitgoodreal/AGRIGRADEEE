package com.agrigrade.android.domain.models

enum class QualityGrade {
    GRADE_A,
    GRADE_B,
    REJECT
}

enum class DefectSeverity {
    MINOR,
    MODERATE,
    SEVERE
}

enum class ShapeCategory {
    REGULAR,
    SLIGHTLY_IRREGULAR,
    IRREGULAR,
    UNKNOWN
}

enum class SizeCategory {
    SMALL,
    MEDIUM,
    LARGE,
    UNKNOWN
}

data class PotatoDefect(
    val type: String,
    val label: String,
    val severity: DefectSeverity,
    val confidence: Float,
    val visibleEvidence: String
)

data class PotatoInspection(
    val id: String,
    val batchId: String?,
    val timestamp: String,
    val isPotato: Boolean,
    val grade: QualityGrade,
    val confidence: Float,
    val needsHumanReview: Boolean,
    val defects: List<PotatoDefect>,
    val shape: ShapeCategory,
    val size: SizeCategory,
    val rawSummary: String
)
