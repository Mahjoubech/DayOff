export type LeaveType = 'CONGE' | 'MALADIE' | 'URGENCE';
export type LeaveStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';

export interface LeaveRequest {
  id: number;
  startDate: string;
  endDate: string;
  days: number;
  type: LeaveType;
  status: LeaveStatus;
  employeeId: number;
  employeeName: string;
  reason?: string;
}

export interface LeaveRequestDto {
  startDate: string;
  endDate: string;
  type: LeaveType;
  reason?: string;
}
