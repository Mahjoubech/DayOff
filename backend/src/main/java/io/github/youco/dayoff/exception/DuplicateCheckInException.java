package io.github.youco.dayoff.exception;

public class DuplicateCheckInException extends RuntimeException {
    public DuplicateCheckInException(String message) {
        super(message);
    }

    public DuplicateCheckInException(String message, Throwable cause) {
        super(message, cause);
    }
}

