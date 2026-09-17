package com.helpinghands.entity;

import com.helpinghands.entity.enums.AssignmentStatus;
import com.helpinghands.entity.enums.ServiceType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;

/**
 * A dispatch of one accident report to one responder.
 * Maps to table `emergency_assignment`.
 */
@Entity
@Table(name = "emergency_assignment")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmergencyAssignment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "report_id", nullable = false)
    private AccidentReport report;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "responder_id", nullable = false)
    private EmergencyResponder responder;

    @Enumerated(EnumType.STRING)
    @Column(name = "service_type", nullable = false,
            columnDefinition = "ENUM('AMBULANCE','POLICE','FIRE_DEPARTMENT')")
    private ServiceType serviceType;

    @CreationTimestamp
    @Column(name = "assigned_at", nullable = false, updatable = false)
    private Instant assignedAt;

    @Column(name = "accepted_at")
    private Instant acceptedAt;

    @Column(name = "completed_at")
    private Instant completedAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false,
            columnDefinition = "ENUM('NOTIFIED','ACCEPTED','REJECTED','ON_THE_WAY','ARRIVED','COMPLETED')")
    @Builder.Default
    private AssignmentStatus status = AssignmentStatus.NOTIFIED;
}
