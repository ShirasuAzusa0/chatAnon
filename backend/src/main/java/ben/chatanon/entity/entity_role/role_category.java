package ben.chatanon.entity.entity_role;

import ben.chatanon.entity.entity_role.IdClass.RoleCategoryId;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@IdClass(RoleCategoryId.class)
@Table(name = "role_category")
public class role_category {
    @Id
    @ManyToOne
    @JoinColumn(name = "roleTagId", referencedColumnName = "roleTagId")
    private RoleCategories roleCategory;

    @Id
    @ManyToOne
    @JoinColumn(name = "roleId", referencedColumnName = "roleId")
    private Roles role;
}
