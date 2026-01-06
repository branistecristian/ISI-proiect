package com.jef.develop.models.responses

import java.time.Instant
import com.jef.develop.enums.*
import java.time.LocalDate

data class UserResponse(
    val id: String,
    val email: String,
    val name: String,
    val role: UserRole,
    val favoritesIslandIds: List<String>,
    val favoritesJetIds: List<String>,
    val createdAt: LocalDate
)