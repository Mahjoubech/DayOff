package io.github.youco.dayoff.dto.response;

import io.github.youco.dayoff.model.enums.LeaveStatus;
import io.github.youco.dayoff.model.enums.LeaveType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LeaveResponse {
    private Long id;
    private LocalDate startDate;
    private LocalDate endDate;
    private Integer days;
    private LeaveType type;
    private LeaveStatus status;
    private Long employeeId;
    private String employeeName;
    private String reason;
}

