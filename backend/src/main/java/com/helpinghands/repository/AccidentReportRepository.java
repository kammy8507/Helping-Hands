package com.helpinghands.repository;

import com.helpinghands.entity.AccidentReport;
import com.helpinghands.entity.enums.ReportStatus;
import com.helpinghands.entity.enums.ServiceType;
import com.helpinghands.entity.enums.Severity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface AccidentReportRepository extends JpaRepository<AccidentReport, Long> {

    Optional<AccidentReport> findByPublicCode(String publicCode);

    boolean existsByPublicCode(String publicCode);

    List<AccidentReport> findByUserIdOrderByCreatedAtDesc(Long userId);

    long countByUserId(Long userId);

    List<AccidentReport> findAllByOrderByCreatedAtDesc();

    List<AccidentReport> findByStatusInOrderByCreatedAtDesc(Collection<ReportStatus> statuses);

    List<AccidentReport> findByRecommendedServiceAndStatusOrderByCreatedAtAsc(
            ServiceType recommendedService, ReportStatus status);

    long countByStatus(ReportStatus status);

    long countByStatusIn(Collection<ReportStatus> statuses);

    long countBySeverity(Severity severity);

    long countByRecommendedService(ServiceType recommendedService);
}
