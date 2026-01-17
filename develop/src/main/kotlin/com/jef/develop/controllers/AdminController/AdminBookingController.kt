package com.jef.develop.controllers.AdminController

import com.jef.develop.models.Booking
// Asigură-te că imporți Enum-ul corect!
import com.jef.develop.enums.BookingStatus
import com.jef.develop.repositories.BookingRepository
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import java.time.LocalDate

data class BookingUpdateRequest(
        val status: String,
        val startDate: LocalDate,
        val endDate: LocalDate
)

@RestController
@RequestMapping("/api/admin/bookings")
@CrossOrigin(origins = ["http://localhost:5173"])
class AdminBookingController(
        private val bookingRepository: BookingRepository
) {

    @GetMapping
    fun getAllBookings(): List<Booking> {
        return bookingRepository.findAll()
    }

    @PutMapping("/{id}/status")
    fun updateBookingStatus(
            @PathVariable id: String,
            @RequestBody statusUpdate: Map<String, String>
    ): ResponseEntity<Booking> {
        val newStatusString = statusUpdate["status"]

        return bookingRepository.findById(id).map { booking ->
            if (newStatusString != null) {
                try {

                    val newStatusEnum = BookingStatus.valueOf(newStatusString.uppercase())

                    // 3. Atribuirea valorii Enum

                    booking.status= newStatusEnum

                    // 4. Salvarea în baza de date
                    ResponseEntity.ok(bookingRepository.save(booking))

                } catch (e: IllegalArgumentException) {
                    // 5. Dacă string-ul nu există în Enum (ex: trimite "BLABLA"), returnăm 400 Bad Request
                    ResponseEntity.badRequest().build<Booking>()
                }
            } else {
                ResponseEntity.badRequest().build()
            }
        }.orElse(ResponseEntity.notFound().build())
    }

    @PutMapping("/{id}")
    fun updateBooking(@PathVariable id: String, @RequestBody req: BookingUpdateRequest): ResponseEntity<Booking> {
        return bookingRepository.findById(id).map { existingBooking ->

            // Convertim statusul (cu fallback la PENDING)
            val newStatus = try {
                BookingStatus.valueOf(req.status.uppercase())
            } catch (e: Exception) {
                BookingStatus.PENDING
            }

            val updatedBooking = existingBooking.copy(
                    status = newStatus,
                    startDate = req.startDate,
                    endDate = req.endDate,
                    updatedAt = java.time.Instant.now()
            )

            ResponseEntity.ok(bookingRepository.save(updatedBooking))
        }.orElse(ResponseEntity.notFound().build())
    }

    // DELETE BOOKING
    @DeleteMapping("/{id}")
    fun deleteBooking(@PathVariable id: String): ResponseEntity<Void> {
        if (bookingRepository.existsById(id)) {
            bookingRepository.deleteById(id)
            return ResponseEntity.ok().build()
        }
        return ResponseEntity.notFound().build()
    }
}