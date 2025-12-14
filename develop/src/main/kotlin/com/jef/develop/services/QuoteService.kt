package com.jef.develop.services

import com.jef.develop.enums.QuoteStatus
import com.jef.develop.enums.QuoteType
import com.jef.develop.models.mappers.toResponse
import com.jef.develop.models.Quote
import com.jef.develop.repositories.QuoteRepository
import com.jef.develop.models.requests.CreateQuoteRequest
import com.jef.develop.models.responses.QuoteResponse
import org.springframework.stereotype.Service
import java.time.Instant
import java.time.LocalDate

@Service
class QuoteService(
    private val quoteRepository: QuoteRepository
) {
    fun create(req: CreateQuoteRequest): QuoteResponse {
        val quote = Quote(
            id = null,
            type = req.type,
            itemId = if (req.type == QuoteType.ISLAND) req.islandId else req.jetId,
            name = req.name,
            email = req.email,
            message = req.message,
            status = QuoteStatus.NEW,
            createdAt = Instant.now()
        )
        return quoteRepository.save(quote).toResponse()
    }
}