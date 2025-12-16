package com.jef.develop.controllers.AdminController

import com.jef.develop.enums.UserRole
import com.jef.develop.models.User
import com.jef.develop.repositories.UserRepository
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

// DTO pentru datele de intrare
data class LoginRequest(val email: String, val password: String)

@RestController
@RequestMapping("/api/admin/auth")
@CrossOrigin(origins = ["http://localhost:5173"])
class AuthController(
        private val userRepository: UserRepository
) {
    @PostMapping("/login")
    fun login(@RequestBody request: LoginRequest): ResponseEntity<Any> {
        val user = userRepository.findByEmail(request.email)

        // 2. Verificări de bază
        if (user == null) {
            return ResponseEntity.status(401).body(mapOf("message" to "Utilizatorul nu există!"))
        }

        if (user.passwordHash != request.password) {
            return ResponseEntity.status(401).body(mapOf("message" to "Parolă incorectă!"))
        }

        if (user.role != UserRole.ADMIN) {
            return ResponseEntity.status(403).body(mapOf("message" to "Acces interzis! Doar administratorii pot accesa acest panou."))
        }

        return ResponseEntity.ok(user)
    }
}