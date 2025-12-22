package ben.chatanon.entity.vo;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class RoleVO {
    private int roleId;
    private String roleName;
    private int likesCount;
    private int favoriteCount;
    private String avatarURL;
    private String description;
    private List<ModelListElementVO> models;
    public RoleVO() {}
}
