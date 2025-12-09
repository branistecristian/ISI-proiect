package com.jef.develop.models

import com.jef.develop.enums.BookingStatus
import com.jef.develop.enums.BookingType
import org.springframework.data.annotation.Id
import org.springframework.data.mongodb.core.mapping.Document
import java.time.Instant
import java.time.LocalDate

@Document("bookings")
data class Booking(
        @Id
    val id: String? = null,
        val userId: String,
        val type: BookingType,
        val itemId: String,          // islandId sau jetId
        val startDate: LocalDate,
        val endDate: LocalDate,
        var status: BookingStatus = BookingStatus.PENDING,
        val createdAt: Instant = Instant.now()
)