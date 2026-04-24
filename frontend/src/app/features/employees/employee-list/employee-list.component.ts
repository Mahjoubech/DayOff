import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../../../core/services/user.service';
import { AuthService } from '../../../core/services/auth.service';
import { User, Role } from '../../../core/models/user.model';
import { UserModalComponent } from '../../../shared/components/user-modal/user-modal.component';

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [CommonModule, UserModalComponent],
  template: `
    <div class="space-y-8">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-black tracking-tight">{{ title }}</h1>
          <p class="text-text-secondary mt-1">{{ subtitle }}</p>
        </div>
        <div class="flex gap-2">
           <!-- SuperAdmin only buttons -->
           <ng-container *ngIf="userRole === 'SUPER_ADMIN'">
              <button (click)="openAddModal('ADMIN')" class="btn-primary bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
                Add HR Manager
              </button>
              <button (click)="openAddModal('EMPLOYEE')" class="btn-primary">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
                Add Employee
              </button>
           </ng-container>

           <!-- HR only button -->
           <button *ngIf="userRole === 'ADMIN'" (click)="openAddModal('EMPLOYEE')" class="btn-primary">
             <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v3m0 0v3m0-3h3m-3 0h-3" /></svg>
             Add Employee
           </button>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         <div *ngFor="let emp of employees" class="card group hover:border-primary transition-all p-0 overflow-hidden relative">
            <!-- Delete Button (Top Right) -->
            <button (click)="deleteUser(emp)" class="absolute top-4 right-4 w-8 h-8 rounded-xl bg-white/20 backdrop-blur-md text-white opacity-0 group-hover:opacity-100 hover:bg-rose-500 hover:text-white transition-all z-10 flex items-center justify-center">
               <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </button>

            <div class="h-20 bg-linear-to-br from-primary/10 to-indigo-500/5 border-b border-border"></div>
            <div class="px-6 pb-6 -mt-10">
               <div class="w-20 h-20 rounded-2xl bg-white border-4 border-white shadow-xl flex items-center justify-center font-black text-2xl text-primary">
                  {{ emp.nom.charAt(0) }}{{ emp.prenom.charAt(0) }}
               </div>
               
               <div class="mt-4">
                  <h3 class="text-lg font-black tracking-tight group-hover:text-primary transition-colors">{{ emp.nom }} {{ emp.prenom }}</h3>
                  <p class="text-xs font-bold text-text-muted uppercase tracking-widest">{{ emp.role }}</p>
               </div>

               <div class="mt-6 space-y-3">
                  <div class="flex items-center gap-3 text-sm text-text-secondary">
                     <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                     <span class="truncate">{{ emp.email }}</span>
                  </div>
                  <div class="flex items-center gap-3 text-sm text-text-secondary">
                     <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                     <span>{{ emp.telephone }}</span>
                  </div>
               </div>

               <div class="mt-8 pt-6 border-t border-border flex items-center justify-between">
                  <div class="flex flex-col">
                     <span class="text-[10px] font-black text-text-muted uppercase">Leave Days</span>
                     <span class="text-sm font-black">{{ emp.leaveDaysRemaining }} / 30</span>
                  </div>
                  <button (click)="openEditModal(emp)" class="w-8 h-8 flex items-center justify-center rounded-full bg-gray-50 text-text-muted hover:bg-primary hover:text-white transition-all">
                     <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                  </button>
               </div>
            </div>
         </div>
      </div>

      <!-- No Data State -->
      <div *ngIf="employees.length === 0" class="flex flex-col items-center justify-center py-20 text-center opacity-50">
         <div class="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <svg class="w-10 h-10 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
         </div>
         <h3 class="text-lg font-black">No users found</h3>
         <p class="text-sm mt-1">Get started by adding your first team member.</p>
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
export class EmployeeListComponent implements OnInit {
  private userService = inject(UserService);
  private authService = inject(AuthService);

  employees: User[] = [];
  userRole: Role | null = this.authService.getRole();
  
  showModal = false;
  selectedUser?: User;
  modalRole: Role = 'EMPLOYEE';
  modalErrorMessage = '';

  get title() {
    return this.userRole === 'SUPER_ADMIN' ? 'Company Directory' : 'Team Management';
  }

  get subtitle() {
    return this.userRole === 'SUPER_ADMIN' ? 'Manage all HR managers and company employees.' : 'Directory of your department employees.';
  }

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    if (this.userRole === 'SUPER_ADMIN') {
      this.userService.getAllUsers().subscribe(res => this.employees = res);
    } else {
      this.userService.getMyEmployees().subscribe(res => this.employees = res);
    }
  }

  openAddModal(role: Role): void {
    console.log('Add Button Clicked - Role:', role);
    this.selectedUser = undefined;
    this.modalRole = role;
    this.modalErrorMessage = '';
    this.showModal = true;
  }

  openEditModal(user: User): void {
    console.log('Edit Button Clicked - User:', user);
    this.selectedUser = user;
    this.modalRole = user.role;
    this.modalErrorMessage = '';
    this.showModal = true;
  }

  handleSave(data: any): void {
    console.log('Saving User Data:', data);
    this.modalErrorMessage = '';
    
    const onNext = () => {
      this.showModal = false;
      this.loadUsers();
    };
    
    const onError = (err: any) => {
      this.modalErrorMessage = err.error?.message || 'An unexpected error occurred while saving the user.';
      console.error(err);
    };

    if (this.selectedUser) {
      // Update
      const updateFn = this.userRole === 'SUPER_ADMIN' 
        ? this.userService.updateUser(this.selectedUser.id, data)
        : this.userService.updateEmployee(this.selectedUser.id, data);

      updateFn.subscribe({ next: onNext, error: onError });
    } else {
      // Create
      let createFn;
      if (this.userRole === 'SUPER_ADMIN') {
        createFn = this.modalRole === 'ADMIN' 
          ? this.userService.createAdmin(data) 
          : this.userService.createEmployeeAsAdmin(data);
      } else {
        createFn = this.userService.createEmployee(data);
      }

      createFn.subscribe({ next: onNext, error: onError });
    }
  }

  deleteUser(user: User): void {
    if (confirm(`Are you sure you want to delete ${user.prenom} ${user.nom}?`)) {
      const deleteFn = this.userRole === 'SUPER_ADMIN'
        ? this.userService.deleteUser(user.id)
        : this.userService.deleteEmployee(user.id);

      deleteFn.subscribe(() => {
        this.loadUsers();
      });
    }
  }
}
