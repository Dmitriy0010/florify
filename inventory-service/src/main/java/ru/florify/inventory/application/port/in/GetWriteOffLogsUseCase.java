package ru.florify.inventory.application.port.in;

import ru.florify.inventory.adapter.in.web.dto.WriteOffLogResponse;
import java.util.List;

public interface GetWriteOffLogsUseCase {
    List<WriteOffLogResponse> execute();
}
