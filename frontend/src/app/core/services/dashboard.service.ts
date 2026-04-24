import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DashboardStats } from '../models/dashboard.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private apiUrl = `${environment.apiUrl}/dashboard`;

  constructor(private http: HttpClient) {}

  /** Single role-aware endpoint — backend decides what to return */
  getStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(this.apiUrl);
  }

  /** Extended employee detail dashboard */
  getEmployeeDetails(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/employee/details`);
  }
}
