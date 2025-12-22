package ben.chatanon.entity.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class NewReplyDto {
    private int postId;
    private int replyId;
    private String content;
}
