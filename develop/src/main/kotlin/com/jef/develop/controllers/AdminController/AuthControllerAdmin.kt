package com.jef.develop.controllers.AdminController

import com.jef.develop.enums.UserRole
import com.jef.develop.repositories.UserRepository
import com.jef.develop.security.JwtService
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

data class LoginRequest(val email: String, val password: String)

@RestController
@RequestMapping("/api/admin/auth")
@CrossOrigin(origins = ["http://localhost:5173"])
class AuthController(
        private val userRepository: UserRepository,
        private val jwtService: JwtService
) {

    @PostMapping("/login")
    fun login(@RequestBody request: LoginRequest): ResponseEntity<Any> {
        val user = userRepository.findByEmail(request.email)

        if (user == null) {
            return ResponseEntity.status(401).body(mapOf("message" to "Utilizatorul nu există!"))
        }

        // Verificare simplă parolă (în producție folosește passwordEncoder.matches)
        if (user.passwordHash != request.password) {
            return ResponseEntity.status(401).body(mapOf("message" to "Parolă incorectă!"))
        }

        if (user.role != UserRole.ADMIN) {
            return ResponseEntity.status(403).body(mapOf("message" to "Acces interzis!"))
        }

        // CORECTAT: Apelăm generateToken cu cei 3 parametri ceruți de JwtService.kt
        // user.id!! este sigur aici deoarece userul vine din baza de date
        val token = jwtService.generateToken(user.id!!, user.email, user.role)

        // CORECTAT: Returnăm un Map care va fi serializat ca JSON: { "token": "...", "user": {...} }
        // Acest format este exact ce așteaptă LoginPage.jsx
        return ResponseEntity.ok(mapOf(
                "token" to token,
                "user" to user
        ))
    }
}