package com.helpinghands.entity;

import com.helpinghands.entity.enums.AvailabilityStatus;
import com.helpinghands.entity.enums.ServiceType;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

/**
 * Responder profile — a 1:1 extension of a RESPONDER {@link User}.
 * Maps to table `emergency_responder`.
 */
@Entity
@Table(name = "emergency_responder")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmergencyResponder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** FK -> user(id), UNIQUE, ON DELETE CASCADE. */
    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Column(name = "email", nullable = false, length = 150)
    private String email;

    @Column(name = "phone", nullable = false, length = 20)
    private String phone;

    @Enumerated(EnumType.STRING)
    @Column(name = "department", nullable = false,
            columnDefinition = "ENUM('AMBULANCE','POLICE','FIRE_DEPARTMENT')")
    private ServiceType department;

    @Column(name = "unit_name", length = 120)
    private String unitName;

    @Column(name = "base_latitude", precision = 9, scale = 6)
    private BigDecimal baseLatitude;

    @Column(name = "base_longitude", precision = 9, scale = 6)
    private BigDecimal baseLongitude;

    @Enumerated(EnumType.STRING)
    @Column(name = "availability_status", nullable = false,
            columnDefinition = "ENUM('AVAILABLE','ON_CALL','BUSY','OFF_DUTY')")
    @Builder.Default
    private AvailabilityStatus availabilityStatus = AvailabilityStatus.AVAILABLE;
}
