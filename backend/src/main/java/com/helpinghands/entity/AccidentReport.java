package com.helpinghands.entity;

import com.helpinghands.entity.enums.AccidentType;
import com.helpinghands.entity.enums.ReportStatus;
import com.helpinghands.entity.enums.ServiceType;
import com.helpinghands.entity.enums.Severity;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.Instant;

/**
 * An accident report — the central workflow entity.
 * Maps to table `accident_report`.
 */
@Entity
@Table(name = "accident_report")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AccidentReport {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Human-facing code shown in the UI, e.g. HH-1042. Unique. */
    @Column(name = "public_code", nullable = false, length = 20, unique = true)
    private String publicCode;

    /** Reporter. FK -> user(id) ON DELETE RESTRICT (history preserved). */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "image_url", length = 500)
    private String imageUrl;

    @Enumerated(EnumType.STRING)
    @Column(name = "accident_type", nullable = false,
            columnDefinition = "ENUM('ROAD_ACCIDENT','VEHICLE_COLLISION','FIRE','OTHER')")
    private AccidentType accidentType;

    /** Free-form label returned by the AI service, e.g. "Vehicle Collision". */
    @Column(name = "ai_detected_type", length = 60)
    private String aiDetectedType;

    @Enumerated(EnumType.STRING)
    @Column(name = "severity", columnDefinition = "ENUM('LOW','MEDIUM','HIGH')")
    private Severity severity;

    /** 0.000 – 1.000 */
    @Column(name = "ai_confidence", precision = 4, scale = 3)
    private BigDecimal aiConfidence;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "remarks", length = 1000)
    private String remarks;

    @Column(name = "people_affected")
    private Integer peopleAffected = 0;

    @Column(name = "latitude", precision = 9, scale = 6)
    private BigDecimal latitude;

    @Column(name = "longitude", precision = 9, scale = 6)
    private BigDecimal longitude;

    @Column(name = "address", length = 300)
    private String address;

    @Enumerated(EnumType.STRING)
    @Column(name = "recommended_service",
            columnDefinition = "ENUM('AMBULANCE','POLICE','FIRE_DEPARTMENT')")
    private ServiceType recommendedService;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false,
            columnDefinition = "ENUM('SUBMITTED','AI_COMPLETED','SERVICE_NOTIFIED'," +
                    "'ACCEPTED','ON_THE_WAY','ARRIVED','COMPLETED')")
    @Builder.Default
    private ReportStatus status = ReportStatus.SUBMITTED;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;
}
