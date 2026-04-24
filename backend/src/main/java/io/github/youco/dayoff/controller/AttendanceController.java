package io.github.youco.dayoff.controller;

import io.github.youco.dayoff.dto.request.CheckInRequest;
import io.github.youco.dayoff.dto.response.AttendanceResponse;
import io.github.youco.dayoff.dto.response.UserResponse;
import io.github.youco.dayoff.service.AttendanceService;
import io.github.youco.dayoff.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;

/**
 * Attendance Controller — employee check-in / check-out.
 *
 * Base path: /api/attendance
 */
@RestController
@RequestMapping("/api/attendance")
@RequiredArgsConstructor
@Tag(name = "Attendance", description = "Employee check-in and check-out management")
public class AttendanceController {

    private final AttendanceService attendanceService;
    private final UserService userService;

    // ─── Self-service ──────────────────────────────────────────────────────────

    @PostMapping("/checkin")
    @Operation(summary = "Check in for today")
    public ResponseEntity<AttendanceResponse> checkIn(@Valid @RequestBody CheckInRequest request,
                                                       Authentication auth) {
        UserResponse employee = userService.getUserByEmail(auth.getName());
        return ResponseEntity.ok(attendanceService.checkIn(employee.getId(), request.getCheckInTime()));
    }

    @PostMapping("/checkout")
    @Operation(summary = "Check out for today")
    public ResponseEntity<AttendanceResponse> checkOut(Authentication auth) {
        UserResponse employee = userService.getUserByEmail(auth.getName());
        return ResponseEntity.ok(attendanceService.checkOut(employee.getId(), LocalTime.now()));
    }

    @GetMapping("/today")
    @Operation(summary = "Get today's attendance record for myself")
    public ResponseEntity<AttendanceResponse> getToday(Authentication auth) {
        UserResponse employee = userService.getUserByEmail(auth.getName());
        AttendanceResponse today = attendanceService.getTodayAttendance(employee.getId());
        if (today == null) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(today);
    }

    @GetMapping("/my")
    @Operation(summary = "Get my full attendance history")
    public ResponseEntity<List<AttendanceResponse>> getMyHistory(Authentication auth) {
        UserResponse employee = userService.getUserByEmail(auth.getName());
        return ResponseEntity.ok(attendanceService.getEmployeeAttendanceHistory(employee.getId()));
    }

    // ─── HR / Admin queries ────────────────────────────────────────────────────

    @GetMapping("/employee/{employeeId}")
    @Operation(summary = "Get attendance history for a specific employee (HR/Admin)")
    public ResponseEntity<List<AttendanceResponse>> getEmployeeHistory(@PathVariable Long employeeId) {
        return ResponseEntity.ok(attendanceService.getEmployeeAttendanceHistory(employeeId));
    }

    @GetMapping("/date")
    @Operation(summary = "Get all attendance records for a specific date (HR/Admin)")
    public ResponseEntity<List<AttendanceResponse>> getByDate(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(attendanceService.getAttendanceByDate(date));
    }

    @GetMapping("/status")
    @Operation(summary = "Check if I'm currently checked-in today")
    public ResponseEntity<Map<String, Object>> getStatus(Authentication auth) {
        UserResponse employee = userService.getUserByEmail(auth.getName());
        AttendanceResponse today = attendanceService.getTodayAttendance(employee.getId());
        boolean checkedIn  = today != null && today.getCheckIn() != null;
        boolean checkedOut = today != null && today.getCheckOut() != null;
        return ResponseEntity.ok(Map.of(
                "checkedIn", checkedIn,
                "checkedOut", checkedOut,
                "record", today != null ? today : Map.of()
        ));
    }
}
