package com.helpinghands.mapper;

import com.helpinghands.dto.auth.UserResponse;
import com.helpinghands.entity.EmergencyResponder;
import com.helpinghands.entity.User;
import org.springframework.stereotype.Component;

/** Maps User (+ optional responder profile) to the safe UserResponse DTO. */
@Component
public class UserMapper {

    public UserResponse toResponse(User user, EmergencyResponder responder) {
        return new UserResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getPhone(),
                user.getRole(),
                Boolean.TRUE.equals(user.getActive()),
                user.getCreatedAt(),
                responder != null ? responder.getId() : null,
                responder != null ? responder.getDepartment() : null,
                responder != null ? responder.getUnitName() : null,
                responder != null ? responder.getBaseLatitude() : null,
                responder != null ? responder.getBaseLongitude() : null,
                responder != null ? responder.getAvailabilityStatus() : null
        );
    }

    public UserResponse toResponse(User user) {
        return toResponse(user, null);
    }
}
