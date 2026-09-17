package com.helpinghands.entity.enums;

/** Responder availability. Maps to emergency_responder.availability_status. */
public enum AvailabilityStatus {
    AVAILABLE,
    ON_CALL,
    BUSY,
    OFF_DUTY;

    /** Responders that can be dispatched a new emergency. */
    public boolean isDispatchable() {
        return this == AVAILABLE || this == ON_CALL;
    }
}
