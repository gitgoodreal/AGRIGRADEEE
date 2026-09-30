package com.agrigrade.android.data.remote

import com.agrigrade.android.data.models.BatchDto
import com.agrigrade.android.data.models.InspectRequest
import com.agrigrade.android.data.models.InspectResponse
import com.agrigrade.android.data.models.InspectionDto
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.http.Path
import retrofit2.http.Query

interface AgriGradeApiService {

    @POST("api/inspect")
    suspend fun inspectPotato(@Body request: InspectRequest): Response<InspectResponse>

    @GET("api/batches")
    suspend fun getBatches(): Response<Map<String, Any>>

    @GET("api/inspections")
    suspend fun getInspections(
        @Query("batchId") batchId: String? = null,
        @Query("needsReview") needsReview: Boolean? = null
    ): Response<Map<String, List<InspectionDto>>>

    @POST("api/reviews/{inspectionId}")
    suspend fun submitReview(
        @Path("inspectionId") inspectionId: String,
        @Body body: Map<String, String>
    ): Response<Map<String, Any>>

    @GET("api/analytics")
    suspend fun getAnalytics(): Response<Map<String, Any>>
}
