package com.jef.develop.controllers.AdminController

import com.jef.develop.models.User
import com.jef.develop.repositories.UserRepository
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

// DTO pentru update user (doar ce avem voie să modificăm)
data class UserUpdateRequest(val email: String, val name: String)

@RestController
@RequestMapping("/api/admin/users")
@CrossOrigin(origins = ["http://localhost:5173"])
class AdminUserController(
        private val userRepository: UserRepository
) {

    // 1. GET ALL USERS
    @GetMapping
    fun getAllUsers(): List<User> = userRepository.findAll()

    // 2. UPDATE USER (Email & Name)
    @PutMapping("/{id}")
    fun updateUser(@PathVariable id: String, @RequestBody req: UserUpdateRequest): ResponseEntity<User> {
        return userRepository.findById(id).map { existingUser ->
            val updatedUser = existingUser.copy(
                    email = req.email,
                    name = req.name
            )
            ResponseEntity.ok(userRepository.save(updatedUser))
        }.orElse(ResponseEntity.notFound().build())
    }

    // 3. DELETE USER (Ban)
    @DeleteMapping("/{id}")
    fun deleteUser(@PathVariable id: String): ResponseEntity<Void> {
        if (userRepository.existsById(id)) {
            userRepository.deleteById(id)
            return ResponseEntity.ok().build()
        }
        return ResponseEntity.notFound().build()
    }
}