package com.jef.develop.models

import org.springframework.data.annotation.Id
import org.springframework.data.mongodb.core.mapping.Document
import java.time.Instant

@Document("testimonials")
data class Testimonial(
    @Id
    val id: String? = null,
    val name: String,
    val title: String,
    val message: String,
    val imageUrl: String? = null,
    val createdAt: Instant = Instant.now()
)