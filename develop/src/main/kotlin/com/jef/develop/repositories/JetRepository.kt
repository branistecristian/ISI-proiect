package com.jef.develop.repositories

import com.jef.develop.models.Jet
import org.springframework.data.mongodb.repository.MongoRepository

interface JetRepository : MongoRepository<Jet, String>