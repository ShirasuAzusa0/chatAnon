package ben.chatanon.entity.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class EditSessionDto {
    private int sessionId;
    private String sessionName;
    private String modelName;
}
