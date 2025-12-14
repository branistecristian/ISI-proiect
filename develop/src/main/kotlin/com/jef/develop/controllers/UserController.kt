package com.jef.develop.controllers

import com.jef.develop.models.requests.UpdateProfileRequest
import com.jef.develop.models.responses.UserResponse
import com.jef.develop.services.UserService
import jakarta.validation.Valid
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/user")
class UserController(
    private val userService: UserService
) {
    // TODO: inlocuieste cu userId din JWT
    private fun currentUserId(): String = "REPLACE_WITH_JWT_SUB"

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