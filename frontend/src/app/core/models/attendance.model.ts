export interface Attendance {
  id: number;
  date: string;        // LocalDate as ISO string
  checkIn: string | null;   // LocalTime as HH:mm:ss string
  checkOut: string | null;  // LocalTime as HH:mm:ss string
  employeeId: number;
  employeeName: string;
}

export interface AttendanceStatus {
  checkedIn: boolean;
  checkedOut: boolean;
  record: Attendance | Record<string, never>;
}
