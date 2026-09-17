package com.helpinghands.security;

import com.helpinghands.entity.User;
import com.helpinghands.repository.UserRepository;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Optional;

/**
 * Runs once per request: reads `Authorization: Bearer <jwt>`, verifies it, confirms the
 * user still exists and is active, and populates the SecurityContext. Invalid/expired
 * tokens leave the context empty — the entry point then returns 401 for protected routes.
 */
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final String HEADER = "Authorization";
    private static final String PREFIX = "Bearer ";

    private final JwtService jwtService;
    private final UserRepository userRepository;

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
                                    @NonNull HttpServletResponse response,
                                    @NonNull FilterChain chain) throws ServletException, IOException {

        String token = resolveToken(request);
        if (token != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            try {
                Claims claims = jwtService.parse(token);
                Long userId = jwtService.extractUserId(claims);
                Optional<User> maybeUser = userRepository.findById(userId);

                if (maybeUser.isPresent() && Boolean.TRUE.equals(maybeUser.get().getActive())) {
                    CustomUserDetails principal = new CustomUserDetails(maybeUser.get());
                    var authentication = new UsernamePasswordAuthenticationToken(
                            principal, null, principal.getAuthorities());
                    authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                } else {
                    request.setAttribute("jwt_error", "This account is no longer active.");
                }
            } catch (ExpiredJwtException e) {
                request.setAttribute("jwt_error", "Your session has expired. Please sign in again.");
            } catch (JwtException | IllegalArgumentException e) {
                request.setAttribute("jwt_error", "Invalid authentication token.");
            }
        }
        chain.doFilter(request, response);
    }

    private String resolveToken(HttpServletRequest request) {
        String header = request.getHeader(HEADER);
        if (header != null && header.startsWith(PREFIX)) {
            String value = header.substring(PREFIX.length()).trim();
            return value.isEmpty() ? null : value;
        }
        return null;
    }
}
