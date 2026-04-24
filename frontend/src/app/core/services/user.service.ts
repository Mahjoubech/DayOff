import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User, CreateUserRequest } from '../models/user.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class UserService {
  private hrUrl = `${environment.apiUrl}/hr`;
  private superadminUrl = `${environment.apiUrl}/superadmin`;

  constructor(private http: HttpClient) {}

  // ── HR Manager endpoints ───────────────────────────────────────────────────

  getMyEmployees(): Observable<User[]> {
    return this.http.get<User[]>(`${this.hrUrl}/employees`);
  }

  getEmployee(id: number): Observable<User> {
    return this.http.get<User>(`${this.hrUrl}/employees/${id}`);
  }

  createEmployee(data: CreateUserRequest): Observable<User> {
    return this.http.post<User>(`${this.hrUrl}/employees`, data);
  }

  updateEmployee(id: number, data: CreateUserRequest): Observable<User> {
    return this.http.put<User>(`${this.hrUrl}/employees/${id}`, data);
  }

  deleteEmployee(id: number): Observable<void> {
    return this.http.delete<void>(`${this.hrUrl}/employees/${id}`);
  }

  // ── Super Admin endpoints ──────────────────────────────────────────────────

  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.superadminUrl}/users`);
  }

  getUserById(id: number): Observable<User> {
    return this.http.get<User>(`${this.superadminUrl}/users/${id}`);
  }

  createAdmin(data: CreateUserRequest): Observable<User> {
    return this.http.post<User>(`${this.superadminUrl}/users/admin`, data);
  }

  createEmployeeAsAdmin(data: CreateUserRequest): Observable<User> {
    return this.http.post<User>(`${this.superadminUrl}/users/employee`, data);
  }

  updateUser(id: number, data: CreateUserRequest): Observable<User> {
    return this.http.put<User>(`${this.superadminUrl}/users/${id}`, data);
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.superadminUrl}/users/${id}`);
  }
}
