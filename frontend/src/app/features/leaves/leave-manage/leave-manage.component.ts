import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LeaveService } from '../../../core/services/leave.service';
import { LeaveRequest } from '../../../core/models/leave.model';

@Component({
  selector: 'app-leave-manage',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-8">
      <div>
        <h1 class="text-2xl font-black tracking-tight">Manage Requests</h1>
        <p class="text-text-secondary mt-1">Review and action pending leave applications from your team.</p>
      </div>

       <!-- Pending Card -->
      <div class="card overflow-hidden border-amber-200 bg-amber-50/20">
        <div class="p-6 border-b border-amber-100 flex items-center justify-between">
          <h3 class="text-lg font-bold text-amber-900">Pending Actions</h3>
          <span class="bg-amber-100 text-amber-800 text-xs font-black px-2 py-1 rounded-md">{{ pendingCount }} REQUIRED</span>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="bg-amber-100/30">
                <th class="px-6 py-4">Employee</th>
                <th class="px-6 py-4">Type</th>
                <th class="px-6 py-4">Dates</th>
                <th class="px-6 py-4">Reason</th>
                <th class="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let leave of pendingLeaves" class="hover:bg-amber-100/10 transition-colors">
                <td class="px-6 py-4">
                   <div class="flex items-center gap-3">
                      <div class="w-8 h-8 rounded-full bg-amber-200 text-amber-800 flex items-center justify-center font-bold text-xs">
                        {{ leave.employeeName.charAt(0) }}
                      </div>
                      <span class="font-bold">{{ leave.employeeName }}</span>
                   </div>
                </td>
                <td class="px-6 py-4 text-xs font-bold uppercase tracking-wider text-text-secondary">{{ leave.type }}</td>
                <td class="px-6 py-4">
                  <span class="text-xs font-medium">{{ leave.startDate }} to {{ leave.endDate }}</span>
                </td>
                <td class="px-6 py-4 text-sm italic text-text-secondary max-w-xs truncate">{{ leave.reason || 'No reason' }}</td>
                <td class="px-6 py-4 text-right">
                  <div class="flex justify-end gap-2">
                     <button (click)="onAction(leave.id, 'cancel')" class="w-9 h-9 flex items-center justify-center rounded-lg bg-white border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors shadow-sm" title="Annul (Cancel)">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
                     </button>
                     <button (click)="onAction(leave.id, 'reject')" class="w-9 h-9 flex items-center justify-center rounded-lg bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 transition-colors shadow-sm" title="Reject">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
                     </button>
                     <button (click)="onAction(leave.id, 'approve')" class="w-9 h-9 flex items-center justify-center rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200" title="Approve">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
                     </button>
                  </div>
                </td>
              </tr>
              <tr *ngIf="pendingLeaves.length === 0">
                <td colspan="5" class="text-center py-12 text-text-muted italic">No pending leave requests at the moment.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- History Card -->
      <div class="card overflow-hidden">
        <div class="p-6 border-b border-border flex items-center justify-between">
          <h3 class="text-lg font-bold">Processed History</h3>
          <span class="text-xs text-text-muted font-medium">{{ historyLeaves.length }} RECORDS</span>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="bg-gray-50/50">
                <th class="px-6 py-4">Employee</th>
                <th class="px-6 py-4">Type</th>
                <th class="px-6 py-4">Dates</th>
                <th class="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let leave of historyLeaves" class="hover:bg-gray-50/10 transition-colors">
                <td class="px-6 py-4">
                  <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center font-bold text-xs uppercase">
                      {{ leave.employeeName.charAt(0) }}
                    </div>
                    <span class="font-bold">{{ leave.employeeName }}</span>
                  </div>
                </td>
                <td class="px-6 py-4 text-xs font-bold uppercase tracking-wider text-text-secondary">{{ leave.type }}</td>
                <td class="px-6 py-4 text-xs">
                  {{ leave.startDate }} to {{ leave.endDate }}
                </td>
                <td class="px-6 py-4">
                  <span class="badge" [ngClass]="{
                    'bg-emerald-100 text-emerald-800': leave.status === 'APPROVED',
                    'bg-rose-100 text-rose-800': leave.status === 'REJECTED',
                    'bg-gray-100 text-gray-800': leave.status === 'CANCELLED'
                  }">
                    {{ leave.status }}
                  </span>
                </td>
              </tr>
              <tr *ngIf="historyLeaves.length === 0">
                <td colspan="4" class="text-center py-12 text-text-muted italic">No processed leaves found.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class LeaveManageComponent implements OnInit {
  private leaveService = inject(LeaveService);
  
  pendingLeaves: LeaveRequest[] = [];
  historyLeaves: LeaveRequest[] = [];
  pendingCount = 0;

  ngOnInit(): void {
    this.loadLeaves();
  }

  loadLeaves() {
    this.leaveService.getAllLeaves().subscribe(res => {
      this.pendingLeaves = res.filter(l => l.status === 'PENDING');
      this.historyLeaves = res.filter(l => l.status !== 'PENDING');
      this.pendingCount = this.pendingLeaves.length;
    });
  }

  onAction(id: number, type: 'approve' | 'reject' | 'cancel') {
    let obs;
    if (type === 'approve') obs = this.leaveService.approve(id);
    else if (type === 'reject') obs = this.leaveService.reject(id);
    else obs = this.leaveService.cancel(id);
    
    obs.subscribe(() => this.loadLeaves());
  }
}
