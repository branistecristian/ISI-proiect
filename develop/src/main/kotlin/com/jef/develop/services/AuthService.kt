package com.jef.develop.services

import com.jef.develop.enums.UserRole
import com.jef.develop.models.mappers.toResponse
import com.jef.develop.models.User
import com.jef.develop.repositories.UserRepository
import com.jef.develop.models.requests.LoginRequest
import com.jef.develop.models.requests.RegisterRequest
import com.jef.develop.models.responses.AuthResponse
import com.jef.develop.security.JwtService
import org.springframework.http.HttpStatus
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service
import org.springframework.web.server.ResponseStatusException
import java.time.Instant

@Service
class AuthService(
    private val userRepository: UserRepository,
    private val passwordEncoder: PasswordEncoder,
    private val jwtService: JwtService
) {
    fun register(req: RegisterRequest): AuthResponse {
        if (userRepository.existsByEmail(req.email)) {
            throw ResponseStatusException(HttpStatus.UNAUTHORIZED, "Email already in use")
        }
        val user = User(
            id = null,
            email = req.email,
            passwordHash = passwordEncoder.encode(req.password),
            name = req.name,
            role = UserRole.USER,
            createdAt = Instant.now()
        )

        val saved = userRepository.save(user)
        val token = jwtService.generateToken(saved.id!!,saved.email,saved.role)
        return AuthResponse(token = token, user = saved.toResponse())
    }

    fun login(req: LoginRequest): AuthResponse {
        val user = userRepository.findByEmail(req.email)
            ?: throw ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials")

        if (!passwordEncoder.matches(req.password, user.passwordHash)) {
            throw ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials")
        }

        val token = jwtService.generateToken(
            userId = user.id!!,
            email = user.email,
            role = user.role
        )
        return AuthResponse(token = token, user = user.toResponse())
    }
}