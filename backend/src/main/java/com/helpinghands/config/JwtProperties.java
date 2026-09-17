package com.helpinghands.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

/** Binds helpinghands.jwt.* from application.yml. */
@ConfigurationProperties(prefix = "helpinghands.jwt")
public record JwtProperties(
        String secret,
        long expirationMs,
        String issuer
) {}
