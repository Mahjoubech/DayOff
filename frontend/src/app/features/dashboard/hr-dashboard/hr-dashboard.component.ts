import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService } from '../../../core/services/dashboard.service';
import { UserService } from '../../../core/services/user.service';
import { LeaveService } from '../../../core/services/leave.service';
import { DashboardStats } from '../../../core/models/dashboard.model';
import { User, Role } from '../../../core/models/user.model';
import { UserModalComponent } from '../../../shared/components/user-modal/user-modal.component';

@Component({
  selector: 'app-hr-dashboard',
  standalone: true,
  imports: [CommonModule, UserModalComponent],
  template: `
    <div class="space-y-8" *ngIf="stats">
      <!-- Welcome Header -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-black tracking-tight">HR Dashboard</h1>
          <p class="text-text-secondary mt-1">Manage your team and review leave requests.</p>
        </div>
        <div class="flex gap-2">
          <button class="btn-primary">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" /></svg>
            Add Employee
          </button>
        </div>
      </div>

      <!-- Stats Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div class="card p-5 flex items-center gap-5 group hover:border-primary/50 transition-all cursor-pointer">
          <div class="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
            <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /></svg>
          </div>
          <div>
            <p class="text-sm font-bold text-text-muted">My Team</p>
            <h3 class="text-3xl font-black text-text-primary">{{ stats.totalUsers }}</h3>
          </div>
        </div>

        <div class="card p-5 flex items-center gap-5 group hover:border-primary/50 transition-all cursor-pointer">
          <div class="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center group-hover:scale-110 transition-transform">
            <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <div>
            <p class="text-sm font-bold text-text-muted">Pending Action</p>
            <h3 class="text-3xl font-black text-text-primary">{{ stats.pendingLeaveRequests }}</h3>
          </div>
        </div>

        <div class="card p-5 flex items-center gap-5 group hover:border-primary/50 transition-all cursor-pointer">
          <div class="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
            <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <div>
            <p class="text-sm font-bold text-text-muted">Present Today</p>
            <h3 class="text-3xl font-black text-text-primary">42</h3>
          </div>
        </div>

        <div class="card p-5 flex items-center gap-5 group hover:border-primary/50 transition-all cursor-pointer">
          <div class="w-14 h-14 rounded-2xl bg-gray-50 text-text-muted flex items-center justify-center group-hover:scale-110 transition-transform">
            <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <div>
            <p class="text-sm font-bold text-text-muted">Absent Today</p>
            <h3 class="text-3xl font-black text-text-primary">3</h3>
          </div>
        </div>
      </div>

      <!-- Recent Leave Requests -->
      <div class="card overflow-hidden border-primary/10">
        <div class="p-6 border-b border-border flex items-center justify-between bg-primary-light/10">
          <h3 class="text-lg font-bold">Pending Leave Requests</h3>
          <button class="text-primary font-bold text-sm hover:underline" routerLink="/leaves/manage">View All</button>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="bg-gray-50/50">
                <th class="px-6 py-4">Employee</th>
                <th class="px-6 py-4">Type</th>
                <th class="px-6 py-4">Dates</th>
                <th class="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let leave of pendingLeaves" class="hover:bg-gray-50/30 transition-colors">
                <td class="px-6 py-4">
                  <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs">
                      {{ leave.employeeName.charAt(0) }}
                    </div>
                    <span class="font-bold">{{ leave.employeeName }}</span>
                  </div>
                </td>
                <td class="px-6 py-4">
                  <span class="text-xs font-bold uppercase text-text-secondary">{{ leave.type }}</span>
                </td>
                <td class="px-6 py-4 text-sm">
                  {{ leave.startDate | date:'MMM d' }} - {{ leave.endDate | date:'MMM d' }}
                </td>
                <td class="px-6 py-4 text-right">
                  <div class="flex justify-end gap-2">
                    <button (click)="onLeaveAction(leave.id, 'cancel')" class="btn-icon text-gray-400 hover:text-gray-600 hover:bg-gray-100" title="Annul">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                    <button (click)="onLeaveAction(leave.id, 'approve')" class="btn-icon text-emerald-500 hover:bg-emerald-50" title="Approve">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
                    </button>
                  </div>
                </td>
              </tr>
              <tr *ngIf="pendingLeaves.length === 0">
                <td colspan="4" class="text-center py-10 text-text-muted italic">No pending leave requests.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Team Table -->
      <div class="card overflow-hidden">
        <div class="p-6 border-b border-border flex items-center justify-between">
          <h3 class="text-lg font-bold">Managed Employees</h3>
          <button class="text-primary font-bold text-sm hover:underline" routerLink="/employees">Manage Team</button>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="bg-gray-50/50">
                <th class="px-6 py-4">Employee</th>
                <th class="px-6 py-4">Contact</th>
                <th class="px-6 py-4">Days Left</th>
                 <th class="px-6 py-4">Status</th>
                <th class="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let emp of employees" class="hover:bg-gray-50/30 transition-colors">
                <td class="px-6 py-4">
                  <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-full bg-primary-light text-primary flex items-center justify-center font-bold text-xs">
                      {{ emp.nom.charAt(0) }}{{ emp.prenom.charAt(0) }}
                    </div>
                    <span class="font-bold">{{ emp.nom }} {{ emp.prenom }}</span>
                  </div>
                </td>
                <td class="px-6 py-4 text-text-secondary">
                  <div class="flex flex-col">
                    <span class="text-xs">{{ emp.email }}</span>
                    <span class="text-[10px]">{{ emp.telephone }}</span>
                  </div>
                </td>
                <td class="px-6 py-4">
                  <span class="font-black">{{ emp.leaveDaysRemaining }}</span> <span class="text-xs text-text-muted">days</span>
                </td>
                <td class="px-6 py-4">
                   <span class="badge" [ngClass]="emp.active ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'">
                     {{ emp.active ? 'Available' : 'On Leave' }}
                   </span>
                </td>
                <td class="px-6 py-4 text-right relative">
                   <button (click)="toggleUserMenu(emp.id)" class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-text-muted">
                     <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" /></svg>
                   </button>
                   
                   <!-- Dropdown Menu -->
                   <div *ngIf="activeUserMenuId === emp.id" class="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-2xl border border-border z-50 overflow-hidden py-1">
                     <button (click)="openEditModal(emp)" class="w-full px-4 py-2 text-left text-sm font-bold hover:bg-indigo-50 hover:text-indigo-600 flex items-center gap-2">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        Update User
                     </button>
                     <button (click)="deleteUser(emp)" class="w-full px-4 py-2 text-left text-sm font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-2">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        Delete User
                     </button>
                   </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <app-user-modal 
      *ngIf="showModal" 
      [user]="selectedUser" 
      [role]="modalRole"
      [errorMessage]="modalErrorMessage"
      (close)="showModal = false"
      (save)="handleSave($event)" />
  `
})
export class HrDashboardComponent implements OnInit {
  private dashboardService = inject(DashboardService);
  private userService = inject(UserService);
  private leaveService = inject(LeaveService);

