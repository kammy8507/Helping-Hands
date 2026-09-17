package com.helpinghands.security;

import com.helpinghands.config.JwtProperties;
import com.helpinghands.entity.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.time.Instant;
import java.util.Date;

/**
 * Issues and verifies signed JWTs (HS256).
 * Each token's subject is the user id; custom claims carry email + role (spec §5).
 */
@Service
public class JwtService {

    private final SecretKey key;
    private final long expirationMs;
    private final String issuer;

    public JwtService(JwtProperties props) {
        // Secret is a Base64-encoded key of at least 256 bits (32 bytes).
        this.key = Keys.hmacShaKeyFor(Decoders.BASE64.decode(props.secret()));
        this.expirationMs = props.expirationMs();
        this.issuer = props.issuer();
    }

    public record IssuedToken(String token, Instant expiresAt, long expiresInMs) {}

    public IssuedToken issue(User user) {
        Instant now = Instant.now();
        Instant exp = now.plusMillis(expirationMs);
        String token = Jwts.builder()
                .issuer(issuer)
                .subject(String.valueOf(user.getId()))
                .claim("email", user.getEmail())
                .claim("role", user.getRole().name())
                .claim("name", user.getName())
                .issuedAt(Date.from(now))
                .expiration(Date.from(exp))
                .signWith(key)
                .compact();
        return new IssuedToken(token, exp, expirationMs);
    }

    /** Parse and verify; throws JwtException (incl. ExpiredJwtException) if invalid. */
    public Claims parse(String token) throws JwtException {
        return Jwts.parser()
                .verifyWith(key)
                .requireIssuer(issuer)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public Long extractUserId(Claims claims) {
        return Long.valueOf(claims.getSubject());
    }
}
