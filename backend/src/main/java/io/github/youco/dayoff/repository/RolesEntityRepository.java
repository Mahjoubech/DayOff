package io.github.youco.dayoff.repository;

import io.github.youco.dayoff.model.entity.RolesEntity;
import io.github.youco.dayoff.model.enums.Roles;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RolesEntityRepository extends JpaRepository<RolesEntity, Long> {
    Optional<RolesEntity> findByName(Roles name);
}

