package com.jef.develop.services

import com.jef.develop.models.mappers.toResponse
import com.jef.develop.repositories.UserRepository
import com.jef.develop.models.responses.UserResponse
import org.springframework.stereotype.Service

@Service
class UserService(
    private val userRepository: UserRepository
) {
    fun me(userId: String): UserResponse =
        userRepository.findById(userId).orElseThrow { IllegalArgumentException("User not found") }.toResponse()

    fun updateProfile(userId: String, newName: String): UserResponse {
        val user = userRepository.findById(userId).orElseThrow { IllegalArgumentException("User not found") }
        val updated = user.copy(name = newName)
        return userRepository.save(updated).toResponse()
    }

    fun addFavoriteIsland(userId: String, islandId: String): UserResponse {
        val user = userRepository.findById(userId).orElseThrow { IllegalArgumentException("User not found") }
        val updated = user.copy(favoritesIslandIds = (user.favoritesIslandIds + islandId).distinct())
        return userRepository.save(updated).toResponse()
    }

    fun removeFavoriteIsland(userId: String, islandId: String): UserResponse {
        val user = userRepository.findById(userId).orElseThrow { IllegalArgumentException("User not found") }
        val updated = user.copy(favoritesIslandIds = user.favoritesIslandIds.filterNot { it == islandId })
        return userRepository.save(updated).toResponse()
    }

    fun addFavoriteJet(userId: String, jetId: String): UserResponse {
        val user = userRepository.findById(userId).orElseThrow { IllegalArgumentException("User not found") }
        val updated = user.copy(favoritesJetIds = (user.favoritesJetIds + jetId).distinct())
        return userRepository.save(updated).toResponse()
    }

    fun removeFavoriteJet(userId: String, jetId: String): UserResponse {
        val user = userRepository.findById(userId).orElseThrow { IllegalArgumentException("User not found") }
        val updated = user.copy(favoritesJetIds = user.favoritesJetIds.filterNot { it == jetId })
        return userRepository.save(updated).toResponse()
    }
}