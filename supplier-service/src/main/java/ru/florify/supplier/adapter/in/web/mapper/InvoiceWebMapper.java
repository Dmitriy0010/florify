package ru.florify.supplier.adapter.in.web.mapper;

import org.mapstruct.Mapper;
import ru.florify.supplier.adapter.in.web.dto.CreateInvoiceRequest;
import ru.florify.supplier.adapter.in.web.dto.InvoiceResponse;
import ru.florify.supplier.adapter.in.web.dto.ReceiveInvoiceRequest;
import ru.florify.supplier.application.command.CreateInvoiceCommand;
import ru.florify.supplier.application.command.UpdateInvoiceCommand;
import ru.florify.supplier.application.command.ReceiveInvoiceCommand;
import ru.florify.supplier.domain.model.PurchaseInvoice;

import java.util.UUID;

@Mapper(componentModel = "spring")
public interface InvoiceWebMapper {
    CreateInvoiceCommand toCommand(CreateInvoiceRequest request, UUID performerId);
    UpdateInvoiceCommand toCommand(UUID invoiceId, CreateInvoiceRequest request, UUID performerId);
    ReceiveInvoiceCommand toCommand(UUID invoiceId, ReceiveInvoiceRequest request, UUID performerId);
    InvoiceResponse toResponse(PurchaseInvoice invoice);
}
