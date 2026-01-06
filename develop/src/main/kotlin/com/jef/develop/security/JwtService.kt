package com.jef.develop.security

import com.jef.develop.enums.UserRole
import io.jsonwebtoken.Jwts
import io.jsonwebtoken.security.Keys
import org.springframework.stereotype.Service
import java.nio.charset.StandardCharsets
import java.time.Instant
import java.util.Date

@Service
class JwtService(
    private val props: JwtProperties
) {
    private val key = Keys.hmacShaKeyFor(props.secret.toByteArray(StandardCharsets.UTF_8))

    fun generateToken(userId: String, email: String, role: UserRole): String {
        val now = Instant.now()
        val exp = now.plusSeconds(props.accessTokenMinutes * 60)

        return Jwts.builder()
            .setIssuer(props.issuer)
            .setSubject(userId)
            .claim("email", email)
            .claim("role", role.name)
            .setIssuedAt(Date.from(now))
            .setExpiration(Date.from(exp))
            .signWith(key)
            .compact()
    }

    fun parse(token: String) =
        Jwts.parserBuilder()
            .setSigningKey(key)
            .build()
            .parseClaimsJws(token)
            .body!!
}