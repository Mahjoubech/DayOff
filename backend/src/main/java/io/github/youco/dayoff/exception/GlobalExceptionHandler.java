package io.github.youco.dayoff.exception;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * Global Exception Handler — centralises all error responses.
 * Converts service-layer exceptions into structured, consistent JSON responses.
 */
@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    // ─── Error response payload ────────────────────────────────────────────────

    public record ErrorResponse(
            LocalDateTime timestamp,
            int status,
            String error,
            String message,
            String path
    ) {}

    private ErrorResponse build(HttpStatus status, String message, String path) {
        return new ErrorResponse(LocalDateTime.now(), status.value(), status.getReasonPhrase(), message, path);
    }

    // ─── 404 Not Found ─────────────────────────────────────────────────────────

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleResourceNotFound(
            ResourceNotFoundException ex,
            jakarta.servlet.http.HttpServletRequest req) {

        log.warn("Resource not found: {} — path: {}", ex.getMessage(), req.getRequestURI());
        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(build(HttpStatus.NOT_FOUND, ex.getMessage(), req.getRequestURI()));
    }

    // ─── 400 Bad Request ───────────────────────────────────────────────────────

    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ErrorResponse> handleBusinessException(
            BusinessException ex,
            jakarta.servlet.http.HttpServletRequest req) {

        log.warn("Business rule violation: {} — path: {}", ex.getMessage(), req.getRequestURI());
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(build(HttpStatus.BAD_REQUEST, ex.getMessage(), req.getRequestURI()));
    }

    // ─── 409 Conflict ──────────────────────────────────────────────────────────

    @ExceptionHandler(DuplicateCheckInException.class)
    public ResponseEntity<ErrorResponse> handleDuplicateCheckIn(
            DuplicateCheckInException ex,
            jakarta.servlet.http.HttpServletRequest req) {

        log.warn("Duplicate check-in: {} — path: {}", ex.getMessage(), req.getRequestURI());
        return ResponseEntity
                .status(HttpStatus.CONFLICT)
                .body(build(HttpStatus.CONFLICT, ex.getMessage(), req.getRequestURI()));
    }

    // ─── 422 Validation ────────────────────────────────────────────────────────

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidationErrors(
            MethodArgumentNotValidException ex,
            jakarta.servlet.http.HttpServletRequest req) {

        Map<String, String> fieldErrors = new HashMap<>();
        for (FieldError error : ex.getBindingResult().getFieldErrors()) {
            fieldErrors.put(error.getField(), error.getDefaultMessage());
        }

        Map<String, Object> body = new HashMap<>();
        body.put("timestamp", LocalDateTime.now());
        body.put("status", 422);
        body.put("error", "Validation Failed");
        body.put("fields", fieldErrors);
        body.put("path", req.getRequestURI());

        log.warn("Validation failed on {}: {}", req.getRequestURI(), fieldErrors);
        return ResponseEntity.status(422).body(body);
    }

    // ─── 403 Forbidden ─────────────────────────────────────────────────────────

    @ExceptionHandler(org.springframework.security.access.AccessDeniedException.class)
    public ResponseEntity<ErrorResponse> handleAccessDenied(
            org.springframework.security.access.AccessDeniedException ex,
            jakarta.servlet.http.HttpServletRequest req) {

        log.warn("Access denied to {}: {}", req.getRequestURI(), ex.getMessage());
        return ResponseEntity
                .status(HttpStatus.FORBIDDEN)
                .body(build(HttpStatus.FORBIDDEN, "Access denied: insufficient permissions", req.getRequestURI()));
    }

    // ─── 500 Generic fallback ──────────────────────────────────────────────────

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGenericException(
            Exception ex,
            jakarta.servlet.http.HttpServletRequest req) {

        log.error("Unexpected error at {}: {}", req.getRequestURI(), ex.getMessage(), ex);
        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(build(HttpStatus.INTERNAL_SERVER_ERROR,
                        "An unexpected error occurred. Please contact support.", req.getRequestURI()));
    }
}
