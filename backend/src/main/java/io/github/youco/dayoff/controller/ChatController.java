package io.github.youco.dayoff.controller;

import io.github.youco.dayoff.dto.response.UserResponse;
import io.github.youco.dayoff.model.entity.Message;
import io.github.youco.dayoff.service.ChatService;
import io.github.youco.dayoff.service.NotificationService;
import io.github.youco.dayoff.service.UserService;
import io.github.youco.dayoff.model.enums.NotificationType;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.ArrayList;

/**
 * Chat Controller — REST endpoints + WebSocket message handler for real-time chat.
 *
 * REST base path:     /api/chat
 * WebSocket mapping:  /app/chat.send  →  pushes to /topic/chat/{receiverId}
 */
@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
@Tag(name = "Chat", description = "Real-time messaging via REST and WebSocket")
public class ChatController {

    private final ChatService chatService;
    private final UserService userService;
    private final NotificationService notificationService;
    private final SimpMessagingTemplate messagingTemplate;

    // ─── REST: send message ────────────────────────────────────────────────────

    @PostMapping("/send/{receiverId}")
    @Operation(summary = "Send a message to another user (REST fallback)")
    public ResponseEntity<Message> sendMessage(@PathVariable Long receiverId,
                                               @RequestBody Map<String, String> body,
                                               Authentication auth) {
        UserResponse sender = userService.getUserByEmail(auth.getName());
        String content = body.get("content");

        Message message = chatService.sendMessage(sender.getId(), receiverId, content);

        // Push via WebSocket to receiver
        messagingTemplate.convertAndSend("/topic/chat/" + receiverId, message);

        // Notify receiver
        notificationService.sendNotification(
                receiverId,
                sender.getPrenom() + " " + sender.getNom() + " vous a envoyé un message.",
                NotificationType.NEW_MESSAGE
        );

        return ResponseEntity.status(HttpStatus.CREATED).body(message);
    }

    // ─── WebSocket: STOMP message mapping ─────────────────────────────────────

    /**
     * WebSocket endpoint — client sends to /app/chat.send
     * Expects payload: { "senderId": 1, "receiverId": 2, "content": "Hello" }
     * Broadcasts to:  /topic/chat/{receiverId}
     */
    @MessageMapping("/chat.send")
    public void handleWebSocketMessage(@Payload Map<String, Object> payload) {
        Long senderId   = Long.valueOf(payload.get("senderId").toString());
        Long receiverId = Long.valueOf(payload.get("receiverId").toString());
        String content  = payload.get("content").toString();

        Message message = chatService.sendMessage(senderId, receiverId, content);
        messagingTemplate.convertAndSend("/topic/chat/" + receiverId, message);
    }

    // ─── REST: read conversation ───────────────────────────────────────────────

    @GetMapping("/conversation/{otherUserId}")
    @Operation(summary = "Get full conversation with another user")
    public ResponseEntity<List<Message>> getConversation(@PathVariable Long otherUserId,
                                                          Authentication auth) {
        UserResponse me = userService.getUserByEmail(auth.getName());
        return ResponseEntity.ok(chatService.getConversation(me.getId(), otherUserId));
    }

    @GetMapping("/unread")
    @Operation(summary = "Get my unread messages")
    public ResponseEntity<List<Message>> getUnread(Authentication auth) {
        UserResponse me = userService.getUserByEmail(auth.getName());
        return ResponseEntity.ok(chatService.getUnreadMessages(me.getId()));
    }

    @PutMapping("/read/{senderId}")
    @Operation(summary = "Mark messages from a sender as read")
    public ResponseEntity<Void> markAsRead(@PathVariable Long senderId, Authentication auth) {
        UserResponse me = userService.getUserByEmail(auth.getName());
        chatService.markAsRead(senderId, me.getId());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/contacts")
    @Operation(summary = "Get a list of users this user can chat with")
    public ResponseEntity<List<UserResponse>> getChatContacts(Authentication auth) {
        UserResponse me = userService.getUserByEmail(auth.getName());
        List<UserResponse> contacts = new ArrayList<>();

        switch (me.getRole()) {
            case SUPER_ADMIN -> {
                // Super Admin can chat with anyone
                contacts.addAll(userService.getAllEmployees());
            }
            case ADMIN -> {
                // HR can chat with their employees
                contacts.addAll(userService.getEmployeesByHRManager(me.getId()));
                // AND HR can chat with all Super Admins
                contacts.addAll(userService.getAllEmployees().stream()
                        .filter(u -> u.getRole() == io.github.youco.dayoff.model.enums.Roles.SUPER_ADMIN)
                        .toList());
            }
            case EMPLOYEE -> {
                // Employee can chat with their HR Manager
                if (me.getHrManagerId() != null) {
                    contacts.add(userService.getUserById(me.getHrManagerId()));
                }
            }
        }
        
        // Remove self from the list just in case
        contacts.removeIf(u -> u.getId().equals(me.getId()));
        
        return ResponseEntity.ok(contacts);
    }
}
