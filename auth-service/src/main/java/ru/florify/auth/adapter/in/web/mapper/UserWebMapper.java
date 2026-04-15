package ru.florify.auth.adapter.in.web.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;
import ru.florify.auth.adapter.in.web.dto.UserResponse;
import ru.florify.auth.domain.model.User;

/**
 * Mapper for User domain model to UserResponse DTO.
 */
@Mapper(componentModel = "spring", unmappedSourcePolicy = ReportingPolicy.IGNORE)
public interface UserWebMapper {

    UserResponse toResponse(User user);
}
