package com.jef.develop.models

import com.jef.develop.enums.JetStatus
import org.springframework.data.annotation.Id
import org.springframework.data.mongodb.core.mapping.Document
import java.math.BigDecimal

@Document("jets")
data class Jet(
    @Id
    val id: String? = null,
    val model: String,
    val capacity: Int,
    val rangeKm: Int,
    val pricePerHour: BigDecimal,
    val images: List<String> = emptyList(),
    val status: JetStatus = JetStatus.AVAILABLE
)