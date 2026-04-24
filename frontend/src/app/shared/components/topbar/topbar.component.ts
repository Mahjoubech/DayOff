import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd, RouterModule } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <header class="h-16 bg-surface border-b border-border flex items-center justify-between px-6 sticky top-0 z-20 shadow-xs">
      <div class="flex items-center gap-4">
        <h2 class="text-lg font-bold text-text-primary">{{ pageTitle }}</h2>
      </div>

      <div class="flex items-center gap-4">
        <!-- Search? -->
        <div class="hidden md:flex relative">
          <input type="text" placeholder="Search..." class="bg-gray-100 border-none rounded-full py-1.5 pl-10 pr-4 text-xs focus:ring-2 focus:ring-primary/20 w-48">
          <svg class="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        </div>

        <!-- Notifications -->
        <button class="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors relative text-text-secondary">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
          <span class="absolute top-2 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-surface"></span>
        </button>

        <!-- Profile -->
        <div class="w-9 h-9 rounded-full bg-primary-light text-primary flex items-center justify-center font-bold text-xs cursor-pointer hover:ring-4 hover:ring-primary/10 transition-all" *ngIf="authService.currentUser$ | async as user">
          {{ user.nom.charAt(0) }}{{ user.prenom.charAt(0) }}
        </div>
      </div>
    </header>
  `
})
export class TopbarComponent {
  authService = inject(AuthService);
  router = inject(Router);
  pageTitle = 'Dashboard';

  constructor() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.updateTitle(event.urlAfterRedirects);
    });
  }

  private updateTitle(url: string) {
    if (url.includes('dashboard')) this.pageTitle = 'Overview';
    else if (url.includes('employees')) this.pageTitle = 'Team Management';
    else if (url.includes('leaves')) this.pageTitle = 'Leave Requests';
    else if (url.includes('attendance')) this.pageTitle = 'Attendance Tracking';
    else if (url.includes('chat')) this.pageTitle = 'Messages';
    else if (url.includes('notifications')) this.pageTitle = 'Notifications Center';
    else if (url.includes('profile')) this.pageTitle = 'My Profile';
    else this.pageTitle = 'DayOff';
  }
}
