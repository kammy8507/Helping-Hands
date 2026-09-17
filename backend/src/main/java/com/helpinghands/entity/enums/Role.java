package com.helpinghands.entity.enums;

/** Account role. Maps to user.role ENUM('USER','RESPONDER','ADMIN'). */
public enum Role {
    USER,
    RESPONDER,
    ADMIN;

    /** Spring Security authority name (ROLE_ prefix required by hasRole()). */
    public String authority() {
        return "ROLE_" + name();
    }
}
