import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DashboardService } from '../../../core/services/dashboard.service';
import { AttendanceService } from '../../../core/services/attendance.service';

@Component({
  selector: 'app-employee-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="space-y-8" *ngIf="details">
      <!-- Welcome Header -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-black tracking-tight">Welcome, {{ details.user.prenom }}</h1>
          <p class="text-text-secondary mt-1">Check in and manage your personal leave requests.</p>
        </div>
        <div class="flex gap-2">
          <button class="btn-primary" routerLink="/attendance">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            Attendance Panel
          </button>
        </div>
      </div>

      <!-- Stats Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div class="card p-5 flex items-center gap-5 group hover:border-primary/50 transition-all cursor-pointer bg-primary text-white">
          <div class="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
            <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          </div>
          <div>
            <p class="text-sm font-bold opacity-80">Days Remaining</p>
            <h3 class="text-3xl font-black">{{ details.leaveDaysLeft }}</h3>
          </div>
        </div>

        <div class="card p-5 flex items-center gap-5 group hover:border-primary/50 transition-all cursor-pointer" routerLink="/leaves">
          <div class="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
            <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <div>
            <p class="text-sm font-bold text-text-muted">Pending Leaves</p>
            <h3 class="text-3xl font-black text-text-primary">{{ details.pendingLeaves }}</h3>
          </div>
        </div>

        <div class="card p-5 flex items-center gap-5 group hover:border-primary/50 transition-all cursor-pointer" routerLink="/attendance">
          <div class="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
            <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <div>
            <p class="text-sm font-bold text-text-muted">Today's Check In</p>
            <h3 class="text-xl font-black text-text-primary">{{ details.todayAttendance?.checkIn || '--:--' }}</h3>
          </div>
        </div>

        <div class="card p-5 flex items-center gap-5 group hover:border-primary/50 transition-all cursor-pointer" routerLink="/attendance">
          <div class="w-14 h-14 rounded-2xl" [ngClass]="details.checkedInToday ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-50 text-text-muted'" class="flex items-center justify-center group-hover:scale-110 transition-transform">
            <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
          </div>
          <div>
            <p class="text-sm font-bold text-text-muted">Status</p>
            <h3 class="text-sm font-black" [ngClass]="details.checkedInToday ? 'text-emerald-600' : 'text-text-muted'">{{ details.checkedInToday ? 'Checked In' : 'Not Working' }}</h3>
          </div>
        </div>
      </div>

      <!-- Quick Action: Submit Leave -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div class="lg:col-span-2 space-y-6">
           <!-- Recent Leaves -->
           <div class="card">
             <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg font-bold">Recent Leaves</h3>
                <button class="text-primary text-sm font-bold hover:underline" routerLink="/leaves">View All</button>
             </div>
             <div class="space-y-3">
                <div *ngFor="let leave of details.recentLeaves" class="flex items-center justify-between p-3 rounded-lg bg-gray-50/50 hover:bg-gray-50 transition-colors">
                   <div class="flex flex-col">
                      <span class="text-sm font-bold">{{ leave.type }}</span>
                      <span class="text-[10px] text-text-muted uppercase font-black">{{ leave.startDate }} to {{ leave.endDate }}</span>
                   </div>
                   <div class="flex gap-4 items-center">
                      <span class="badge" [ngClass]="{
                        'badge-pending': leave.status === 'PENDING',
                        'badge-approved': leave.status === 'APPROVED',
                        'badge-rejected': leave.status === 'REJECTED'
                      }">{{ leave.status }}</span>
                   </div>
                </div>
                <div *ngIf="details.recentLeaves.length === 0" class="text-center py-6 text-text-muted text-sm italic">
                  No recent leaves found.
                </div>
             </div>
           </div>
        </div>

        <div class="space-y-6">
           <div class="card bg-linear-to-br from-indigo-600 to-primary p-6 text-white border-none shadow-indigo-200">
             <h3 class="text-lg font-bold mb-2">Need time off?</h3>
             <p class="text-sm opacity-80 mb-6">Plan your next vacation or submit a sick leave request in seconds.</p>
             <button class="w-full bg-white text-primary font-bold py-2.5 rounded-lg shadow-lg hover:bg-indigo-50 transition-colors" routerLink="/leaves">
               Request Leave
             </button>
           </div>

           <div class="card border-dashed border-2 flex flex-col items-center justify-center py-10 text-center opacity-60">
              <svg class="w-12 h-12 text-text-muted mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
              <p class="text-sm font-medium">Add Widget</p>
           </div>
        </div>
      </div>
    </div>
  `
})
export class EmployeeDashboardComponent implements OnInit {
  private dashboardService = inject(DashboardService);
  private attendanceService = inject(AttendanceService);

  details: any = null;

  ngOnInit(): void {
    this.dashboardService.getEmployeeDetails().subscribe(res => this.details = res);
  }
}
