package com.jef.develop.controllers

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
// --- IMPORTURILE CRITICE (Verifică să fie exact astea) ---
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.web.bind.annotation.*
import org.springframework.web.server.ResponseStatusException
// ---------------------------------------------------------
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
        // Verificare strictă pentru a evita erorile de NullPointer
        if (auth == null || auth.name == "anonymousUser") {
            // Aici apare eroarea ta. Importul corect de sus rezolvă problema.
            throw ResponseStatusException(HttpStatus.UNAUTHORIZED, "Missing token")
        }
        return auth.principal.toString()
    }

    @PostMapping("/create-checkout-session")
    fun createCheckoutSession(@RequestBody req: PaymentRequest): ResponseEntity<Map<String, String>> {
        val userId = currentUserId()

        // 1. Căutăm rezervarea
        val booking = bookingRepository.findById(req.bookingId).orElseThrow {
            ResponseStatusException(HttpStatus.NOT_FOUND, "Booking not found")
        }

        // 2. Verificăm ownership-ul
        if (booking.userId != userId) {
            throw ResponseStatusException(HttpStatus.FORBIDDEN, "Not your booking")
        }

        var priceInCents: Long = 0
        var productName = ""

        // 3. Calculăm prețul în funcție de tip (BookingType)
        if (booking.type == BookingType.ISLAND) {
            val island = islandRepository.findById(booking.itemId).orElseThrow {
                ResponseStatusException(HttpStatus.NOT_FOUND, "Island not found")
            }
            productName = "Sejur la ${island.name}"

            // Calculăm nr. nopți
            val nights = ChronoUnit.DAYS.between(booking.startDate, booking.endDate)
            val finalNights = if (nights <= 0) 1 else nights

            // --- CALCUL MATEMATIC CORECT (BigDecimal) ---
            // Convertim totul la BigDecimal pentru a evita eroarea "Type mismatch: Long vs BigDecimal"
            val pricePerNightBd = island.pricePerNight // BigDecimal din entitate
            val nightsBd = BigDecimal.valueOf(finalNights)
            val centsBd = BigDecimal.valueOf(100)

            val totalDecimal = pricePerNightBd.multiply(nightsBd).multiply(centsBd)

            priceInCents = totalDecimal.toLong()

        } else if (booking.type == BookingType.JET) {
            val jet = jetRepository.findById(booking.itemId).orElseThrow {
                ResponseStatusException(HttpStatus.NOT_FOUND, "Jet not found")
            }
            productName = "Zbor cu ${jet.model}"

            // Calculăm zilele active
            val days = ChronoUnit.DAYS.between(booking.startDate, booking.endDate)
            val activeDays = if (days <= 0) 1 else days
            val estimatedHours = activeDays * 3

            // --- CALCUL MATEMATIC CORECT (BigDecimal) ---
            val pricePerHourBd = jet.pricePerHour // BigDecimal din entitate
            val hoursBd = BigDecimal.valueOf(estimatedHours)
            val centsBd = BigDecimal.valueOf(100)

            val totalDecimal = pricePerHourBd.multiply(hoursBd).multiply(centsBd)

            priceInCents = totalDecimal.toLong()
        }

        // 4. Configurare Stripe Session
        val params = SessionCreateParams.builder()
                .setMode(SessionCreateParams.Mode.PAYMENT)
                // URL-urile trebuie să ducă spre Frontend (Vite rulează de obicei pe 5173)
                .setSuccessUrl("http://localhost:5173/booking?success=true")
                .setCancelUrl("http://localhost:5173/booking?canceled=true")
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