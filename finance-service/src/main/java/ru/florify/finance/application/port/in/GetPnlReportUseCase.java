package ru.florify.finance.application.port.in;

import ru.florify.finance.domain.model.PnlReport;
import java.time.Instant;

public interface GetPnlReportUseCase {
    PnlReport execute(Instant from, Instant to);
}
