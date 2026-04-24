package io.github.youco.dayoff.service.impl;

import io.github.youco.dayoff.dto.request.LoginRequest;
import io.github.youco.dayoff.dto.response.AuthResponse;
import io.github.youco.dayoff.exception.ResourceNotFoundException;
import io.github.youco.dayoff.model.entity.User;
import io.github.youco.dayoff.repository.UserRepository;
import io.github.youco.dayoff.service.AuthService;
import io.github.youco.dayoff.utils.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

/**
 * Authentication Service Implementation
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AuthServiceImpl implements AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    @Override
    public AuthResponse login(LoginRequest request) {
        log.info("Login attempt for user: {}", request.getEmail());

        User user = userRepository.findByEmailAndActiveTrue(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + request.getEmail()));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            log.warn("Invalid password for user: {}", request.getEmail());
            throw new ResourceNotFoundException("Invalid credentials");
        }

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().getName().name());

        log.info("User logged in successfully: {}", user.getEmail());

        return AuthResponse.builder()
                .token(token)
                .userId(user.getId())
                .email(user.getEmail())
                .role(user.getRole().getName())
                .nom(user.getNom())
                .prenom(user.getPrenom())
                .build();
    }
}

