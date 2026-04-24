package io.github.youco.dayoff.scheduler;

import io.github.youco.dayoff.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Leave Balance Reset Scheduler
 *
 * Resets all employee leave balances to 26 days every 1st January at midnight.
 * Cron expression: "0 0 0 1 1 *" = second=0, minute=0, hour=0, day=1, month=January, any weekday
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class LeaveBalanceResetScheduler {

    private static final int DEFAULT_LEAVE_DAYS = 26;

    private final UserRepository userRepository;

    /**
     * Scheduled task — runs every 1st January at 00:00:00.
     * Resets the leaveDaysRemaining field for all active employees.
     */
    @Scheduled(cron = "0 0 0 1 1 *")
    @Transactional
    public void resetLeaveBalances() {
        log.info("=== [LeaveBalanceResetScheduler] Starting annual leave balance reset ===");

        long updatedCount = userRepository.findAll().stream()
                .filter(user -> Boolean.TRUE.equals(user.getActive()))
                .peek(user -> {
                    log.debug("Resetting leave balance for user: {} {} (was {} days)",
                            user.getPrenom(), user.getNom(), user.getLeaveDaysRemaining());
                    user.setLeaveDaysRemaining(DEFAULT_LEAVE_DAYS);
                })
                .count();

        // Save is handled by @Transactional dirty-checking (JPA managed entities)
        userRepository.flush();

        log.info("=== [LeaveBalanceResetScheduler] Reset completed — {} employees updated to {} days ===",
                updatedCount, DEFAULT_LEAVE_DAYS);
    }

    /**
     * Manual trigger for testing / admin use.
     * Can be called programmatically without waiting for the cron schedule.
     */
    @Transactional
    public void triggerManualReset() {
        log.warn("[LeaveBalanceResetScheduler] Manual reset triggered by admin");
        resetLeaveBalances();
    }
}
