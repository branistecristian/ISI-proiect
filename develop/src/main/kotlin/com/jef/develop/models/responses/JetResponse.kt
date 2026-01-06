package com.jef.develop.models.responses

import com.jef.develop.enums.JetStatus
import java.math.BigDecimal

data class JetResponse(
    val id: String,
    val model: String,
    val capacity: Int,
    val rangeKm: Int,
    val pricePerHour: BigDecimal?,
    val images: List<String>,
    val status: JetStatus
)