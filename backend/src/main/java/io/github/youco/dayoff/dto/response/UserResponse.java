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
public class UserResponse {
    private Long id;
    private String nom;
    private String prenom;
    private String email;
    private String telephone;
    private Integer leaveDaysRemaining;
    private Roles role;
    private Long hrManagerId;
    private Boolean active;
}

