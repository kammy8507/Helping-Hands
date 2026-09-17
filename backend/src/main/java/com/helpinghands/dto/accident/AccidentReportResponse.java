package com.helpinghands.dto.accident;

import com.helpinghands.entity.AccidentReport;
import com.helpinghands.entity.enums.ReportStatus;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

public record AccidentReportResponse(
        Long id,
        String publicCode,
        Long userId,
        String userName,
        String imageUrl,
        String accidentType,
        String aiDetectedType,
        String severity,
        BigDecimal aiConfidence,
        String description,
        Integer peopleAffected,
        String remarks,
        BigDecimal lat,
        BigDecimal lng,
        String address,
        String recommendedService,
        String status,
        Instant createdAt,
        Instant updatedAt,
        Map<String, Instant> timeline
) {
    public static AccidentReportResponse from(AccidentReport r, String remarks) {
        Map<String, Instant> timeline = new LinkedHashMap<>();
        if (r.getCreatedAt() != null) timeline.put("SUBMITTED", r.getCreatedAt());
        if (r.getStatus() != null && r.getStatus().ordinal() >= ReportStatus.AI_COMPLETED.ordinal()) {
            timeline.put("AI_COMPLETED", r.getUpdatedAt());
        }
        if (r.getStatus() != null && r.getStatus().ordinal() >= ReportStatus.SERVICE_NOTIFIED.ordinal()) {
            timeline.put("SERVICE_NOTIFIED", r.getUpdatedAt());
        }
        return new AccidentReportResponse(
                r.getId(), r.getPublicCode(), r.getUser().getId(), r.getUser().getName(),
                r.getImageUrl(), r.getAccidentType().label(), r.getAiDetectedType(),
                r.getSeverity() == null ? null : r.getSeverity().name(), r.getAiConfidence(),
                r.getDescription(), r.getPeopleAffected(), remarks,
                r.getLatitude(), r.getLongitude(), r.getAddress(),
                r.getRecommendedService() == null ? null : r.getRecommendedService().name(),
                r.getStatus() == null ? null : r.getStatus().name(),
                r.getCreatedAt(), r.getUpdatedAt(), timeline
        );
    }
}
