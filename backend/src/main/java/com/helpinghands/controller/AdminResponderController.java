package com.helpinghands.controller;
import com.helpinghands.dto.admin.CreateResponderRequest;
import com.helpinghands.dto.auth.UserResponse;
import com.helpinghands.dto.common.ApiResponse;
import com.helpinghands.service.AdminResponderService;
import jakarta.validation.Valid; import lombok.RequiredArgsConstructor; import org.springframework.http.ResponseEntity; import org.springframework.security.access.prepost.PreAuthorize; import org.springframework.web.bind.annotation.*; import java.util.List;
@RestController @RequestMapping("/api/admin/responders") @RequiredArgsConstructor @PreAuthorize("hasRole('ADMIN')")
public class AdminResponderController { private final AdminResponderService service;
 @GetMapping public ResponseEntity<ApiResponse<List<UserResponse>>> list(){return ResponseEntity.ok(ApiResponse.ok(service.list()));}
 @PostMapping public ResponseEntity<ApiResponse<UserResponse>> create(@Valid @RequestBody CreateResponderRequest r){return ResponseEntity.ok(ApiResponse.ok("Responder created.",service.create(r)));}
 @PatchMapping("/{id}/status") public ResponseEntity<ApiResponse<UserResponse>> status(@PathVariable Long id,@RequestBody StatusRequest r){return ResponseEntity.ok(ApiResponse.ok(service.active(id,r.active())));}
 public record StatusRequest(boolean active){} }
