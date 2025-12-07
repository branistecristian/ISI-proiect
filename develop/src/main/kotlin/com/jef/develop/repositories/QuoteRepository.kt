package com.jef.develop.repositories

import com.jef.develop.models.Quote
import org.springframework.data.mongodb.repository.MongoRepository

interface QuoteRepository : MongoRepository<Quote, String>