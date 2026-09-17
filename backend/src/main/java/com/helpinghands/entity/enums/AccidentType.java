package com.helpinghands.entity.enums;

/**
 * User-selected accident category. Maps to accident_report.accident_type
 * ENUM('ROAD_ACCIDENT','VEHICLE_COLLISION','FIRE','OTHER').
 * The `label` is the human string the React prototype uses in dropdowns/UI.
 */
public enum AccidentType {
    ROAD_ACCIDENT("Road Accident"),
    VEHICLE_COLLISION("Vehicle Collision"),
    FIRE("Fire"),
    OTHER("Other Emergency");

    private final String label;

    AccidentType(String label) {
        this.label = label;
    }

    public String label() { return label; }

    /** Accepts either the enum name ("VEHICLE_COLLISION") or the UI label ("Vehicle Collision"). */
    public static AccidentType from(String value) {
        if (value == null) return OTHER;
        String v = value.trim();
        for (AccidentType t : values()) {
            if (t.name().equalsIgnoreCase(v) || t.label.equalsIgnoreCase(v)) return t;
        }
        // Normalise "road accident", "vehicle-collision", etc.
        String norm = v.replaceAll("[\\s-]+", "_").toUpperCase();
        for (AccidentType t : values()) {
            if (t.name().equals(norm)) return t;
        }
        return OTHER;
    }
}
