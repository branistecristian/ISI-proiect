package com.jef.develop.models.responses

import java.time.LocalDate

data class AvailabilityResponse(
    val islandId: String,
    val from: LocalDate,
    val to: LocalDate,
    val occupiedDates: List<LocalDate>
)