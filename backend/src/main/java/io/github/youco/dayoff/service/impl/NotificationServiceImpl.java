package io.github.youco.dayoff.service.impl;

import io.github.youco.dayoff.exception.ResourceNotFoundException;
import io.github.youco.dayoff.model.entity.Notification;
import io.github.youco.dayoff.model.entity.User;
import io.github.youco.dayoff.model.enums.NotificationType;
import io.github.youco.dayoff.repository.NotificationRepository;
import io.github.youco.dayoff.repository.UserRepository;
import io.github.youco.dayoff.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

/**
 * Notification Service Implementation
 * Persists notifications to database and delivers real-time push via WebSocket (STOMP).
 * WebSocket destination: /topic/notifications/{userId}
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @Override
    public Notification sendNotification(Long userId, String content, NotificationType type) {
        log.info("Sending {} notification to user {}: {}", type, userId, content);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        Notification notification = Notification.builder()
                .content(content)
                .type(type)
                .isRead(false)
                .user(user)
                .build();

        Notification saved = notificationRepository.save(notification);

        // Push via WebSocket
        try {
            messagingTemplate.convertAndSend(
                    "/topic/notifications/" + userId,
                    saved
            );
            log.debug("WebSocket notification pushed to user {}", userId);
        } catch (Exception e) {
            log.warn("Failed to push WebSocket notification to user {}: {}", userId, e.getMessage());
            // Don't fail the operation - notification is still persisted in DB
        }

        return saved;
    }

    @Override
    public void sendLeaveRequestNotification(Long hrManagerId, String employeeName, Long leaveRequestId) {
        String content = String.format("Nouvelle demande de congé de %s (ID: %d). Veuillez examiner et approuver/rejeter.",
                employeeName, leaveRequestId);
        sendNotification(hrManagerId, content, NotificationType.LEAVE_APPROVED);
    }

    @Override
    public void sendLeaveApprovedNotification(Long employeeId, LocalDate startDate, LocalDate endDate) {
        String content = String.format("Votre demande de congé du %s au %s a été approuvée ✅",
                startDate, endDate);
        sendNotification(employeeId, content, NotificationType.LEAVE_APPROVED);
    }

    @Override
    public void sendLeaveRejectedNotification(Long employeeId, LocalDate startDate, LocalDate endDate) {
        String content = String.format("Votre demande de congé du %s au %s a été rejetée ❌",
                startDate, endDate);
        sendNotification(employeeId, content, NotificationType.LEAVE_REJECTED);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Notification> getUserNotifications(Long userId) {
        log.debug("Fetching all notifications for user: {}", userId);
        return notificationRepository.findByUserId(userId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Notification> getUnreadNotifications(Long userId) {
        log.debug("Fetching unread notifications for user: {}", userId);
        return notificationRepository.findByUserIdAndIsReadFalse(userId);
    }

    @Override
    @Transactional(readOnly = true)
    public long getUnreadCount(Long userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }

    @Override
    public void markAsRead(Long notificationId) {
        log.info("Marking notification {} as read", notificationId);

        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found with id: " + notificationId));

        notification.setIsRead(true);
        notificationRepository.save(notification);
    }

    @Override
    public void markAllAsRead(Long userId) {
        log.info("Marking all notifications as read for user: {}", userId);

        List<Notification> unread = notificationRepository.findByUserIdAndIsReadFalse(userId);
        unread.forEach(n -> n.setIsRead(true));
        notificationRepository.saveAll(unread);

        log.info("Marked {} notifications as read for user {}", unread.size(), userId);
    }
}
