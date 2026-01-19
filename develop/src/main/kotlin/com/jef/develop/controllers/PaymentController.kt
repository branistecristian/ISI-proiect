package com.jef.develop.controllers

import com.jef.develop.enums.BookingStatus
import com.jef.develop.enums.BookingType
import com.jef.develop.models.requests.PaymentRequest
import com.jef.develop.repositories.BookingRepository
import com.jef.develop.repositories.IslandRepository
import com.jef.develop.repositories.JetRepository
import com.stripe.Stripe
import com.stripe.model.checkout.Session
import com.stripe.param.checkout.SessionCreateParams
import jakarta.annotation.PostConstruct
import org.springframework.beans.factory.annotation.Value
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.web.bind.annotation.*
import org.springframework.web.server.ResponseStatusException
import java.math.BigDecimal
import java.time.temporal.ChronoUnit

@RestController
@RequestMapping("/api/payments")
class PaymentController(
        private val bookingRepository: BookingRepository,
        private val islandRepository: IslandRepository,
        private val jetRepository: JetRepository,
        @Value("\${stripe.api.key}") private val stripeApiKey: String
) {

    @PostConstruct
    fun init() {
        Stripe.apiKey = stripeApiKey
    }

    private fun currentUserId(): String {
        val auth = SecurityContextHolder.getContext().authentication
        if (auth == null || auth.name == "anonymousUser") {
            throw ResponseStatusException(HttpStatus.UNAUTHORIZED, "Missing token")
        }
        return auth.principal.toString()
    }

    // --- ENDPOINT NOU: Confirmare Plată (Schimbă în PAID) ---
    @PostMapping("/{bookingId}/success")
    fun markAsPaid(@PathVariable bookingId: String): ResponseEntity<String> {
        val userId = currentUserId()
        val booking = bookingRepository.findById(bookingId).orElseThrow {
            ResponseStatusException(HttpStatus.NOT_FOUND, "Booking not found")
        }

        if (booking.userId != userId) {
            throw ResponseStatusException(HttpStatus.FORBIDDEN, "Not your booking")
        }

        // Trecem în status PAID doar dacă era PENDING
        if (booking.status == BookingStatus.PENDING) {
            booking.status = BookingStatus.PAID
            bookingRepository.save(booking)
        }

        return ResponseEntity.ok("Booking marked as PAID")
    }

    @PostMapping("/create-checkout-session")
    fun createCheckoutSession(@RequestBody req: PaymentRequest): ResponseEntity<Map<String, String>> {
        val userId = currentUserId()

        val booking = bookingRepository.findById(req.bookingId).orElseThrow {
            ResponseStatusException(HttpStatus.NOT_FOUND, "Booking not found")
        }

        if (booking.userId != userId) {
            throw ResponseStatusException(HttpStatus.FORBIDDEN, "Not your booking")
        }

        // Verificăm să nu fie deja plătit
        if (booking.status == BookingStatus.PAID || booking.status == BookingStatus.CONFIRMED) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Booking already paid")
        }

        var priceInCents: Long = 0
        var productName = ""

        if (booking.type == BookingType.ISLAND) {
            val island = islandRepository.findById(booking.itemId).orElseThrow {
                ResponseStatusException(HttpStatus.NOT_FOUND, "Island not found")
            }
            productName = "Sejur la ${island.name}"

            val nights = ChronoUnit.DAYS.between(booking.startDate, booking.endDate)
            val finalNights = if (nights <= 0) 1 else nights
            val pricePerNightBd = island.pricePerNight
            val totalBd = pricePerNightBd
                    .multiply(BigDecimal.valueOf(finalNights))
                    .multiply(BigDecimal.valueOf(100))

            priceInCents = totalBd.toLong()

        } else if (booking.type == BookingType.JET) {
            val jet = jetRepository.findById(booking.itemId).orElseThrow {
                ResponseStatusException(HttpStatus.NOT_FOUND, "Jet not found")
            }
            productName = "Zbor cu ${jet.model}"

            val days = ChronoUnit.DAYS.between(booking.startDate, booking.endDate)
            val activeDays = if (days <= 0) 1 else days
            val estimatedHours = activeDays * 3
            val pricePerHourBd = jet.pricePerHour
            val totalBd = pricePerHourBd
                    .multiply(BigDecimal.valueOf(estimatedHours))
                    .multiply(BigDecimal.valueOf(100))

            priceInCents = totalBd.toLong()
        }

        // URL-urile Frontend-ului: Adăugăm &bookingId=... ca să știm ce să actualizăm la întoarcere
        val successUrl = "http://localhost:5173/booking?success=true&bookingId=${booking.id}"
        val cancelUrl = "http://localhost:5173/booking?canceled=true"

        val params = SessionCreateParams.builder()
                .setMode(SessionCreateParams.Mode.PAYMENT)
                .setSuccessUrl(successUrl)
                .setCancelUrl(cancelUrl)
                .addLineItem(
                        SessionCreateParams.LineItem.builder()
                                .setQuantity(1L)
                                .setPriceData(
                                        SessionCreateParams.LineItem.PriceData.builder()
                                                .setCurrency("eur")
                                                .setUnitAmount(priceInCents)
                                                .setProductData(
                                                        SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                                                .setName(productName)
                                                                .build()
                                                )
                                                .build()
                                )
                                .build()
                )
                .putMetadata("bookingId", booking.id)
                .putMetadata("userId", userId)
                .build()

        val session = Session.create(params)

        return ResponseEntity.ok(mapOf("url" to session.url))
    }
}