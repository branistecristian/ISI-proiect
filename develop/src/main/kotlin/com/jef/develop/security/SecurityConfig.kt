package com.jef.develop.security

import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity
import org.springframework.security.config.http.SessionCreationPolicy
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.security.web.SecurityFilterChain
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter
import org.springframework.web.cors.CorsConfiguration
import org.springframework.web.cors.CorsConfigurationSource
import org.springframework.web.cors.UrlBasedCorsConfigurationSource

@Configuration
@EnableWebSecurity
class SecurityConfig(
        private val jwtAuthFilter: JwtAuthFilter
) {

    @Bean
    fun passwordEncoder(): PasswordEncoder = BCryptPasswordEncoder()

    @Bean
    fun corsConfigurationSource(): CorsConfigurationSource {
        val config = CorsConfiguration().apply {
            allowedOrigins = listOf(
                    "http://localhost:5173", // Frontend-ul tău React
                    "http://127.0.0.1:5173",
                    "http://localhost:3000"
            )
            allowedMethods = listOf("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
            allowedHeaders = listOf("*")
            exposedHeaders = listOf("Authorization")
            allowCredentials = true
        }

        return UrlBasedCorsConfigurationSource().apply {
            registerCorsConfiguration("/**", config)
        }
    }

    @Bean
    fun securityFilterChain(http: HttpSecurity): SecurityFilterChain {
        http
                .cors { it.configurationSource(corsConfigurationSource()) }
                .csrf { it.disable() }
                .sessionManagement { it.sessionCreationPolicy(SessionCreationPolicy.STATELESS) }
                .authorizeHttpRequests { auth ->
                    auth
                            // 1. Login public
                            .requestMatchers("/api/admin/auth/**").permitAll()

                            // 2. Rute publice
                            .requestMatchers("/api/public/**").permitAll()

                            // 3. Swagger
                            .requestMatchers(
                                    "/v3/api-docs/**",
                                    "/swagger-ui/**",
                                    "/swagger-ui.html"
                            ).permitAll()

                            // 4. RESTUL Admin Dashboard-ului este protejat
                            // CORECTAT: Folosim "ROLE_ADMIN" pentru a se potrivi cu JwtAuthFilter
                            .requestMatchers("/api/admin/**").hasAuthority("ROLE_ADMIN")

                            // 5. Orice altceva necesită autentificare
                            .anyRequest().authenticated()
                }
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter::class.java)
                .formLogin { it.disable() }
                .httpBasic { it.disable() }

        return http.build()
    }
// ... restul clasei
}