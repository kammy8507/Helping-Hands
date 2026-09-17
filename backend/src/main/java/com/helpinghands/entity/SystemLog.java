package com.helpinghands.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;

/**
 * An audit log entry for important operations. Maps to table `system_log`.
 * A null {@code user} means the SYSTEM actor (e.g. the AI/dispatch pipeline).
 */
@Entity
@Table(name = "system_log")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SystemLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Actor. FK -> user(id) ON DELETE SET NULL. Null = SYSTEM. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "action", nullable = false, length = 60)
    private String action;

    @Column(name = "description", nullable = false, length = 500)
    private String description;

    @CreationTimestamp
    @Column(name = "timestamp", nullable = false, updatable = false)
    private Instant timestamp;
}
