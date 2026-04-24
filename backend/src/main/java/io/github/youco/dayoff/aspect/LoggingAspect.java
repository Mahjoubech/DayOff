package io.github.youco.dayoff.aspect;

import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Pointcut;
import org.springframework.stereotype.Component;

/**
 * LoggingAspect — cross-cutting concern for controller method logging.
 *
 * Intercepts every method in any class annotated with @RestController and logs:
 *   - Entry: class name, method name
 *   - Exit:  execution time in milliseconds
 *   - Error: exception class and message (then re-throws)
 */
@Aspect
@Component
@Slf4j
public class LoggingAspect {

    /**
     * Pointcut matching all methods in classes annotated with @RestController.
     */
    @Pointcut("within(@org.springframework.web.bind.annotation.RestController *)")
    public void restControllerMethods() {}

    /**
     * Around advice: logs method name and execution duration for every controller call.
     */
    @Around("restControllerMethods()")
    public Object logAround(ProceedingJoinPoint joinPoint) throws Throwable {
        String className  = joinPoint.getSignature().getDeclaringType().getSimpleName();
        String methodName = joinPoint.getSignature().getName();

        log.info("→ [{}.{}] called", className, methodName);
        long start = System.currentTimeMillis();

        try {
            Object result = joinPoint.proceed();
            long elapsed = System.currentTimeMillis() - start;
            log.info("← [{}.{}] completed in {} ms", className, methodName, elapsed);
            return result;
        } catch (Throwable ex) {
            long elapsed = System.currentTimeMillis() - start;
            log.error("✗ [{}.{}] failed after {} ms — {}: {}",
                    className, methodName, elapsed,
                    ex.getClass().getSimpleName(), ex.getMessage());
            throw ex;
        }
    }
}
