package ben.chatanon.entity.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ChatMessageDto {
    private int sessionId;
    private String message;
}
