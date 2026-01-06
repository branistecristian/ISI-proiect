package com.jef.develop.repositories

import com.jef.develop.enums.BookingStatus
import com.jef.develop.enums.BookingType
import com.jef.develop.models.Booking
import org.springframework.data.mongodb.repository.MongoRepository
import java.time.LocalDate

interface BookingRepository : MongoRepository<Booking, String>{

    fun countByStatus(status: BookingStatus): Long
    fun findAllByUserIdOrderByCreatedAtDesc(userId: String): List<Booking>

    fun existsByTypeAndItemIdAndStatusInAndStartDateLessThanAndEndDateGreaterThan(
        type: BookingType,
        itemId: String,
        statuses: List<BookingStatus>,
        endDate: LocalDate,
        startDate: LocalDate
    ): Boolean

    fun findAllByTypeAndItemIdAndStatusInAndStartDateLessThanAndEndDateGreaterThan(
        type: BookingType,
        itemId: String,
        statuses: List<BookingStatus>,
        endDate: LocalDate,   // "to"
        startDate: LocalDate  // "from"
    ): List<Booking>

}