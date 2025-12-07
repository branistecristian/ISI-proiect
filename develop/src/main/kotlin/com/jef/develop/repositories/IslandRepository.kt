package com.jef.develop.repositories

import com.jef.develop.models.Island
import org.springframework.data.mongodb.repository.MongoRepository

interface IslandRepository : MongoRepository<Island, String>