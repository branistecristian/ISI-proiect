package com.jef.develop.services

import com.jef.develop.enums.UserRole
import com.jef.develop.models.mappers.toResponse
import com.jef.develop.models.User
import com.jef.develop.repositories.UserRepository
import com.jef.develop.models.requests.LoginRequest
import com.jef.develop.models.requests.RegisterRequest
import com.jef.develop.models.responses.AuthResponse
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service
import java.time.Instant

@Service
class AuthService(
    private val userRepository: UserRepository,
    // private val passwordEncoder: PasswordEncoder,
    // private val jwtService: JwtService
) {
    fun register(req: RegisterRequest): AuthResponse {
        if (userRepository.existsByEmail(req.email)) {
            throw IllegalArgumentException("Email already in use")
        }
        TODO()
//        val user = User(
//            id = null,
//            email = req.email,
//            passwordHash = passwordEncoder.encode(req.password),
//            name = req.name,
//            role = UserRole.USER,
//            createdAt = Instant.now()
//        )

//        val saved = userRepository.save(user)
//        val token = jwtService.generateToken(saved.id!!)
//        return AuthResponse(token = token, user = saved.toResponse())
    }

    fun login(req: LoginRequest): AuthResponse {
        val user = userRepository.findByEmail(req.email)
            ?: throw IllegalArgumentException("Invalid credentials")

        TODO()
//        if (!passwordEncoder.matches(req.password, user.passwordHash)) {
//            throw IllegalArgumentException("Invalid credentials")
//        }
//
//        val token = jwtService.generateToken(user.id!!)
//        return AuthResponse(token = token, user = user.toResponse())
    }
}