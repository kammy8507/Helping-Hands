package com.helpinghands.service;

import com.helpinghands.dto.accident.AccidentAnalysisResponse;
import com.helpinghands.dto.accident.AccidentReportResponse;
import com.helpinghands.dto.accident.CreateAccidentReportRequest;
import com.helpinghands.entity.AccidentReport;
import com.helpinghands.entity.User;
import com.helpinghands.entity.enums.AccidentType;
import com.helpinghands.entity.enums.ReportStatus;
import com.helpinghands.entity.enums.ServiceType;
import com.helpinghands.entity.enums.Severity;
import com.helpinghands.exception.BadRequestException;
import com.helpinghands.exception.ResourceNotFoundException;
import com.helpinghands.repository.AccidentReportRepository;
import com.helpinghands.repository.UserRepository;
import com.helpinghands.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.io.IOException;
import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Base64;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AccidentReportService {

    private final AccidentReportRepository reportRepository;
    private final UserRepository userRepository;
    private final SystemLogService logService;

    @Value("${helpinghands.storage.upload-dir:uploads}")
    private String uploadDir;

    @Value("${helpinghands.storage.public-base-url:http://localhost:8080/uploads}")
    private String publicBaseUrl;

    @Transactional
    public AccidentReportResponse create(CreateAccidentReportRequest request) {
        User user = userRepository.findById(SecurityUtils.currentUserId())
                .orElseThrow(() -> ResourceNotFoundException.of("User", SecurityUtils.currentUserId()));

        AccidentType selectedType = AccidentType.from(request.accidentType());
        AccidentAnalysisResponse analysis = analyze(selectedType, request.peopleAffected());
        String imageUrl = storeImage(request.imageData(), request.imageName());
        String publicCode = nextPublicCode();

        AccidentReport report = AccidentReport.builder()
                .publicCode(publicCode)
                .user(user)
                .imageUrl(imageUrl)
                .accidentType(selectedType)
                .aiDetectedType(analysis.accidentType())
                .severity(Severity.from(analysis.severity()))
                .aiConfidence(analysis.confidence())
                .description(request.description().trim())
                .peopleAffected(request.peopleAffected())
                .remarks(StringUtils.hasText(request.remarks()) ? request.remarks().trim() : null)
                .latitude(request.latitude())
                .longitude(request.longitude())
                .address(StringUtils.hasText(request.address()) ? request.address().trim() : "Address pending")
                .recommendedService(ServiceType.valueOf(analysis.recommendedService()))
                .status(ReportStatus.SERVICE_NOTIFIED)
                .build();

        report = reportRepository.save(report);
        logService.log(user, "REPORT_CREATED", "Report " + publicCode + " created.");
        logService.logSystem("AI_ANALYSIS", publicCode + " analysed by the server-side triage engine.");
        logService.logSystem("SERVICE_NOTIFIED", analysis.recommendedService() + " notification created for " + publicCode + ".");

        return AccidentReportResponse.from(report, report.getRemarks());
    }

    @Transactional(readOnly = true)
    public List<AccidentReportResponse> myReports() {
        Long userId = SecurityUtils.currentUserId();
        return reportRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(r -> AccidentReportResponse.from(r, r.getRemarks()))
                .toList();
    }

    @Transactional(readOnly = true)
    public AccidentReportResponse getMine(String publicCode) {
        AccidentReport report = reportRepository.findByPublicCode(publicCode)
                .orElseThrow(() -> new ResourceNotFoundException("Accident report not found."));
        if (!report.getUser().getId().equals(SecurityUtils.currentUserId())) {
            throw new com.helpinghands.exception.ForbiddenException("You cannot access this report.");
        }
        return AccidentReportResponse.from(report, report.getRemarks());
    }

    public AccidentAnalysisResponse analyze(AccidentType type, int peopleAffected) {
        Severity severity;
        ServiceType service;
        String detectedType = type.label();
        BigDecimal confidence;

        switch (type) {
            case FIRE -> { severity = Severity.HIGH; service = ServiceType.FIRE_DEPARTMENT; confidence = new BigDecimal("0.95"); }
            case VEHICLE_COLLISION -> { severity = peopleAffected > 2 ? Severity.HIGH : Severity.MEDIUM; service = ServiceType.AMBULANCE; confidence = new BigDecimal("0.93"); }
            case ROAD_ACCIDENT -> { severity = peopleAffected > 2 ? Severity.HIGH : Severity.MEDIUM; service = ServiceType.AMBULANCE; confidence = new BigDecimal("0.90"); }
            default -> { severity = Severity.MEDIUM; service = ServiceType.POLICE; confidence = new BigDecimal("0.75"); }
        }
        return new AccidentAnalysisResponse(true, detectedType, severity.name(), confidence, service.name());
    }

    private String nextPublicCode() {
        String code;
        do {
            code = "HH-" + (1000 + (int) (Math.random() * 9000));
        } while (reportRepository.existsByPublicCode(code));
        return code;
    }

    private String storeImage(String imageData, String imageName) {
        if (!StringUtils.hasText(imageData)) return null;
        try {
            String[] parts = imageData.split(",", 2);
            if (parts.length != 2 || !parts[0].startsWith("data:image/")) {
                throw new BadRequestException("Invalid accident image data.");
            }
            String mime = parts[0].substring(5, parts[0].indexOf(';')).toLowerCase();
            String extension = mime.equals("image/png") ? "png" : "jpg";
            byte[] bytes = Base64.getDecoder().decode(parts[1]);
            if (bytes.length > 5 * 1024 * 1024) throw new BadRequestException("Image must be 5 MB or smaller.");

            Path dir = Paths.get(uploadDir, "accidents");
            Files.createDirectories(dir);
            String filename = UUID.randomUUID() + "." + extension;
            Files.write(dir.resolve(filename), bytes);
            return publicBaseUrl.replaceAll("/$", "") + "/accidents/" + filename;
        } catch (IllegalArgumentException | IOException ex) {
            throw new BadRequestException("Unable to store the accident image.");
        }
    }
}
