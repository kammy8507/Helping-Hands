package com.helpinghands.exception;

import org.springframework.http.HttpStatus;

/** Attempted an emergency/report status change that violates the allowed chain (spec §33). */
public class InvalidStatusTransitionException extends ApiException {
    public InvalidStatusTransitionException(String message) {
        super(HttpStatus.CONFLICT, message);
    }
}
