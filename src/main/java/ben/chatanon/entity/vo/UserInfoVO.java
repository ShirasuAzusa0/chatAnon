package ben.chatanon.entity.vo;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class UserInfoVO {
    private int userId;
    private String userName;
    private String email;
    private String avatarUrl;
    private String description;
    private int reply;
    private int topics;
    private int follower;
    private int following;
}
