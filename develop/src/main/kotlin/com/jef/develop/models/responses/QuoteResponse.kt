package com.jef.develop.models.responses

import com.jef.develop.enums.QuoteStatus
import com.jef.develop.enums.QuoteType
import java.time.LocalDate

data class QuoteResponse(
    val id: String,
    val name: String,
    val email: String,
    val message: String?,
    val type: QuoteType,
    val itemId: String?,
    val createdAt: LocalDate,
    val status: QuoteStatus
)