  stats: DashboardStats | null = null;
  employees: User[] = [];
  pendingLeaves: any[] = [];

  activeUserMenuId: number | null = null;
  showModal = false;
  selectedUser?: User;
  modalRole: Role = 'EMPLOYEE';
  modalErrorMessage = '';

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loadStats();
    this.userService.getMyEmployees().subscribe(res => this.employees = res.slice(0, 5));
    this.loadPendingLeaves();
  }

  loadStats() {
    this.dashboardService.getStats().subscribe(res => this.stats = res);
  }

  loadPendingLeaves() {
    this.leaveService.getPendingLeaves().subscribe(res => this.pendingLeaves = res.slice(0, 5));
  }

  onLeaveAction(id: number, type: 'approve' | 'cancel') {
    const obs = type === 'approve' ? this.leaveService.approve(id) : this.leaveService.cancel(id);
    obs.subscribe(() => {
      this.loadPendingLeaves();
      this.loadStats();
    });
  }

  toggleUserMenu(id: number): void {
    this.activeUserMenuId = this.activeUserMenuId === id ? null : id;
  }

  openEditModal(user: User): void {
    this.selectedUser = user;
    this.modalRole = user.role;
    this.modalErrorMessage = '';
    this.showModal = true;
    this.activeUserMenuId = null;
  }

  deleteUser(user: User): void {
    this.activeUserMenuId = null;
    if (confirm(`Are you sure you want to delete ${user.prenom} ${user.nom}?`)) {
      this.userService.deleteEmployee(user.id).subscribe(() => {
        this.loadData();
      });
    }
  }

  handleSave(data: any): void {
    if (!this.selectedUser) return;
    
    this.modalErrorMessage = '';
    this.userService.updateEmployee(this.selectedUser.id, data).subscribe({
      next: () => {
        this.showModal = false;
        this.loadData();
      },
      error: (err) => {
        this.modalErrorMessage = err.error?.message || 'Error updating employee';
      }
    });
  }
}
