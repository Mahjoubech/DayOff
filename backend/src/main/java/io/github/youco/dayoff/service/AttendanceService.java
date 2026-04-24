package io.github.youco.dayoff.service;

import io.github.youco.dayoff.dto.response.AttendanceResponse;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

/**
 * Attendance Service Interface
 * Manages employee check-in and check-out with duplicate prevention.
 */
public interface AttendanceService {

    /**
     * Check in an employee for today
     * @param employeeId the employee id
     * @param checkInTime the check-in time
     * @return the attendance response
     * @throws io.github.youco.dayoff.exception.DuplicateCheckInException if already checked in today
     */
    AttendanceResponse checkIn(Long employeeId, LocalTime checkInTime);

    /**
     * Check out an employee for today
     * @param employeeId the employee id
     * @param checkOutTime the check-out time
     * @return the updated attendance response
     */
    AttendanceResponse checkOut(Long employeeId, LocalTime checkOutTime);

    /**
     * Get today's attendance for a specific employee
     * @param employeeId the employee id
     * @return the attendance response or null if not checked in
     */
    AttendanceResponse getTodayAttendance(Long employeeId);

    /**
     * Get all attendance records for a specific employee
     * @param employeeId the employee id
     * @return list of attendance records
     */
    List<AttendanceResponse> getEmployeeAttendanceHistory(Long employeeId);

    /**
     * Get all attendance records for a specific date
     * @param date the date to query
     * @return list of attendance records
     */
    List<AttendanceResponse> getAttendanceByDate(LocalDate date);
}
