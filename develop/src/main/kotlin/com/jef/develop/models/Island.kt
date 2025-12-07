package com.jef.develop.models

import org.springframework.data.annotation.Id
import org.springframework.data.mongodb.core.mapping.Document
import java.math.BigDecimal

@Document("islands")
data class Island(
    @Id
    val id: String? = null,
    val name: String,
    val location: String,
    val pricePerNight: BigDecimal,
    val description: String,
    val images: List<String> = emptyList(),
    val amenities: List<String> = emptyList(),
    val isAvailable: Boolean = true
)