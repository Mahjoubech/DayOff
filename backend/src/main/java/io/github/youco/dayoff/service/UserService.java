package io.github.youco.dayoff.service;

import io.github.youco.dayoff.dto.request.CreateUserRequest;
import io.github.youco.dayoff.dto.response.UserResponse;
import io.github.youco.dayoff.model.enums.Roles;

import java.util.List;

/**
 * User Service Interface
 */
public interface UserService {
    /**
     * Create a new user
     */
    UserResponse createUser(CreateUserRequest request, Roles role);

    /**
     * Get user by ID
     */
    UserResponse getUserById(Long id);

    /**
     * Get user by email
     */
    UserResponse getUserByEmail(String email);

    /**
     * Get all employees
     */
    List<UserResponse> getAllEmployees();

    /**
     * Get employees managed by HR
     */
    List<UserResponse> getEmployeesByHRManager(Long hrManagerId);

    /**
     * Update user
     */
    UserResponse updateUser(Long id, CreateUserRequest request);

    /**
     * Delete user (soft delete)
     */
    void deleteUser(Long id);
}

