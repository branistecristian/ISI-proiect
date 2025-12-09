package com.jef.develop.controllers.AdminController

import com.jef.develop.models.Island
import com.jef.develop.repositories.IslandRepository
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/admin/islands")
@CrossOrigin(origins = ["http://localhost:5173"])
class AdminIslandController(
        private val islandRepository: IslandRepository
) {

    // Get All Islands
    @GetMapping
    fun getAllIslands(): List<Island> {
        return islandRepository.findAll()
    }

    // Create Island
    @PostMapping
    fun createIsland(@RequestBody island: Island): Island {
        return islandRepository.save(island)
    }

    // Update Island
    @PutMapping("/{id}")
    fun updateIsland(@PathVariable id: String, @RequestBody islandDetails: Island): ResponseEntity<Island> {
        return islandRepository.findById(id).map { existingIsland ->

            val updatedIsland = islandDetails

            ResponseEntity.ok(islandRepository.save(updatedIsland))
        }.orElse(ResponseEntity.notFound().build())
    }

    // Delete Island
    @DeleteMapping("/{id}")
    fun deleteIsland(@PathVariable id: String): ResponseEntity<Void> {
        return if (islandRepository.existsById(id)) {
            islandRepository.deleteById(id)
            ResponseEntity.ok().build()
        } else {
            ResponseEntity.notFound().build()
        }
    }
}