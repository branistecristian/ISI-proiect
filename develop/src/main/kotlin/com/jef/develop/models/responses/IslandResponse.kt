package com.jef.develop.models.responses

import java.math.BigDecimal

data class IslandResponse(
    val id: String,
    val name: String,
    val location: String,
    val pricePerNight: BigDecimal,
    val description: String,
    val images: List<String>,
    val amenities: List<String>,
    val isAvailable: Boolean,
    val lat: Double?,
    val lng: Double?
)