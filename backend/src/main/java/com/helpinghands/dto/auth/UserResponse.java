package com.helpinghands.dto.auth;

import com.helpinghands.entity.enums.AvailabilityStatus;
import com.helpinghands.entity.enums.Role;
import com.helpinghands.entity.enums.ServiceType;

import java.math.BigDecimal;
import java.time.Instant;

/**
 * Safe view of an account (never exposes the password hash).
 * Responder-only fields are populated only when role = RESPONDER, else null.
 */
public record UserResponse(
        Long id,
        String name,
        String email,
        String phone,
        Role role,
        boolean active,
        Instant createdAt,

        // responder profile (nullable)
        Long responderId,
        ServiceType department,
        String unitName,
        BigDecimal baseLatitude,
        BigDecimal baseLongitude,
        AvailabilityStatus availabilityStatus
) {}
