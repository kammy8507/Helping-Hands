package com.helpinghands.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

import java.util.List;

/** Binds helpinghands.cors.* — the list of allowed frontend origins. */
@ConfigurationProperties(prefix = "helpinghands.cors")
public record CorsProperties(
        List<String> allowedOrigins
) {}
