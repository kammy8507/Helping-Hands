package com.helpinghands.entity.enums;

/**
 * Status of a single responder<->report assignment.
 * Maps to emergency_assignment.status
 * ENUM('NOTIFIED','ACCEPTED','REJECTED','ON_THE_WAY','ARRIVED','COMPLETED').
 *
 * A report may have several NOTIFIED / REJECTED assignment rows over its life,
 * but at most one "active" assignment (ACCEPTED/ON_THE_WAY/ARRIVED/COMPLETED).
 */
public enum AssignmentStatus {
    NOTIFIED,
    ACCEPTED,
    REJECTED,
    ON_THE_WAY,
    ARRIVED,
    COMPLETED;

    public boolean isActive() {
        return this == ACCEPTED || this == ON_THE_WAY || this == ARRIVED;
    }

    /** Map a report status onto the matching assignment status (for the active row). */
    public static AssignmentStatus fromReportStatus(ReportStatus s) {
        return switch (s) {
            case ACCEPTED -> ACCEPTED;
            case ON_THE_WAY -> ON_THE_WAY;
            case ARRIVED -> ARRIVED;
            case COMPLETED -> COMPLETED;
            default -> NOTIFIED;
        };
    }
}
