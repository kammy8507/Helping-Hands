package com.helpinghands.security;

import com.helpinghands.entity.enums.Role;
import com.helpinghands.exception.UnauthorizedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

/** Convenience accessors for the currently-authenticated principal. */
public final class SecurityUtils {

    private SecurityUtils() {}

    public static CustomUserDetails currentPrincipal() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()
                || !(auth.getPrincipal() instanceof CustomUserDetails principal)) {
            throw new UnauthorizedException("Not authenticated.");
        }
        return principal;
    }

    public static Long currentUserId() {
        return currentPrincipal().getId();
    }

    public static Role currentRole() {
        return currentPrincipal().getRole();
    }
}
