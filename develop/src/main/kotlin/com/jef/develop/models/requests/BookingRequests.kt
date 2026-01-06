package com.jef.develop.models.requests

import com.jef.develop.enums.BookingType
import java.time.LocalDate

data class CreateBookingRequest(
    val type: BookingType,         // ISLAND / JET
    val islandId: String? = null,
    val jetId: String? = null,
    val startDate: LocalDate,
    val endDate: LocalDate,
    val notes: String? = null // not used for the moment
)