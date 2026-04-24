package io.github.youco.dayoff.controller;

import io.github.youco.dayoff.dto.request.CreateUserRequest;
import io.github.youco.dayoff.dto.response.AttendanceResponse;
import io.github.youco.dayoff.dto.response.DashboardResponse;
import io.github.youco.dayoff.dto.response.LeaveResponse;
import io.github.youco.dayoff.dto.response.UserResponse;
import io.github.youco.dayoff.model.enums.LeaveStatus;
import io.github.youco.dayoff.model.enums.Roles;
import io.github.youco.dayoff.repository.AttendanceRepository;
import io.github.youco.dayoff.repository.LeaveRequestRepository;
import io.github.youco.dayoff.service.AttendanceService;
import io.github.youco.dayoff.service.LeaveService;
import io.github.youco.dayoff.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

/**
 * HR Controller — HR Manager operations.
 * Access: ADMIN role only.
 *
 * Base path: /api/hr
 */
@RestController
@RequestMapping("/api/hr")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "HR Management", description = "HR manager endpoints for employees and leave management")
public class HRController {

    private final UserService userService;
    private final LeaveService leaveService;
    private final AttendanceService attendanceService;
    private final LeaveRequestRepository leaveRequestRepository;
    private final AttendanceRepository attendanceRepository;

    // ─── Dashboard ─────────────────────────────────────────────────────────────

    @GetMapping("/dashboard")
    @Operation(summary = "Get HR dashboard statistics for managed employees")
    public ResponseEntity<DashboardResponse> getDashboard(Authentication auth) {
        UserResponse hrManager = userService.getUserByEmail(auth.getName());

        List<UserResponse> team = userService.getEmployeesByHRManager(hrManager.getId());
        java.util.Set<Long> teamIds = team.stream().map(UserResponse::getId).collect(java.util.stream.Collectors.toSet());

        long pendingLeave = leaveRequestRepository
                .findByStatus(LeaveStatus.PENDING).stream()
                .filter(lr -> teamIds.contains(lr.getEmployee().getId()))
                .count();

        int avgDays = team.stream()
                .mapToInt(u -> u.getLeaveDaysRemaining() != null ? u.getLeaveDaysRemaining() : 0)
                .sum();
        int avg = !team.isEmpty() ? avgDays / team.size() : 0;

        return ResponseEntity.ok(DashboardResponse.builder()
                .totalUsers((long) team.size())
                .totalLeaveRequests((long) leaveRequestRepository.count())
                .totalAttendanceRecords((long) attendanceRepository.count())
                .pendingLeaveRequests(pendingLeave)
                .averageLeaveDaysRemaining(avg)
                .dashboardType("HR")
                .build());
    }

    // ─── Employee Management ───────────────────────────────────────────────────

    @GetMapping("/employees")
    @Operation(summary = "Get all employees managed by this HR")
    public ResponseEntity<List<UserResponse>> getMyEmployees(Authentication auth) {
        UserResponse hrManager = userService.getUserByEmail(auth.getName());
        return ResponseEntity.ok(userService.getEmployeesByHRManager(hrManager.getId()));
    }

    @GetMapping("/employees/{id}")
    @Operation(summary = "Get employee by ID")
    public ResponseEntity<UserResponse> getEmployee(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }

    @PostMapping("/employees")
    @Operation(summary = "Create a new employee under this HR manager")
    public ResponseEntity<UserResponse> createEmployee(@Valid @RequestBody CreateUserRequest request,
                                                        Authentication auth) {
        // Force this HR as the manager
        UserResponse hrManager = userService.getUserByEmail(auth.getName());
        request = CreateUserRequest.builder()
                .prenom(request.getPrenom())
                .nom(request.getNom())
                .email(request.getEmail())
                .telephone(request.getTelephone())
                .password(request.getPassword())
                .hrManagerId(hrManager.getId())
                .build();
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(userService.createUser(request, Roles.EMPLOYEE));
    }

    @PutMapping("/employees/{id}")
    @Operation(summary = "Update employee details")
    public ResponseEntity<UserResponse> updateEmployee(@PathVariable Long id,
                                                        @Valid @RequestBody CreateUserRequest request) {
        return ResponseEntity.ok(userService.updateUser(id, request));
    }

    @DeleteMapping("/employees/{id}")
    @Operation(summary = "Deactivate an employee (soft delete)")
    public ResponseEntity<Void> deactivateEmployee(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    // ─── Leave Request Management ──────────────────────────────────────────────

    @GetMapping("/leaves")
    @Operation(summary = "Get all leave requests")
    public ResponseEntity<List<LeaveResponse>> getAllLeaves() {
        return ResponseEntity.ok(leaveService.getAllLeaveRequests());
    }

    @GetMapping("/leaves/pending")
    @Operation(summary = "Get all pending leave requests")
    public ResponseEntity<List<LeaveResponse>> getPendingLeaves() {
        return ResponseEntity.ok(leaveService.getLeaveRequestsByStatus(LeaveStatus.PENDING));
    }

    @GetMapping("/leaves/employee/{employeeId}")
    @Operation(summary = "Get leave requests for a specific employee")
    public ResponseEntity<List<LeaveResponse>> getEmployeeLeaves(@PathVariable Long employeeId) {
        return ResponseEntity.ok(leaveService.getEmployeeLeaveRequests(employeeId));
    }

    @PutMapping("/leaves/{id}/approve")
    @Operation(summary = "Approve a leave request")
    public ResponseEntity<LeaveResponse> approveLeave(@PathVariable Long id) {
        return ResponseEntity.ok(leaveService.approveLeaveRequest(id));
    }

    @PutMapping("/leaves/{id}/reject")
    @Operation(summary = "Reject a leave request")
    public ResponseEntity<LeaveResponse> rejectLeave(@PathVariable Long id) {
        return ResponseEntity.ok(leaveService.rejectLeaveRequest(id));
    }

    // ─── Attendance ────────────────────────────────────────────────────────────

    @GetMapping("/attendance/date")
    @Operation(summary = "Get attendance records for a specific date")
    public ResponseEntity<List<AttendanceResponse>> getAttendanceByDate(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(attendanceService.getAttendanceByDate(date));
    }

    @GetMapping("/attendance/employee/{employeeId}")
    @Operation(summary = "Get attendance history for a specific employee")
    public ResponseEntity<List<AttendanceResponse>> getEmployeeAttendance(@PathVariable Long employeeId) {
        return ResponseEntity.ok(attendanceService.getEmployeeAttendanceHistory(employeeId));
    }
}
