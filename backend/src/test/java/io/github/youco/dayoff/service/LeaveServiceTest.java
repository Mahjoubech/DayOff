package io.github.youco.dayoff.service;

import io.github.youco.dayoff.dto.request.LeaveRequestDto;
import io.github.youco.dayoff.dto.response.LeaveResponse;
import io.github.youco.dayoff.exception.BusinessException;
import io.github.youco.dayoff.mapper.LeaveMapper;
import io.github.youco.dayoff.model.entity.LeaveRequest;
import io.github.youco.dayoff.model.entity.User;
import io.github.youco.dayoff.model.enums.LeaveStatus;
import io.github.youco.dayoff.model.enums.LeaveType;
import io.github.youco.dayoff.repository.LeaveRequestRepository;
import io.github.youco.dayoff.repository.UserRepository;
import io.github.youco.dayoff.service.impl.LeaveServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Collections;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class LeaveServiceTest {

    @Mock
    private LeaveRequestRepository leaveRequestRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private LeaveMapper leaveMapper;
    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private LeaveServiceImpl leaveService;

    private User employee;
    private LeaveRequestDto requestDto;

    @BeforeEach
    void setUp() {
        employee = new User();
        employee.setId(1L);
        employee.setPrenom("John");
        employee.setNom("Doe");
        employee.setLeaveDaysRemaining(30);

        // Use a known future Tuesday to Thursday to ensure working days = 3
        LocalDate futureTuesday = LocalDate.now().plusWeeks(2);
        while (futureTuesday.getDayOfWeek() != java.time.DayOfWeek.TUESDAY) {
            futureTuesday = futureTuesday.plusDays(1);
        }

        requestDto = new LeaveRequestDto();
        requestDto.setStartDate(futureTuesday);
        requestDto.setEndDate(futureTuesday.plusDays(2)); // Tue, Wed, Thu = 3 days
        requestDto.setType(LeaveType.CONGE);
        requestDto.setReason("Vacation");
    }

    @Test
    void submitLeaveRequest_Success() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(employee));
        when(leaveRequestRepository.findByEmployeeId(1L)).thenReturn(Collections.emptyList());
        when(leaveRequestRepository.save(any(LeaveRequest.class))).thenAnswer(i -> {
            LeaveRequest lr = (LeaveRequest) i.getArguments()[0];
            lr.setId(100L); // Ensure ID is set for logging
            return lr;
        });
        when(leaveMapper.toResponse(any())).thenReturn(new LeaveResponse());

        LeaveResponse response = leaveService.submitLeaveRequest(1L, requestDto);

        assertNotNull(response);
        verify(leaveRequestRepository).save(any(LeaveRequest.class));
    }

    @Test
    void submitLeaveRequest_InsufficientBalance() {
        employee.setLeaveDaysRemaining(1);
        when(userRepository.findById(1L)).thenReturn(Optional.of(employee));

        assertThrows(BusinessException.class, () -> {
            leaveService.submitLeaveRequest(1L, requestDto);
        });
    }

    @Test
    void approveLeaveRequest_Success() {
        LeaveRequest leave = new LeaveRequest();
        leave.setId(1L);
        leave.setDays(3);
        leave.setStatus(LeaveStatus.PENDING);
        leave.setEmployee(employee);
        leave.setStartDate(LocalDate.now().plusDays(1));
        leave.setEndDate(LocalDate.now().plusDays(4));

        when(leaveRequestRepository.findById(1L)).thenReturn(Optional.of(leave));
        when(leaveRequestRepository.save(any(LeaveRequest.class))).thenReturn(leave);
        when(leaveMapper.toResponse(any())).thenReturn(new LeaveResponse());

        leaveService.approveLeaveRequest(1L);

        assertEquals(27, employee.getLeaveDaysRemaining());
        assertEquals(LeaveStatus.APPROVED, leave.getStatus());
        verify(notificationService).sendLeaveApprovedNotification(any(), any(), any());
    }

    @Test
    void calculateWorkingDays_ShouldExcludeWeekends() {
        // Friday to next Monday should be 2 working days (Friday, Monday)
        LocalDate friday = LocalDate.now().plusWeeks(3);
        while (friday.getDayOfWeek() != java.time.DayOfWeek.FRIDAY) {
            friday = friday.plusDays(1);
        }
        
        requestDto.setStartDate(friday);
        requestDto.setEndDate(friday.plusDays(3)); // Fri, Sat, Sun, Mon
        
        when(userRepository.findById(1L)).thenReturn(Optional.of(employee));
        when(leaveRequestRepository.findByEmployeeId(1L)).thenReturn(Collections.emptyList());
        when(leaveRequestRepository.save(any(LeaveRequest.class))).thenAnswer(i -> {
            LeaveRequest saved = (LeaveRequest) i.getArguments()[0];
            assertEquals(2, saved.getDays()); // Fri, Mon
            saved.setId(101L);
            return saved;
        });
        
        leaveService.submitLeaveRequest(1L, requestDto);
    }
}
