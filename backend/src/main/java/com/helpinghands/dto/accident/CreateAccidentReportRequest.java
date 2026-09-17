package com.helpinghands.dto.accident;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record CreateAccidentReportRequest(
        @NotBlank(message = "Accident type is required.")
        String accidentType,

        @NotBlank(message = "Description is required.")
        @Size(min = 10, max = 5000, message = "Description must be between 10 and 5000 characters.")
        String description,

        @NotNull(message = "People affected is required.")
        @Min(value = 0, message = "People affected cannot be negative.")
        Integer peopleAffected,

        @Size(max = 1000, message = "Remarks cannot exceed 1000 characters.")
        String remarks,

        String imageData,
        String imageName,
        BigDecimal latitude,
        BigDecimal longitude,
        @Size(max = 300, message = "Address cannot exceed 300 characters.")
        String address
) {}
