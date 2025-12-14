package com.jef.develop.services

import com.jef.develop.models.mappers.toResponse
import com.jef.develop.repositories.JetRepository
import com.jef.develop.models.responses.JetResponse
import org.springframework.stereotype.Service
import java.math.BigDecimal

@Service
class JetService(
    private val jetRepository: JetRepository
) {

    // Filtreaza cautarea in functie de diferiti parametrii: model, minPricePerHour, maxPricePerHour etc. si returneaza o lista de
    // avioane private
    fun list(q: String?, minPricePerHour: BigDecimal?, maxPricePerHour: BigDecimal?, minRangeKm: Int?, maxRangeKm: Int?): List<JetResponse> =
        jetRepository.findAll()
            .asSequence()
            .filter { q.isNullOrBlank() || it.model.contains(q, true) }
            .filter { minPricePerHour == null || it.pricePerHour >= minPricePerHour }
            .filter { maxPricePerHour == null || it.pricePerHour <= maxPricePerHour }
            .filter { minRangeKm == null || it.rangeKm >= minRangeKm }
            .filter { maxRangeKm == null || it.rangeKm <= maxRangeKm }
            .map { it.toResponse() }
            .toList()

    fun getById(id: String): JetResponse =
        jetRepository.findById(id).orElseThrow { IllegalArgumentException("Jet not found") }.toResponse()
}