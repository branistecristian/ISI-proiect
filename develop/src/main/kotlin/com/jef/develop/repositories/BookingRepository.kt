package com.jef.develop.repositories

import com.jef.develop.models.Booking
import org.springframework.data.mongodb.repository.MongoRepository

interface BookingRepository : MongoRepository<Booking, String>