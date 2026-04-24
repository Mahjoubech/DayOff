import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService } from '../../../core/services/dashboard.service';
import { UserService } from '../../../core/services/user.service';
import { DashboardStats } from '../../../core/models/dashboard.model';
import { User, Role } from '../../../core/models/user.model';
import { UserModalComponent } from '../../../shared/components/user-modal/user-modal.component';

@Component({
  selector: 'app-superadmin-dashboard',
  standalone: true,
  imports: [CommonModule, UserModalComponent],
  template: `
    <div class="space-y-8" *ngIf="stats">
      <!-- Welcome Header -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-black tracking-tight">System Overview</h1>
          <p class="text-text-secondary mt-1">Global statistics and administration control.</p>
        </div>
        <div class="flex gap-2">
          <button class="btn-primary">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" /></svg>
            Add New Admin
          </button>
        </div>
      </div>

      <!-- Stats Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div class="card p-5 flex items-center gap-5 group hover:border-primary/50 transition-all cursor-pointer">
          <div class="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
            <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2m16-10a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
          </div>
          <div>
            <p class="text-sm font-bold text-text-muted">Total Users</p>
            <h3 class="text-3xl font-black text-text-primary">{{ stats.totalUsers }}</h3>
          </div>
        </div>

        <div class="card p-5 flex items-center gap-5 group hover:border-primary/50 transition-all cursor-pointer">
          <div class="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
            <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <div>
            <p class="text-sm font-bold text-text-muted">Pending Leaves</p>
            <h3 class="text-3xl font-black text-text-primary">{{ stats.pendingLeaveRequests }}</h3>
          </div>
        </div>

        <div class="card p-5 flex items-center gap-5 group hover:border-primary/50 transition-all cursor-pointer">
          <div class="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
            <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <div>
            <p class="text-sm font-bold text-text-muted">Attendance Rate</p>
            <h3 class="text-3xl font-black text-text-primary">94%</h3>
          </div>
        </div>

        <div class="card p-5 flex items-center gap-5 group hover:border-primary/50 transition-all cursor-pointer">
          <div class="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center group-hover:scale-110 transition-transform">
            <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <div>
            <p class="text-sm font-bold text-text-muted">Avg Leave Days</p>
            <h3 class="text-3xl font-black text-text-primary">{{ stats.averageLeaveDaysRemaining }}</h3>
          </div>
        </div>
      </div>

      <!-- Recent Users Table -->
      <div class="card overflow-hidden">
        <div class="p-6 border-b border-border flex items-center justify-between">
          <h3 class="text-lg font-bold">Recent Registrations</h3>
          <button class="text-primary font-bold text-sm hover:underline">View All Users</button>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="bg-gray-50/50">
                <th class="px-6 py-4">User</th>
                <th class="px-6 py-4">Email</th>
                <th class="px-6 py-4">Role</th>
                <th class="px-6 py-4">Status</th>
                <th class="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let user of users" class="hover:bg-gray-50/30 transition-colors">
                <td class="px-6 py-4">
                  <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xs">
                      {{ user.nom.charAt(0) }}{{ user.prenom.charAt(0) }}
                    </div>
                    <span class="font-bold">{{ user.nom }} {{ user.prenom }}</span>
                  </div>
                </td>
                <td class="px-6 py-4 text-text-secondary">{{ user.email }}</td>
                <td class="px-6 py-4">
                  <span class="badge" [ngClass]="{
                    'bg-indigo-100 text-indigo-800': user.role === 'SUPER_ADMIN',
                    'bg-amber-100 text-amber-800': user.role === 'ADMIN',
                    'bg-gray-100 text-gray-800': user.role === 'EMPLOYEE'
                  }">{{ user.role }}</span>
                </td>
                <td class="px-6 py-4">
                  <div class="flex items-center">
                    <span class="status-dot" [ngClass]="user.active ? 'status-dot-online' : 'status-dot-offline'"></span>
                    <span class="text-sm font-medium">{{ user.active ? 'Active' : 'Inactive' }}</span>
                  </div>
                </td>
                <td class="px-6 py-4 text-right relative">
                  <button (click)="toggleMenu(user.id)" class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-text-muted">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" /></svg>
                  </button>
                  
                  <!-- Dropdown Menu -->
                  <div *ngIf="activeMenuId === user.id" class="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-2xl border border-border z-50 overflow-hidden py-1">
                    <button (click)="openEditModal(user)" class="w-full px-4 py-2 text-left text-sm font-bold hover:bg-indigo-50 hover:text-indigo-600 flex items-center gap-2">
                       <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                       Update User
                    </button>
                    <button (click)="deleteUser(user)" class="w-full px-4 py-2 text-left text-sm font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-2">
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
export class SuperadminDashboardComponent implements OnInit {
  private dashboardService = inject(DashboardService);
  private userService = inject(UserService);

  stats: DashboardStats | null = null;
  users: User[] = [];

  activeMenuId: number | null = null;
  showModal = false;
  selectedUser?: User;
  modalRole: Role = 'EMPLOYEE';
  modalErrorMessage = '';

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.dashboardService.getStats().subscribe(res => this.stats = res);
    this.userService.getAllUsers().subscribe(res => this.users = res.slice(0, 5));
  }

  toggleMenu(id: number): void {
    this.activeMenuId = this.activeMenuId === id ? null : id;
  }

  openEditModal(user: User): void {
    this.selectedUser = user;
    this.modalRole = user.role;
    this.modalErrorMessage = '';
    this.showModal = true;
    this.activeMenuId = null;
  }

  deleteUser(user: User): void {
    this.activeMenuId = null;
    if (confirm(`Are you sure you want to delete ${user.prenom} ${user.nom}?`)) {
      this.userService.deleteUser(user.id).subscribe(() => {
        this.loadData();
      });
    }
  }

  handleSave(data: any): void {
    if (!this.selectedUser) return;
    
    this.modalErrorMessage = '';
    this.userService.updateUser(this.selectedUser.id, data).subscribe({
      next: () => {
        this.showModal = false;
        this.loadData();
      },
      error: (err) => {
        this.modalErrorMessage = err.error?.message || 'Error updating user';
      }
    });
  }
}
