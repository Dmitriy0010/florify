package ru.florify.supplier.adapter.in.web.mapper;

import org.mapstruct.Mapper;
import ru.florify.supplier.adapter.in.web.dto.CreateSupplierRequest;
import ru.florify.supplier.adapter.in.web.dto.SupplierResponse;
import ru.florify.supplier.adapter.in.web.dto.SupplierSummaryResponse;
import ru.florify.supplier.adapter.in.web.dto.UpdateSupplierRequest;
import ru.florify.supplier.application.command.CreateSupplierCommand;
import ru.florify.supplier.application.command.UpdateSupplierCommand;
import ru.florify.supplier.domain.model.Supplier;

import java.util.UUID;

@Mapper(componentModel = "spring")
public interface SupplierWebMapper {
    CreateSupplierCommand toCommand(CreateSupplierRequest request);
    UpdateSupplierCommand toCommand(UUID supplierId, UpdateSupplierRequest request);
    SupplierResponse toResponse(Supplier supplier);
    SupplierSummaryResponse toSummaryResponse(Supplier supplier);
}
