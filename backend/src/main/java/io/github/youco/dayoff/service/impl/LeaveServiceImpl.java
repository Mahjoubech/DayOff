package io.github.youco.dayoff.service.impl;

import io.github.youco.dayoff.dto.request.LeaveRequestDto;
import io.github.youco.dayoff.dto.response.LeaveResponse;
import io.github.youco.dayoff.exception.BusinessException;
import io.github.youco.dayoff.exception.ResourceNotFoundException;
import io.github.youco.dayoff.mapper.LeaveMapper;
import io.github.youco.dayoff.model.entity.LeaveRequest;
import io.github.youco.dayoff.model.entity.User;
import io.github.youco.dayoff.model.enums.LeaveStatus;
import io.github.youco.dayoff.repository.LeaveRequestRepository;
import io.github.youco.dayoff.repository.UserRepository;
import io.github.youco.dayoff.service.LeaveService;
import io.github.youco.dayoff.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.List;

/**
 * Leave Service Implementation
 * Business logic for leave management: day calculation, balance validation,
 * and automatic deductions upon approval.
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class LeaveServiceImpl implements LeaveService {

    private final LeaveRequestRepository leaveRequestRepository;
    private final UserRepository userRepository;
    private final LeaveMapper leaveMapper;
    private final NotificationService notificationService;

    @Override
    public LeaveResponse submitLeaveRequest(Long employeeId, LeaveRequestDto request) {
        log.info("Employee {} submitting leave request from {} to {}", employeeId, request.getStartDate(), request.getEndDate());

        // Validate employee exists
        User employee = userRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + employeeId));

        // Validate dates
        if (request.getEndDate().isBefore(request.getStartDate())) {
            throw new BusinessException("End date cannot be before start date");
        }

        if (request.getStartDate().isBefore(LocalDate.now())) {
            throw new BusinessException("Start date cannot be in the past");
        }

        // Calculate working days (excluding weekends)
        int workingDays = calculateWorkingDays(request.getStartDate(), request.getEndDate());

        if (workingDays <= 0) {
            throw new BusinessException("Leave request must include at least one working day");
        }

        // Check remaining leave balance
        if (employee.getLeaveDaysRemaining() < workingDays) {
            throw new BusinessException(
                    String.format("Insufficient leave balance. Requested: %d days, Available: %d days",
                            workingDays, employee.getLeaveDaysRemaining())
            );
        }

        // Create leave request entity
        LeaveRequest leaveRequest = LeaveRequest.builder()
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .days(workingDays)
                .type(request.getType())
                .status(LeaveStatus.PENDING)
                .reason(request.getReason())
                .employee(employee)
                .build();

        LeaveRequest savedRequest = leaveRequestRepository.save(leaveRequest);
        log.info("Leave request created with id: {}, days: {}", savedRequest.getId(), workingDays);

        // Notify HR manager if present
        if (employee.getHrManager() != null) {
            notificationService.sendLeaveRequestNotification(
                    employee.getHrManager().getId(),
                    employee.getPrenom() + " " + employee.getNom(),
                    savedRequest.getId()
            );
        }

        return leaveMapper.toResponse(savedRequest);
    }

    @Override
    public LeaveResponse approveLeaveRequest(Long leaveRequestId) {
        log.info("Approving leave request: {}", leaveRequestId);

        LeaveRequest leaveRequest = leaveRequestRepository.findById(leaveRequestId)
                .orElseThrow(() -> new ResourceNotFoundException("Leave request not found with id: " + leaveRequestId));

        if (leaveRequest.getStatus() != LeaveStatus.PENDING) {
            throw new BusinessException("Only pending leave requests can be approved. Current status: " + leaveRequest.getStatus());
        }

        // Deduct leave days from employee balance
        User employee = leaveRequest.getEmployee();
        int newBalance = employee.getLeaveDaysRemaining() - leaveRequest.getDays();

        if (newBalance < 0) {
            throw new BusinessException("Employee no longer has enough leave days remaining");
        }

        employee.setLeaveDaysRemaining(newBalance);
        userRepository.save(employee);

        // Update leave request status
        leaveRequest.setStatus(LeaveStatus.APPROVED);
        LeaveRequest savedRequest = leaveRequestRepository.save(leaveRequest);

        log.info("Leave request {} approved. Employee {} new balance: {} days",
                leaveRequestId, employee.getId(), newBalance);

        // Notify employee
        notificationService.sendLeaveApprovedNotification(
                employee.getId(),
                leaveRequest.getStartDate(),
                leaveRequest.getEndDate()
        );

        return leaveMapper.toResponse(savedRequest);
    }

    @Override
    public LeaveResponse rejectLeaveRequest(Long leaveRequestId) {
        log.info("Rejecting leave request: {}", leaveRequestId);

        LeaveRequest leaveRequest = leaveRequestRepository.findById(leaveRequestId)
                .orElseThrow(() -> new ResourceNotFoundException("Leave request not found with id: " + leaveRequestId));

        if (leaveRequest.getStatus() != LeaveStatus.PENDING) {
            throw new BusinessException("Only pending leave requests can be rejected. Current status: " + leaveRequest.getStatus());
        }

        leaveRequest.setStatus(LeaveStatus.REJECTED);
        LeaveRequest savedRequest = leaveRequestRepository.save(leaveRequest);

        log.info("Leave request {} rejected", leaveRequestId);

        // Notify employee
        notificationService.sendLeaveRejectedNotification(
                leaveRequest.getEmployee().getId(),
                leaveRequest.getStartDate(),
                leaveRequest.getEndDate()
        );

        return leaveMapper.toResponse(savedRequest);
    }

    @Override
    @Transactional(readOnly = true)
    public List<LeaveResponse> getEmployeeLeaveRequests(Long employeeId) {
        log.debug("Fetching leave requests for employee: {}", employeeId);
        return leaveRequestRepository.findByEmployeeId(employeeId).stream()
                .map(leaveMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<LeaveResponse> getAllLeaveRequests() {
        log.debug("Fetching all leave requests");
        return leaveRequestRepository.findAll().stream()
                .map(leaveMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<LeaveResponse> getLeaveRequestsByStatus(LeaveStatus status) {
        log.debug("Fetching leave requests with status: {}", status);
        return leaveRequestRepository.findByStatus(status).stream()
                .map(leaveMapper::toResponse)
                .toList();
    }

    /**
     * Calculate the number of working days between two dates (excluding Sat & Sun)
     */
    private int calculateWorkingDays(LocalDate startDate, LocalDate endDate) {
        int workingDays = 0;
        LocalDate current = startDate;

        while (!current.isAfter(endDate)) {
            DayOfWeek dayOfWeek = current.getDayOfWeek();
            if (dayOfWeek != DayOfWeek.SATURDAY && dayOfWeek != DayOfWeek.SUNDAY) {
                workingDays++;
            }
            current = current.plusDays(1);
        }

        return workingDays;
    }
}
