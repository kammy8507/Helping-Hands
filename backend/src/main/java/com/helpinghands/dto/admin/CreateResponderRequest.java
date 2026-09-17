package com.helpinghands.dto.admin;
import com.helpinghands.entity.enums.AvailabilityStatus;
import com.helpinghands.entity.enums.ServiceType;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
public record CreateResponderRequest(@NotBlank @Size(max=100) String name,@NotBlank @Email @Size(max=150) String email,@NotBlank @Size(max=20) String phone,@NotBlank @Size(min=6,max=72) String password,@NotNull ServiceType department,@Size(max=150) String unitName,BigDecimal baseLatitude,BigDecimal baseLongitude,AvailabilityStatus availabilityStatus) {}
