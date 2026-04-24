package io.github.youco.dayoff.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CheckInRequest {
    @NotNull(message = "Check-in time is required")
    private LocalTime checkInTime;
}

