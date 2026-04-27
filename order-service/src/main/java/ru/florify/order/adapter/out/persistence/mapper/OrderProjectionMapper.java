package ru.florify.order.adapter.out.persistence.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import ru.florify.order.adapter.out.persistence.repository.OrderKanbanProjection;
import ru.florify.order.domain.model.OrderKanbanItem;
import ru.florify.order.domain.model.OrderSource;
import ru.florify.order.domain.model.OrderType;

@Mapper(componentModel = "spring")
public interface OrderProjectionMapper {

    @Mapping(target = "type", expression = "java(projection.getType() != null ? OrderType.valueOf(projection.getType()) : null)")
    @Mapping(target = "source", expression = "java(projection.getSource() != null ? OrderSource.valueOf(projection.getSource()) : null)")
    OrderKanbanItem toDomain(OrderKanbanProjection projection);
}
