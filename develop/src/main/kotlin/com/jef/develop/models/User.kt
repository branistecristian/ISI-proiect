package com.jef.develop.models

import com.jef.develop.enums.UserRole
import org.springframework.data.annotation.Id
import org.springframework.data.mongodb.core.mapping.Document
import java.time.Instant

@Document("users")
data class User(
    @Id
    val id: String? = null,
    val email: String,
    val passwordHash: String,
    val name: String,
    val role: UserRole = UserRole.USER,
    val createdAt: Instant = Instant.now()
)