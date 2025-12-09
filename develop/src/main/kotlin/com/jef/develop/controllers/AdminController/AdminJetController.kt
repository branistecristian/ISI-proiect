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