package com.jef.develop.controllers.AdminController

import com.jef.develop.models.Booking
// Asigură-te că imporți Enum-ul corect!
import com.jef.develop.enums.BookingStatus
import com.jef.develop.repositories.BookingRepository
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

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
}