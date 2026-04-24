import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../../../core/services/chat.service';
import { AuthService } from '../../../core/services/auth.service';
import { Message } from '../../../core/models/message.model';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-chat-shell',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="h-[calc(100vh-160px)] flex gap-6">
      <!-- Sidebar / Contacts -->
      <div class="w-80 flex flex-col gap-4">
        <div class="card p-0 flex-1 flex flex-col overflow-hidden">
          <div class="p-4 border-b border-border bg-gray-50/50">
             <input type="text" placeholder="Search contacts..." class="w-full bg-white border border-border rounded-lg px-3 py-2 text-sm outline-hidden focus:ring-2 focus:ring-primary/10">
          </div>
          <div class="flex-1 overflow-y-auto">
             <div *ngFor="let contact of contacts" 
                  (click)="selectContact(contact)"
                  [class.bg-primary-light]="selectedContact?.id === contact.id"
                  class="flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-50 transition-colors border-b border-border last:border-0">
                <div class="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xs relative">
                   {{ contact.nom.charAt(0) }}{{ contact.prenom.charAt(0) }}
                   <span class="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></span>
                </div>
                <div class="flex-1 min-w-0">
                   <div class="flex items-center justify-between gap-2">
                     <p class="text-sm font-bold truncate">{{ contact.nom }} {{ contact.prenom }}</p>
                     <span *ngIf="unreadCounts.get(contact.id)" class="bg-indigo-600 text-white text-[10px] min-w-[18px] h-[18px] flex items-center justify-center rounded-full font-black shadow-sm shrink-0">
                        {{ unreadCounts.get(contact.id) }}
                     </span>
                   </div>
                   <p class="text-xs text-text-muted truncate">{{ contact.role }}</p>
                </div>
             </div>
          </div>
        </div>
      </div>

      <!-- Chat Area -->
      <div class="flex-1 flex flex-col min-w-0">
        <div class="card p-0 flex-1 flex flex-col overflow-hidden">
          <ng-container *ngIf="selectedContact; else noSelect">
            <!-- Header -->
            <div class="p-3 border-b border-border/50 shadow-sm flex items-center justify-between bg-white/95 backdrop-blur-md sticky top-0 z-10">
               <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center font-bold relative">
                     {{ selectedContact.nom.charAt(0) }}{{ selectedContact.prenom.charAt(0) }}
                     <span class="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                  </div>
                  <div class="flex flex-col justify-center">
                     <h3 class="font-bold text-[15px] leading-tight text-gray-900">{{ selectedContact.prenom }} {{ selectedContact.nom }}</h3>
                     <p class="text-[12px] text-gray-500 font-medium">Active now</p>
                  </div>
               </div>
               <div class="flex items-center gap-4 text-[#0084ff]">
                  <button class="hover:bg-gray-100 p-2 rounded-full transition-colors">
                     <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.026 22.957c10.957-11.421-2.326-23.815-13.743-12.82V7.128C14.704-5.305 29.412 8.444 17.026 22.957zM11.11 14.186a1.002 1.002 0 01-.177 1.404c-1.398 1.033-2.924 1.706-4.535 2.001A1.001 1.001 0 015 16.608v-2.827a1 1 0 01.684-.948l2.928-.976a1 1 0 011.042.235l1.456 1.456zM8.384 10.158l-1.456-1.456a1 1 0 01-.235-1.042l.976-2.928A1 1 0 018.617 4h2.827a1.001 1.001 0 01.983 1.189c-.295 1.611-.968 3.137-2.001 4.535a1.002 1.002 0 01-1.404.177l-.638-.743z"/></svg>
                  </button>
                  <button class="hover:bg-gray-100 p-2 rounded-full transition-colors">
                     <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm0 15v-4H8v-2h4V7l5 5-5 5z"/></svg>
                  </button>
               </div>
            </div>

             <!-- Messages -->
            <div class="flex-1 overflow-y-auto p-6 space-y-6 bg-white">
               <div *ngFor="let msg of messages" class="flex gap-4 w-full">
                  
                  <!-- Avatar -->
                  <div class="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 uppercase"
                       [class.bg-[#f3f2ef]]="getSenderId(msg) === currentUserId"
                       [class.text-gray-800]="getSenderId(msg) === currentUserId"
                       [class.bg-gray-200]="getSenderId(msg) !== currentUserId"
                       [class.text-gray-700]="getSenderId(msg) !== currentUserId">
                     {{ getSenderInitials(msg) }}
                  </div>

                  <!-- Content -->
                  <div class="flex flex-col min-w-0">
                     <div class="flex items-center gap-2 mb-1">
                        <span class="font-bold text-[15px] text-gray-900 truncate hover:text-[#0a66c2] hover:underline cursor-pointer">
                           {{ getSenderName(msg) }}
                        </span>
                        <span class="text-xs font-semibold text-gray-500">•</span>
                        <span class="text-[12px] text-gray-500">{{ msg.timestamp | date:'h:mm a' }}</span>
                     </div>
                     <p class="text-[14px] text-gray-800 leading-relaxed whitespace-pre-wrap">{{ msg.content }}</p>
                  </div>
                  
               </div>
               <div *ngIf="messages.length === 0" class="text-center py-20 text-text-muted italic text-sm">
                  Start a conversation with {{ selectedContact.prenom }}.
               </div>
            </div>

            <!-- Input -->
            <div class="p-4 bg-white border-t border-border/50">
               <form (ngSubmit)="sendMessage()" class="flex items-center gap-2">
                  <div class="flex-1 relative">
                     <input type="text" [(ngModel)]="newMessage" name="msg" placeholder="Aa" class="w-full bg-[#f0f2f5] text-[15px] placeholder-gray-500 rounded-full px-4 py-2.5 outline-none focus:bg-[#e4e6eb] transition-colors">
                  </div>
                  <button type="submit" class="w-10 h-10 text-[#0084ff] rounded-full flex items-center justify-center hover:bg-gray-100 transition-all disabled:opacity-50 disabled:hover:bg-transparent" [disabled]="!newMessage.trim()">
                     <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
                  </button>
               </form>
            </div>
          </ng-container>

          <ng-template #noSelect>
            <div class="flex-1 flex flex-col items-center justify-center text-center p-12 opacity-50">
               <div class="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <svg class="w-10 h-10 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
               </div>
               <h3 class="text-xl font-black">Messages</h3>
               <p class="text-sm mt-2">Select a contact to start chatting in real-time.</p>
            </div>
          </ng-template>
        </div>
      </div>
    </div>
  `
})
export class ChatShellComponent implements OnInit {
  private chatService = inject(ChatService);
  private authService = inject(AuthService);

  contacts: User[] = [];
  messages: Message[] = [];
  selectedContact: User | null = null;
  unreadCounts = new Map<number, number>();
  newMessage = '';
  currentUser = this.authService.getCurrentUser();
  currentUserId = this.currentUser?.id;

  ngOnInit(): void {
    // Load contacts
    this.chatService.getContacts().subscribe(res => {
      this.contacts = res.filter(u => u.id !== this.currentUserId);
    });

    // Listen for real-time messages and update the local list
    this.chatService.messages$.subscribe(msgs => {
      this.messages = msgs;
      this.scrollToBottom();
    });

    // Track unread counts
    this.chatService.unreadCounts$.subscribe(counts => {
      this.unreadCounts = counts;
    });
  }

  selectContact(contact: User) {
    this.selectedContact = contact;
    this.chatService.getConversation(contact.id).subscribe(() => {
      this.chatService.markAsRead(contact.id).subscribe();
    });
  }

  sendMessage() {
    if (this.selectedContact && this.newMessage.trim()) {
      const content = this.newMessage;
      this.newMessage = ''; // Clear early for better UX
      this.chatService.sendMessage(this.selectedContact.id, content).subscribe();
    }
  }

  getSenderId(msg: any): number {
    return msg.sender?.id || msg.senderId;
  }

  getSenderName(msg: any): string {
    if (msg.sender && msg.sender.prenom) {
      return `${msg.sender.prenom} ${msg.sender.nom}`;
    }
    if (this.getSenderId(msg) === this.currentUserId) {
      return `${this.currentUser?.prenom} ${this.currentUser?.nom}`;
    }
    return `${this.selectedContact?.prenom} ${this.selectedContact?.nom}`;
  }

  getSenderInitials(msg: any): string {
    if (msg.sender && msg.sender.nom) {
      return `${msg.sender.nom.charAt(0)}${msg.sender.prenom.charAt(0)}`;
    }
    if (this.getSenderId(msg) === this.currentUserId) {
      return `${this.currentUser?.nom?.charAt(0)}${this.currentUser?.prenom?.charAt(0)}`;
    }
    if (this.selectedContact) {
      return `${this.selectedContact.nom.charAt(0)}${this.selectedContact.prenom.charAt(0)}`;
    }
    return '';
  }

  private scrollToBottom() {
    setTimeout(() => {
      const container = document.querySelector('.overflow-y-auto');
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    }, 100);
  }
}
