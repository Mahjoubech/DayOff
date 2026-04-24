package io.github.youco.dayoff.service;

import io.github.youco.dayoff.dto.request.LeaveRequestDto;
import io.github.youco.dayoff.dto.response.LeaveResponse;
import io.github.youco.dayoff.model.enums.LeaveStatus;

import java.util.List;

/**
 * Leave Service Interface
 * Manages leave requests with business logic for day deductions and validations.
 */
public interface LeaveService {

    /**
     * Submit a new leave request for an employee
     * Validates dates, calculates working days, and checks remaining balance.
     * @param employeeId the employee submitting the request
     * @param request the leave request details
     * @return the created leave response
     */
    LeaveResponse submitLeaveRequest(Long employeeId, LeaveRequestDto request);

    /**
     * Approve a leave request and deduct days from employee balance
     * @param leaveRequestId the leave request to approve
     * @return the updated leave response
     */
    LeaveResponse approveLeaveRequest(Long leaveRequestId);

    /**
     * Reject a leave request
     * @param leaveRequestId the leave request to reject
     * @return the updated leave response
     */
    LeaveResponse rejectLeaveRequest(Long leaveRequestId);
    
    /**
     * Cancel/Annul a leave request
     * @param leaveRequestId the leave request to cancel
     * @return the updated leave response
     */
    LeaveResponse cancelLeaveRequest(Long leaveRequestId);

    /**
     * Get all leave requests for a specific employee
     * @param employeeId the employee id
     * @return list of leave responses
     */
    List<LeaveResponse> getEmployeeLeaveRequests(Long employeeId);

    /**
     * Get all leave requests (for HR/Admin)
     * @return list of all leave responses
     */
    List<LeaveResponse> getAllLeaveRequests();

    /**
     * Get leave requests filtered by status
     * @param status the leave status filter
     * @return filtered list of leave responses
     */
    List<LeaveResponse> getLeaveRequestsByStatus(LeaveStatus status);
}
