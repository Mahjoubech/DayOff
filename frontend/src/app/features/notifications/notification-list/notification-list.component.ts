import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../../core/services/notification.service';
import { Notification } from '../../../core/models/notification.model';

@Component({
  selector: 'app-notification-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="max-w-4xl mx-auto space-y-8">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-black tracking-tight">Notifications</h1>
          <p class="text-text-secondary mt-1">Keep track of your leave status and messages.</p>
        </div>
        <button class="text-primary text-sm font-bold hover:underline" (click)="markAllAsRead()">Mark all as read</button>
      </div>

      <div class="space-y-4">
         <div *ngFor="let note of notifications" 
              [ngClass]="{
                'bg-white': note.isRead,
                'bg-primary-light/30': !note.isRead,
                'border-primary/20': !note.isRead
              }"
              class="card p-4 flex gap-4 items-start transition-all border shadow-xs hover:shadow-md cursor-pointer"
              (click)="markAsRead(note)">
            
            <div class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm"
                 [ngClass]="{
                   'bg-emerald-100 text-emerald-600': note.type === 'LEAVE_APPROVED',
                   'bg-rose-100 text-rose-600': note.type === 'LEAVE_REJECTED',
                   'bg-indigo-100 text-indigo-600': note.type === 'NEW_MESSAGE',
                   'bg-amber-100 text-amber-600': note.type === 'NEW_EMPLOYEE'
                 }">
               <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path *ngIf="note.type === 'LEAVE_APPROVED'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  <path *ngIf="note.type === 'LEAVE_REJECTED'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  <path *ngIf="note.type === 'NEW_MESSAGE'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  <path *ngIf="note.type === 'NEW_EMPLOYEE'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
               </svg>
            </div>

            <div class="flex-1">
               <div class="flex items-center justify-between">
                  <span class="text-xs font-black uppercase tracking-widest text-text-muted">{{ note.type.replace('_', ' ') }}</span>
                  <span class="text-[10px] text-text-muted">{{ note.createdAt | date:'MMM d, HH:mm' }}</span>
               </div>
               <p class="text-sm font-medium mt-1 text-text-primary">{{ note.content }}</p>
            </div>

            <div *ngIf="!note.isRead" class="w-2 h-2 bg-primary rounded-full mt-2"></div>
         </div>

         <div *ngIf="notifications.length === 0" class="text-center py-20 opacity-50 flex flex-col items-center">
            <svg class="w-16 h-16 text-text-muted mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
            <p class="font-bold">No notifications yet</p>
            <p class="text-sm">We'll let you know when something important happens.</p>
         </div>
      </div>
    </div>
  `
})
export class NotificationListComponent implements OnInit {
  private noteService = inject(NotificationService);
  notifications: Notification[] = [];

  ngOnInit(): void {
    this.loadNotes();
  }

  loadNotes() {
    this.noteService.getNotifications().subscribe(res => this.notifications = res);
  }

  markAsRead(note: Notification) {
    if (!note.isRead) {
      this.noteService.markAsRead(note.id).subscribe(() => this.loadNotes());
    }
  }

  markAllAsRead() {
    this.noteService.markAllAsRead().subscribe(() => this.loadNotes());
  }
}
