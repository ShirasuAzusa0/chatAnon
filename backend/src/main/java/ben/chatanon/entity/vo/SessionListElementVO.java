package ben.chatanon.entity.vo;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class SessionListElementVO {
    private int sessionId;
    private String sessionName;
    private int roleId;
    private String roleName;
    private String modelName;
    private LocalDateTime createdAt;
    private LocalDateTime lastUpdatedAt;
}
