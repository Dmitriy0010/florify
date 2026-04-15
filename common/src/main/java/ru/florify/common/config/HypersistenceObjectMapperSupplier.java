package ru.florify.common.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.hypersistence.utils.hibernate.type.util.ObjectMapperSupplier;

/**
 * Provides a properly configured ObjectMapper to Hibernate/Hypersistence for JSONB serialization.
 * This ensures that dates are formatted as ISO strings and Java 8 date/time types are supported.
 */
public class HypersistenceObjectMapperSupplier implements ObjectMapperSupplier {

    @Override
    public ObjectMapper get() {
        return JacksonConfig.createConfiguredMapper();
    }
}
