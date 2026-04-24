package io.github.youco.dayoff.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardResponse {
    private Long totalUsers;
    private Long totalLeaveRequests;
    private Long totalAttendanceRecords;
    private Long pendingLeaveRequests;
    private Integer averageLeaveDaysRemaining;
    private String dashboardType; // SUPERADMIN, HR, EMPLOYEE
}

