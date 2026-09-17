package com.helpinghands.entity;

import com.helpinghands.entity.enums.NotificationType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;

/**
 * A persistent in-app notification for a single recipient user.
 * Maps to table `notification`. (Role-wide broadcasts are fanned out to one row
 * per recipient user, since the schema targets a concrete user_id.)
 */
@Entity
@Table(name = "notification")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Recipient. FK -> user(id) ON DELETE CASCADE. */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    /** Optional related report. FK -> accident_report(id) ON DELETE SET NULL. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "report_id")
    private AccidentReport report;

    @Column(name = "title", nullable = false, length = 150)
    private String title;

    @Column(name = "message", nullable = false, length = 500)
    private String message;

    @Enumerated(EnumType.STRING)
    @Column(name = "notification_type", nullable = false,
            columnDefinition = "ENUM('REPORT','NEW_EMERGENCY','ACCEPTED','REJECTED','STATUS','COMPLETED','ALERT','SUMMARY')")
    private NotificationType notificationType;

    @Column(name = "is_read", nullable = false)
    @Builder.Default
    private Boolean read = false;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;
}
