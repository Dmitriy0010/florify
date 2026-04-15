package ru.florify.inventory.adapter.in.scheduler;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.javacrumbs.shedlock.spring.annotation.SchedulerLock;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import ru.florify.inventory.application.port.in.MarkBatchesAsExpiredUseCase;

@Slf4j
@Component
@RequiredArgsConstructor
public class ExpiryCheckScheduler {

    private final MarkBatchesAsExpiredUseCase markBatchesAsExpiredUseCase;

    /**
     * Periodically check for expired stock batches and synchronize global balance.
     * Runs every hour. Uses ShedLock to ensure only one instance runs the task in a cluster.
     */
    @Scheduled(cron = "${app.inventory.expiry-check.cron:0 0 * * * *}")
    @SchedulerLock(
            name = "Inventory_ExpiryCheckTask",
            lockAtLeastFor = "PT50M",
            lockAtMostFor = "PT55M"
    )
    public void checkExpiredBatches() {
        log.info("Starting scheduled expiry check...");
        try {
            int expiredCount = markBatchesAsExpiredUseCase.execute();
            if (expiredCount > 0) {
                log.info("Successfully processed {} expired stock batches", expiredCount);
            } else {
                log.debug("No expired batches found");
            }
        } catch (Exception e) {
            log.error("Error during scheduled expiry check: {}", e.getMessage(), e);
        }
    }
}
