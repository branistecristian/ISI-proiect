package com.jef.develop.controllers

import com.jef.develop.models.requests.CreateBookingRequest
import com.jef.develop.models.responses.BookingResponse
import com.jef.develop.services.BookingService
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.web.bind.annotation.*
import org.springframework.web.server.ResponseStatusException

@RestController
@RequestMapping("/api/user/bookings")
class BookingController(
    private val bookingService: BookingService
) {

    private fun currentUserId(): String {
        val auth = SecurityContextHolder.getContext().authentication
        if (auth == null || auth.name == "anonymousUser") {
            throw ResponseStatusException(HttpStatus.UNAUTHORIZED, "Missing token")
        }
        return auth.principal.toString()
    }

    @PostMapping
    fun create(@Valid @RequestBody req: CreateBookingRequest): BookingResponse =
        bookingService.create(currentUserId(), req)

    @GetMapping("/mine")
    fun mine(): List<BookingResponse> =
        bookingService.myBookings(currentUserId())
}