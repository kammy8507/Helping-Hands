package com.helpinghands.exception;

import org.springframework.http.HttpStatus;

/** Authenticated but not allowed to perform this action on this resource. */
public class ForbiddenException extends ApiException {
    public ForbiddenException(String message) {
        super(HttpStatus.FORBIDDEN, message);
    }
}
