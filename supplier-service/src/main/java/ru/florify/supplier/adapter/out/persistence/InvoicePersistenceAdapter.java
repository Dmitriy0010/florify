package ru.florify.supplier.adapter.out.persistence;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Component;
import ru.florify.common.application.query.PagedResult;
import ru.florify.supplier.adapter.out.persistence.entity.PurchaseInvoiceJpaEntity;
import ru.florify.supplier.adapter.out.persistence.entity.PurchaseInvoiceItemJpaEntity;
import ru.florify.supplier.adapter.out.persistence.mapper.InvoicePersistenceMapper;
import ru.florify.supplier.adapter.out.persistence.repository.PurchaseInvoiceJpaRepository;
import ru.florify.supplier.application.port.out.InvoiceRepository;
import ru.florify.supplier.domain.model.InvoiceStatus;
import ru.florify.supplier.domain.model.PurchaseInvoice;
import ru.florify.supplier.domain.model.PurchaseInvoiceItem;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class InvoicePersistenceAdapter implements InvoiceRepository {

    private final PurchaseInvoiceJpaRepository jpaRepository;
    private final InvoicePersistenceMapper mapper;

    @Override
    public PurchaseInvoice save(PurchaseInvoice invoice) {
        PurchaseInvoiceJpaEntity entity;
        if (invoice.getId() != null && jpaRepository.existsById(invoice.getId())) {
            entity = jpaRepository.findById(invoice.getId())
                    .orElseThrow(() -> new IllegalStateException("Entity disappeared during transaction"));
            entity.setInvoiceNumber(invoice.getInvoiceNumber());
            entity.setSupplierId(invoice.getSupplierId());
            entity.setSupplierName(invoice.getSupplierName());
            entity.setStatus(invoice.getStatus().name());
            entity.setTotalAmount(invoice.getTotalAmount());
            entity.setPlannedDeliveryAt(invoice.getPlannedDeliveryAt());
            entity.setReceivedAt(invoice.getReceivedAt());
            entity.setComment(invoice.getComment());
            entity.setCreatedBy(invoice.getCreatedBy());
            entity.setCreatedAt(invoice.getCreatedAt());
            entity.getItems().clear();
            if (invoice.getItems() != null) {
                List<PurchaseInvoiceItemJpaEntity> itemEntities = invoice.getItems().stream()
                        .map(mapper::toItemEntity)
                        .peek(item -> item.setInvoice(entity))
                        .toList();
                entity.getItems().addAll(itemEntities);
            }
        } else {
            entity = mapper.toEntity(invoice);
            if (invoice.getItems() != null) {
                List<PurchaseInvoiceItemJpaEntity> itemEntities = invoice.getItems().stream()
                        .map(mapper::toItemEntity)
                        .peek(item -> item.setInvoice(entity))
                        .toList();
                entity.setItems(itemEntities);
            }
        }
        return toDomainWithItems(jpaRepository.save(entity));
    }

    @Override
    public Optional<PurchaseInvoice> findById(UUID id) {
        return jpaRepository.findById(id).map(mapper::toDomain);
    }

    @Override
    public Optional<PurchaseInvoice> findByIdWithItems(UUID id) {
        return jpaRepository.findByIdWithItems(id).map(this::toDomainWithItems);
    }

    @Override
    public PagedResult<PurchaseInvoice> findAll(UUID supplierId, InvoiceStatus status, Instant from, Instant to, int page, int size) {
        String statusStr = status != null ? status.name() : null;
        var pg = jpaRepository.findAllWithFilters(supplierId, statusStr, from, to, PageRequest.of(page, size));
        return new PagedResult<>(pg.getContent().stream().map(mapper::toDomain).toList(), page, size, pg.getTotalElements());
    }

    @Override
    public boolean existsBySupplierIdAndInvoiceNumber(UUID supplierId, String invoiceNumber) {
        return jpaRepository.existsBySupplierIdAndInvoiceNumber(supplierId, invoiceNumber);
    }

    private PurchaseInvoice toDomainWithItems(PurchaseInvoiceJpaEntity entity) {
        PurchaseInvoice invoice = mapper.toDomain(entity);
        if (entity.getItems() != null) {
            List<PurchaseInvoiceItem> items = entity.getItems().stream().map(mapper::toItem).toList();
            invoice.setItems(items);
        }
        return invoice;
    }
}
