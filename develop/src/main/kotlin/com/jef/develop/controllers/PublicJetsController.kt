package com.jef.develop.controllers

import com.jef.develop.models.responses.JetResponse
import com.jef.develop.services.JetService
import org.springframework.web.bind.annotation.*
import java.math.BigDecimal

@RestController
@RequestMapping("/api/public/jets")
class PublicJetsController(
    private val jetService: JetService
) {
    @GetMapping
    fun list(
        @RequestParam(required = false) q: String?,
        @RequestParam(required = false) minPricePerHour: BigDecimal?,
        @RequestParam(required = false) maxPricePerHour: BigDecimal?,
        @RequestParam(required = false) minRangeKm: Int?,
        @RequestParam(required = false) maxRangeKm: Int?
    ): List<JetResponse> = jetService.list(q,minPricePerHour,maxPricePerHour,minRangeKm, maxRangeKm)

    @GetMapping("/{id}")
    fun details(@PathVariable id: String): JetResponse = jetService.getById(id)
}