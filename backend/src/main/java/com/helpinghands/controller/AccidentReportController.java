package com.helpinghands.controller;

import com.helpinghands.dto.accident.AccidentAnalysisResponse;
import com.helpinghands.dto.accident.AccidentReportResponse;
import com.helpinghands.dto.accident.CreateAccidentReportRequest;
import com.helpinghands.dto.common.ApiResponse;
import com.helpinghands.entity.enums.AccidentType;
import com.helpinghands.service.AccidentReportService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/accidents")
@RequiredArgsConstructor
@PreAuthorize("hasRole('USER')")
public class AccidentReportController {

    private final AccidentReportService reportService;

    @PostMapping("/analyze")
    public ResponseEntity<ApiResponse<AccidentAnalysisResponse>> analyze(@RequestBody AnalyzeRequest request) {
        AccidentType type = AccidentType.from(request.accidentType());
        AccidentAnalysisResponse result = reportService.analyze(type, Math.max(0, request.peopleAffected() == null ? 0 : request.peopleAffected()));
        return ResponseEntity.ok(ApiResponse.ok(result));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<AccidentReportResponse>> create(
            @Valid @RequestBody CreateAccidentReportRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Emergency report submitted.", reportService.create(request)));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<List<AccidentReportResponse>>> mine() {
        return ResponseEntity.ok(ApiResponse.ok(reportService.myReports()));
    }

    @GetMapping("/{publicCode}")
    public ResponseEntity<ApiResponse<AccidentReportResponse>> getMine(@PathVariable String publicCode) {
        return ResponseEntity.ok(ApiResponse.ok(reportService.getMine(publicCode)));
    }

    public record AnalyzeRequest(String accidentType, Integer peopleAffected, String imageData, String imageName) {}
}
