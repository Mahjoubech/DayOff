package io.github.youco.dayoff.service;

import io.github.youco.dayoff.model.entity.Message;

import java.util.List;

/**
 * Chat Service Interface
 * Manages real-time messaging between users.
 */
public interface ChatService {

    /**
     * Send a message from one user to another
     * @param senderId the sender user id
     * @param receiverId the receiver user id
     * @param content the message content
     * @return the saved message
     */
    Message sendMessage(Long senderId, Long receiverId, String content);

    /**
     * Get all messages between two users (conversation)
     * @param userId1 first user id
     * @param userId2 second user id
     * @return list of messages ordered by timestamp
     */
    List<Message> getConversation(Long userId1, Long userId2);

    /**
     * Get unread messages for a user
     * @param userId the user id
     * @return list of unread messages
     */
    List<Message> getUnreadMessages(Long userId);

    /**
     * Mark all messages from a sender to a receiver as read
     * @param senderId the sender user id
     * @param receiverId the receiver user id
     */
    void markAsRead(Long senderId, Long receiverId);
}
