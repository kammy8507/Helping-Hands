package com.helpinghands.dto.auth;

import com.helpinghands.entity.enums.AvailabilityStatus;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/**
 * PUT /api/users/me — a user may update their display name and phone.
 * Responders may additionally update their unit name and availability.
 * Email and role are immutable here.
 */
public record UpdateProfileRequest(

        @Size(max = 100, message = "Name must be at most 100 characters.")
        String name,

        @Size(max = 20, message = "Phone must be at most 20 characters.")
        @Pattern(regexp = "^[0-9+\\-\\s()]{7,20}$", message = "Enter a valid phone number.")
        String phone,

        // responder-only (ignored for USER/ADMIN)
        String unitName,
        AvailabilityStatus availabilityStatus
) {}
