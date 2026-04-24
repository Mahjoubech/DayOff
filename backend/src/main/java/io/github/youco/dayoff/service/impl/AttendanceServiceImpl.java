package io.github.youco.dayoff.service.impl;

import io.github.youco.dayoff.dto.response.AttendanceResponse;
import io.github.youco.dayoff.exception.BusinessException;
import io.github.youco.dayoff.exception.DuplicateCheckInException;
import io.github.youco.dayoff.exception.ResourceNotFoundException;
import io.github.youco.dayoff.mapper.AttendanceMapper;
import io.github.youco.dayoff.model.entity.Attendance;
import io.github.youco.dayoff.model.entity.User;
import io.github.youco.dayoff.repository.AttendanceRepository;
import io.github.youco.dayoff.repository.UserRepository;
import io.github.youco.dayoff.service.AttendanceService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

/**
 * Attendance Service Implementation
 * Handles employee check-in/check-out with duplicate detection per day.
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class AttendanceServiceImpl implements AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final UserRepository userRepository;
    private final AttendanceMapper attendanceMapper;

    @Override
    public AttendanceResponse checkIn(Long employeeId, LocalTime checkInTime) {
        log.info("Employee {} checking in at {}", employeeId, checkInTime);

        User employee = userRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + employeeId));

        LocalDate today = LocalDate.now();

        // Check for duplicate check-in
        Optional<Attendance> existingAttendance = attendanceRepository.findByEmployeeIdAndDate(employeeId, today);
        if (existingAttendance.isPresent()) {
            throw new DuplicateCheckInException("Employee " + employeeId + " has already checked in today (" + today + ")");
        }

        Attendance attendance = Attendance.builder()
                .date(today)
                .checkIn(checkInTime)
                .employee(employee)
                .build();

        Attendance savedAttendance = attendanceRepository.save(attendance);
        log.info("Check-in recorded for employee {} with id: {}", employeeId, savedAttendance.getId());

        return attendanceMapper.toResponse(savedAttendance);
    }

    @Override
    public AttendanceResponse checkOut(Long employeeId, LocalTime checkOutTime) {
        log.info("Employee {} checking out at {}", employeeId, checkOutTime);

        LocalDate today = LocalDate.now();

        Attendance attendance = attendanceRepository.findByEmployeeIdAndDate(employeeId, today)
                .orElseThrow(() -> new BusinessException("Employee " + employeeId + " has not checked in today. Please check in first."));

        if (attendance.getCheckOut() != null) {
            throw new BusinessException("Employee " + employeeId + " has already checked out today");
        }

        if (checkOutTime.isBefore(attendance.getCheckIn())) {
            throw new BusinessException("Check-out time cannot be before check-in time");
        }

        attendance.setCheckOut(checkOutTime);
        Attendance savedAttendance = attendanceRepository.save(attendance);

        log.info("Check-out recorded for employee {} at {}", employeeId, checkOutTime);

        return attendanceMapper.toResponse(savedAttendance);
    }

    @Override
    @Transactional(readOnly = true)
    public AttendanceResponse getTodayAttendance(Long employeeId) {
        log.debug("Fetching today's attendance for employee: {}", employeeId);

        LocalDate today = LocalDate.now();
        return attendanceRepository.findByEmployeeIdAndDate(employeeId, today)
                .map(attendanceMapper::toResponse)
                .orElse(null);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AttendanceResponse> getEmployeeAttendanceHistory(Long employeeId) {
        log.debug("Fetching attendance history for employee: {}", employeeId);

        if (!userRepository.existsById(employeeId)) {
            throw new ResourceNotFoundException("Employee not found with id: " + employeeId);
        }

        return attendanceRepository.findByEmployeeId(employeeId).stream()
                .map(attendanceMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<AttendanceResponse> getAttendanceByDate(LocalDate date) {
        log.debug("Fetching attendance records for date: {}", date);
        return attendanceRepository.findByDate(date).stream()
                .map(attendanceMapper::toResponse)
                .toList();
    }
}
