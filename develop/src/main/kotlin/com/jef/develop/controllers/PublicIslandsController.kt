package com.jef.develop.controllers

import com.jef.develop.models.responses.IslandResponse
import com.jef.develop.services.IslandService
import org.springframework.web.bind.annotation.*
import java.math.BigDecimal

@RestController
@RequestMapping("/api/public/islands")
class PublicIslandsController(
    private val islandService: IslandService
) {
    @GetMapping
    fun list(
        @RequestParam(required = false) q: String?,
        @RequestParam(required = false) location: String?,
        @RequestParam(required = false) minPrice: BigDecimal?,
        @RequestParam(required = false) maxPrice: BigDecimal?,
        @RequestParam(defaultValue = "true") onlyAvailable: Boolean
    ): List<IslandResponse> = islandService.list(q, location, minPrice, maxPrice, onlyAvailable)

    @GetMapping("/{id}")
    fun details(@PathVariable id: String): IslandResponse = islandService.getById(id)
}