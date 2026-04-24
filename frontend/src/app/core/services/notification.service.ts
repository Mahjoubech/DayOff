import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap, filter, map } from 'rxjs/operators';
import { Notification } from '../models/notification.model';
import { environment } from '../../../environments/environment';
import { WebsocketService } from './websocket.service';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private http = inject(HttpClient);
  private wsService = inject(WebsocketService);
  
  private apiUrl = `${environment.apiUrl}/notifications`;
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  public notifications$ = this.notificationsSubject.asObservable();

  constructor() {
    // Listen for real-time notifications
    this.wsService.getMessages().pipe(
      filter(msg => msg.type === 'NOTIFICATION'),
      map(msg => msg.data as Notification)
    ).subscribe(newNotif => {
      const current = this.notificationsSubject.value;
      this.notificationsSubject.next([newNotif, ...current]);
    });
  }

  getNotifications(): Observable<Notification[]> {
    return this.http.get<Notification[]>(this.apiUrl).pipe(
      tap(notifs => this.notificationsSubject.next(notifs))
    );
  }

  getUnread(): Observable<Notification[]> {
    return this.http.get<Notification[]>(`${this.apiUrl}/unread`);
  }

  getUnreadCount(): Observable<{ count: number }> {
    return this.http.get<{ count: number }>(`${this.apiUrl}/unread/count`);
  }

  markAsRead(id: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/read`, {}).pipe(
      tap(() => {
        const current = this.notificationsSubject.value.map(n => 
          n.id === id ? { ...n, read: true } : n
        );
        this.notificationsSubject.next(current);
      })
    );
  }

  markAllAsRead(): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/read-all`, {}).pipe(
      tap(() => {
        const current = this.notificationsSubject.value.map(n => ({ ...n, read: true }));
        this.notificationsSubject.next(current);
      })
    );
  }
}
