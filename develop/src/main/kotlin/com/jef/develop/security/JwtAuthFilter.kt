package com.jef.develop.security

import jakarta.servlet.FilterChain
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.stereotype.Component
import org.springframework.web.filter.OncePerRequestFilter

@Component
class JwtAuthFilter(
    private val jwtService: JwtService
) : OncePerRequestFilter() {

    override fun doFilterInternal(
        request: HttpServletRequest,
        response: HttpServletResponse,
        filterChain: FilterChain
    ) {
        val header = request.getHeader("Authorization")
        val token = header?.takeIf { it.startsWith("Bearer ") }?.removePrefix("Bearer ")?.trim()

        if (token != null && SecurityContextHolder.getContext().authentication == null) {
            runCatching {
                val claims = jwtService.parse(token)
                val userId = claims.subject
                val role = claims["role"]?.toString()  // "USER" / "ADMIN"
                val authorities =
                    if (role.isNullOrBlank()) emptyList()
                    else listOf(SimpleGrantedAuthority("ROLE_$role"))

                val auth = UsernamePasswordAuthenticationToken(userId, null, authorities)
                SecurityContextHolder.getContext().authentication = auth
            }
        }

        filterChain.doFilter(request, response)
    }

    override fun shouldNotFilter(request: HttpServletRequest): Boolean {
        val path = request.requestURI
        return path.startsWith("/auth/")
    }
}