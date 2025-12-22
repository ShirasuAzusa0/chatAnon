package ben.chatanon.entity.entity_role;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@Table(name = "rolecategories")
public class RoleCategories {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "roleTagId")
    private int roleTagId;

    @Column(name = "roleTagName", nullable = false, unique = true)
    private String roleTagName;

    @Column(name = "hueColor", nullable = false)
    private String hueColor;

    @Column(name = "description", nullable = false)
    private String description;

    @Column(name = "rolesCount", nullable = false)
    private int rolesCount;

    @Column(name = "lastUpdateTime", nullable = false)
    private LocalDateTime lastUpdateTime;

    @Column(name = "backgroundPrompt", columnDefinition = "LONGTEXT")
    private String backgroundPrompt;
}
