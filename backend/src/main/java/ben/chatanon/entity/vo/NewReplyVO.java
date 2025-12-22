package ben.chatanon.entity.vo;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class NewReplyVO {
    private int postId;
    private int commentId;
    private int replyId;
}
