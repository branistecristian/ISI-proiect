package com.jef.develop.controllers

import com.jef.develop.models.requests.CreateBookingRequest
import com.jef.develop.models.responses.BookingResponse
import com.jef.develop.services.BookingService
import jakarta.validation.Valid
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/user/bookings")
class BookingController(
    private val bookingService: BookingService
) {
    // TODO: inlocuieste cu userId din JWT
    private fun currentUserId(): String = "REPLACE_WITH_JWT_SUB"

    @PostMapping
    fun create(@Valid @RequestBody req: CreateBookingRequest): BookingResponse =
        bookingService.create(currentUserId(), req)

    @GetMapping("/mine")
    fun mine(): List<BookingResponse> =
        bookingService.myBookings(currentUserId())
}