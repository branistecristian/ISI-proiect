package com.jef.develop.controllers.AdminController

import com.jef.develop.models.Jet
import com.jef.develop.repositories.JetRepository
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/admin/jets")
@CrossOrigin(origins = ["http://localhost:5173"])
class AdminJetController(
        private val jetRepository: JetRepository
) {

    @GetMapping
    fun getAllJets(): List<Jet> = jetRepository.findAll()

    @PostMapping
    fun createJet(@RequestBody jet: Jet): Jet = jetRepository.save(jet)

    @PutMapping("/{id}")
    fun updateJet(@PathVariable id: String, @RequestBody jetDetails: Jet): ResponseEntity<Jet> {
        return jetRepository.findById(id).map { existingJet ->

            val updatedJet = jetDetails.copy(
                    id = existingJet.id
            )

            ResponseEntity.ok(jetRepository.save(updatedJet))
        }.orElse(ResponseEntity.notFound().build())
    }

    @DeleteMapping("/{id}")
    fun deleteJet(@PathVariable id: String): ResponseEntity<Void> {
        return if (jetRepository.existsById(id)) {
            jetRepository.deleteById(id)
            ResponseEntity.ok().build()
        } else {
            ResponseEntity.notFound().build()
        }
    }

}