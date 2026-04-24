package io.github.youco.dayoff.config;

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
 * Data Initializer — runs at startup to seed required reference data.
 *
 * Creates:
 *   1. All role entries (SUPER_ADMIN, ADMIN, EMPLOYEE)  — if not present
 *   2. Default Super Admin account                       — if not present
 *   3. Default HR Manager account                       — if not present
 *
 * Default credentials (change in production!):
 *   Super Admin → admin@dayoff.io / Admin@1234
 *   HR Manager  → hr@dayoff.io   / Hr@12345
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final RolesEntityRepository rolesRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        log.info("=== [DataInitializer] Seeding initial data ===");

        // ── 1. Roles ──────────────────────────────────────────────────────────
        RolesEntity superAdminRole = ensureRole(Roles.SUPER_ADMIN);
        RolesEntity adminRole      = ensureRole(Roles.ADMIN);
        ensureRole(Roles.EMPLOYEE);

        // ── 2. Default Super Admin ────────────────────────────────────────────
        if (!userRepository.existsByEmail("admin@dayoff.io")) {
            User superAdmin = User.builder()
                    .prenom("Super")
                    .nom("Admin")
                    .email("admin@dayoff.io")
                    .telephone("0600000000")
                    .password(passwordEncoder.encode("Admin@1234"))
                    .role(superAdminRole)
                    .leaveDaysRemaining(26)
                    .active(true)
                    .build();
            userRepository.save(superAdmin);
            log.info("[DataInitializer] ✓ Default Super Admin created: admin@dayoff.io / Admin@1234");
        } else {
            log.debug("[DataInitializer] Super Admin already exists — skipping");
        }

        // ── 3. Default HR Manager ─────────────────────────────────────────────
        if (!userRepository.existsByEmail("hr@dayoff.io")) {
            User hrManager = User.builder()
                    .prenom("RH")
                    .nom("Manager")
                    .email("hr@dayoff.io")
                    .telephone("0611111111")
                    .password(passwordEncoder.encode("Hr@12345"))
                    .role(adminRole)
                    .leaveDaysRemaining(26)
                    .active(true)
                    .build();
            userRepository.save(hrManager);
            log.info("[DataInitializer] ✓ Default HR Manager created: hr@dayoff.io / Hr@12345");
        } else {
            log.debug("[DataInitializer] HR Manager already exists — skipping");
        }

        log.info("=== [DataInitializer] Initialization complete ===");
    }

    /**
     * Creates the role if it doesn't already exist, returns the managed entity.
     */
    private RolesEntity ensureRole(Roles role) {
        return rolesRepository.findByName(role).orElseGet(() -> {
            RolesEntity created = rolesRepository.save(RolesEntity.builder().name(role).build());
            log.info("[DataInitializer] ✓ Role created: {}", role);
            return created;
        });
    }
}
