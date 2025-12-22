package ben.chatanon.entity.entity_chat;

import ben.chatanon.entity.entity_role.Roles;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Setter
@Getter
@Table(name = "live2dmodel")
public class L2DModel {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "live2dId")
    private int live2dId;

    @Column(name = "live2dName", nullable = false)
    private String live2dName;

    @Column(name = "live2dCode", nullable = false)
    private String live2dCode;

    @Column(name = "live2dEntry", nullable = false)
    private String live2dEntry;

    @Column(name = "basePath", nullable = false)
    private String basePath;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "roleId", referencedColumnName = "roleId", nullable = false)
    private Roles role;

    @Column(name = "prompt", nullable = false)
    private String prompt;
}
