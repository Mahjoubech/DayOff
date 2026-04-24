package io.github.youco.dayoff.controller;

import io.github.youco.dayoff.dto.request.CreateUserRequest;
import io.github.youco.dayoff.dto.response.DashboardResponse;
import io.github.youco.dayoff.dto.response.UserResponse;
import io.github.youco.dayoff.model.enums.LeaveStatus;
import io.github.youco.dayoff.model.enums.Roles;
import io.github.youco.dayoff.repository.AttendanceRepository;
import io.github.youco.dayoff.repository.LeaveRequestRepository;
import io.github.youco.dayoff.repository.UserRepository;
import io.github.youco.dayoff.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Super Admin Controller — full system management.
 * Access: SUPER_ADMIN role only.
 *
 * Base path: /api/superadmin
 */
@RestController
@RequestMapping("/api/superadmin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('SUPER_ADMIN')")
@Tag(name = "Super Admin", description = "Super admin management endpoints")
public class SuperAdminController {

    private final UserService userService;
    private final UserRepository userRepository;
    private final LeaveRequestRepository leaveRequestRepository;
    private final AttendanceRepository attendanceRepository;

    // ─── Dashboard ─────────────────────────────────────────────────────────────

    @GetMapping("/dashboard")
    @Operation(summary = "Get Super Admin dashboard statistics")
    public ResponseEntity<DashboardResponse> getDashboard() {
        long totalUsers        = userRepository.count();
        long totalLeave        = leaveRequestRepository.count();
        long totalAttendance   = attendanceRepository.count();
        long pendingLeave  = leaveRequestRepository.findByStatus(LeaveStatus.PENDING).size();

        int avgDays = userRepository.findAll().stream()
                .mapToInt(u -> u.getLeaveDaysRemaining() != null ? u.getLeaveDaysRemaining() : 0)
                .sum();
        int avg = totalUsers > 0 ? avgDays / (int) totalUsers : 0;

        return ResponseEntity.ok(DashboardResponse.builder()
                .totalUsers(totalUsers)
                .totalLeaveRequests(totalLeave)
                .totalAttendanceRecords(totalAttendance)
                .pendingLeaveRequests(pendingLeave)
                .averageLeaveDaysRemaining(avg)
                .dashboardType("SUPERADMIN")
                .build());
    }

    // ─── User Management ───────────────────────────────────────────────────────

    @GetMapping("/users")
    @Operation(summary = "Get all users")
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllEmployees());
    }

    @GetMapping("/users/{id}")
    @Operation(summary = "Get user by ID")
    public ResponseEntity<UserResponse> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }

    @PostMapping("/users/admin")
    @Operation(summary = "Create a new HR Admin account")
    public ResponseEntity<UserResponse> createAdmin(@Valid @RequestBody CreateUserRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(userService.createUser(request, Roles.ADMIN));
    }

    @PostMapping("/users/employee")
    @Operation(summary = "Create a new Employee account")
    public ResponseEntity<UserResponse> createEmployee(@Valid @RequestBody CreateUserRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(userService.createUser(request, Roles.EMPLOYEE));
    }

    @PutMapping("/users/{id}")
    @Operation(summary = "Update a user")
    public ResponseEntity<UserResponse> updateUser(@PathVariable Long id,
                                                    @Valid @RequestBody CreateUserRequest request) {
        return ResponseEntity.ok(userService.updateUser(id, request));
    }

    @DeleteMapping("/users/{id}")
    @Operation(summary = "Soft delete a user")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }
}
