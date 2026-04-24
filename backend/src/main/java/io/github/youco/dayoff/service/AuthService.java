package io.github.youco.dayoff.service;

import io.github.youco.dayoff.dto.request.LoginRequest;
import io.github.youco.dayoff.dto.response.AuthResponse;

/**
 * Authentication Service Interface
 */
public interface AuthService {
    /**
     * Authenticate user and generate JWT token
     * @param request login credentials
     * @return authentication response with token
     */
    AuthResponse login(LoginRequest request);
}

