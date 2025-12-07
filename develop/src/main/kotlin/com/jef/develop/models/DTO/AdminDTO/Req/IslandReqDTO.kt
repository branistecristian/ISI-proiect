package com.jef.develop.models.DTO.AdminDTO.Req

data class IslandReqDTO(
        val name: String,
        val description: String,
        val country: String,
        val pricePerNight: Double,
        val capacity: Int,
        val sizeHectares: Double,
        val images: List<String> = emptyList(),        // URLs
        val amenities: List<String> = emptyList(),     // e.g. "Pool", "Helipad"
        val isAvailable: Boolean = true
)