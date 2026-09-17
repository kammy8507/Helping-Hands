package com.helpinghands.entity.enums;

/**
 * Notification category. Maps to notification.notification_type
 * ENUM('REPORT','NEW_EMERGENCY','ACCEPTED','REJECTED','STATUS','COMPLETED','ALERT','SUMMARY').
 */
public enum NotificationType {
    REPORT,          // report submitted / received
    NEW_EMERGENCY,   // responder: a new emergency was assigned
    ACCEPTED,        // reporter: a responder accepted
    REJECTED,        // (reserved) responder declined
    STATUS,          // generic status change
    COMPLETED,       // emergency completed
    ALERT,           // admin alert (dispatch, unassigned, etc.)
    SUMMARY          // admin digest
}
