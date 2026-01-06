package com.jef.develop.models.mappers

import com.jef.develop.models.*
import com.jef.develop.models.responses.*
import java.time.ZoneId

fun Island.toResponse() = IslandResponse(
    id = requireNotNull(id),
    name = name,
    location = location,
    pricePerNight = pricePerNight,
    description = description,
    images = images,
    amenities = amenities,
    isAvailable = isAvailable,
    lat = lat,
    lng = lng
)

fun Jet.toResponse() = JetResponse(
    id = requireNotNull(id),
    model = model,
    capacity = capacity,
    pricePerHour = pricePerHour,
    rangeKm = rangeKm,
    images = images,
    status = status
)

fun User.toResponse() = UserResponse(
    id = requireNotNull(id),
    email = email,
    name = name,
    role = role,
    favoritesIslandIds = favoritesIslandIds,
    favoritesJetIds = favoritesJetIds,
    createdAt = this.createdAt
        .atZone(ZoneId.systemDefault())
        .toLocalDate()
)

fun Booking.toResponse() = BookingResponse(
    id = requireNotNull(id),
    userId = userId,
    type = type,
    itemId = itemId,
    startDate = startDate,
    endDate = endDate,
    status = status,
    createdAt = this.createdAt
        .atZone(ZoneId.systemDefault())
        .toLocalDate(),
    updatedAt = this.updatedAt
        .atZone(ZoneId.systemDefault())
        .toLocalDate()
)

fun Quote.toResponse() = QuoteResponse(
    id = requireNotNull(id),
    type = type,
    itemId = itemId,
    name = name,
    email = email,
    message = message,
    status = status,
    createdAt = this.createdAt
        .atZone(ZoneId.systemDefault())
        .toLocalDate()
)

fun Testimonial.toResponse() = TestimonialResponse(
    id = requireNotNull(id),
    name = name,
    title = title,
    message = message,
    rating = rating,
    createdAt = this.createdAt
        .atZone(ZoneId.systemDefault())
        .toLocalDate()
)