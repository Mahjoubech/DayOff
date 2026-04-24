import { Component, EventEmitter, Input, Output, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { User, Role } from '../../../core/models/user.model';

@Component({
  selector: 'app-user-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div (click)="$event.stopPropagation()" class="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-border">
        <!-- Header -->
        <div class="px-8 py-6 border-b border-border bg-gray-50/50 flex items-center justify-between">
          <div>
            <h2 class="text-xl font-black tracking-tight">{{ user ? 'Update User' : 'Add New User' }}</h2>
            <p class="text-xs text-text-muted font-bold uppercase tracking-widest mt-1">
              {{ role === 'ADMIN' ? 'HR Manager' : 'Employee' }} Account
            </p>
          </div>
          <button (click)="close.emit()" class="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-white hover:shadow-md transition-all text-text-muted hover:text-rose-500">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <!-- Global Error Alert -->
        <div *ngIf="errorMessage" class="mx-8 mt-6 bg-rose-50 border border-rose-200 text-rose-600 px-4 py-3 rounded-lg text-sm font-bold flex items-start gap-3">
          <svg class="w-5 h-5 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <span>{{ errorMessage }}</span>
        </div>

        <!-- Form -->
        <form [formGroup]="userForm" (ngSubmit)="onSubmit()" class="p-8 space-y-6">
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-1">
              <label class="text-xs font-black uppercase tracking-widest text-text-muted">First Name</label>
              <input type="text" formControlName="prenom" class="form-control" [class.border-rose-500]="userForm.get('prenom')?.invalid && userForm.get('prenom')?.touched" placeholder="John">
              <p class="text-[10px] text-rose-500 font-bold" *ngIf="userForm.get('prenom')?.invalid && userForm.get('prenom')?.touched">First name is required.</p>
            </div>
            <div class="space-y-1">
              <label class="text-xs font-black uppercase tracking-widest text-text-muted">Last Name</label>
              <input type="text" formControlName="nom" class="form-control" [class.border-rose-500]="userForm.get('nom')?.invalid && userForm.get('nom')?.touched" placeholder="Doe">
              <p class="text-[10px] text-rose-500 font-bold" *ngIf="userForm.get('nom')?.invalid && userForm.get('nom')?.touched">Last name is required.</p>
            </div>
          </div>

          <div class="space-y-1">
            <label class="text-xs font-black uppercase tracking-widest text-text-muted">Email Address</label>
            <input type="email" formControlName="email" class="form-control" [class.border-rose-500]="userForm.get('email')?.invalid && userForm.get('email')?.touched" placeholder="john.doe@company.com">
            <p class="text-[10px] text-rose-500 font-bold" *ngIf="userForm.get('email')?.invalid && userForm.get('email')?.touched">Please enter a valid email.</p>
          </div>

          <div class="space-y-1">
            <label class="text-xs font-black uppercase tracking-widest text-text-muted">Phone Number</label>
            <input type="text" formControlName="telephone" class="form-control" [class.border-rose-500]="userForm.get('telephone')?.invalid && userForm.get('telephone')?.touched" placeholder="06 12 34 56 78">
            <p class="text-[10px] text-rose-500 font-bold" *ngIf="userForm.get('telephone')?.invalid && userForm.get('telephone')?.touched">Phone number is required.</p>
          </div>

          <div class="space-y-1" *ngIf="!user">
            <label class="text-xs font-black uppercase tracking-widest text-text-muted">Temporary Password</label>
            <input type="password" formControlName="password" class="form-control" [class.border-rose-500]="userForm.get('password')?.invalid && userForm.get('password')?.touched" placeholder="••••••••">
            <p class="text-[10px] text-rose-500 font-bold" *ngIf="userForm.get('password')?.invalid && userForm.get('password')?.touched">Password must be at least 4 characters.</p>
          </div>

          <!-- Footer -->
          <div class="pt-6 flex gap-3">
            <button type="button" (click)="close.emit()" class="flex-1 h-12 rounded-xl font-bold text-sm border border-border hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button type="submit" [disabled]="userForm.invalid" class="flex-2 h-12 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary-dark transition-all shadow-lg shadow-primary/20 disabled:opacity-50">
              {{ user ? 'Save Changes' : 'Create Account' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class UserModalComponent implements OnInit {
  private fb = inject(FormBuilder);

  @Input() user?: User;
  @Input() role: Role = 'EMPLOYEE';
  @Input() errorMessage = '';
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<any>();

  userForm!: FormGroup;

  ngOnInit(): void {
    this.userForm = this.fb.group({
      prenom: [this.user?.prenom || '', [Validators.required]],
      nom: [this.user?.nom || '', [Validators.required]],
      email: [this.user?.email || '', [Validators.required, Validators.email]],
      telephone: [this.user?.telephone || '', [Validators.required]],
      password: ['', this.user ? [] : [Validators.required, Validators.minLength(4)]]
    });
  }

  onSubmit(): void {
    if (this.userForm.valid) {
      this.save.emit(this.userForm.value);
    }
  }
}
