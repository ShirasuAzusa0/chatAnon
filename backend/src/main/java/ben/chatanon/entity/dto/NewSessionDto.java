package ben.chatanon.entity.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class NewSessionDto {
    private int userId;
    private int roleId;
    private String modelName;
}
