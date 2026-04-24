package io.github.youco.dayoff.service;

import io.github.youco.dayoff.model.entity.Notification;

import java.time.LocalDate;
import java.util.List;

/**
 * Notification Service Interface
 * Manages notifications with WebSocket real-time delivery and database persistence.
 */
public interface NotificationService {

    /**
     * Send a general notification to a user
     * @param userId the target user id
     * @param content the notification content
     * @param type the notification type
     * @return the saved notification
     */
    Notification sendNotification(Long userId, String content, io.github.youco.dayoff.model.enums.NotificationType type);

    /**
     * Send a notification when a leave request is submitted
     * @param hrManagerId the HR manager to notify
     * @param employeeName the employee who submitted the request
     * @param leaveRequestId the leave request id
     */
    void sendLeaveRequestNotification(Long hrManagerId, String employeeName, Long leaveRequestId);

    /**
     * Send a notification when a leave request is approved
     * @param employeeId the employee to notify
     * @param startDate leave start date
     * @param endDate leave end date
     */
    void sendLeaveApprovedNotification(Long employeeId, LocalDate startDate, LocalDate endDate);

    /**
     * Send a notification when a leave request is rejected
     * @param employeeId the employee to notify
     * @param startDate leave start date
     * @param endDate leave end date
     */
    void sendLeaveRejectedNotification(Long employeeId, LocalDate startDate, LocalDate endDate);

    /**
     * Get all notifications for a user
     * @param userId the user id
     * @return list of notifications
     */
    List<Notification> getUserNotifications(Long userId);

    /**
     * Get unread notifications for a user
     * @param userId the user id
     * @return list of unread notifications
     */
    List<Notification> getUnreadNotifications(Long userId);

    /**
     * Get the count of unread notifications for a user
     * @param userId the user id
     * @return count of unread notifications
     */
    long getUnreadCount(Long userId);

    /**
     * Mark a notification as read
     * @param notificationId the notification id
     */
    void markAsRead(Long notificationId);

    /**
     * Mark all notifications for a user as read
     * @param userId the user id
     */
    void markAllAsRead(Long userId);
}
