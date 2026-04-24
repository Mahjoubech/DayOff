import { Injectable } from '@angular/core';
import { Client, Message } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';
import { Subject, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class WebsocketService {
  private client: Client | null = null;
  private messageSubject = new Subject<any>();

  constructor(private authService: AuthService) {}

  /**
   * Connect to the STOMP broker via SockJS
   */
  connect(): void {
    const token = this.authService.getToken();
    if (!token || this.client?.active) return;

    this.client = new Client({
      webSocketFactory: () => new SockJS(`${environment.wsUrl}`),
      connectHeaders: {
        Authorization: `Bearer ${token}`
      },
      debug: (str) => {
        // console.log('[STOMP] ' + str);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        console.log('[STOMP] Connected');
        // Subscribe to user-specific messages (chat and notifications)
        const currentUser = this.authService.getCurrentUser();
        if (currentUser) {
           this.subscribeToUserTopics(currentUser.id);
        }
      },
      onStompError: (frame) => {
        console.error('[STOMP] Broker error: ' + frame.headers['message']);
        console.error('[STOMP] Additional details: ' + frame.body);
      },
      onWebSocketClose: () => {
        console.log('[STOMP] Connection closed');
      }
    });

    this.client.activate();
  }

  private subscribeToUserTopics(userId: number): void {
    if (!this.client) return;

    // Subscribe to chat messages
    this.client.subscribe(`/topic/chat/${userId}`, (message: Message) => {
      this.messageSubject.next({
        type: 'CHAT',
        data: JSON.parse(message.body)
      });
    });

    // Subscribe to notifications
    this.client.subscribe(`/topic/notifications/${userId}`, (message: Message) => {
      this.messageSubject.next({
        type: 'NOTIFICATION',
        data: JSON.parse(message.body)
      });
    });
  }

  /**
   * Send a message to a STOMP destination
   */
  send(destination: string, body: any): void {
    if (this.client && this.client.connected) {
      this.client.publish({
        destination,
        body: JSON.stringify(body)
      });
    } else {
      console.warn('[STOMP] Cannot send message: not connected');
    }
  }

  /**
   * Listen for incoming messages of all types
   */
  getMessages(): Observable<any> {
    return this.messageSubject.asObservable();
  }

  disconnect(): void {
    if (this.client) {
      this.client.deactivate();
      this.client = null;
    }
  }
}
