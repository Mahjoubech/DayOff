package io.github.youco.dayoff.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

/**
 * WebSocket Configuration
 * Enables STOMP messaging for real-time notifications and chat.
 *
 * Endpoints:
 *   - /ws : WebSocket connection endpoint (with SockJS fallback)
 *
 * Broker prefixes:
 *   - /topic : for broadcast messages (e.g., /topic/notifications/{userId})
 *   - /queue : for point-to-point messages
 *
 * Application prefix:
 *   - /app : for messages routed to @MessageMapping controllers
 */
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // Enable simple in-memory message broker with /topic and /queue prefixes
        config.enableSimpleBroker("/topic", "/queue");
        // Prefix for messages sent from client to server
        config.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // WebSocket endpoint with SockJS fallback - allow all origins for development
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*")
                .withSockJS();
    }
}
