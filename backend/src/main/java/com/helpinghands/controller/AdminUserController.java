package com.helpinghands.controller;

import com.helpinghands.dto.auth.UserResponse;
import com.helpinghands.dto.common.ApiResponse;
import com.helpinghands.security.CustomUserDetails;
import com.helpinghands.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Real database-backed endpoints for Admin -> User Management.
 * Only ADMIN accounts can access these endpoints.
 */
@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminUserController {

    private final UserService userService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<UserResponse>>> listUsers() {
        return ResponseEntity.ok(ApiResponse.ok(userService.listUsersForAdmin()));
    }

    @PatchMapping("/{userId}/status")
    public ResponseEntity<ApiResponse<UserResponse>> setStatus(
            @AuthenticationPrincipal CustomUserDetails principal,
            @PathVariable Long userId,
            @RequestBody StatusRequest request) {
        UserResponse updated = userService.setUserActive(principal.getId(), userId, request.active());
        return ResponseEntity.ok(ApiResponse.ok(
                request.active() ? "User activated." : "User deactivated.", updated));
    }

    @DeleteMapping("/{userId}")
    public ResponseEntity<ApiResponse<Void>> delete(
            @AuthenticationPrincipal CustomUserDetails principal,
            @PathVariable Long userId) {
        userService.deleteUser(principal.getId(), userId);
        return ResponseEntity.ok(ApiResponse.ok("User deleted.", null));
    }

    public record StatusRequest(boolean active) {}
}
