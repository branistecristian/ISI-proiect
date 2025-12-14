package com.jef.develop.models.responses

import java.time.LocalDate

data class TestimonialResponse(
    val id: String,
    val name: String,
    val title: String,
    val message: String,
    val rating: Int,
    val createdAt: LocalDate
)