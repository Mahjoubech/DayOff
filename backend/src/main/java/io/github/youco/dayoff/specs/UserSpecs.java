package io.github.youco.dayoff.specs;

import io.github.youco.dayoff.model.entity.User;
import io.github.youco.dayoff.model.enums.Roles;
import org.springframework.data.jpa.domain.Specification;

public class UserSpecs {

    public static Specification<User> hasRole(Roles role) {
        return (root, query, criteriaBuilder) ->
            criteriaBuilder.equal(root.get("role").get("name"), role);
    }

    public static Specification<User> hasManager(Long hrId) {
        return (root, query, criteriaBuilder) ->
            criteriaBuilder.equal(root.get("hrManager").get("id"), hrId);
    }

    public static Specification<User> hasEmail(String email) {
        return (root, query, criteriaBuilder) ->
            criteriaBuilder.equal(root.get("email"), email);
    }

    public static Specification<User> isActive() {
        return (root, query, criteriaBuilder) ->
            criteriaBuilder.equal(root.get("active"), true);
    }
}

