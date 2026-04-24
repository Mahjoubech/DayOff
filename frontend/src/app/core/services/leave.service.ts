import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LeaveRequest, LeaveRequestDto, LeaveStatus } from '../models/leave.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class LeaveService {
  private apiUrl = `${environment.apiUrl}/leaves`;
  private hrUrl = `${environment.apiUrl}/hr/leaves`;

  constructor(private http: HttpClient) {}

  // ── Employee self-service ──────────────────────────────────────────────────

  getMyLeaves(): Observable<LeaveRequest[]> {
    return this.http.get<LeaveRequest[]>(`${this.apiUrl}/my`);
  }

  getMyLeavesByStatus(status: LeaveStatus): Observable<LeaveRequest[]> {
    return this.http.get<LeaveRequest[]>(`${this.apiUrl}/my/status/${status}`);
  }

  submitLeave(dto: LeaveRequestDto): Observable<LeaveRequest> {
    return this.http.post<LeaveRequest>(this.apiUrl, dto);
  }

  // ── HR / Admin ─────────────────────────────────────────────────────────────

  getAllLeaves(): Observable<LeaveRequest[]> {
    return this.http.get<LeaveRequest[]>(`${this.apiUrl}/all`);
  }

  getLeavesByStatus(status: LeaveStatus): Observable<LeaveRequest[]> {
    return this.http.get<LeaveRequest[]>(`${this.apiUrl}/status/${status}`);
  }

  getPendingLeaves(): Observable<LeaveRequest[]> {
    return this.http.get<LeaveRequest[]>(`${this.hrUrl}/pending`);
  }

  getEmployeeLeaves(employeeId: number): Observable<LeaveRequest[]> {
    return this.http.get<LeaveRequest[]>(`${this.hrUrl}/employee/${employeeId}`);
  }

  approve(id: number): Observable<LeaveRequest> {
    return this.http.put<LeaveRequest>(`${this.hrUrl}/${id}/approve`, {});
  }

  reject(id: number): Observable<LeaveRequest> {
    return this.http.put<LeaveRequest>(`${this.hrUrl}/${id}/reject`, {});
  }

  cancel(id: number): Observable<LeaveRequest> {
    return this.http.put<LeaveRequest>(`${this.hrUrl}/${id}/cancel`, {});
  }
}
