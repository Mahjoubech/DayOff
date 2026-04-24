import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="card w-full max-w-md p-8 bg-surface shadow-2xl shadow-primary/10">
      <div class="text-center mb-10">
        <div class="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/20 rotate-3">
          <svg class="w-8 h-8 text-white -rotate-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <h1 class="text-3xl font-black tracking-tight text-text-primary">Welcome Back</h1>
        <p class="text-text-muted mt-2">Sign in to manage your DayOff</p>
      </div>

      <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="space-y-6">
        <div class="space-y-2">
          <label class="text-sm font-semibold text-text-secondary ml-1">Email Address</label>
          <div class="relative">
            <input type="email" formControlName="email" placeholder="name@company.com" class="form-control pl-11" [class.border-rose-500]="loginForm.get('email')?.invalid && loginForm.get('email')?.touched">
            <svg class="w-5 h-5 text-text-muted absolute left-4 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.206" /></svg>
          </div>
          <p class="text-xs text-rose-500 mt-1" *ngIf="loginForm.get('email')?.invalid && loginForm.get('email')?.touched">Please enter a valid email.</p>
        </div>

        <div class="space-y-2">
          <label class="text-sm font-semibold text-text-secondary ml-1">Password</label>
          <div class="relative">
            <input [type]="showPassword ? 'text' : 'password'" formControlName="password" placeholder="••••••••" class="form-control pl-11 pr-12" [class.border-rose-500]="loginForm.get('password')?.invalid && loginForm.get('password')?.touched">
            <svg class="w-5 h-5 text-text-muted absolute left-4 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
            <button type="button" class="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-primary transition-colors" (click)="showPassword = !showPassword">
              <svg *ngIf="!showPassword" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
              <svg *ngIf="showPassword" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.97 9.97 0 011.563-3.076m1.133-2.082A10.16 10.16 0 0112 5c4.478 0 8.268 2.943 9.542 7a10.028 10.028 0 01-1.655 3.32M9.172 9.172L15.828 15.828M21 21l-2.022-2.022M3 3l2.022 2.022" /></svg>
            </button>
          </div>
          <p class="text-xs text-rose-500 mt-1" *ngIf="loginForm.get('password')?.invalid && loginForm.get('password')?.touched">Password is required.</p>
        </div>

        <div class="flex items-center justify-between py-1">
          <label class="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" class="w-4 h-4 rounded text-primary border-border focus:ring-primary/20 cursor-pointer">
            <span class="text-xs text-text-secondary font-medium">Remember me</span>
          </label>
          <a href="#" class="text-xs font-bold text-primary hover:underline underline-offset-4">Forgot password?</a>
        </div>

        <div class="bg-rose-50 border border-rose-200 text-rose-600 p-3 rounded-lg text-xs font-semibold text-center animate-in fade-in slide-in-from-top-2" *ngIf="errorMessage">
          {{ errorMessage }}
        </div>

        <button type="submit" class="btn-primary w-full h-12 text-lg shadow-xl shadow-primary/20" [disabled]="loginForm.invalid || isLoading">
          <span *ngIf="!isLoading">Sign In</span>
          <div *ngIf="isLoading" class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
        </button>
      </form>

      <div class="mt-8 text-center border-t border-border pt-6">
        <p class="text-xs text-text-muted">DayOff Internal HR System v1.2</p>
      </div>
    </div>
  `
})
export class LoginComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });

  showPassword = false;
  isLoading = false;
  errorMessage = '';

  ngOnInit(): void {
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
    }
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      const { email, password } = this.loginForm.getRawValue();
      
      this.authService.login(email!, password!).subscribe({
        next: () => {
          this.isLoading = false;
          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          this.isLoading = false;
          this.errorMessage = 'Invalid email or password. Please try again.';
          console.error(err);
        }
      });
    }
  }
}
