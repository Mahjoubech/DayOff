package io.github.youco.dayoff.service.impl;

import io.github.youco.dayoff.exception.ResourceNotFoundException;
import io.github.youco.dayoff.model.entity.Message;
import io.github.youco.dayoff.model.entity.User;
import io.github.youco.dayoff.repository.MessageRepository;
import io.github.youco.dayoff.repository.UserRepository;
import io.github.youco.dayoff.service.ChatService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

/**
 * Chat Service Implementation
 * Handles message persistence and retrieval for user-to-user chat.
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class ChatServiceImpl implements ChatService {

    private final MessageRepository messageRepository;
    private final UserRepository userRepository;

    @Override
    public Message sendMessage(Long senderId, Long receiverId, String content) {
        log.info("Sending message from user {} to user {}", senderId, receiverId);

        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new ResourceNotFoundException("Sender not found with id: " + senderId));
        User receiver = userRepository.findById(receiverId)
                .orElseThrow(() -> new ResourceNotFoundException("Receiver not found with id: " + receiverId));

        Message message = Message.builder()
                .content(content)
                .sender(sender)
                .receiver(receiver)
                .isRead(false)
                .build();

        Message savedMessage = messageRepository.save(message);
        log.info("Message sent successfully with id: {}", savedMessage.getId());

        return savedMessage;
    }

    @Override
    @Transactional(readOnly = true)
    public List<Message> getConversation(Long userId1, Long userId2) {
        log.debug("Fetching conversation between users {} and {}", userId1, userId2);

        // Get messages in both directions
        List<Message> sentMessages = messageRepository.findBySenderIdAndReceiverId(userId1, userId2);
        List<Message> receivedMessages = messageRepository.findBySenderIdAndReceiverId(userId2, userId1);

        // Merge and sort by timestamp
        List<Message> conversation = new ArrayList<>();
        conversation.addAll(sentMessages);
        conversation.addAll(receivedMessages);
        conversation.sort(Comparator.comparing(Message::getTimestamp));

        return conversation;
    }

    @Override
    @Transactional(readOnly = true)
    public List<Message> getUnreadMessages(Long userId) {
        log.debug("Fetching unread messages for user: {}", userId);
        return messageRepository.findByReceiverIdAndIsReadFalse(userId);
    }

    @Override
    public void markAsRead(Long senderId, Long receiverId) {
        log.info("Marking messages as read from user {} to user {}", senderId, receiverId);

        List<Message> unreadMessages = messageRepository.findBySenderIdAndReceiverId(senderId, receiverId)
                .stream()
                .filter(msg -> !msg.getIsRead())
                .toList();

        unreadMessages.forEach(msg -> msg.setIsRead(true));
        messageRepository.saveAll(unreadMessages);

        log.info("Marked {} messages as read", unreadMessages.size());
    }
}
