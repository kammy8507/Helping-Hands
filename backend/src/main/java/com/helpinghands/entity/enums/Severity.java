package com.helpinghands.entity.enums;

/** AI-assessed severity. Maps to accident_report.severity ENUM('LOW','MEDIUM','HIGH'). */
public enum Severity {
    LOW,
    MEDIUM,
    HIGH;

    public static Severity from(String value) {
        if (value == null) return MEDIUM;
        try {
            return valueOf(value.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            return MEDIUM;
        }
    }
}
