import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap, filter, map } from 'rxjs/operators';
import { Message } from '../models/message.model';
import { User } from '../models/user.model';
import { environment } from '../../../environments/environment';
import { WebsocketService } from './websocket.service';

@Injectable({ providedIn: 'root' })
export class ChatService {
  private http = inject(HttpClient);
  private wsService = inject(WebsocketService);
  
  private apiUrl = `${environment.apiUrl}/chat`;
  private messagesSubject = new BehaviorSubject<Message[]>([]);
  public messages$ = this.messagesSubject.asObservable();

  private unreadCountsSubject = new BehaviorSubject<Map<number, number>>(new Map());
  public unreadCounts$ = this.unreadCountsSubject.asObservable();

  constructor() {
    // Listen for real-time messages
    this.wsService.getMessages().pipe(
      filter(msg => msg.type === 'CHAT'),
      map(msg => msg.data as Message)
    ).subscribe(newMsg => {
      // Add to messages list
      const currentMsgs = this.messagesSubject.value;
      if (!currentMsgs.some(m => m.id === newMsg.id)) {
        this.messagesSubject.next([...currentMsgs, newMsg]);
      }

      // Increment unread count for the sender (if it's not from self)
      const senderId = newMsg.senderId;
      if (senderId) {
        const counts = new Map(this.unreadCountsSubject.value);
        const currentCount = counts.get(senderId) || 0;
        counts.set(senderId, currentCount + 1);
        this.unreadCountsSubject.next(counts);
      }
    });

    // Initial load of unread counts
    this.loadUnreadCounts();
  }

  private loadUnreadCounts() {
    this.getUnreadMessages().subscribe(msgs => {
      const counts = new Map<number, number>();
      msgs.forEach(m => {
        const senderId = m.senderId;
        if (senderId) {
          counts.set(senderId, (counts.get(senderId) || 0) + 1);
        }
      });
      this.unreadCountsSubject.next(counts);
    });
  }

  getConversation(otherUserId: number): Observable<Message[]> {
    return this.http.get<Message[]>(`${this.apiUrl}/conversation/${otherUserId}`).pipe(
      tap((msgs) => this.messagesSubject.next(msgs))
    );
  }

  getUnreadMessages(): Observable<Message[]> {
    return this.http.get<Message[]>(`${this.apiUrl}/unread`);
  }

  sendMessage(receiverId: number, content: string): Observable<Message> {
    // We can use REST or WS. Let's stick to REST for sending for reliability, 
    // and WS for receiving for speed.
    return this.http.post<Message>(`${this.apiUrl}/send/${receiverId}`, { content }).pipe(
      tap((msg) => {
        const current = this.messagesSubject.value;
        if (!current.some(m => m.id === msg.id)) {
          this.messagesSubject.next([...current, msg]);
        }
      })
    );
  }

  markAsRead(senderId: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/read/${senderId}`, {}).pipe(
      tap(() => {
        const counts = new Map(this.unreadCountsSubject.value);
        counts.delete(senderId);
        this.unreadCountsSubject.next(counts);
      })
    );
  }

  /** Get list of users the current user can chat with based on role */
  getContacts(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/contacts`);
  }
}
