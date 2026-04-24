package io.github.youco.dayoff.service.impl;

import io.github.youco.dayoff.dto.request.CreateUserRequest;
import io.github.youco.dayoff.dto.response.UserResponse;
import io.github.youco.dayoff.exception.BusinessException;
import io.github.youco.dayoff.exception.ResourceNotFoundException;
import io.github.youco.dayoff.mapper.UserMapper;
import io.github.youco.dayoff.model.entity.RolesEntity;
import io.github.youco.dayoff.model.entity.User;
import io.github.youco.dayoff.model.enums.Roles;
import io.github.youco.dayoff.repository.RolesEntityRepository;
import io.github.youco.dayoff.repository.UserRepository;
import io.github.youco.dayoff.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * User Service Implementation
 * Handles CRUD operations for users with role management and password hashing.
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class UserServiceImpl implements UserService {

    private static final String USER_NOT_FOUND = "User not found with id: ";
    private static final String HR_MANAGER_NOT_FOUND = "HR Manager not found with id: ";

    private final UserRepository userRepository;
    private final RolesEntityRepository rolesEntityRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;

    @Override
    public UserResponse createUser(CreateUserRequest request, Roles role) {
        log.info("Creating user with email: {} and role: {}", request.getEmail(), role);

        // Check if email already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BusinessException("Email already in use: " + request.getEmail());
        }

        // Map DTO to entity
        User user = userMapper.toEntity(request);

        // Set password (hashed)
        user.setPassword(passwordEncoder.encode(request.getPassword()));

        // Set role
        RolesEntity roleEntity = rolesEntityRepository.findByName(role)
                .orElseThrow(() -> new ResourceNotFoundException("Role not found: " + role));
        user.setRole(roleEntity);

        // Set HR manager if provided
        if (request.getHrManagerId() != null) {
            User hrManager = userRepository.findById(request.getHrManagerId())
                    .orElseThrow(() -> new ResourceNotFoundException(HR_MANAGER_NOT_FOUND + request.getHrManagerId()));
            user.setHrManager(hrManager);
        }

        User savedUser = userRepository.save(user);
        log.info("User created successfully with id: {}", savedUser.getId());

        return userMapper.toResponse(savedUser);
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getUserById(Long id) {
        log.debug("Fetching user by id: {}", id);
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(USER_NOT_FOUND + id));
        return userMapper.toResponse(user);
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getUserByEmail(String email) {
        log.debug("Fetching user by email: {}", email);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
        return userMapper.toResponse(user);
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserResponse> getAllEmployees() {
        log.debug("Fetching all employees");
        return userRepository.findAll().stream()
                .map(userMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserResponse> getEmployeesByHRManager(Long hrManagerId) {
        log.debug("Fetching employees for HR manager id: {}", hrManagerId);
        // Verify HR manager exists
        if (!userRepository.existsById(hrManagerId)) {
            throw new ResourceNotFoundException(HR_MANAGER_NOT_FOUND + hrManagerId);
        }
        return userRepository.findAll().stream()
                .filter(user -> user.getHrManager() != null && user.getHrManager().getId().equals(hrManagerId))
                .map(userMapper::toResponse)
                .toList();
    }

    @Override
    public UserResponse updateUser(Long id, CreateUserRequest request) {
        log.info("Updating user with id: {}", id);

        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(USER_NOT_FOUND + id));

        // Check email uniqueness (if changed)
        if (!user.getEmail().equals(request.getEmail()) && userRepository.existsByEmail(request.getEmail())) {
            throw new BusinessException("Email already in use: " + request.getEmail());
        }

        user.setPrenom(request.getPrenom());
        user.setNom(request.getNom());
        user.setEmail(request.getEmail());
        user.setTelephone(request.getTelephone());

        // Update password only if provided and different
        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            user.setPassword(passwordEncoder.encode(request.getPassword()));
        }

        // Update HR manager if provided
        if (request.getHrManagerId() != null) {
            User hrManager = userRepository.findById(request.getHrManagerId())
                    .orElseThrow(() -> new ResourceNotFoundException(HR_MANAGER_NOT_FOUND + request.getHrManagerId()));
            user.setHrManager(hrManager);
        }

        User savedUser = userRepository.save(user);
        log.info("User updated successfully: {}", savedUser.getId());

        return userMapper.toResponse(savedUser);
    }

    @Override
    public void deleteUser(Long id) {
        log.info("Soft deleting user with id: {}", id);

        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(USER_NOT_FOUND + id));

        user.setActive(false);
        userRepository.save(user);

        log.info("User soft deleted successfully: {}", id);
    }
}
