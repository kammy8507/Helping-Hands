package com.helpinghands.repository;

import com.helpinghands.entity.EmergencyAssignment;
import com.helpinghands.entity.enums.AssignmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface EmergencyAssignmentRepository extends JpaRepository<EmergencyAssignment, Long> {

    List<EmergencyAssignment> findByReportId(Long reportId);

    List<EmergencyAssignment> findByResponderIdOrderByAssignedAtDesc(Long responderId);

    List<EmergencyAssignment> findByResponderIdAndStatusInOrderByAssignedAtDesc(
            Long responderId, Collection<AssignmentStatus> statuses);

    /** The single "active" assignment for a report (accepted/on-the-way/arrived/completed). */
    Optional<EmergencyAssignment> findFirstByReportIdAndStatusInOrderByAssignedAtDesc(
            Long reportId, Collection<AssignmentStatus> statuses);

    boolean existsByReportIdAndResponderIdAndStatus(
            Long reportId, Long responderId, AssignmentStatus status);
}
