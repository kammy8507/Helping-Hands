package com.helpinghands.entity.enums;

/**
 * Emergency service / responder department.
 * Shared by user-facing "recommended service", the responder's department,
 * and an assignment's service_type — all three DB columns use the same 3 values:
 * ENUM('AMBULANCE','POLICE','FIRE_DEPARTMENT').
 */
public enum ServiceType {
    AMBULANCE("Ambulance", "108"),
    POLICE("Police", "112"),
    FIRE_DEPARTMENT("Fire Department", "101");

    private final String label;
    private final String phone;

    ServiceType(String label, String phone) {
        this.label = label;
        this.phone = phone;
    }

    public String label() { return label; }
    public String phone() { return phone; }
}
