package io.github.youco.dayoff.controller;

import io.github.youco.dayoff.dto.request.LeaveRequestDto;
import io.github.youco.dayoff.dto.response.LeaveResponse;
import io.github.youco.dayoff.dto.response.UserResponse;
import io.github.youco.dayoff.model.enums.LeaveStatus;
import io.github.youco.dayoff.service.LeaveService;
import io.github.youco.dayoff.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Leave Controller — employee self-service for leave requests.
 * Accessible by all authenticated users.
 *
 * Base path: /api/leaves
 */
@RestController
@RequestMapping("/api/leaves")
@RequiredArgsConstructor
@Tag(name = "Leave Requests", description = "Leave request submission and tracking")
public class LeaveController {

    private final LeaveService leaveService;
    private final UserService userService;

    @PostMapping
    @Operation(summary = "Submit a new leave request (employee self-service)")
    public ResponseEntity<LeaveResponse> submitLeave(@Valid @RequestBody LeaveRequestDto request,
                                                      Authentication auth) {
        UserResponse employee = userService.getUserByEmail(auth.getName());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(leaveService.submitLeaveRequest(employee.getId(), request));
    }

    @GetMapping("/my")
    @Operation(summary = "Get my leave requests")
    public ResponseEntity<List<LeaveResponse>> getMyLeaves(Authentication auth) {
        UserResponse employee = userService.getUserByEmail(auth.getName());
        return ResponseEntity.ok(leaveService.getEmployeeLeaveRequests(employee.getId()));
    }

    @GetMapping("/my/status/{status}")
    @Operation(summary = "Get my leave requests filtered by status")
    public ResponseEntity<List<LeaveResponse>> getMyLeavesByStatus(@PathVariable LeaveStatus status,
                                                                     Authentication auth) {
        UserResponse employee = userService.getUserByEmail(auth.getName());
        return ResponseEntity.ok(
                leaveService.getEmployeeLeaveRequests(employee.getId()).stream()
                        .filter(l -> l.getStatus() == status)
                        .toList()
        );
    }

    @GetMapping("/all")
    @Operation(summary = "Get all leave requests (HR/Admin access)")
    public ResponseEntity<List<LeaveResponse>> getAllLeaves() {
        return ResponseEntity.ok(leaveService.getAllLeaveRequests());
    }

    @GetMapping("/status/{status}")
    @Operation(summary = "Get leave requests by status (HR/Admin access)")
    public ResponseEntity<List<LeaveResponse>> getByStatus(@PathVariable LeaveStatus status) {
        return ResponseEntity.ok(leaveService.getLeaveRequestsByStatus(status));
    }
}
