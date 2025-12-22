package ben.chatanon.entity.entity_role.IdClass;

import lombok.Data;

import java.io.Serializable;

@Data
public class RoleCategoryId implements Serializable {
    private Integer role;
    private Integer roleCategory;
}
