package ru.florify.finance.domain.model;

/**
 * Типы финансовых транзакций для Главной книги.
 */
public enum FinancialType {
    REVENUE_SALE,       // Выручка с продажи
    COGS,               // Себестоимость проданного товара (убыток)
    PURCHASE_EXPENSE,   // Закупка товара у поставщика
    SALARY_EXPENSE,     // Выплата зарплаты
    WRITE_OFF_EXPENSE,  // Убыток от списания (порча/кража)
    RENT_EXPENSE,       // Аренда
    UTILITY_EXPENSE,    // Коммунальные платежи
    MARKETING_EXPENSE,  // Маркетинг
    OTHER_EXPENSE,      // Прочие расходы
    MANUAL_INCOME,       // Прочие доходы
    INVENTORY_GAIN,      // Излишки инвентаризации (Доход)
    INVENTORY_LOSS       // Недостача инвентаризации (Расход - заменяет или дополняет WRITE_OFF)
}
