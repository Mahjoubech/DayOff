import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { ChatService } from '../../../core/services/chat.service';
import { map, startWith, switchMap, timer } from 'rxjs';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <aside class="w-64 h-screen bg-surface border-r border-border flex flex-col fixed left-0 top-0 z-30 transition-transform lg:translate-x-0" [class.-translate-x-full]="!isMobileMenuOpen">
      <!-- Logo -->
      <div class="h-16 flex items-center px-6 gap-3 border-b border-border">
        <div class="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-lg shadow-primary/20">
          <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <span class="text-xl font-bold tracking-tight">Day<span class="text-primary">Off</span></span>
      </div>

      <!-- User Info -->
      <div class="p-6 border-b border-border bg-gray-50/50" *ngIf="authService.currentUser$ | async as user">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold shadow-md shadow-primary/10">
            {{ user.nom.charAt(0) }}{{ user.prenom.charAt(0) }}
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-semibold truncate">{{ user.nom }} {{ user.prenom }}</p>
            <p class="text-xs text-text-muted truncate uppercase tracking-wider">{{ user.role }}</p>
          </div>
        </div>
      </div>

      <!-- Nav -->
      <nav class="flex-1 overflow-y-auto p-4 space-y-1">
        <a routerLink="/dashboard" routerLinkActive="bg-primary-light text-primary" [routerLinkActiveOptions]="{exact: false}" class="flex items-center gap-3 px-4 py-2.5 rounded-lg text-text-secondary hover:bg-gray-100 transition-colors">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
          <span class="font-medium text-sm">Dashboard</span>
        </a>

        <a *ngIf="userRole === 'SUPER_ADMIN' || userRole === 'ADMIN'" routerLink="/employees" routerLinkActive="bg-primary-light text-primary" class="flex items-center gap-3 px-4 py-2.5 rounded-lg text-text-secondary hover:bg-gray-100 transition-colors">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
          <span class="font-medium text-sm">Employees</span>
        </a>

        <a routerLink="/leaves" routerLinkActive="bg-primary-light text-primary" class="flex items-center gap-3 px-4 py-2.5 rounded-lg text-text-secondary hover:bg-gray-100 transition-colors">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          <span class="font-medium text-sm">Leaves</span>
        </a>

        <a routerLink="/attendance" routerLinkActive="bg-primary-light text-primary" class="flex items-center gap-3 px-4 py-2.5 rounded-lg text-text-secondary hover:bg-gray-100 transition-colors">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <span class="font-medium text-sm">Attendance</span>
        </a>

        <a routerLink="/chat" routerLinkActive="bg-primary-light text-primary" class="flex items-center justify-between gap-3 px-4 py-2.5 rounded-lg text-text-secondary hover:bg-gray-100 transition-colors">
          <div class="flex items-center gap-3">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
            <span class="font-medium text-sm">Chat</span>
          </div>
          <span *ngIf="(unreadChatCount$ | async) as count" class="bg-indigo-600 text-white text-[10px] min-w-[18px] h-[18px] flex items-center justify-center rounded-full font-black shadow-sm">
            {{ count }}
          </span>
        </a>

        <a routerLink="/notifications" routerLinkActive="bg-primary-light text-primary" class="flex items-center justify-between gap-3 px-4 py-2.5 rounded-lg text-text-secondary hover:bg-gray-100 transition-colors">
          <div class="flex items-center gap-3">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
            <span class="font-medium text-sm">Notifications</span>
          </div>
          <span *ngIf="(unreadNotifCount$ | async) as count" class="bg-indigo-600 text-white text-[10px] min-w-[18px] h-[18px] flex items-center justify-center rounded-full font-black shadow-sm">
            {{ count }}
          </span>
        </a>
      </nav>

      <!-- Footer -->
      <div class="p-4 border-t border-border">
        <button (click)="logout()" class="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
          <span class="font-medium text-sm">Logout</span>
        </button>
      </div>
    </aside>
  `
})
export class SidebarComponent {
  authService = inject(AuthService);
  private notifService = inject(NotificationService);
  private chatService = inject(ChatService);

  userRole = this.authService.getRole();
  isMobileMenuOpen = true; // For now

  // Poll for unread counts every 30 seconds as fallback to WS
  unreadNotifCount$ = timer(0, 30000).pipe(
    switchMap(() => this.notifService.getUnreadCount()),
    map(res => res.count),
    startWith(0)
  );

  unreadChatCount$ = timer(0, 30000).pipe(
    switchMap(() => this.chatService.getUnreadMessages()),
    map(msgs => msgs.length),
    startWith(0)
  );

  logout() {
    this.authService.logout();
    window.location.href = '/login';
  }
}
