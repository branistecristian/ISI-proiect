package com.jef.develop.models.responses

import com.jef.develop.enums.BookingStatus
import com.jef.develop.enums.BookingType
import java.time.LocalDate

data class BookingResponse(
    val id: String,
    val userId: String,
    val type: BookingType,
    val itemId: String,          // islandId sau jetId
    val startDate: LocalDate,
    val endDate: LocalDate,
    val status: BookingStatus,
    val createdAt: LocalDate
)