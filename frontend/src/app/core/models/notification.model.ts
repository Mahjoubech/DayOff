export type NotificationType = 'LEAVE_APPROVED' | 'LEAVE_REJECTED' | 'NEW_MESSAGE' | 'NEW_EMPLOYEE';

export interface Notification {
  id: number;
  content: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: string;
  userId: number;
}
