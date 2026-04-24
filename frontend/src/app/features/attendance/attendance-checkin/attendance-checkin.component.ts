import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AttendanceService } from '../../../core/services/attendance.service';
import { AttendanceStatus } from '../../../core/models/attendance.model';

@Component({
  selector: 'app-attendance-checkin',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="max-w-3xl mx-auto space-y-8">
      <div class="text-center">
        <h1 class="text-3xl font-black tracking-tight">Time Tracking</h1>
        <p class="text-text-secondary mt-1">Record your presence and view today's logs.</p>
      </div>

      <!-- Clock Card -->
      <div class="card p-10 flex flex-col items-center justify-center space-y-6 relative overflow-hidden">
        <div class="absolute -top-24 -right-24 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>
        <div class="absolute -bottom-24 -left-24 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl"></div>

        <div class="text-6xl font-black tracking-tighter text-text-primary tabular-nums">{{ currentTime | date:'HH:mm:ss' }}</div>
        <div class="text-sm font-bold text-text-muted uppercase tracking-widest">{{ currentTime | date:'EEEE, d MMMM yyyy' }}</div>

        <div class="w-full max-w-sm flex flex-col gap-4 pt-6">
           <button *ngIf="!status?.checkedIn" (click)="checkIn()" class="btn-primary h-16 text-xl shadow-2xl shadow-primary/30 group">
              <svg class="w-6 h-6 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
              Check In
           </button>

           <button *ngIf="status?.checkedIn && !status?.checkedOut" (click)="checkOut()" class="h-16 text-xl bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-2xl shadow-rose-200 transition-all flex items-center justify-center gap-3 group">
              <svg class="w-6 h-6 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
              Check Out
           </button>

           <div *ngIf="status?.checkedOut" class="h-16 flex items-center justify-center gap-3 bg-emerald-50 text-emerald-700 font-black rounded-xl border border-emerald-100">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              Workday Completed
           </div>
        </div>
      </div>

      <!-- Logs Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
         <div class="card p-6 flex flex-col items-center gap-2">
            <span class="text-xs font-bold text-text-muted uppercase">Arrival</span>
            <span class="text-2xl font-black" [class.text-text-muted]="!status?.record?.checkIn">{{ status?.record?.checkIn || '--:--' }}</span>
         </div>
         <div class="card p-6 flex flex-col items-center gap-2">
            <span class="text-xs font-bold text-text-muted uppercase">Departure</span>
            <span class="text-2xl font-black" [class.text-text-muted]="!status?.record?.checkOut">{{ status?.record?.checkOut || '--:--' }}</span>
         </div>
      </div>
    </div>
  `
})
export class AttendanceCheckinComponent implements OnInit, OnDestroy {
  private attendanceService = inject(AttendanceService);
  
  currentTime = new Date();
  private timer: any;
  status: AttendanceStatus | null = null;

  ngOnInit(): void {
    this.timer = setInterval(() => this.currentTime = new Date(), 1000);
    this.loadStatus();
  }

  ngOnDestroy(): void {
    if (this.timer) clearInterval(this.timer);
  }

  loadStatus() {
    this.attendanceService.getStatus().subscribe(res => this.status = res);
  }

  checkIn() {
    const timeStr = this.currentTime.toTimeString().split(' ')[0];
    this.attendanceService.checkIn(timeStr).subscribe(() => this.loadStatus());
  }

  checkOut() {
    this.attendanceService.checkOut().subscribe(() => this.loadStatus());
  }
}
