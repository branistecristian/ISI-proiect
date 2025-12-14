package com.jef.develop.models.requests

import jakarta.validation.constraints.NotBlank

data class UpdateProfileRequest(
    @field:NotBlank val name: String
)