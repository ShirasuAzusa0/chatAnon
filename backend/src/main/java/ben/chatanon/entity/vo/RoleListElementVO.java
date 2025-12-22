package ben.chatanon.entity.vo;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class RoleListElementVO {
    private int roleId;
    private String roleName;
    private int favoriteCount;
    private int likesCount;
    private String avatarURL;
    private String shortInfo;
}
