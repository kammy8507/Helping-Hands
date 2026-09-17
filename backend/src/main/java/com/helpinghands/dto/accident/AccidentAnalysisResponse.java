package com.helpinghands.dto.accident;

import java.math.BigDecimal;

public record AccidentAnalysisResponse(
        boolean accidentDetected,
        String accidentType,
        String severity,
        BigDecimal confidence,
        String recommendedService
) {}
