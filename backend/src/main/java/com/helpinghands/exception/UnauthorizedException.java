package com.helpinghands.exception;

import org.springframework.http.HttpStatus;

/** Bad credentials / authentication failure surfaced from the service layer. */
public class UnauthorizedException extends ApiException {
    public UnauthorizedException(String message) {
        super(HttpStatus.UNAUTHORIZED, message);
    }
}
