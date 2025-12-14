package com.jef.develop.models

import com.jef.develop.enums.QuoteStatus
import com.jef.develop.enums.QuoteType
import org.springframework.data.annotation.Id
import org.springframework.data.mongodb.core.mapping.Document
import java.time.Instant

@Document("quotes")
data class Quote(
    @Id
    val id: String? = null,
    val name: String,
    val email: String,
    val message: String?,
    val type: QuoteType,
    val itemId: String?,
    val createdAt: Instant = Instant.now(),
    val status: QuoteStatus = QuoteStatus.NEW
)