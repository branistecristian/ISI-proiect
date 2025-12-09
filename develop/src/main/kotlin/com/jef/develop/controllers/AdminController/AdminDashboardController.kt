package com.jef.develop.controllers.AdminController


import com.jef.develop.enums.BookingStatus
import com.jef.develop.repositories.BookingRepository
import com.jef.develop.repositories.IslandRepository
import com.jef.develop.repositories.JetRepository
import com.jef.develop.repositories.UserRepository
import org.springframework.web.bind.annotation.CrossOrigin
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

data class DashboardStats(
        val totalIslands: Long,
        val totalJets: Long,
        val pendingBookings: Long,
        val activeUsers: Long
)

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = ["http://localhost:5173"])
class AdminDashboardController(
        private val islandRepository: IslandRepository,
        private val jetRepository: JetRepository,
        private val bookingRepository: BookingRepository,
        private val userRepository: UserRepository
) {

    @GetMapping("/stats")
    fun getDashboardStats(): DashboardStats {
        return DashboardStats(
                totalIslands = islandRepository.count(),
                totalJets = jetRepository.count(),
                pendingBookings = bookingRepository.countByStatus(BookingStatus.PENDING),
                activeUsers = userRepository.count()
        )
    }
}