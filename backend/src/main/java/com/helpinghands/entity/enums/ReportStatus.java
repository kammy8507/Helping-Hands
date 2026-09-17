package com.helpinghands.entity.enums;

import java.util.List;

/**
 * Lifecycle status of an accident report — the single ordered chain the whole
 * system tracks (matches the prototype's STATUS_FLOW and spec §33).
 *
 *   SUBMITTED -> AI_COMPLETED -> SERVICE_NOTIFIED -> ACCEPTED
 *             -> ON_THE_WAY -> ARRIVED -> COMPLETED
 *
 * The first three transitions are driven by the server pipeline (AI + dispatch).
 * ACCEPTED is reached only via the accept endpoint. ON_THE_WAY/ARRIVED/COMPLETED
 * are responder-driven via the status endpoint. Any other jump is rejected.
 */
public enum ReportStatus {
    SUBMITTED,
    AI_COMPLETED,
    SERVICE_NOTIFIED,
    ACCEPTED,
    ON_THE_WAY,
    ARRIVED,
    COMPLETED;

    /** Statuses a responder may set through PUT /api/emergencies/{id}/status. */
    public static final List<ReportStatus> RESPONDER_DRIVEN =
            List.of(ON_THE_WAY, ARRIVED, COMPLETED);

    /** The next status in the linear chain, or null if already COMPLETED. */
    public ReportStatus next() {
        int i = ordinal();
        return i + 1 < values().length ? values()[i + 1] : null;
    }

    /** Strict forward-by-one transition check. */
    public boolean canTransitionTo(ReportStatus target) {
        return target != null && target.ordinal() == this.ordinal() + 1;
    }

    public boolean isActive() {
        return this == ACCEPTED || this == ON_THE_WAY || this == ARRIVED;
    }

    public boolean isTerminal() {
        return this == COMPLETED;
    }
}
