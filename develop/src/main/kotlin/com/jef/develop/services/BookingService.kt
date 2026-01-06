package com.jef.develop.services

import com.jef.develop.enums.BookingStatus
import com.jef.develop.enums.BookingType
import com.jef.develop.models.Booking
import com.jef.develop.models.mappers.toResponse
import com.jef.develop.models.requests.CreateBookingRequest
import com.jef.develop.models.responses.BookingResponse
import com.jef.develop.repositories.BookingRepository
import com.jef.develop.repositories.IslandRepository
import com.jef.develop.repositories.JetRepository
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.web.server.ResponseStatusException
import java.time.Instant

@Service
class BookingService(
    private val bookingRepository: BookingRepository,
    private val islandRepository: IslandRepository,
    private val jetRepository: JetRepository
) {
    fun create(userId: String, req: CreateBookingRequest): BookingResponse {
        if (!req.startDate.isBefore(req.endDate)) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "startDate must be before endDate")
        }

        val itemId = when (req.type) {
            BookingType.ISLAND -> req.islandId
            BookingType.JET -> req.jetId
        } ?: throw ResponseStatusException(
            HttpStatus.BAD_REQUEST,
            "Missing item id for booking type ${req.type}"
        )

        // check island/jet exists
        val exists = when (req.type) {
            BookingType.ISLAND -> islandRepository.existsById(itemId)
            BookingType.JET -> jetRepository.existsById(itemId)
        }

        if (!exists) {
            throw ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "${req.type.name.lowercase().replaceFirstChar { it.uppercase() }} not found"
            )
        }

        // conflict check (active bookings)
        val conflict = bookingRepository.existsByTypeAndItemIdAndStatusInAndStartDateLessThanAndEndDateGreaterThan(
            type = req.type,
            itemId = itemId,
            statuses = listOf(BookingStatus.PENDING, BookingStatus.CONFIRMED),
            endDate = req.endDate,
            startDate = req.startDate
        )

        if (conflict) {
            throw ResponseStatusException(HttpStatus.CONFLICT, "Already booked for this period")
        }

        val booking = Booking(
            id = null,
            userId = userId,
            type = req.type,
            itemId = itemId,
            startDate = req.startDate,
            endDate = req.endDate,
            status = BookingStatus.PENDING,
            createdAt = Instant.now(),
            updatedAt = Instant.now()
        )

        return bookingRepository.save(booking).toResponse()
    }

    fun myBookings(userId: String): List<BookingResponse> =
        bookingRepository.findAllByUserIdOrderByCreatedAtDesc(userId)
            .map { it.toResponse() }

    fun cancel(userId: String, bookingId: String): BookingResponse {
        val booking = bookingRepository.findById(bookingId).orElseThrow {
            ResponseStatusException(HttpStatus.NOT_FOUND, "Booking not found")
        }

        if (booking.userId != userId) {
            throw ResponseStatusException(HttpStatus.FORBIDDEN, "Not your booking")
        }

        if (booking.status != BookingStatus.PENDING) {
            throw ResponseStatusException(HttpStatus.CONFLICT, "Only PENDING bookings can be cancelled")
        }

        val updated = booking.copy(
            status = BookingStatus.CANCELLED,
            updatedAt = Instant.now()
        )

        return bookingRepository.save(updated).toResponse()
    }
}
