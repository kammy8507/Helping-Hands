package com.helpinghands.exception;

import org.springframework.http.HttpStatus;

/** Base for all domain exceptions that carry an HTTP status and a safe client message. */
public abstract class ApiException extends RuntimeException {
    private final HttpStatus status;

    protected ApiException(HttpStatus status, String message) {
        super(message);
        this.status = status;
    }

    public HttpStatus getStatus() {
        return status;
    }
}
