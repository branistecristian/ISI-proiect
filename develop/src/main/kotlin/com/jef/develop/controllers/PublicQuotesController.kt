package com.jef.develop.controllers

import com.jef.develop.models.requests.CreateQuoteRequest
import com.jef.develop.models.responses.QuoteResponse
import com.jef.develop.services.QuoteService
import jakarta.validation.Valid
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/public/quotes")
class PublicQuotesController(
    private val quoteService: QuoteService
) {
    @PostMapping
    fun create(@Valid @RequestBody req: CreateQuoteRequest): QuoteResponse =
        quoteService.create(req)
}