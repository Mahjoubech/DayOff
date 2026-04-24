package io.github.youco.dayoff.utils;

import io.github.youco.dayoff.model.entity.RolesEntity;
import io.github.youco.dayoff.model.entity.User;
import io.github.youco.dayoff.model.enums.Roles;
import io.github.youco.dayoff.repository.RolesEntityRepository;
import io.github.youco.dayoff.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Data Admin Utilities
 * Initializes default roles and creates a super admin account on application startup
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class DataAdminUtils implements CommandLineRunner {
    private final UserRepository userRepository;
    private final RolesEntityRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // Check if users already exist
        if (userRepository.count() > 0) {
            log.info("Users already exist, skipping admin creation");
            return;
        }

        log.info("Initializing default roles and admin user...");

        // Create SUPER_ADMIN role
        RolesEntity superAdminRole = roleRepository.findByName(Roles.SUPER_ADMIN)
                .orElseGet(() -> {
                    RolesEntity role = RolesEntity.builder()
                            .name(Roles.SUPER_ADMIN)
                            .build();
                    log.info("Creating SUPER_ADMIN role");
                    return roleRepository.save(role);
                });

        // Create ADMIN role
        RolesEntity adminRole = roleRepository.findByName(Roles.ADMIN)
                .orElseGet(() -> {
                    RolesEntity role = RolesEntity.builder()
                            .name(Roles.ADMIN)
                            .build();
                    log.info("Creating ADMIN role");
                    return roleRepository.save(role);
                });

        // Create EMPLOYEE role
        RolesEntity employeeRole = roleRepository.findByName(Roles.EMPLOYEE)
                .orElseGet(() -> {
                    RolesEntity role = RolesEntity.builder()
                            .name(Roles.EMPLOYEE)
                            .build();
                    log.info("Creating EMPLOYEE role");
                    return roleRepository.save(role);
                });

        // Create default Super Admin account
        User superAdmin = User.builder()
                .nom("Admin")
                .prenom("Super")
                .email("admin@dayoff.com")
                .telephone("0600000000")
                .password(passwordEncoder.encode("admin"))
                .leaveDaysRemaining(0)
                .role(superAdminRole)
                .active(true)
                .build();

        userRepository.save(superAdmin);

        log.info("====================================");
        log.info("✅ Default roles created successfully");
        log.info("✅ Super Admin account created");
        log.info("====================================");
        log.info("📧 Email: admin@dayoff.com");
        log.info("🔑 Password: admin");
        log.info("👤 Role: SUPER_ADMIN");
        log.info("====================================");
    }
}

