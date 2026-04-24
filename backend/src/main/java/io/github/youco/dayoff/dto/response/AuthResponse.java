package io.github.youco.dayoff.dto.response;

import io.github.youco.dayoff.model.enums.Roles;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
    private String token;
    private Long userId;
    private String email;
    private Roles role;
    private String nom;
    private String prenom;
}

