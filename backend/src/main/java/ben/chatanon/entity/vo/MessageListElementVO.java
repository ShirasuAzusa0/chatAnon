package ben.chatanon.entity.vo;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class MessageListElementVO {
    private int messageId;
    private String content;
    private String role;
    private LocalDateTime createdAt;
}
