package com.helpinghands.dto.auth;

import java.time.Instant;

/**
 * Login/registration result. The signed JWT must be sent back as
 * `Authorization: Bearer <token>` on every protected request.
 */
public record AuthResponse(
        String token,
        String tokenType,   // always "Bearer"
        Instant expiresAt,
        long expiresInMs,
        UserResponse user
) {
    public static AuthResponse of(String token, Instant expiresAt, long expiresInMs, UserResponse user) {
        return new AuthResponse(token, "Bearer", expiresAt, expiresInMs, user);
    }
}
