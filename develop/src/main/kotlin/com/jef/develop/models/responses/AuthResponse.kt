package com.jef.develop.models.responses

data class AuthResponse(
    val token: String,
    val user: UserResponse
)