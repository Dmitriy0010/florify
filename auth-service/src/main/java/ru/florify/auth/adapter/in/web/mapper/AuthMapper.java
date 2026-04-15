package ru.florify.auth.adapter.in.web.mapper;

import org.mapstruct.Mapper;
import ru.florify.auth.adapter.in.web.dto.TokenResponse;
import ru.florify.auth.application.AuthTokensResult;

/**
 * Mapper for AuthTokensResult to TokenResponse DTO.
 */
@Mapper(componentModel = "spring")
public interface AuthMapper {

    TokenResponse toResponse(AuthTokensResult result);
}
