package com.jef.develop.security

import org.springframework.boot.context.properties.ConfigurationProperties

@ConfigurationProperties(prefix = "app.jwt")
data class JwtProperties(
    val issuer: String,
    val secret: String,
    val accessTokenMinutes: Long
)