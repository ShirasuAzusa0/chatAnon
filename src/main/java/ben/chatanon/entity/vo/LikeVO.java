package ben.chatanon.entity.vo;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class LikeVO {
    private boolean isLiked;
    private int likeId;
}
