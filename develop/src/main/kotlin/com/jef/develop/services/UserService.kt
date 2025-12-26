package com.jef.develop.services

import com.jef.develop.models.mappers.toResponse
import com.jef.develop.models.responses.UserResponse
import com.jef.develop.repositories.UserRepository
import com.jef.develop.repositories.IslandRepository
import com.jef.develop.repositories.JetRepository
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.web.server.ResponseStatusException

@Service
class UserService(
    private val userRepository: UserRepository,
    private val islandRepository: IslandRepository,
    private val jetRepository: JetRepository
) {

    private fun userOr404(userId: String) =
        userRepository.findById(userId)
            .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "User not found") }

    private fun requireNonBlank(value: String, field: String) {
        if (value.isBlank()) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "$field must not be blank")
        }
    }

    fun me(userId: String): UserResponse =
        userOr404(userId).toResponse()

    fun updateProfile(userId: String, newName: String): UserResponse {
        requireNonBlank(newName, "newName")
        val user = userOr404(userId)
        val updated = user.copy(name = newName.trim())
        return userRepository.save(updated).toResponse()
    }

    fun addFavoriteIsland(userId: String, islandId: String): UserResponse {
        requireNonBlank(islandId, "islandId")
        if (!islandRepository.existsById(islandId)) {
            throw ResponseStatusException(HttpStatus.NOT_FOUND, "Island not found")
        }

        val user = userOr404(userId)
        val updated = user.copy(
            favoritesIslandIds = (user.favoritesIslandIds + islandId).distinct()
        )
        return userRepository.save(updated).toResponse()
    }

    fun removeFavoriteIsland(userId: String, islandId: String): UserResponse {
        requireNonBlank(islandId, "islandId")
        val user = userOr404(userId)

        val updated = user.copy(
            favoritesIslandIds = user.favoritesIslandIds.filterNot { it == islandId }
        )
        return userRepository.save(updated).toResponse()
    }

    fun addFavoriteJet(userId: String, jetId: String): UserResponse {
        requireNonBlank(jetId, "jetId")
        if (!jetRepository.existsById(jetId)) {
            throw ResponseStatusException(HttpStatus.NOT_FOUND, "Jet not found")
        }

        val user = userOr404(userId)
        val updated = user.copy(
            favoritesJetIds = (user.favoritesJetIds + jetId).distinct()
        )
        return userRepository.save(updated).toResponse()
    }

    fun removeFavoriteJet(userId: String, jetId: String): UserResponse {
        requireNonBlank(jetId, "jetId")
        val user = userOr404(userId)

        val updated = user.copy(
            favoritesJetIds = user.favoritesJetIds.filterNot { it == jetId }
        )
        return userRepository.save(updated).toResponse()
    }
}
