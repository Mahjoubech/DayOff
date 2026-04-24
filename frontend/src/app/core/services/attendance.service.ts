import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Attendance, AttendanceStatus } from '../models/attendance.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AttendanceService {
  private apiUrl = `${environment.apiUrl}/attendance`;

  constructor(private http: HttpClient) {}

  // ── Self-service ───────────────────────────────────────────────────────────

  checkIn(checkInTime: string): Observable<Attendance> {
    return this.http.post<Attendance>(`${this.apiUrl}/checkin`, { checkInTime });
  }

  checkOut(): Observable<Attendance> {
    return this.http.post<Attendance>(`${this.apiUrl}/checkout`, {});
  }

  getTodayAttendance(): Observable<Attendance> {
    return this.http.get<Attendance>(`${this.apiUrl}/today`);
  }

  getMyHistory(): Observable<Attendance[]> {
    return this.http.get<Attendance[]>(`${this.apiUrl}/my`);
  }

  getStatus(): Observable<AttendanceStatus> {
    return this.http.get<AttendanceStatus>(`${this.apiUrl}/status`);
  }

  // ── HR / Admin ─────────────────────────────────────────────────────────────

  getEmployeeHistory(employeeId: number): Observable<Attendance[]> {
    return this.http.get<Attendance[]>(`${this.apiUrl}/employee/${employeeId}`);
  }

  getByDate(date: string): Observable<Attendance[]> {
    return this.http.get<Attendance[]>(`${this.apiUrl}/date`, { params: { date } });
  }
}
