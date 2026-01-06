package com.jef.develop.models.requests

import com.jef.develop.enums.QuoteType

data class CreateQuoteRequest(
    val type: QuoteType,              // ISLAND / JET
    val islandId: String? = null,
    val jetId: String? = null,
    val name: String,
    val email: String,
    val message: String? = null
)