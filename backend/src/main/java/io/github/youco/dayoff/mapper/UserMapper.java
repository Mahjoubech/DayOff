package io.github.youco.dayoff.mapper;

import io.github.youco.dayoff.dto.request.CreateUserRequest;
import io.github.youco.dayoff.dto.response.UserResponse;
import io.github.youco.dayoff.model.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

/**
 * MapStruct mapper for User entity conversions
 */
@Mapper(componentModel = "spring")
public interface UserMapper {

    /**
     * Convert User entity to UserResponse DTO
     */
    @Mapping(target = "hrManagerId", source = "hrManager.id")
    @Mapping(target = "role", source = "role.name")
    UserResponse toResponse(User user);

    /**
     * Convert CreateUserRequest to User entity
     * Note: Password, role, and hrManager must be set manually in service
     */
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "password", ignore = true)
    @Mapping(target = "role", ignore = true)
    @Mapping(target = "hrManager", ignore = true)
    @Mapping(target = "leaveDaysRemaining", ignore = true)
    @Mapping(target = "active", ignore = true)
    User toEntity(CreateUserRequest request);
}

