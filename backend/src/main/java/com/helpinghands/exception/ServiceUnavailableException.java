package com.helpinghands.exception;

import org.springframework.http.HttpStatus;

/** A required downstream (e.g. AI service) is unavailable and there is no fallback. */
public class ServiceUnavailableException extends ApiException {
    public ServiceUnavailableException(String message) {
        super(HttpStatus.SERVICE_UNAVAILABLE, message);
    }
}
