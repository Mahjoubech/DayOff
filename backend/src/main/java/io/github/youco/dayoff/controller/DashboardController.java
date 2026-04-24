package io.github.youco.dayoff.controller;

import io.github.youco.dayoff.dto.response.AttendanceResponse;
import io.github.youco.dayoff.dto.response.DashboardResponse;
import io.github.youco.dayoff.dto.response.LeaveResponse;
import io.github.youco.dayoff.dto.response.UserResponse;
import io.github.youco.dayoff.model.enums.LeaveStatus;
import io.github.youco.dayoff.model.enums.Roles;
import io.github.youco.dayoff.repository.AttendanceRepository;
import io.github.youco.dayoff.repository.LeaveRequestRepository;
import io.github.youco.dayoff.repository.UserRepository;
import io.github.youco.dayoff.service.AttendanceService;
import io.github.youco.dayoff.service.LeaveService;
import io.github.youco.dayoff.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

/**
 * Dashboard Controller — role-aware single endpoint.
 * Returns different stats based on the authenticated user's role.
 *
 * Base path: /api/dashboard
 */
@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
@Tag(name = "Dashboard", description = "Role-aware dashboard data")
public class DashboardController {

    private final UserService userService;
    private final LeaveService leaveService;
    private final AttendanceService attendanceService;
    private final UserRepository userRepository;
    private final LeaveRequestRepository leaveRequestRepository;
    private final AttendanceRepository attendanceRepository;

    /**
     * Returns dashboard data appropriate for the current user's role:
     * - SUPER_ADMIN: global statistics
     * - ADMIN (HR):  team statistics
     * - EMPLOYEE:    personal statistics
     */
    @GetMapping
    @Operation(summary = "Get role-aware dashboard data")
    public ResponseEntity<DashboardResponse> getDashboard(Authentication auth) {
        UserResponse user = userService.getUserByEmail(auth.getName());
        Roles role = user.getRole();

        return switch (role) {
            case SUPER_ADMIN -> ResponseEntity.ok(buildSuperAdminDashboard());
            case ADMIN       -> ResponseEntity.ok(buildHRDashboard(user));
            case EMPLOYEE    -> ResponseEntity.ok(buildEmployeeDashboard(user));
        };
    }

    /**
     * Extended employee dashboard with recent leave and today's attendance.
     */
    @GetMapping("/employee/details")
    @Operation(summary = "Get detailed employee personal dashboard")
    public ResponseEntity<Map<String, Object>> getEmployeeDetails(Authentication auth) {
        UserResponse user = userService.getUserByEmail(auth.getName());

        List<LeaveResponse> recentLeaves    = leaveService.getEmployeeLeaveRequests(user.getId());
        AttendanceResponse  todayAttendance = attendanceService.getTodayAttendance(user.getId());
        long pendingLeaves = recentLeaves.stream().filter(l -> l.getStatus() == LeaveStatus.PENDING).count();

        return ResponseEntity.ok(Map.of(
                "user",             user,
                "leaveDaysLeft",    user.getLeaveDaysRemaining(),
                "pendingLeaves",    pendingLeaves,
                "recentLeaves",     recentLeaves.stream().limit(5).toList(),
                "todayAttendance",  todayAttendance != null ? todayAttendance : Map.of(),
                "checkedInToday",   todayAttendance != null && todayAttendance.getCheckIn() != null
        ));
    }

    // ─── Private builders ──────────────────────────────────────────────────────

    private DashboardResponse buildSuperAdminDashboard() {
        long totalUsers      = userRepository.count();
        long totalLeave      = leaveRequestRepository.count();
        long totalAttendance = attendanceRepository.count();
        long pendingLeave    = leaveRequestRepository.findByStatus(LeaveStatus.PENDING).size();

        int sumDays = userRepository.findAll().stream()
                .mapToInt(u -> u.getLeaveDaysRemaining() != null ? u.getLeaveDaysRemaining() : 0)
                .sum();
        int avg = totalUsers > 0 ? sumDays / (int) totalUsers : 0;

        return DashboardResponse.builder()
                .totalUsers(totalUsers)
                .totalLeaveRequests(totalLeave)
                .totalAttendanceRecords(totalAttendance)
                .pendingLeaveRequests(pendingLeave)
                .averageLeaveDaysRemaining(avg)
                .dashboardType("SUPERADMIN")
                .build();
    }

    private DashboardResponse buildHRDashboard(UserResponse hrManager) {
        List<UserResponse> team = userService.getEmployeesByHRManager(hrManager.getId());

        long pendingLeave = leaveRequestRepository.findByStatus(LeaveStatus.PENDING).stream()
                .filter(lr -> team.stream().anyMatch(e -> e.getId().equals(lr.getEmployee().getId())))
                .count();

        int sumDays = team.stream()
                .mapToInt(u -> u.getLeaveDaysRemaining() != null ? u.getLeaveDaysRemaining() : 0)
                .sum();
        int avg = !team.isEmpty() ? sumDays / team.size() : 0;

        return DashboardResponse.builder()
                .totalUsers((long) team.size())
                .totalLeaveRequests((long) leaveRequestRepository.count())
                .totalAttendanceRecords((long) attendanceRepository.count())
                .pendingLeaveRequests(pendingLeave)
                .averageLeaveDaysRemaining(avg)
                .dashboardType("HR")
                .build();
    }

    private DashboardResponse buildEmployeeDashboard(UserResponse employee) {
        List<LeaveResponse> myLeaves = leaveService.getEmployeeLeaveRequests(employee.getId());
        long pending   = myLeaves.stream().filter(l -> l.getStatus() == LeaveStatus.PENDING).count();
        long totalAtt  = attendanceService.getEmployeeAttendanceHistory(employee.getId()).size();

        return DashboardResponse.builder()
                .totalUsers(1L)
                .totalLeaveRequests((long) myLeaves.size())
                .totalAttendanceRecords(totalAtt)
                .pendingLeaveRequests(pending)
                .averageLeaveDaysRemaining(employee.getLeaveDaysRemaining())
                .dashboardType("EMPLOYEE")
                .build();
    }
}
