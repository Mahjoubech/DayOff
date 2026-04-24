package io.github.youco.dayoff.mapper;

import io.github.youco.dayoff.dto.response.AttendanceResponse;
import io.github.youco.dayoff.model.entity.Attendance;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

/**
 * MapStruct mapper for Attendance entity conversions
 */
@Mapper(componentModel = "spring")
public interface AttendanceMapper {

    /**
     * Convert Attendance entity to AttendanceResponse DTO
     */
    @Mapping(target = "employeeId", source = "employee.id")
    @Mapping(target = "employeeName", expression = "java(attendance.getEmployee().getPrenom() + \" \" + attendance.getEmployee().getNom())")
    AttendanceResponse toResponse(Attendance attendance);
}

