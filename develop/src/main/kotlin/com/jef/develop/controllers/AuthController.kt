package com.jef.develop.controllers

import com.jef.develop.models.requests.LoginRequest
import com.jef.develop.models.requests.RegisterRequest
import com.jef.develop.models.responses.AuthResponse
import com.jef.develop.services.AuthService
import jakarta.validation.Valid
import org.springframework.web.bind.annotation.*

@RestController("publicAuthController")
@RequestMapping("/api/public/auth")
class AuthController(
    private val authService: AuthService
) {
    @PostMapping("/register")
    fun register(@Valid @RequestBody req: RegisterRequest): AuthResponse =
        authService.register(req)

    @PostMapping("/login")
    fun login(@Valid @RequestBody req: LoginRequest): AuthResponse =
        authService.login(req)
}