package ben.chatanon.entity.entity_role;

import ben.chatanon.entity.Users;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@Table(name = "roles")
public class Roles {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "roleId")
    private int roleId;

    @Column(name = "roleName", nullable = false, unique = true)
    private String roleName;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "authorId", referencedColumnName = "userId", nullable = false)
    private Users author;

    @Column(name = "likesCount", nullable = false)
    private int likesCount;

    @Column(name = "favoriteCount", nullable = false)
    private int favoriteCount;

    @Column(name = "avatarURL", nullable = false)
    private String avatarURL;

    @Column(name = "description", nullable = false)
    private String description;

    @Column(name = "shortInfo", nullable = false)
    private String shortInfo;

    @Column(name = "createdAt", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "prompt", nullable = false, columnDefinition = "LONGTEXT")
    private String prompt;
}
