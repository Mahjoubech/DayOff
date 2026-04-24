import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LeaveService } from '../../../core/services/leave.service';
import { LeaveRequest, LeaveType } from '../../../core/models/leave.model';

@Component({
  selector: 'app-leave-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-8">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-black tracking-tight">Leave Requests</h1>
          <p class="text-text-secondary mt-1">View your history and request new time off.</p>
        </div>
        <button class="btn-primary" (click)="showRequestModal = true">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" /></svg>
          Request Leave
        </button>
      </div>

      <!-- History Card -->
      <div class="card overflow-hidden">
        <div class="p-6 border-b border-border">
          <h3 class="text-lg font-bold">My Leave History</h3>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="bg-gray-50/50">
                <th class="px-6 py-4">Type</th>
                <th class="px-6 py-4">Dates</th>
                <th class="px-6 py-4 text-center">Duration</th>
                <th class="px-6 py-4">Status</th>
                <th class="px-6 py-4">Reason</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let leave of leaves" class="hover:bg-gray-50/30 transition-colors">
                <td class="px-6 py-4 font-bold">{{ leave.type }}</td>
                <td class="px-6 py-4">
                  <div class="flex flex-col">
                    <span class="text-xs text-text-muted">From {{ leave.startDate }}</span>
                    <span class="text-xs text-text-muted">To {{ leave.endDate }}</span>
                  </div>
                </td>
                <td class="px-6 py-4 text-center font-black">{{ leave.days }} <span class="text-[10px] text-text-muted">days</span></td>
                <td class="px-6 py-4">
                  <span class="badge" [ngClass]="{
                    'badge-pending': leave.status === 'PENDING',
                    'badge-approved': leave.status === 'APPROVED',
                    'badge-rejected': leave.status === 'REJECTED'
                  }">{{ leave.status }}</span>
                </td>
                <td class="px-6 py-4 text-sm text-text-secondary italic max-w-xs truncate">{{ leave.reason || 'No reason provided' }}</td>
              </tr>
              <tr *ngIf="leaves.length === 0">
                <td colspan="5" class="text-center py-12 text-text-muted italic">You haven't submitted any leave requests yet.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Simple Request Modal (Simulation) -->
      <div *ngIf="showRequestModal" class="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <div class="card w-full max-w-lg shadow-2xl border border-border">
           <h2 class="text-xl font-black mb-6">New Leave Request</h2>
           
           <!-- Error Message Alert -->
           <div *ngIf="errorMessage" class="bg-rose-50 border border-rose-200 text-rose-600 px-4 py-3 rounded-lg text-sm font-bold mb-6 flex items-start gap-3">
              <svg class="w-5 h-5 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <span>{{ errorMessage }}</span>
           </div>

           <form (ngSubmit)="onSubmit()" class="space-y-4">
              <div class="grid grid-cols-2 gap-4">
                 <div class="space-y-1">
                    <label class="text-xs font-bold uppercase tracking-wider text-text-muted">Start Date</label>
                    <input type="date" [(ngModel)]="newRequest.startDate" name="start" class="form-control" required>
                 </div>
                 <div class="space-y-1">
                    <label class="text-xs font-bold uppercase tracking-wider text-text-muted">End Date</label>
                    <input type="date" [(ngModel)]="newRequest.endDate" name="end" class="form-control" required>
                 </div>
              </div>
              <div class="space-y-1">
                 <label class="text-xs font-bold uppercase tracking-wider text-text-muted">Leave Type</label>
                 <select [(ngModel)]="newRequest.type" name="type" class="form-control">
                    <option value="CONGE">Paid Leave (Congé)</option>
                    <option value="MALADIE">Sick Leave (Maladie)</option>
                    <option value="URGENCE">Emergency (Urgence)</option>
                 </select>
              </div>
              <div class="space-y-1">
                 <label class="text-xs font-bold uppercase tracking-wider text-text-muted">Reason (Optional)</label>
                 <textarea [(ngModel)]="newRequest.reason" name="reason" class="form-control h-24" placeholder="Briefly explain your request..."></textarea>
              </div>
              <div class="flex justify-end gap-3 mt-8">
                 <button type="button" class="px-4 py-2 text-sm font-bold text-text-secondary hover:bg-gray-100 rounded-lg transition-colors" (click)="showRequestModal = false">Cancel</button>
                 <button type="submit" class="btn-primary">Submit Request</button>
              </div>
           </form>
        </div>
      </div>
    </div>
  `
})
export class LeaveListComponent implements OnInit {
  private leaveService = inject(LeaveService);

  leaves: LeaveRequest[] = [];
  showRequestModal = false;
  errorMessage = '';
  newRequest = {
    startDate: '',
    endDate: '',
    type: 'CONGE' as LeaveType,
    reason: ''
  };

  ngOnInit(): void {
    this.loadLeaves();
  }

  loadLeaves() {
    this.leaveService.getMyLeaves().subscribe(res => this.leaves = res);
  }

  onSubmit() {
    this.errorMessage = '';
    this.leaveService.submitLeave(this.newRequest).subscribe({
      next: () => {
        this.showRequestModal = false;
        this.loadLeaves();
        // Reset form
        this.newRequest = { startDate: '', endDate: '', type: 'CONGE', reason: '' };
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'An unexpected error occurred. Please try again.';
      }
    });
  }
}
