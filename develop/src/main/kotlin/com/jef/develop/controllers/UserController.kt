package com.jef.develop.controllers

import com.jef.develop.models.requests.UpdateProfileRequest
import com.jef.develop.models.responses.UserResponse
import com.jef.develop.services.UserService
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.web.bind.annotation.*
import org.springframework.web.server.ResponseStatusException

@RestController
@RequestMapping("/api/user")
class UserController(
    private val userService: UserService
) {
    private fun currentUserId(): String {
        val auth = SecurityContextHolder.getContext().authentication
        if (auth == null || auth.name == "anonymousUser") {
            throw ResponseStatusException(HttpStatus.UNAUTHORIZED, "Missing token")
        }
        return auth.principal.toString()
    }
    @GetMapping("/me")
    fun me(): UserResponse = userService.me(currentUserId())

    @PutMapping("/me")
    fun update(@Valid @RequestBody req: UpdateProfileRequest): UserResponse =
        userService.updateProfile(currentUserId(), req.name)

    @PostMapping("/favorites/islands/{islandId}")
    fun addFavIsland(@PathVariable islandId: String): UserResponse =
        userService.addFavoriteIsland(currentUserId(), islandId)

    @DeleteMapping("/favorites/islands/{islandId}")
    fun removeFavIsland(@PathVariable islandId: String): UserResponse =
        userService.removeFavoriteIsland(currentUserId(), islandId)

    @PostMapping("/favorites/jets/{jetId}")
    fun addFavJet(@PathVariable jetId: String): UserResponse =
        userService.addFavoriteJet(currentUserId(), jetId)

    @DeleteMapping("/favorites/jets/{jetId}")
    fun removeFavJet(@PathVariable jetId: String): UserResponse =
        userService.removeFavoriteJet(currentUserId(), jetId)
}