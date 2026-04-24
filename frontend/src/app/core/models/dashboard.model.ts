export interface DashboardStats {
  totalUsers: number;
  totalLeaveRequests: number;
  totalAttendanceRecords: number;
  pendingLeaveRequests: number;
  averageLeaveDaysRemaining: number;
  dashboardType: 'SUPERADMIN' | 'HR' | 'EMPLOYEE';
}
