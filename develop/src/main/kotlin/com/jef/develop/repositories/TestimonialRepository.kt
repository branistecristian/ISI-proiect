package com.jef.develop.repositories

import com.jef.develop.models.Testimonial
import org.springframework.data.mongodb.repository.MongoRepository

interface TestimonialRepository : MongoRepository<Testimonial, String>