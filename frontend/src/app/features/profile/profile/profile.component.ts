import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="max-w-2xl mx-auto space-y-8" *ngIf="authService.currentUser$ | async as user">
      <div>
        <h1 class="text-2xl font-black tracking-tight">Account Settings</h1>
        <p class="text-text-secondary mt-1">Manage your personal information and preferences.</p>
      </div>

      <div class="card p-0 overflow-hidden">
         <div class="h-32 bg-linear-to-br from-primary to-indigo-700"></div>
         <div class="px-8 pb-8 -mt-12">
            <div class="flex items-end justify-between mb-8">
               <div class="w-24 h-24 rounded-3xl bg-white border-4 border-white shadow-xl flex items-center justify-center font-black text-3xl text-primary">
                  {{ user.nom.charAt(0) }}{{ user.prenom.charAt(0) }}
               </div>
               <button class="btn-primary">Update Profile</button>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div class="space-y-1">
                  <label class="text-xs font-black uppercase tracking-widest text-text-muted">First Name</label>
                  <input type="text" [value]="user.prenom" class="form-control" disabled>
               </div>
               <div class="space-y-1">
                  <label class="text-xs font-black uppercase tracking-widest text-text-muted">Last Name</label>
                  <input type="text" [value]="user.nom" class="form-control" disabled>
               </div>
               <div class="space-y-1">
                  <label class="text-xs font-black uppercase tracking-widest text-text-muted">Email Address</label>
                  <input type="email" [value]="user.email" class="form-control" disabled>
               </div>
               <div class="space-y-1">
                  <label class="text-xs font-black uppercase tracking-widest text-text-muted">Phone Number</label>
                  <input type="text" [value]="user.telephone || 'Not set'" class="form-control" disabled>
               </div>
            </div>

            <div class="mt-10 pt-8 border-t border-border">
               <h3 class="font-bold mb-4">Role & Permissions</h3>
               <div class="flex items-center gap-3 p-4 rounded-xl bg-gray-50 border border-border">
                  <div class="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center">
                     <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                  </div>
                  <div>
                     <p class="text-sm font-black">{{ user.role }}</p>
                     <p class="text-xs text-text-muted">You have full access to {{ user.role === 'SUPER_ADMIN' ? 'the entire system' : (user.role === 'ADMIN' ? 'your team management' : 'your personal dashboard') }}.</p>
                  </div>
               </div>
            </div>

            <div class="mt-8 flex justify-end">
               <button class="text-rose-600 text-sm font-bold hover:underline">Deactivate Account</button>
            </div>
         </div>
      </div>
    </div>
  `
})
export class ProfileComponent {
  authService = inject(AuthService);
}
