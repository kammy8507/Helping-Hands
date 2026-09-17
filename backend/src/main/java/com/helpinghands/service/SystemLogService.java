package com.helpinghands.service;

import com.helpinghands.entity.SystemLog;
import com.helpinghands.entity.User;
import com.helpinghands.repository.SystemLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Writes audit entries to system_log. Actions are stable string codes
 * (LOGIN, REPORT_CREATED, AI_ANALYSIS, SERVICE_NOTIFIED, EMERGENCY_ACCEPTED,
 *  EMERGENCY_REJECTED, STATUS_UPDATE, USER_UPDATED, USER_DELETED, REGISTER, ...).
 */
@Service
@RequiredArgsConstructor
public class SystemLogService {

    private final SystemLogRepository logRepository;

    /** Log an action attributed to a specific user (may be null for SYSTEM). */
    @Transactional
    public void log(User actor, String action, String description) {
        logRepository.save(SystemLog.builder()
                .user(actor)
                .action(action)
                .description(truncate(description))
                .build());
    }

    /** Log an action performed by the SYSTEM actor (AI/dispatch pipeline). */
    @Transactional
    public void logSystem(String action, String description) {
        log(null, action, description);
    }

    private String truncate(String s) {
        if (s == null) return "";
        return s.length() <= 500 ? s : s.substring(0, 500);
    }
}
