package ru.florify.media.smoke;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import ru.florify.common.config.GlobalSecurityConfig;
import ru.florify.common.test.SecurityMockConfig;
import ru.florify.media.adapter.in.web.MediaController;
import ru.florify.media.adapter.in.web.mapper.MediaWebMapper;
import ru.florify.media.application.port.in.DeleteMediaUseCase;
import ru.florify.media.application.port.in.GetMediaUrlUseCase;
import ru.florify.media.application.port.in.UploadMediaUseCase;

import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static ru.florify.common.test.SecurityTestSupport.admin;

@WebMvcTest(controllers = MediaController.class)
@Import({GlobalSecurityConfig.class, SecurityMockConfig.class})
@ActiveProfiles("test")
public class MediaSmokeTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private UploadMediaUseCase uploadMediaUseCase;
    @MockitoBean
    private DeleteMediaUseCase deleteMediaUseCase;
    @MockitoBean
    private GetMediaUrlUseCase getMediaUrlUseCase;
    @MockitoBean
    private MediaWebMapper mediaWebMapper;

    @Test
    void shouldReturn401WhenUnauthorized() throws Exception {
        mockMvc.perform(get("/api/v1/media/" + UUID.randomUUID() + "/THUMBNAIL"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void shouldReturn200ForAuthenticatedUser() throws Exception {
        mockMvc.perform(get("/api/v1/media/" + UUID.randomUUID() + "/THUMBNAIL").with(admin()))
                .andExpect(status().isOk());
    }
}
