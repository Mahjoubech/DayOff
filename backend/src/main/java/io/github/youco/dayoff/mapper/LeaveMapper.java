package io.github.youco.dayoff.mapper;

import io.github.youco.dayoff.dto.response.LeaveResponse;
import io.github.youco.dayoff.model.entity.LeaveRequest;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

/**
 * MapStruct mapper for LeaveRequest entity conversions
 */
@Mapper(componentModel = "spring")
public interface LeaveMapper {

    /**
     * Convert LeaveRequest entity to LeaveResponse DTO
     */
    @Mapping(target = "employeeId", source = "employee.id")
    @Mapping(target = "employeeName", expression = "java(leaveRequest.getEmployee().getPrenom() + \" \" + leaveRequest.getEmployee().getNom())")
    LeaveResponse toResponse(LeaveRequest leaveRequest);
}

