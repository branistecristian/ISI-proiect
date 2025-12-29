package com.jef.develop.services

import com.jef.develop.enums.BookingStatus
import com.jef.develop.enums.BookingType
import com.jef.develop.models.responses.AvailabilityResponse
import com.jef.develop.repositories.BookingRepository
import com.jef.develop.repositories.IslandRepository
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.web.server.ResponseStatusException
import java.time.LocalDate

@Service
class AvailabilityService(
    private val bookingRepository: BookingRepository,
    private val islandRepository: IslandRepository
) {
    fun islandAvailability(islandId: String, from: LocalDate, to: LocalDate): AvailabilityResponse {
        if (!from.isBefore(to)) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "`from` must be before `to`")
        }

        if (!islandRepository.existsById(islandId)) {
            throw ResponseStatusException(HttpStatus.NOT_FOUND, "Island not found")
        }

        val activeStatuses = listOf(BookingStatus.PENDING, BookingStatus.CONFIRMED)

        val bookings = bookingRepository
            .findAllByTypeAndItemIdAndStatusInAndStartDateLessThanAndEndDateGreaterThan(
                type = BookingType.ISLAND,
                itemId = islandId,
                statuses = activeStatuses,
                endDate = to,
                startDate = from
            )

        // Expand bookings into occupied dates (standard: [startDate, endDate))
        val occupied = bookings
            .asSequence()
            .flatMap { b ->
                val s = maxOf(b.startDate, from)
                val e = minOf(b.endDate, to) // e is exclusive
                generateSequence(s) { d -> d.plusDays(1) }
                    .takeWhile { d -> d.isBefore(e) }
            }
            .distinct()
            .sorted()
            .toList()

        return AvailabilityResponse(
            islandId = islandId,
            from = from,
            to = to,
            occupiedDates = occupied
        )
    }
}