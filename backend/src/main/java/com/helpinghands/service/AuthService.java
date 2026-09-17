package com.helpinghands.service;

import com.helpinghands.dto.auth.AuthResponse;
import com.helpinghands.dto.auth.LoginRequest;
import com.helpinghands.dto.auth.RegisterRequest;
import com.helpinghands.dto.auth.UserResponse;
import com.helpinghands.entity.EmergencyResponder;
import com.helpinghands.entity.User;
import com.helpinghands.entity.enums.AvailabilityStatus;
import com.helpinghands.entity.enums.Role;
import com.helpinghands.exception.BadRequestException;
import com.helpinghands.exception.DuplicateResourceException;
import com.helpinghands.exception.UnauthorizedException;
import com.helpinghands.mapper.UserMapper;
import com.helpinghands.repository.EmergencyResponderRepository;
import com.helpinghands.repository.UserRepository;
import com.helpinghands.security.JwtService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final EmergencyResponderRepository responderRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final SystemLogService logService;
    private final UserMapper userMapper;

    /**
     * Public self-registration. Creates a USER by default, or a RESPONDER with a profile.
     * ADMIN accounts cannot be self-registered (seed them or create via an admin) — this
     * closes the privilege-escalation hole the prototype's open role picker would otherwise allow.
     */
    @Transactional
    public AuthResponse register(RegisterRequest req) {
        // Public registration is intentionally limited to citizens. Responder accounts are admin-managed.
        Role role = Role.USER;
        if (req.role() != null && req.role() != Role.USER) {
            throw new BadRequestException("Responder and admin accounts are created by an administrator.");
        }
        if (userRepository.existsByEmailIgnoreCase(req.email())) {
            throw new DuplicateResourceException("An account with this email already exists.");
        }

        User user = User.builder()
                .name(req.name().trim())
                .email(req.email().trim().toLowerCase())
                .phone(req.phone().trim())
                .passwordHash(passwordEncoder.encode(req.password()))
                .role(role)
                .active(true)
                .build();
        user = userRepository.save(user);

        EmergencyResponder responder = null;
        if (role == Role.RESPONDER) {
            if (req.department() == null) {
                throw new BadRequestException("A responder must select a department.");
            }
            responder = EmergencyResponder.builder()
                    .user(user)
                    .name(user.getName())
                    .email(user.getEmail())
                    .phone(user.getPhone())
                    .department(req.department())
                    .unitName(req.unitName() != null ? req.unitName() : "Unassigned unit")
                    .baseLatitude(req.baseLatitude())
                    .baseLongitude(req.baseLongitude())
                    .availabilityStatus(req.availabilityStatus() != null
                            ? req.availabilityStatus() : AvailabilityStatus.AVAILABLE)
                    .build();
            responder = responderRepository.save(responder);
        }

        logService.log(user, "REGISTER", user.getName() + " registered as " + role + ".");

        JwtService.IssuedToken token = jwtService.issue(user);
        UserResponse userResponse = userMapper.toResponse(user, responder);
        return AuthResponse.of(token.token(), token.expiresAt(), token.expiresInMs(), userResponse);
    }

    /** Verifies credentials via Spring Security, then issues a signed JWT. */
    @Transactional
    public AuthResponse login(LoginRequest req) {
        String email = req.email().trim().toLowerCase();
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(email, req.password()));
        } catch (DisabledException e) {
            throw new UnauthorizedException("This account has been deactivated by the administrator.");
        } catch (BadCredentialsException e) {
            throw new UnauthorizedException("Invalid email or password.");
        }

        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new UnauthorizedException("Invalid email or password."));

        if (req.role() == null || user.getRole() != req.role()) {
            throw new UnauthorizedException("The selected role does not match this account.");
        }

        EmergencyResponder responder = user.getRole() == Role.RESPONDER
                ? responderRepository.findByUserId(user.getId()).orElse(null)
                : null;

        logService.log(user, "LOGIN", user.getName() + " signed in.");

        JwtService.IssuedToken token = jwtService.issue(user);
        UserResponse userResponse = userMapper.toResponse(user, responder);
        return AuthResponse.of(token.token(), token.expiresAt(), token.expiresInMs(), userResponse);
    }
}
