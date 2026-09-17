package com.helpinghands.dto.auth;

import com.helpinghands.entity.enums.AvailabilityStatus;
import com.helpinghands.entity.enums.Role;
import com.helpinghands.entity.enums.ServiceType;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

/**
 * Public self-registration payload.
 * Role defaults to USER. ADMIN cannot be self-registered (must be seeded or created
 * by an existing admin) — see AuthService. RESPONDER must supply a department.
 */
public record RegisterRequest(

        @NotBlank(message = "Name is required.")
        @Size(max = 100, message = "Name must be at most 100 characters.")
        String name,

        @NotBlank(message = "Email is required.")
        @Email(message = "Enter a valid email address.")
        @Size(max = 150, message = "Email must be at most 150 characters.")
        String email,

        @NotBlank(message = "Phone number is required.")
        @Size(max = 20, message = "Phone must be at most 20 characters.")
        @Pattern(regexp = "^[0-9+\\-\\s()]{7,20}$", message = "Enter a valid phone number.")
        String phone,

        @NotBlank(message = "Password is required.")
        @Size(min = 6, max = 72, message = "Password must be 6–72 characters.")
        String password,

        /** Public registration is restricted to normal users. */
        Role role,

        /** Required when role = RESPONDER. */
        ServiceType department,
        String unitName,
        BigDecimal baseLatitude,
        BigDecimal baseLongitude,
        AvailabilityStatus availabilityStatus
) {}
