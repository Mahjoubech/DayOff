export interface Message {
  id: number;
  content: string;
  timestamp: string;
  isRead: boolean;
  senderId: number;
  senderName?: string;
  receiverId: number;
  receiverName?: string;
}

export interface SendMessageRequest {
  content: string;
}

export interface WsSendMessage {
  senderId: number;
  receiverId: number;
  content: string;
}
