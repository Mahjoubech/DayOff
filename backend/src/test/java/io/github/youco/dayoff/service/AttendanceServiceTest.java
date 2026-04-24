package io.github.youco.dayoff.service;

import io.github.youco.dayoff.dto.response.AttendanceResponse;
import io.github.youco.dayoff.exception.BusinessException;
import io.github.youco.dayoff.exception.DuplicateCheckInException;
import io.github.youco.dayoff.mapper.AttendanceMapper;
import io.github.youco.dayoff.model.entity.Attendance;
import io.github.youco.dayoff.model.entity.User;
import io.github.youco.dayoff.repository.AttendanceRepository;
import io.github.youco.dayoff.repository.UserRepository;
import io.github.youco.dayoff.service.impl.AttendanceServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AttendanceServiceTest {

    @Mock
    private AttendanceRepository attendanceRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private AttendanceMapper attendanceMapper;

    @InjectMocks
    private AttendanceServiceImpl attendanceService;

    private User employee;

    @BeforeEach
    void setUp() {
        employee = new User();
        employee.setId(1L);
        employee.setPrenom("John");
        employee.setNom("Doe");
    }

    @Test
    void checkIn_Success() {
        LocalTime now = LocalTime.now();
        when(userRepository.findById(1L)).thenReturn(Optional.of(employee));
        when(attendanceRepository.findByEmployeeIdAndDate(eq(1L), any(LocalDate.class))).thenReturn(Optional.empty());
        when(attendanceRepository.save(any(Attendance.class))).thenAnswer(i -> i.getArguments()[0]);
        when(attendanceMapper.toResponse(any())).thenReturn(new AttendanceResponse());

        AttendanceResponse response = attendanceService.checkIn(1L, now);

        assertNotNull(response);
        verify(attendanceRepository).save(any(Attendance.class));
    }

    @Test
    void checkIn_Duplicate_ThrowsException() {
        LocalTime now = LocalTime.now();
        Attendance existing = new Attendance();
        
        when(userRepository.findById(1L)).thenReturn(Optional.of(employee));
        when(attendanceRepository.findByEmployeeIdAndDate(eq(1L), any(LocalDate.class))).thenReturn(Optional.of(existing));

        assertThrows(DuplicateCheckInException.class, () -> {
            attendanceService.checkIn(1L, now);
        });
    }

    @Test
    void checkOut_Success() {
        LocalTime checkInTime = LocalTime.of(9, 0);
        LocalTime checkOutTime = LocalTime.of(17, 0);
        
        Attendance attendance = new Attendance();
        attendance.setCheckIn(checkInTime);
        
        when(attendanceRepository.findByEmployeeIdAndDate(eq(1L), any(LocalDate.class))).thenReturn(Optional.of(attendance));
        when(attendanceRepository.save(any(Attendance.class))).thenReturn(attendance);
        when(attendanceMapper.toResponse(any())).thenReturn(new AttendanceResponse());

        AttendanceResponse response = attendanceService.checkOut(1L, checkOutTime);

        assertNotNull(response);
        assertEquals(checkOutTime, attendance.getCheckOut());
    }

    @Test
    void checkOut_BeforeCheckIn_ThrowsException() {
        LocalTime checkInTime = LocalTime.of(9, 0);
        LocalTime checkOutTime = LocalTime.of(8, 0);
        
        Attendance attendance = new Attendance();
        attendance.setCheckIn(checkInTime);
        
        when(attendanceRepository.findByEmployeeIdAndDate(eq(1L), any(LocalDate.class))).thenReturn(Optional.of(attendance));

        assertThrows(BusinessException.class, () -> {
            attendanceService.checkOut(1L, checkOutTime);
        });
    }
}
