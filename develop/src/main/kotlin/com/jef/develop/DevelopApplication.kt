package com.jef.develop

import com.jef.develop.security.JwtProperties
import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.context.properties.EnableConfigurationProperties
import org.springframework.boot.runApplication

@SpringBootApplication
@EnableConfigurationProperties(JwtProperties::class)
class DevelopApplication

fun main(args: Array<String>) {
	runApplication<DevelopApplication>(*args)
}
