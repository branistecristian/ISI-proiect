package com.jef.develop.services


import com.jef.develop.enums.BookingStatus
import com.jef.develop.enums.BookingType
import com.jef.develop.models.mappers.toResponse
import com.jef.develop.models.Booking
import com.jef.develop.repositories.BookingRepository
import com.jef.develop.models.requests.CreateBookingRequest
import com.jef.develop.models.responses.BookingResponse
import org.springframework.stereotype.Service
import java.time.Instant

@Service
class BookingService(
    private val bookingRepository: BookingRepository
) {
    fun create(userId: String, req: CreateBookingRequest): BookingResponse {
        val booking = Booking(
            id = null,
            userId = userId,
            type = req.type,
            itemId = (if (req.type == BookingType.ISLAND) req.islandId else req.jetId)!!,
            startDate = req.startDate,
            endDate = req.endDate,
            status = BookingStatus.PENDING, // workflow: user trimite, admin aproba/respinge
            createdAt = Instant.now()
        )
        return bookingRepository.save(booking).toResponse()
    }

    fun myBookings(userId: String): List<BookingResponse> =
        bookingRepository.findAll()
            .filter { it.userId == userId }
            .map { it.toResponse() }
}