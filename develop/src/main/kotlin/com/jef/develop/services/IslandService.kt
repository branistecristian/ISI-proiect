package com.jef.develop.services

import com.jef.develop.models.mappers.toResponse
import com.jef.develop.repositories.IslandRepository
import com.jef.develop.models.responses.IslandResponse
import org.springframework.stereotype.Service
import java.math.BigDecimal

@Service
class IslandService(
    private val islandRepository: IslandRepository
) {
    // Filtreaza cautarea in functie de diferiti parametrii: location, minPrice, maxPrice etc. si returneaza o lista de
    // insule
    fun list(q: String?, location: String?, minPrice: BigDecimal?, maxPrice: BigDecimal?, onlyAvailable: Boolean): List<IslandResponse> {
        return islandRepository.findAll()
            .asSequence()
            .filter { if (onlyAvailable) it.isAvailable else true }
            .filter { q.isNullOrBlank() || it.name.contains(q, true) || it.description.contains(q, true) }
            .filter { location.isNullOrBlank() || it.location.contains(location, true) }
            .filter { minPrice == null || it.pricePerNight >= minPrice }
            .filter { maxPrice == null || it.pricePerNight <= maxPrice }
            .map { it.toResponse() }
            .toList()
    }

    fun getById(id: String): IslandResponse =
        islandRepository.findById(id).orElseThrow { IllegalArgumentException("Island not found") }.toResponse()
}