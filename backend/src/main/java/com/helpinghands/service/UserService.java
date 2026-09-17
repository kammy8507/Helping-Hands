package com.helpinghands.service;

import com.helpinghands.dto.auth.UpdateProfileRequest;
import com.helpinghands.dto.auth.UserResponse;
import com.helpinghands.entity.EmergencyResponder;
import com.helpinghands.entity.User;
import com.helpinghands.entity.enums.Role;
import com.helpinghands.exception.ResourceNotFoundException;
import com.helpinghands.mapper.UserMapper;
import com.helpinghands.repository.EmergencyResponderRepository;
import com.helpinghands.repository.AccidentReportRepository;
import com.helpinghands.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final EmergencyResponderRepository responderRepository;
    private final AccidentReportRepository accidentReportRepository;
    private final SystemLogService logService;
    private final UserMapper userMapper;

    @Transactional(readOnly = true)
    public UserResponse getById(Long userId) {
        User user = requireUser(userId);
        EmergencyResponder responder = user.getRole() == Role.RESPONDER
                ? responderRepository.findByUserId(user.getId()).orElse(null)
                : null;
        return userMapper.toResponse(user, responder);
    }

    /**
     * Update the caller's own profile. Name/phone apply to any role; unit name and
     * availability apply only to responders. Email and role are immutable here.
     */
    @Transactional
    public UserResponse updateProfile(Long userId, UpdateProfileRequest req) {
        User user = requireUser(userId);

        if (StringUtils.hasText(req.name())) {
            user.setName(req.name().trim());
        }
        if (StringUtils.hasText(req.phone())) {
            user.setPhone(req.phone().trim());
        }
        userRepository.save(user);

        EmergencyResponder responder = null;
        if (user.getRole() == Role.RESPONDER) {
            responder = responderRepository.findByUserId(user.getId()).orElse(null);
            if (responder != null) {
                // keep the responder profile's denormalised name/phone in sync
                responder.setName(user.getName());
                responder.setPhone(user.getPhone());
                if (StringUtils.hasText(req.unitName())) {
                    responder.setUnitName(req.unitName().trim());
                }
                if (req.availabilityStatus() != null) {
                    responder.setAvailabilityStatus(req.availabilityStatus());
                }
                responderRepository.save(responder);
            }
        }

        logService.log(user, "USER_UPDATED", user.getName() + " updated their profile.");
        return userMapper.toResponse(user, responder);
    }


    /** List normal USER accounts for the admin User Management screen. */
    @Transactional(readOnly = true)
    public java.util.List<UserResponse> listUsersForAdmin() {
        return userRepository.findByRole(Role.USER).stream()
                .map(user -> userMapper.toResponse(user))
                .toList();
    }

    /** Activate or deactivate a normal USER account. */
    @Transactional
    public UserResponse setUserActive(Long adminId, Long userId, boolean active) {
        User target = requireUser(userId);
        if (target.getRole() != Role.USER) {
            throw new com.helpinghands.exception.BadRequestException("Only USER accounts can be managed from User Management.");
        }
        target.setActive(active);
        userRepository.save(target);

        User admin = requireUser(adminId);
        logService.log(admin, "USER_UPDATED",
                (active ? "Activated " : "Deactivated ") + "user " + target.getEmail() + ".");
        return userMapper.toResponse(target);
    }

    /** Permanently delete a normal USER account. */
    @Transactional
    public void deleteUser(Long adminId, Long userId) {
        User target = requireUser(userId);
        if (target.getRole() != Role.USER) {
            throw new com.helpinghands.exception.BadRequestException("Only USER accounts can be deleted from User Management.");
        }

        long reportCount = accidentReportRepository.countByUserId(target.getId());
        if (reportCount > 0) {
            throw new com.helpinghands.exception.BadRequestException(
                    "This user has " + reportCount + " accident report(s). Deactivate the account instead of deleting it.");
        }

        User admin = requireUser(adminId);
        userRepository.delete(target);
        logService.log(admin, "USER_DELETED", "Deleted user " + target.getEmail() + ".");
    }

    private User requireUser(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> ResourceNotFoundException.of("User", userId));
    }
}
