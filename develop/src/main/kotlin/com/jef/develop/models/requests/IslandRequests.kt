package com.jef.develop.models.requests

import java.math.BigDecimal

data class IslandCreateRequest(
    val name: String,
    val location: String,
    val pricePerNight: BigDecimal,
    val description: String,
    val images: List<String> = emptyList(),
    val amenities: List<String> = emptyList(),
    val isAvailable: Boolean = true
)

data class IslandFilterRequest(
    val q: String? = null,                 // search keyword
    val location: String? = null,
    val minPrice: BigDecimal? = null,
    val maxPrice: BigDecimal? = null,
    val onlyAvailable: Boolean = true
)